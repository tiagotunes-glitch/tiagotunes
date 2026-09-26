import type { Category } from '../types'

export const defaultCategories: Category[] = [
  { id: 'cat-salario', name: 'Salário', type: 'receita', color: '#16a34a' },
  { id: 'cat-freelance', name: 'Freelance / Extra', type: 'receita', color: '#22c55e' },
  { id: 'cat-investimentos-receita', name: 'Rendimentos', type: 'receita', color: '#84cc16' },
  { id: 'cat-outros-receita', name: 'Outras receitas', type: 'receita', color: '#4ade80' },

  { id: 'cat-moradia', name: 'Moradia', type: 'despesa', color: '#ef4444' },
  { id: 'cat-alimentacao', name: 'Alimentação', type: 'despesa', color: '#f97316' },
  { id: 'cat-transporte', name: 'Transporte', type: 'despesa', color: '#eab308' },
  { id: 'cat-saude', name: 'Saúde', type: 'despesa', color: '#ec4899' },
  { id: 'cat-educacao', name: 'Educação', type: 'despesa', color: '#8b5cf6' },
  { id: 'cat-lazer', name: 'Lazer', type: 'despesa', color: '#06b6d4' },
  { id: 'cat-assinaturas', name: 'Assinaturas', type: 'despesa', color: '#0ea5e9' },
  { id: 'cat-cartao', name: 'Cartão de crédito', type: 'despesa', color: '#f43f5e' },
  { id: 'cat-outros-despesa', name: 'Outras despesas', type: 'despesa', color: '#a8a29e' },
]
