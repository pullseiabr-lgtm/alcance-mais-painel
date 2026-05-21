// Armazenamento local de usuários para modo dev (sem Supabase)
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { PERMISSOES_PADRAO, type Role } from './permissoes'

const DB_PATH = path.join(process.cwd(), '.usuarios-dev.json')

export type UsuarioLocal = {
  id: string
  nome: string
  email: string
  cargo: string
  role: Role
  permissoes: string[]
  ativo: boolean
  created_at: string
  senha_hash: string
}

function lerDB(): UsuarioLocal[] {
  try {
    if (!fs.existsSync(DB_PATH)) return []
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
  } catch { return [] }
}

function salvarDB(usuarios: UsuarioLocal[]) {
  fs.writeFileSync(DB_PATH, JSON.stringify(usuarios, null, 2), 'utf-8')
}

function hashSenha(senha: string) {
  return crypto.createHash('sha256').update(senha + 'alcance2026').digest('hex')
}

export function listarUsuarios() {
  return lerDB().map(({ senha_hash: _, ...u }) => u)
}

export function criarUsuario(dados: {
  nome: string; email: string; senha: string
  cargo?: string; role: Role; permissoes?: string[]
}) {
  const db = lerDB()
  if (db.find(u => u.email === dados.email)) {
    throw new Error('E-mail já cadastrado')
  }
  const novo: UsuarioLocal = {
    id: crypto.randomUUID(),
    nome: dados.nome,
    email: dados.email,
    cargo: dados.cargo ?? '',
    role: dados.role,
    permissoes: dados.permissoes ?? PERMISSOES_PADRAO[dados.role] ?? [],
    ativo: true,
    created_at: new Date().toISOString(),
    senha_hash: hashSenha(dados.senha),
  }
  db.push(novo)
  salvarDB(db)
  const { senha_hash: _, ...sem } = novo
  return sem
}

export function atualizarUsuario(id: string, dados: Partial<UsuarioLocal & { senha?: string }>) {
  const db = lerDB()
  const idx = db.findIndex(u => u.id === id)
  if (idx === -1) throw new Error('Usuário não encontrado')
  if (dados.senha) {
    db[idx].senha_hash = hashSenha(dados.senha)
  }
  const { senha: _, senha_hash: __, ...rest } = dados as Record<string, unknown>
  db[idx] = { ...db[idx], ...(rest as Partial<UsuarioLocal>) }
  salvarDB(db)
  const { senha_hash: _h, ...sem } = db[idx]
  return sem
}

export function deletarUsuario(id: string) {
  const db = lerDB()
  const novo = db.filter(u => u.id !== id)
  salvarDB(novo)
}

export function autenticarUsuario(email: string, senha: string) {
  const db = lerDB()
  const user = db.find(u => u.email === email && u.senha_hash === hashSenha(senha) && u.ativo)
  if (!user) return null
  const { senha_hash: _, ...sem } = user
  return sem
}
