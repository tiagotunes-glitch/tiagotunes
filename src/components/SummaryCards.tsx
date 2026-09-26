import { formatCurrency } from '../utils/format'

interface Props {
  receitas: number
  despesas: number
  saldoMes: number
  saldoTotal: number
}

export function SummaryCards({ receitas, despesas, saldoMes, saldoTotal }: Props) {
  const cards = [
    { label: 'Receitas do mês', value: receitas, accent: 'text-emerald-400' },
    { label: 'Despesas do mês', value: despesas, accent: 'text-rose-400' },
    {
      label: 'Saldo do mês',
      value: saldoMes,
      accent: saldoMes >= 0 ? 'text-emerald-400' : 'text-rose-400',
    },
    {
      label: 'Saldo acumulado',
      value: saldoTotal,
      accent: saldoTotal >= 0 ? 'text-sky-400' : 'text-rose-400',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold ${card.accent}`}>
            {formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  )
}
