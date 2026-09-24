'use client'
import { useCallback, useEffect, useState } from 'react'

/** Cliente em pré-visualização pela equipe (persistido na aba). */
export function clientePreview(): string {
  try { return sessionStorage.getItem('a7_cliente') || '' } catch { return '' }
}
export function setClientePreview(id: string) {
  try { id ? sessionStorage.setItem('a7_cliente', id) : sessionStorage.removeItem('a7_cliente') } catch {}
}

function url(recurso: string, extra: Record<string, string> = {}, clienteId?: string) {
  const p = new URLSearchParams(extra)
  const c = clienteId ?? clientePreview()
  if (c) p.set('cliente_id', c)
  const qs = p.toString()
  return `/api/a7/${recurso}${qs ? '?' + qs : ''}`
}

async function tratar(r: Response) {
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(j.error || 'Erro na requisição')
  return j
}

export const a7 = {
  listar: (rec: string, clienteId?: string) => fetch(url(rec, {}, clienteId)).then(tratar).then(j => j.data as any[]),
  criar: (rec: string, body: any, clienteId?: string) =>
    fetch(url(rec, {}, clienteId), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(tratar).then(j => j.data),
  editar: (rec: string, id: string, body: any, clienteId?: string) =>
    fetch(url(rec, { id }, clienteId), { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(tratar).then(j => j.data),
  apagar: (rec: string, id: string, clienteId?: string) =>
    fetch(url(rec, { id }, clienteId), { method: 'DELETE' }).then(tratar),
  me: () => fetch(url('me')).then(tratar),
  async enviarArquivo(file: File, pasta: string, clienteId?: string) {
    const up = await fetch(url('upload', {}, clienteId), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: file.name, cliente_id: clienteId }),
    }).then(tratar)
    const { createClient } = await import('@/lib/supabase/client')
    const { error } = await createClient().storage.from('a7').uploadToSignedUrl(up.path, up.token, file)
    if (error) throw new Error(error.message)
    const tipo = file.type.startsWith('image') ? 'imagem' : file.type.startsWith('video') ? 'video'
      : /pdf|word|sheet|presentation|text/.test(file.type) ? 'documento' : 'outro'
    return a7.criar('biblioteca', { pasta: pasta || 'Geral', nome: file.name, url: up.url, path: up.path, tipo, tamanho: file.size }, clienteId)
  },
}

/** Carrega um recurso do A7 e expõe recarregar. */
export function useA7(recurso: string, clienteId?: string) {
  const [dados, setDados] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const recarregar = useCallback(async () => {
    setCarregando(true); setErro('')
    try { setDados(await a7.listar(recurso, clienteId)) } catch (e: any) { setErro(e.message) }
    setCarregando(false)
  }, [recurso, clienteId])
  useEffect(() => { recarregar() }, [recarregar])
  return { dados, carregando, erro, recarregar }
}

export const fmtData = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'
export const fmtDataHora = (d?: string | null) =>
  d ? new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'sem data'
export const brl = (n: number) => (Number(n) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
