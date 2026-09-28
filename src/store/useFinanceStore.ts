import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { defaultCategories } from '../data/defaultCategories'
import type { Category, Transaction, TransactionType } from '../types'

interface FinanceState {
  transactions: Transaction[]
  categories: Category[]
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void
  deleteTransaction: (id: string) => void
  addCategory: (name: string, type: TransactionType, color: string) => void
  deleteCategory: (id: string) => boolean
  ensureCategories: (categories: Category[]) => void
  importData: (data: { transactions: Transaction[]; categories: Category[] }) => void
  importTransactions: (
    transactions: Omit<Transaction, 'id'>[],
  ) => { imported: number; skipped: number }
  resetAll: () => void
}

function generateId(): string {
  return crypto.randomUUID()
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,

      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, { ...transaction, id: generateId() }],
        })),

      updateTransaction: (id, transaction) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...transaction, id } : t,
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addCategory: (name, type, color) =>
        set((state) => ({
          categories: [...state.categories, { id: generateId(), name, type, color }],
        })),

      deleteCategory: (id) => {
        const inUse = get().transactions.some((t) => t.categoryId === id)
        if (inUse) return false
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }))
        return true
      },

      ensureCategories: (categories) =>
        set((state) => {
          const existingIds = new Set(state.categories.map((c) => c.id))
          const missing = categories.filter((c) => !existingIds.has(c.id))
          if (missing.length === 0) return state
          return { categories: [...state.categories, ...missing] }
        }),

      importData: (data) => set({ transactions: data.transactions, categories: data.categories }),

      importTransactions: (transactions) => {
        const existingExternalIds = new Set(
          get()
            .transactions.map((t) => t.externalId)
            .filter((id): id is string => Boolean(id)),
        )
        const seen = new Set<string>()
        const toAdd = transactions.filter((t) => {
          if (!t.externalId) return true
          if (existingExternalIds.has(t.externalId) || seen.has(t.externalId)) return false
          seen.add(t.externalId)
          return true
        })
        set((state) => ({
          transactions: [
            ...state.transactions,
            ...toAdd.map((t) => ({ ...t, id: generateId() })),
          ],
        }))
        return { imported: toAdd.length, skipped: transactions.length - toAdd.length }
      },

      resetAll: () => set({ transactions: [], categories: defaultCategories }),
    }),
    { name: 'financas-pf' },
  ),
)
