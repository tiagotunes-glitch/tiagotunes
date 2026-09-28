import { useRef, useState } from 'react'
import { useFinanceStore } from '../store/useFinanceStore'
import type { OfxTransaction } from '../utils/ofx'
import { parseOfx, readOfxFile } from '../utils/ofx'
import { formatCurrency, formatDate } from '../utils/format'

export function ImportOfx() {
  const categories = useFinanceStore((s) => s.categories)
  const importTransactions = useFinanceStore((s) => s.importTransactions)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [parsed, setParsed] = useState<OfxTransaction[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null)

  const despesaCategories = categories.filter((c) => c.type === 'despesa')
  const receitaCategories = categories.filter((c) => c.type === 'receita')
  const [despesaCategoryId, setDespesaCategoryId] = useState(despesaCategories[0]?.id ?? '')
  const [receitaCategoryId, setReceitaCategoryId] = useState(receitaCategories[0]?.id ?? '')

  function handleClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setError('')
    setResult(null)
    setFileName(file.name)

    try {
      const text = await readOfxFile(file)
      const transactions = parseOfx(text)
      if (transactions.length === 0) {
        setParsed(null)
        setError('Nenhum lançamento encontrado neste arquivo OFX.')
        return
      }
      setParsed(transactions)
    } catch {
      setParsed(null)
      setError('Não foi possível ler este arquivo. Confirme que é um extrato OFX válido.')
    }
  }

  function categoryIdFor(t: OfxTransaction): string {
    if (t.investmentMove === 'aplicacao') {
      const category = categories.find((c) => c.id === 'cat-aplicacao-investimento')
      if (category) return category.id
    }
    if (t.investmentMove === 'resgate') {
      const category = categories.find((c) => c.id === 'cat-resgate-investimento')
      if (category) return category.id
    }
    return t.type === 'despesa' ? despesaCategoryId : receitaCategoryId
  }

  function handleConfirmImport() {
    if (!parsed) return
    const withCategory = parsed.map((t) => ({
      ...t,
      categoryId: categoryIdFor(t),
    }))
    const outcome = importTransactions(withCategory)
    setResult(outcome)
    setParsed(null)
    setFileName('')
  }

  function handleCancel() {
    setParsed(null)
    setFileName('')
    setError('')
  }

  const totalDespesas = parsed
    ?.filter((t) => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalReceitas = parsed
    ?.filter((t) => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0)
  const investmentMoveCount = parsed?.filter((t) => t.investmentMove).length ?? 0

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-200">Importar extrato (OFX)</h3>
      <p className="mb-4 text-sm text-slate-500">
        Importe o arquivo .ofx exportado do internet banking (Banco Inter e outros). Lançamentos
        já importados antes (mesmo identificador do banco) não são duplicados.
      </p>

      {!parsed && (
        <>
          <button
            type="button"
            onClick={handleClick}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
          >
            Selecionar arquivo .ofx
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ofx,application/x-ofx,text/ofx"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}

      {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

      {result && (
        <p className="mt-3 text-sm text-emerald-400">
          {result.imported} lançamento(s) importado(s)
          {result.skipped > 0 ? ` · ${result.skipped} já existente(s), ignorado(s)` : ''}.
        </p>
      )}

      {parsed && (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-300">
            <span className="font-medium text-slate-100">{fileName}</span> · {parsed.length}{' '}
            lançamento(s) encontrado(s)
            {totalReceitas ? ` · receitas: ${formatCurrency(totalReceitas)}` : ''}
            {totalDespesas ? ` · despesas: ${formatCurrency(totalDespesas)}` : ''}
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-400" htmlFor="ofx-despesa-cat">
                Categoria para despesas importadas
              </label>
              <select
                id="ofx-despesa-cat"
                value={despesaCategoryId}
                onChange={(e) => setDespesaCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              >
                {despesaCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-400" htmlFor="ofx-receita-cat">
                Categoria para receitas importadas
              </label>
              <select
                id="ofx-receita-cat"
                value={receitaCategoryId}
                onChange={(e) => setReceitaCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              >
                {receitaCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Lançamentos sem indicação de aplicação/resgate entram com a categoria acima escolhida;
            você pode reclassificar cada um depois na aba Lançamentos.
          </p>

          {investmentMoveCount > 0 && (
            <p className="rounded-lg bg-cyan-950/50 px-3 py-2 text-sm text-cyan-300">
              🔁 {investmentMoveCount} lançamento(s) identificado(s) automaticamente como
              aplicação/resgate em investimentos — categorizados à parte e{' '}
              <strong>não entram</strong> nos totais de receita/despesa do painel, por serem
              transferência entre suas próprias contas.
            </p>
          )}

          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-800">
            <ul className="divide-y divide-slate-800">
              {parsed.map((t, i) => (
                <li
                  key={`${t.externalId ?? i}-${t.date}-${t.amount}`}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate text-slate-200">
                      {t.description}
                      {t.investmentMove && (
                        <span className="ml-2 rounded bg-cyan-950 px-1.5 py-0.5 text-xs text-cyan-300">
                          {t.investmentMove === 'aplicacao' ? 'Aplicação' : 'Resgate'}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(t.date)}</p>
                  </div>
                  <span
                    className={`shrink-0 font-medium ${
                      t.type === 'receita' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {t.type === 'receita' ? '+' : '-'} {formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={!despesaCategoryId && !receitaCategoryId}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Importar {parsed.length} lançamento(s)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
