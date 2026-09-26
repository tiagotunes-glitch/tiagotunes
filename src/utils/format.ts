export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7) // yyyy-mm
}

export function monthKeyOf(iso: string): string {
  return iso.slice(0, 7)
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return `${MONTH_NAMES[month - 1]} de ${year}`
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}
