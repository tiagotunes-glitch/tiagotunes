export type TransactionType = 'receita' | 'despesa'

export interface Category {
  id: string
  name: string
  type: TransactionType
  color: string
}

export interface Transaction {
  id: string
  date: string // ISO yyyy-mm-dd
  description: string
  amount: number // always stored positive
  type: TransactionType
  categoryId: string
  externalId?: string // bank transaction id (e.g. OFX FITID), used to avoid duplicate imports
}
