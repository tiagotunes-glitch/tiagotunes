import { useEffect, useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Transaction, TransactionType } from '../types'
import { todayISO } from '../utils/format'

interface Props {
  editing: Transaction | null
  onClose: () => void
}

export function TransactionForm({ editing, onClose }: Props) {
  const categories = useFinanceStore((s) => s.categories)
  const addTransaction = useFinanceStore((s) => s.addTransaction)
  const updateTransaction = useFinanceStore((s) => s.updateTransaction)

  const [type, setType] = useState<TransactionType>(editing?.type ?? 'despesa')
  const [description, setDescription] = useState(editing?.description ?? '')
  const [amount, setAmount] = useState(editing ? String(editing.amount) : '')
  const [date, setDate] = useState(editing?.date ?? todayISO())
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? '')

  const availableCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (!availableCategories.some((c) => c.id === categoryId)) {
      setCategoryId(availableCategories[0]?.id ?? '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = Number(amount.replace(',', '.'))
    if (!description.trim() || !parsedAmount || parsedAmount <= 0 || !categoryId || !date) return

    const payload = {
      type,
      description: description.trim(),
      amount: parsedAmount,
      date,
      categoryId,
    }

    if (editing) {
      updateTransaction(editing.id, payload)
    } else {
      addTransaction(payload)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-100">
          {editing ? 'Editar lançamento' : 'Novo lançamento'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            {(['despesa', 'receita'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize ${
                  type === t
                    ? t === 'receita'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="description">
              Descrição
            </label>
            <input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              placeholder="Ex: Supermercado, Salário, Aluguel..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-slate-400" htmlFor="amount">
                Valor (R$)
              </label>
              <input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400" htmlFor="date">
                Data
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-400" htmlFor="category">
              Categoria
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
              required
            >
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
            >
              {editing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
