import { useMemo, useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Transaction, TransactionType } from '../types'
import { formatCurrency, formatDate } from '../utils/format'

interface Props {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onEdit }: Props) {
  const categories = useFinanceStore((s) => s.categories)
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'todos'>('todos')
  const [categoryFilter, setCategoryFilter] = useState('todas')

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  )

  const filtered = transactions
    .filter((t) => (typeFilter === 'todos' ? true : t.type === typeFilter))
    .filter((t) => (categoryFilter === 'todas' ? true : t.categoryId === categoryFilter))
    .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900">
      <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por descrição..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'todos')}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        >
          <option value="todos">Todos os tipos</option>
          <option value="receita">Receitas</option>
          <option value="despesa">Despesas</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
        >
          <option value="todas">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="p-6 text-center text-sm text-slate-500">Nenhum lançamento encontrado.</p>
      ) : (
        <ul className="divide-y divide-slate-800">
          {filtered.map((t) => {
            const category = categoryById.get(t.categoryId)
            return (
              <li key={t.id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: category?.color ?? '#94a3b8' }}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-100">{t.description}</p>
                    <p className="text-xs text-slate-500">
                      {formatDate(t.date)} · {category?.name ?? 'Sem categoria'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`font-semibold ${
                      t.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEdit(t)}
                    className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Excluir este lançamento?')) deleteTransaction(t.id)
                    }}
                    className="rounded-lg px-2 py-1 text-xs text-rose-400 hover:bg-rose-950"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
