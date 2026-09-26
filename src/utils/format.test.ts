import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatMonthKey, monthKeyOf, shiftMonthKey } from './format'

describe('formatCurrency', () => {
  it('formats positive values as BRL', () => {
    expect(formatCurrency(1234.5)).toBe('R$ 1.234,50')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00')
  })
})

describe('formatDate', () => {
  it('converts ISO yyyy-mm-dd to dd/mm/yyyy', () => {
    expect(formatDate('2026-09-26')).toBe('26/09/2026')
  })
})

describe('monthKeyOf', () => {
  it('extracts the yyyy-mm portion of an ISO date', () => {
    expect(monthKeyOf('2026-09-26')).toBe('2026-09')
  })
})

describe('formatMonthKey', () => {
  it('formats a month key in Portuguese', () => {
    expect(formatMonthKey('2026-09')).toBe('Setembro de 2026')
  })
})

describe('shiftMonthKey', () => {
  it('moves forward across year boundaries', () => {
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01')
  })

  it('moves backward across year boundaries', () => {
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12')
  })

  it('supports multi-month shifts', () => {
    expect(shiftMonthKey('2026-09', -6)).toBe('2026-03')
  })
})
