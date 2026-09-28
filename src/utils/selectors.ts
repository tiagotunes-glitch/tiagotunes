import type { Category, Transaction } from '../types'
import { monthKeyOf, shiftMonthKey } from './format'

function transferCategoryIds(categories: Category[]): Set<string> {
  return new Set(categories.filter((c) => c.excludeFromTotals).map((c) => c.id))
}

export function totalsForMonth(transactions: Transaction[], categories: Category[], monthKey: string) {
  const transferIds = transferCategoryIds(categories)
  const monthTransactions = transactions.filter(
    (t) => monthKeyOf(t.date) === monthKey && !transferIds.has(t.categoryId),
  )
  const receitas = monthTransactions
    .filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0)
  const despesas = monthTransactions
    .filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0)
  return { receitas, despesas, saldo: receitas - despesas }
}

export function balanceUpTo(
  transactions: Transaction[],
  categories: Category[],
  monthKey: string,
): number {
  const transferIds = transferCategoryIds(categories)
  return transactions
    .filter((t) => monthKeyOf(t.date) <= monthKey && !transferIds.has(t.categoryId))
    .reduce((sum, t) => sum + (t.type === 'receita' ? t.amount : -t.amount), 0)
}

export function expensesByCategory(
  transactions: Transaction[],
  categories: Category[],
  monthKey: string,
) {
  const transferIds = transferCategoryIds(categories)
  const monthExpenses = transactions.filter(
    (t) => t.type === 'despesa' && monthKeyOf(t.date) === monthKey && !transferIds.has(t.categoryId),
  )
  const totals = new Map<string, number>()
  for (const t of monthExpenses) {
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount)
  }
  return Array.from(totals.entries())
    .map(([categoryId, value]) => {
      const category = categories.find((c) => c.id === categoryId)
      return {
        categoryId,
        name: category?.name ?? 'Sem categoria',
        color: category?.color ?? '#94a3b8',
        value,
      }
    })
    .sort((a, b) => b.value - a.value)
}

export function monthlyTrend(
  transactions: Transaction[],
  categories: Category[],
  monthKey: string,
  months = 6,
) {
  const result: { monthKey: string; receitas: number; despesas: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const key = shiftMonthKey(monthKey, -i)
    const { receitas, despesas } = totalsForMonth(transactions, categories, key)
    result.push({ monthKey: key, receitas, despesas })
  }
  return result
}
