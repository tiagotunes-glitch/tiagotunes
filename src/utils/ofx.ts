import type { TransactionType } from '../types'

export interface OfxTransaction {
  date: string // ISO yyyy-mm-dd
  description: string
  amount: number // always positive
  type: TransactionType
  externalId?: string
}

export async function readOfxFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const header = new TextDecoder('windows-1252').decode(buffer.slice(0, 512))
  const charsetMatch = header.match(/CHARSET:\s*([\w-]+)/i)
  let encoding = 'utf-8'
  if (charsetMatch) {
    const charset = charsetMatch[1].toUpperCase()
    if (charset === '1252' || charset.includes('8859')) encoding = 'windows-1252'
  }
  try {
    return new TextDecoder(encoding).decode(buffer)
  } catch {
    return new TextDecoder('utf-8').decode(buffer)
  }
}

function extractField(block: string, tag: string): string | undefined {
  const match = block.match(new RegExp(`<${tag}>([^<\r\n]*)`, 'i'))
  return match ? match[1].trim() : undefined
}

function parseOfxDate(raw: string): string | undefined {
  const match = raw.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!match) return undefined
  const [, year, month, day] = match
  return `${year}-${month}-${day}`
}

export function parseOfx(text: string): OfxTransaction[] {
  const transactions: OfxTransaction[] = []
  const blockRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi
  let match: RegExpExecArray | null
  while ((match = blockRegex.exec(text))) {
    const block = match[1]
    const amountRaw = extractField(block, 'TRNAMT')
    const dateRaw = extractField(block, 'DTPOSTED')
    if (!amountRaw || !dateRaw) continue

    const amount = Number(amountRaw.replace(',', '.'))
    const date = parseOfxDate(dateRaw)
    if (Number.isNaN(amount) || amount === 0 || !date) continue

    const memo = extractField(block, 'MEMO')
    const name = extractField(block, 'NAME')
    const fitId = extractField(block, 'FITID')

    transactions.push({
      date,
      description: memo || name || 'Lançamento importado',
      amount: Math.abs(amount),
      type: amount < 0 ? 'despesa' : 'receita',
      externalId: fitId,
    })
  }
  return transactions
}
