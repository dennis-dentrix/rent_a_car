import { nairobiDate } from '@carvo/shared'
import { unwrap } from '../lib/supabase.js'

/** Adds a company's class, with its first price when one is given, in one database call. Returns the class id. */
export async function createClass(db, { price_kes: price, ...cls }, today = new Date()) {
  return unwrap(
    await db.rpc('create_operator_class', {
      p_class: cls,
      p_price_kes: price ?? null,
      p_date: nairobiDate(today),
    }),
  )
}

/** Changes what the company charges per day for a class, from today. */
export async function setClassRate(db, classId, { price_kes: price }, today = new Date()) {
  unwrap(
    await db.rpc('set_operator_class_rate', {
      p_class_id: classId,
      p_price_kes: price,
      p_date: nairobiDate(today),
    }),
  )
  return { class_id: classId, price_kes: price }
}
