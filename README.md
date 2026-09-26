# Minhas Finanças

Aplicativo web para controle financeiro de pessoa física: lançamentos de
receitas e despesas, categorização, resumo mensal e gráficos.

## Funcionalidades

- Cadastro de lançamentos (receita/despesa) com descrição, valor, data e categoria
- Painel com totais do mês (receitas, despesas, saldo do mês e saldo acumulado)
- Gráfico de despesas por categoria e de receitas x despesas dos últimos 6 meses
- Navegação entre meses
- Lista de lançamentos com busca e filtros por tipo/categoria, edição e exclusão
- Gerenciamento de categorias (padrão + personalizadas)
- Exportação de backup em JSON e de lançamentos em CSV, e importação de backup
- Dados salvos localmente no navegador (`localStorage`) — não há backend nem envio de dados a servidores

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## Testes

```bash
npm run test
```

Cobre as funções de cálculo (totais mensais, saldo acumulado, despesas por
categoria) e de formatação.

## Build de produção

```bash
npm run build
npm run preview
```

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Zustand (estado + persistência em `localStorage`)
- Recharts (gráficos)

## Observação sobre os dados

Todos os dados ficam salvos apenas no navegador utilizado (chave
`financas-pf` no `localStorage`). Limpar o cache do navegador ou trocar de
dispositivo apaga o histórico local — use a aba **Dados** para exportar
backups periodicamente.
