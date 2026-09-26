import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '../utils/format'

interface Item {
  categoryId: string
  name: string
  color: string
  value: number
}

export function ExpenseByCategoryChart({ data }: { data: Item[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Nenhuma despesa registrada neste mês.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((entry) => (
            <Cell key={entry.categoryId} fill={entry.color} stroke="#0f172a" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
