import { useRef } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'

export function DataTools() {
  const transactions = useFinanceStore((s) => s.transactions)
  const categories = useFinanceStore((s) => s.categories)
  const importData = useFinanceStore((s) => s.importData)
  const resetAll = useFinanceStore((s) => s.resetAll)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const blob = new Blob([JSON.stringify({ transactions, categories }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financas-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportCsv() {
    const header = 'data,descricao,tipo,categoria,valor'
    const categoryById = new Map(categories.map((c) => [c.id, c.name]))
    const rows = transactions.map((t) =>
      [t.date, `"${t.description.replace(/"/g, '""')}"`, t.type, categoryById.get(t.categoryId) ?? '', t.amount]
        .join(','),
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financas-transacoes-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data.transactions) || !Array.isArray(data.categories)) {
        throw new Error('Formato inválido')
      }
      if (confirm('Importar este backup irá substituir todos os dados atuais. Continuar?')) {
        importData(data)
      }
    } catch {
      alert('Não foi possível importar: arquivo inválido.')
    } finally {
      e.target.value = ''
    }
  }

  function handleReset() {
    if (confirm('Isso apagará todos os lançamentos e restaurará as categorias padrão. Continuar?')) {
      resetAll()
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-200">Backup e dados</h3>
      <p className="mb-4 text-sm text-slate-500">
        Seus dados ficam salvos apenas neste navegador. Exporte um backup periodicamente.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          Exportar backup (JSON)
        </button>
        <button
          type="button"
          onClick={handleExportCsv}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          Exportar transações (CSV)
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
        >
          Importar backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg bg-rose-950 px-4 py-2 text-sm text-rose-300 hover:bg-rose-900"
        >
          Limpar todos os dados
        </button>
      </div>
    </div>
  )
}
