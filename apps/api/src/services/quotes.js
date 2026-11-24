import { AppError, fieldError } from '../lib/errors.js'
import { withServiceRole, unwrap } from '../lib/supabase.js'
import { convertFromKes, nairobiDate } from '@carvo/shared'

import { availableCount, exchangeRate, findPublicClass, rateOn } from './catalogue.js'
import { calculateQuote, minimumHireDays, rentalDays } from './pricing.js'

const SETTING_KEYS = [
  'deposit_percent',
  'vat_percent',
  'quote_expiry_minutes',
  'security_deposit_enabled',
  'minimum_hire_days',
]

async function loadSettings(db) {
  const rows = unwrap(await db.from('settings').select('key, value').in('key', SETTING_KEYS))
  return Object.fromEntries(rows.map((row) => [row.key, row.value]))
}

async function loadExtras(db, extraIds) {
  if (extraIds.length === 0) return []
  const rows = unwrap(await db.from('extras').select('*').in('id', extraIds).eq('is_active', true))
  if (rows.length !== new Set(extraIds).size) {
    throw fieldError('extras', 'One or more extras are not available.')
  }
  return rows
}

async function loadDeliveryFee(db, handover) {
  if (handover.type !== 'delivery') return 0
  const zone = unwrap(
    await db
      .from('delivery_zones')
      .select('fee_kes')
      .eq('id', handover.delivery_zone_id)
      .eq('is_active', true)
      .maybeSingle(),
  )
  if (!zone) throw fieldError('handover.delivery_zone_id', 'Unknown delivery zone.')
  return zone.fee_kes
}

async function loadDiscounts(db, classId, day) {
  return unwrap(
    await db
      .from('discounts')
      .select('*')
      .eq('is_active', true)
      .lte('effective_from', day)
      .or(`effective_to.is.null,effective_to.gte.${day}`)
      .or(`class_id.is.null,class_id.eq.${classId}`),
  )
}

// Class-level security deposit overrides the system setting (section 24.4).
const securityDepositKes = (cls, settings) => {
  const enabled = cls.security_deposit_enabled ?? settings.security_deposit_enabled === true
  return enabled ? (cls.security_deposit_kes ?? 0) : 0
}

const toExtraInput = (extra) => ({
  name: extra.name,
  priceKes: extra.price_kes,
  pricingType: extra.pricing_type,
})

function assertStartNotInPast(startAt, now) {
  if (new Date(startAt) < now) throw fieldError('start_at', 'The start time is in the past.')
}

async function loadInputs(db, input) {
  const cls = await findPublicClass(db, input.class_id)
  const rate = await rateOn(db, cls.id, input.start_at)
  if (!rate) throw new AppError('NOT_FOUND', { message: 'No rate is set for those dates.' })
  const [settings, extras, deliveryFeeKes, discounts, fx, count] = await Promise.all([
    loadSettings(db),
    loadExtras(db, input.extras),
    loadDeliveryFee(db, input.handover),
    loadDiscounts(db, cls.id, nairobiDate(input.start_at)),
    exchangeRate(db, input.currency),
    availableCount(db, cls.id, input.start_at, input.end_at),
  ])
  return { cls, rate, settings, extras, deliveryFeeKes, discounts, fx, count }
}

/** The exchange rate fixed on the quote. KES quotes use a rate of 1 and no rate date. */
const fixedRate = (fx) => ({ rateToKes: fx?.rateToKes ?? 1, rateDate: fx?.rateDate ?? null })

function toQuoteRow(input, data, quote, expiresAt) {
  const { rateToKes, rateDate } = fixedRate(data.fx)
  return {
    class_id: data.cls.id,
    start_at: input.start_at,
    end_at: input.end_at,
    pickup_location_id: input.pickup_location_id ?? null,
    handover_type: input.handover.type,
    service: input.service,
    extra_ids: input.extras,
    delivery_address: input.handover.address ?? null,
    delivery_zone_id: input.handover.delivery_zone_id ?? null,
    delivery_window_start: input.handover.window_start ?? null,
    delivery_window_end: input.handover.window_end ?? null,
    total_kes: quote.totalKes,
    deposit_kes: quote.depositKes,
    security_deposit_kes: quote.securityDepositKes,
    breakdown: quote.lines,
    display_currency: input.currency,
    exchange_rate_to_kes: rateToKes,
    exchange_rate_date: rateDate,
    display_total: data.fx ? convertFromKes(quote.totalKes, rateToKes) : quote.totalKes,
    expires_at: expiresAt.toISOString(),
  }
}

function toQuoteResponse(row, input, data, quote) {
  const { rateToKes, rateDate } = fixedRate(data.fx)
  return {
    id: row.id,
    expires_at: row.expires_at,
    breakdown: quote.lines.map(({ kind, label, amountKes }) => ({
      kind,
      label,
      amount_kes: amountKes,
    })),
    total_kes: quote.totalKes,
    deposit_kes: quote.depositKes,
    balance_kes: quote.balanceKes,
    security_deposit_kes: quote.securityDepositKes,
    availability: data.count > 0,
    display: {
      currency: input.currency,
      total: row.display_total,
      rate_to_kes: rateToKes,
      rate_date: rateDate,
    },
  }
}

async function storeQuote(db, input, data, quote, now) {
  const expiresAt = new Date(now.getTime() + data.settings.quote_expiry_minutes * 60_000)
  const row = unwrap(
    await db
      .from('quotes')
      .insert(toQuoteRow(input, data, quote, expiresAt))
      .select('id, expires_at, display_total')
      .single(),
  )
  return toQuoteResponse(row, input, data, quote)
}

/** Create and store a quote. Price, deposit, and expiry are all calculated on the server. */
export async function createQuote(input, now = new Date()) {
  assertStartNotInPast(input.start_at, now)
  return withServiceRole('create_quote', async (db) => {
    const data = await loadInputs(db, input)
    const quote = calculateQuote({
      dailyRateKes: data.rate.price_kes,
      days: rentalDays(
        input.start_at,
        input.end_at,
        minimumHireDays(input.service, data.settings.minimum_hire_days),
      ),
      extras: data.extras.map(toExtraInput),
      deliveryFeeKes: data.deliveryFeeKes,
      discounts: data.discounts,
      depositPercent: data.settings.deposit_percent,
      vatPercent: data.settings.vat_percent,
      securityDepositKes: securityDepositKes(data.cls, data.settings),
    })
    return storeQuote(db, input, data, quote, now)
  })
}
