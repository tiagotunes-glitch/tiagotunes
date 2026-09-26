import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency, formatMonthKey } from '../utils/format'

interface Item {
  monthKey: string
  receitas: number
  despesas: number
}

export function MonthlyTrendChart({ data }: { data: Item[] }) {
  const chartData = data.map((item) => ({
    ...item,
    label: formatMonthKey(item.monthKey).split(' de ')[0].slice(0, 3),
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} />
        <YAxis
          stroke="#94a3b8"
          fontSize={12}
          tickFormatter={(v: number) => v.toLocaleString('pt-BR', { notation: 'compact' })}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }}
        />
        <Legend />
        <Bar dataKey="receitas" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="despesas" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
