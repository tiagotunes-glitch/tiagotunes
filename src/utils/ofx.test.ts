import { describe, expect, it } from 'vitest'
import { parseOfx } from './ofx'

const sampleOfx = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
SECURITY:NONE
ENCODING:USASCII
CHARSET:1252
COMPRESSION:NONE
OLDFILEUID:NONE
NEWFILEUID:NONE

<OFX>
<SIGNONMSGSRSV1>
<SONRS>
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<DTSERVER>20240131120000
<LANGUAGE>POR
</SONRS>
</SIGNONMSGSRSV1>
<BANKMSGSRSV1>
<STMTTRNRS>
<TRNUID>1
<STATUS>
<CODE>0
<SEVERITY>INFO
</STATUS>
<STMTRS>
<CURDEF>BRL
<BANKACCTFROM>
<BANKID>077
<ACCTID>12345678
<ACCTTYPE>CHECKING
</BANKACCTFROM>
<BANKTRANLIST>
<DTSTART>20240101000000
<DTEND>20240131000000
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240105120000[-03:EST]
<TRNAMT>-150.00
<FITID>202401050001
<MEMO>PAGAMENTO BOLETO
</STMTTRN>
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240110080000[-03:EST]
<TRNAMT>2500.00
<FITID>202401100001
<MEMO>TRANSFERENCIA RECEBIDA
</STMTTRN>
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240115000000
<TRNAMT>-45.90
<FITID>202401150001
<NAME>SUPERMERCADO ABC
</STMTTRN>
</BANKTRANLIST>
</STMTRS>
</STMTTRNRS>
</BANKMSGSRSV1>
</OFX>
`

describe('parseOfx', () => {
  it('extracts every STMTTRN block', () => {
    expect(parseOfx(sampleOfx)).toHaveLength(3)
  })

  it('marks negative amounts as despesa with the absolute value', () => {
    const [first] = parseOfx(sampleOfx)
    expect(first).toMatchObject({
      date: '2024-01-05',
      description: 'PAGAMENTO BOLETO',
      amount: 150,
      type: 'despesa',
      externalId: '202401050001',
    })
  })

  it('marks positive amounts as receita', () => {
    const [, second] = parseOfx(sampleOfx)
    expect(second).toMatchObject({
      date: '2024-01-10',
      description: 'TRANSFERENCIA RECEBIDA',
      amount: 2500,
      type: 'receita',
    })
  })

  it('falls back to NAME when MEMO is absent', () => {
    const [, , third] = parseOfx(sampleOfx)
    expect(third.description).toBe('SUPERMERCADO ABC')
  })

  it('returns an empty array when there are no transactions', () => {
    expect(parseOfx('<OFX></OFX>')).toEqual([])
  })

  it('ignores malformed blocks missing amount or date', () => {
    const broken = `
<STMTTRN>
<TRNTYPE>DEBIT
<MEMO>SEM VALOR OU DATA
</STMTTRN>
`
    expect(parseOfx(broken)).toEqual([])
  })
})

describe('parseOfx investment move detection', () => {
  it('flags a debit whose description mentions APLICA as aplicacao', () => {
    const ofx = `
<STMTTRN>
<TRNTYPE>DEBIT
<DTPOSTED>20240120000000
<TRNAMT>-1000.00
<FITID>1
<MEMO>APLICACAO RDB AUTOMATICA
</STMTTRN>
`
    const [t] = parseOfx(ofx)
    expect(t.investmentMove).toBe('aplicacao')
  })

  it('flags a credit whose description mentions RESGATE as resgate', () => {
    const ofx = `
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240122000000
<TRNAMT>1050.00
<FITID>2
<MEMO>RESGATE RDB AUTOMATICO
</STMTTRN>
`
    const [t] = parseOfx(ofx)
    expect(t.investmentMove).toBe('resgate')
  })

  it('does not flag a credit that mentions APLICA (wrong direction)', () => {
    const ofx = `
<STMTTRN>
<TRNTYPE>CREDIT
<DTPOSTED>20240120000000
<TRNAMT>1000.00
<FITID>3
<MEMO>APLICACAO ESTORNADA
</STMTTRN>
`
    const [t] = parseOfx(ofx)
    expect(t.investmentMove).toBeUndefined()
  })

  it('leaves ordinary transactions without investmentMove', () => {
    const [pagamento] = parseOfx(sampleOfx)
    expect(pagamento.investmentMove).toBeUndefined()
  })
})
