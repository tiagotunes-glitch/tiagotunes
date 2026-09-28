import { describe, expect, it } from 'vitest'
import type { Category, Transaction } from '../types'
import { balanceUpTo, expensesByCategory, monthlyTrend, totalsForMonth } from './selectors'

const categories: Category[] = [
  { id: 'cat-salario', name: 'Salário', type: 'receita', color: '#16a34a' },
  { id: 'cat-moradia', name: 'Moradia', type: 'despesa', color: '#ef4444' },
  { id: 'cat-alimentacao', name: 'Alimentação', type: 'despesa', color: '#f97316' },
  {
    id: 'cat-aplicacao-investimento',
    name: 'Aplicação em investimentos',
    type: 'despesa',
    color: '#0891b2',
    excludeFromTotals: true,
  },
  {
    id: 'cat-resgate-investimento',
    name: 'Resgate de investimentos',
    type: 'receita',
    color: '#0891b2',
    excludeFromTotals: true,
  },
]

const transactions: Transaction[] = [
  { id: '1', date: '2026-08-05', description: 'Salário', amount: 4000, type: 'receita', categoryId: 'cat-salario' },
  { id: '2', date: '2026-08-10', description: 'Aluguel', amount: 1500, type: 'despesa', categoryId: 'cat-moradia' },
  { id: '3', date: '2026-09-05', description: 'Salário', amount: 4200, type: 'receita', categoryId: 'cat-salario' },
  { id: '4', date: '2026-09-10', description: 'Aluguel', amount: 1500, type: 'despesa', categoryId: 'cat-moradia' },
  { id: '5', date: '2026-09-15', description: 'Mercado', amount: 300, type: 'despesa', categoryId: 'cat-alimentacao' },
  { id: '6', date: '2026-09-20', description: 'Mercado', amount: 150, type: 'despesa', categoryId: 'cat-alimentacao' },
  {
    id: '7',
    date: '2026-09-22',
    description: 'Aplicação RDB',
    amount: 5000,
    type: 'despesa',
    categoryId: 'cat-aplicacao-investimento',
  },
  {
    id: '8',
    date: '2026-09-25',
    description: 'Resgate RDB',
    amount: 5000,
    type: 'receita',
    categoryId: 'cat-resgate-investimento',
  },
]

describe('totalsForMonth', () => {
  it('sums receitas and despesas only for the given month', () => {
    expect(totalsForMonth(transactions, categories, '2026-09')).toEqual({
      receitas: 4200,
      despesas: 1950,
      saldo: 2250,
    })
  })

  it('returns zeros for a month with no transactions', () => {
    expect(totalsForMonth(transactions, categories, '2026-01')).toEqual({
      receitas: 0,
      despesas: 0,
      saldo: 0,
    })
  })

  it('excludes transactions in categories marked excludeFromTotals', () => {
    const { receitas, despesas } = totalsForMonth(transactions, categories, '2026-09')
    // 5000 aplicação and 5000 resgate must not appear in either total
    expect(receitas).toBe(4200)
    expect(despesas).toBe(1950)
  })
})

describe('balanceUpTo', () => {
  it('accumulates the balance across all months up to and including the given month', () => {
    // Aug: 4000 - 1500 = 2500; Sep: 4200 - 1950 = 2250; total = 4750
    // (investment transfer transactions are excluded)
    expect(balanceUpTo(transactions, categories, '2026-09')).toBe(4750)
  })

  it('ignores transactions after the given month', () => {
    expect(balanceUpTo(transactions, categories, '2026-08')).toBe(2500)
  })
})

describe('expensesByCategory', () => {
  it('groups and sorts expenses by category, descending', () => {
    expect(expensesByCategory(transactions, categories, '2026-09')).toEqual([
      { categoryId: 'cat-moradia', name: 'Moradia', color: '#ef4444', value: 1500 },
      { categoryId: 'cat-alimentacao', name: 'Alimentação', color: '#f97316', value: 450 },
    ])
  })

  it('excludes receitas from the grouping', () => {
    const result = expensesByCategory(transactions, categories, '2026-09')
    expect(result.find((r) => r.categoryId === 'cat-salario')).toBeUndefined()
  })

  it('excludes categories marked excludeFromTotals', () => {
    const result = expensesByCategory(transactions, categories, '2026-09')
    expect(result.find((r) => r.categoryId === 'cat-aplicacao-investimento')).toBeUndefined()
  })
})

describe('monthlyTrend', () => {
  it('returns totals for the trailing N months in chronological order', () => {
    const trend = monthlyTrend(transactions, categories, '2026-09', 2)
    expect(trend).toEqual([
      { monthKey: '2026-08', receitas: 4000, despesas: 1500 },
      { monthKey: '2026-09', receitas: 4200, despesas: 1950 },
    ])
  })
})
