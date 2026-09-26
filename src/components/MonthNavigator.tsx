import { formatMonthKey, shiftMonthKey } from '../utils/format'

interface Props {
  monthKey: string
  onChange: (monthKey: string) => void
}

export function MonthNavigator({ monthKey, onChange }: Props) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(shiftMonthKey(monthKey, -1))}
        className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 hover:bg-slate-700"
        aria-label="Mês anterior"
      >
        ‹
      </button>
      <span className="min-w-[10rem] text-center font-medium capitalize text-slate-100">
        {formatMonthKey(monthKey)}
      </span>
      <button
        type="button"
        onClick={() => onChange(shiftMonthKey(monthKey, 1))}
        className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-200 hover:bg-slate-700"
        aria-label="Próximo mês"
      >
        ›
      </button>
    </div>
  )
}
