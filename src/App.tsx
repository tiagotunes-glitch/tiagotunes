import { useMemo, useState } from 'react'
import { CategoriesManager } from './components/CategoriesManager'
import { DataTools } from './components/DataTools'
import { ExpenseByCategoryChart } from './components/ExpenseByCategoryChart'
import { MonthNavigator } from './components/MonthNavigator'
import { MonthlyTrendChart } from './components/MonthlyTrendChart'
import { SummaryCards } from './components/SummaryCards'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { useFinanceStore } from './store/useFinanceStore'
import type { Transaction } from './types'
import { currentMonthKey } from './utils/format'
import { balanceUpTo, expensesByCategory, monthlyTrend, totalsForMonth } from './utils/selectors'

type Tab = 'dashboard' | 'transacoes' | 'categorias' | 'dados'

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Painel' },
  { id: 'transacoes', label: 'Lançamentos' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'dados', label: 'Dados' },
]

function App() {
  const transactions = useFinanceStore((s) => s.transactions)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [monthKey, setMonthKey] = useState(currentMonthKey())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const { receitas, despesas, saldo } = useMemo(
    () => totalsForMonth(transactions, monthKey),
    [transactions, monthKey],
  )
  const saldoTotal = useMemo(() => balanceUpTo(transactions, monthKey), [transactions, monthKey])
  const categories = useFinanceStore((s) => s.categories)
  const expenseData = useMemo(
    () => expensesByCategory(transactions, categories, monthKey),
    [transactions, categories, monthKey],
  )
  const trendData = useMemo(() => monthlyTrend(transactions, monthKey), [transactions, monthKey])
  const monthTransactions = useMemo(
    () => transactions.filter((t) => t.date.slice(0, 7) === monthKey),
    [transactions, monthKey],
  )

  function openNewForm() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEditForm(transaction: Transaction) {
    setEditing(transaction)
    setFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-slate-100">💰 Minhas Finanças</h1>
          <button
            type="button"
            onClick={openNewForm}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500"
          >
            + Novo lançamento
          </button>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-t-lg px-4 py-2 text-sm font-medium ${
                tab === t.id
                  ? 'bg-slate-900 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        {(tab === 'dashboard' || tab === 'transacoes') && (
          <MonthNavigator monthKey={monthKey} onChange={setMonthKey} />
        )}

        {tab === 'dashboard' && (
          <div className="space-y-6">
            <SummaryCards
              receitas={receitas}
              despesas={despesas}
              saldoMes={saldo}
              saldoTotal={saldoTotal}
            />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h2 className="mb-2 text-sm font-semibold text-slate-200">Despesas por categoria</h2>
                <ExpenseByCategoryChart data={expenseData} />
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h2 className="mb-2 text-sm font-semibold text-slate-200">
                  Receitas x despesas (últimos 6 meses)
                </h2>
                <MonthlyTrendChart data={trendData} />
              </div>
            </div>
          </div>
        )}

        {tab === 'transacoes' && (
          <TransactionList transactions={monthTransactions} onEdit={openEditForm} />
        )}

        {tab === 'categorias' && <CategoriesManager />}

        {tab === 'dados' && <DataTools />}
      </main>

      {formOpen && <TransactionForm editing={editing} onClose={() => setFormOpen(false)} />}
    </div>
  )
}

export default App
