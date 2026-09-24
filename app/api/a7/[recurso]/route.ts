// CRUD genérico do A7. O cliente só enxerga/altera o que é dele; a equipe vê tudo por cliente_id.
import { NextRequest, NextResponse } from 'next/server'
import { RECURSOS } from '@/lib/a7-config'
import { admin, cifrar, decifrar, getCtx, hashSenha } from '@/lib/a7-server'

export const runtime = 'nodejs'

const err = (m: string, s = 400) => NextResponse.json({ error: m }, { status: s })

function pegar(cfg: (typeof RECURSOS)[string], body: any, permitidos?: string[]) {
  const out: Record<string, any> = {}
  for (const c of cfg.campos) {
    if (permitidos && !permitidos.includes(c.k)) continue
    if (body[c.k] === undefined) continue
    let v = body[c.k]
    if (c.tipo === 'number') v = Number(v) || 0
    if ((c.tipo === 'date' || c.tipo === 'datetime') && !v) v = null
    out[c.k] = v
  }
  return out
}

function saida(recurso: string, row: any) {
  if (recurso === 'senhas') { const { senha_enc, ...r } = row; return { ...r, senha: decifrar(senha_enc) } }
  if (recurso === 'acessos') { const { senha_hash, ...r } = row; return r }
  return row
}

export async function GET(req: NextRequest, { params }: { params: { recurso: string } }) {
  const ctx = await getCtx(req)
  if (!ctx) return err('Não autenticado', 401)
  const sb = admin()

  if (params.recurso === 'clientes') {
    if (ctx.tipo !== 'staff') return err('Sem permissão', 403)
    const { data } = await sb.from('clientes').select('id,nome').order('nome')
    return NextResponse.json({ data: data ?? [] })
  }

  const cfg = RECURSOS[params.recurso]
  if (!cfg) return err('Recurso inválido', 404)
  if (params.recurso === 'acessos' && ctx.tipo !== 'staff') return err('Sem permissão', 403)

  let q = sb.from(cfg.tabela).select('*')
  if (ctx.clienteId) {
    q = params.recurso === 'comunicados'
      ? q.or(`cliente_id.eq.${ctx.clienteId},cliente_id.is.null`)
      : q.eq('cliente_id', ctx.clienteId)
  } else if (ctx.tipo === 'cliente') return err('Sem permissão', 403)
  q = q.order(cfg.ordem.col, { ascending: cfg.ordem.asc, nullsFirst: false })

  const { data, error } = await q
  if (error) return err(error.message + ' — rodou supabase/a7.sql?', 500)
  return NextResponse.json({ data: (data ?? []).map(r => saida(params.recurso, r)) })
}

export async function POST(req: NextRequest, { params }: { params: { recurso: string } }) {
  const ctx = await getCtx(req)
  if (!ctx) return err('Não autenticado', 401)
  const cfg = RECURSOS[params.recurso]
  if (!cfg) return err('Recurso inválido', 404)
  if (ctx.tipo === 'cliente' && !cfg.cliente.criar) return err('Sem permissão', 403)

  const body = await req.json()
  const clienteId = ctx.tipo === 'cliente' ? ctx.clienteId : (body.cliente_id ?? ctx.clienteId)
  if (params.recurso === 'comunicados' && ctx.tipo === 'staff' && !body.cliente_id && !ctx.clienteId) {
    // comunicado geral (todos os clientes)
  } else if (!clienteId) return err('Selecione o cliente')

  const row: Record<string, any> = { ...pegar(cfg, body), cliente_id: clienteId || null }
  for (const c of cfg.campos) if (c.obrigatorio && !row[c.k]) return err(`Preencha: ${c.label}`)

  if (params.recurso === 'senhas') { row.senha_enc = cifrar(body.senha || ''); delete row.senha }
  if (params.recurso === 'acessos') {
    row.email = String(row.email).trim().toLowerCase()
    row.senha_hash = hashSenha(body.senha); delete row.senha
  }
  if (params.recurso === 'biblioteca') {
    row.origem = ctx.tipo === 'cliente' ? 'cliente' : 'agencia'
    row.tipo = body.tipo || 'outro'; row.path = body.path || ''; row.tamanho = Number(body.tamanho) || 0
  }
  if (params.recurso === 'chamados') {
    const texto = body.descricao || ''
    row.status = 'novo'
    row.mensagens = texto ? [{ autor: body.autor || 'Cliente', de: ctx.tipo, texto, em: new Date().toISOString() }] : []
  }
  if (ctx.tipo === 'cliente' && params.recurso === 'senhas') row.obs = row.obs ?? ''

  const { data, error } = await admin().from(cfg.tabela).insert(row).select().single()
  if (error) return err(error.message, 500)
  return NextResponse.json({ data: saida(params.recurso, data) })
}

export async function PATCH(req: NextRequest, { params }: { params: { recurso: string } }) {
  const ctx = await getCtx(req)
  if (!ctx) return err('Não autenticado', 401)
  const cfg = RECURSOS[params.recurso]
  if (!cfg) return err('Recurso inválido', 404)
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return err('id obrigatório')
  const body = await req.json()
  const sb = admin()

  // Resposta em chamado (cliente ou equipe)
  if (params.recurso === 'chamados' && body.mensagem) {
    let q = sb.from('a7_chamados').select('*').eq('id', id)
    if (ctx.tipo === 'cliente') q = q.eq('cliente_id', ctx.clienteId)
    const { data: ch } = await q.maybeSingle()
    if (!ch) return err('Chamado não encontrado', 404)
    const msgs = [...(ch.mensagens || []), {
      autor: body.autor || (ctx.tipo === 'cliente' ? 'Cliente' : 'Equipe Alcance+'),
      de: ctx.tipo, texto: body.mensagem, em: new Date().toISOString(),
    }]
    let status = ch.status
    if (ctx.tipo === 'cliente' && (status === 'aguardando_cliente' || status === 'resolvido')) status = 'andamento'
    if (ctx.tipo === 'staff') status = body.status || (status === 'novo' ? 'andamento' : status)
    const { data, error } = await sb.from('a7_chamados')
      .update({ mensagens: msgs, status, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) return err(error.message, 500)
    return NextResponse.json({ data })
  }

  const permitidos = ctx.tipo === 'cliente' ? cfg.cliente.editar : undefined
  if (ctx.tipo === 'cliente' && !permitidos) return err('Sem permissão', 403)
  const upd = pegar(cfg, body, permitidos)

  // Cliente só pode aprovar ou pedir ajuste no cronograma
  if (ctx.tipo === 'cliente' && params.recurso === 'posts' && upd.status && !['aprovado', 'ajuste'].includes(upd.status)) {
    return err('Status não permitido', 403)
  }
  // Cliente valida uma ação: aprova ou devolve para execução
  if (ctx.tipo === 'cliente' && params.recurso === 'acoes' && upd.status && !['aprovado', 'execucao'].includes(upd.status)) {
    return err('Status não permitido', 403)
  }
  if (params.recurso === 'senhas' && 'senha' in upd) { upd.senha_enc = cifrar(upd.senha); delete upd.senha }
  if (params.recurso === 'acessos' && body.senha) upd.senha_hash = hashSenha(body.senha)
  if (params.recurso === 'acessos') delete upd.senha

  let q = sb.from(cfg.tabela).update(upd).eq('id', id)
  if (ctx.tipo === 'cliente') q = q.eq('cliente_id', ctx.clienteId)
  const { data, error } = await q.select().single()
  if (error) return err(error.message, 500)
  return NextResponse.json({ data: saida(params.recurso, data) })
}

export async function DELETE(req: NextRequest, { params }: { params: { recurso: string } }) {
  const ctx = await getCtx(req)
  if (!ctx) return err('Não autenticado', 401)
  const cfg = RECURSOS[params.recurso]
  if (!cfg) return err('Recurso inválido', 404)
  if (ctx.tipo === 'cliente' && !cfg.cliente.apagar) return err('Sem permissão', 403)
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return err('id obrigatório')
  const sb = admin()

  if (params.recurso === 'biblioteca') {
    let q = sb.from('a7_biblioteca').select('path,cliente_id,origem').eq('id', id)
    if (ctx.tipo === 'cliente') q = q.eq('cliente_id', ctx.clienteId)
    const { data: b } = await q.maybeSingle()
    if (!b) return err('Arquivo não encontrado', 404)
    if (ctx.tipo === 'cliente' && b.origem !== 'cliente') return err('Só a agência remove arquivos dela', 403)
    if (b.path) await sb.storage.from('a7').remove([b.path])
  }

  let q = sb.from(cfg.tabela).delete().eq('id', id)
  if (ctx.tipo === 'cliente') q = q.eq('cliente_id', ctx.clienteId)
  const { error } = await q
  if (error) return err(error.message, 500)
  return NextResponse.json({ ok: true })
}
