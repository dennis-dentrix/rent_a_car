'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CURRENCY, currencyCookie, readCurrencyCookie } from '@/lib/currency'

const CurrencyContext = createContext({ currency: DEFAULT_CURRENCY, rates: {}, setCurrency() {} })

/** The display currency and the rates that convert to it. Pages render in KES first; a saved USD choice applies after load. */
export const useCurrency = () => useContext(CurrencyContext)

export function CurrencyProvider({ rates, children }) {
  const [currency, setCurrencyState] = useState(DEFAULT_CURRENCY)

  useEffect(() => {
    const saved = readCurrencyCookie(document.cookie)
    if (saved && (saved === DEFAULT_CURRENCY || rates[saved])) setCurrencyState(saved)
  }, [rates])

  const setCurrency = useCallback((next) => {
    setCurrencyState(next)
    document.cookie = currencyCookie(next)
  }, [])

  const value = useMemo(() => ({ currency, rates, setCurrency }), [currency, rates, setCurrency])
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}
