import { useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import type { TransactionType } from '../types'

const PALETTE = [
  '#22c55e', '#ef4444', '#f97316', '#eab308', '#06b6d4',
  '#8b5cf6', '#ec4899', '#0ea5e9', '#84cc16', '#f43f5e',
]

export function CategoriesManager() {
  const categories = useFinanceStore((s) => s.categories)
  const addCategory = useFinanceStore((s) => s.addCategory)
  const deleteCategory = useFinanceStore((s) => s.deleteCategory)

  const [name, setName] = useState('')
  const [type, setType] = useState<TransactionType>('despesa')
  const [error, setError] = useState('')

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const color = PALETTE[categories.length % PALETTE.length]
    addCategory(name.trim(), type, color)
    setName('')
  }

  function handleDelete(id: string) {
    setError('')
    if (!confirm('Excluir esta categoria?')) return
    const ok = deleteCategory(id)
    if (!ok) setError('Não é possível excluir: existem lançamentos usando esta categoria.')
  }

  const receitaCategories = categories.filter((c) => c.type === 'receita')
  const despesaCategories = categories.filter((c) => c.type === 'despesa')

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleAdd}
        className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-sm text-slate-400" htmlFor="cat-name">
            Nova categoria
          </label>
          <input
            id="cat-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Pets, Viagens..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
          />
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as TransactionType)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
        >
          <option value="despesa">Despesa</option>
          <option value="receita">Receita</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Adicionar
        </button>
      </form>

      {error && <p className="text-sm text-rose-400">{error}</p>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-emerald-400">Receitas</h3>
          <ul className="space-y-1">
            {receitaCategories.map((c) => (
              <CategoryRow key={c.id} name={c.name} color={c.color} onDelete={() => handleDelete(c.id)} />
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-rose-400">Despesas</h3>
          <ul className="space-y-1">
            {despesaCategories.map((c) => (
              <CategoryRow key={c.id} name={c.name} color={c.color} onDelete={() => handleDelete(c.id)} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

function CategoryRow({
  name,
  color,
  onDelete,
}: {
  name: string
  color: string
  onDelete: () => void
}) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
      <span className="flex items-center gap-2 text-sm text-slate-200">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
        {name}
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="text-xs text-rose-400 hover:text-rose-300"
      >
        Excluir
      </button>
    </li>
  )
}
