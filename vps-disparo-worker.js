#!/usr/bin/env node
/* Worker autônomo de disparos — roda por cron na VPS (independente do PC).
   Lê a fila no Supabase, envia em lotes pela Evolution (local), respeita
   intervalo anti-ban e opt-out. Sem dependências (Node 20 fetch nativo). */

const SB_URL  = 'https://agpqapkpttxuvjmpocbl.supabase.co'
const SB_KEY  = 'sb_publishable_KELgNBhPk4UfsvRpHq0woA_ulLzKDyb'
const EVO_URL = 'http://localhost:8080'
const EVO_KEY = 'esdras2024chave'
const EVO_INST = 'esdras'

const sbHeaders = { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, 'Content-Type': 'application/json' }
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a
const log = (...a) => console.log(new Date().toISOString(), ...a)

async function sbGet(path) {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: sbHeaders })
  return r.ok ? r.json() : []
}
async function sbPatch(path, body) {
  await fetch(`${SB_URL}/rest/v1/${path}`, { method: 'PATCH', headers: sbHeaders, body: JSON.stringify(body) })
}

const MEDIATYPE = { imagem: 'image', video: 'video', documento: 'document' }
async function enviar(tipo, mensagem, mediaUrl, fileName, numero) {
  try {
    let endpoint, body
    if (tipo === 'texto' || tipo === 'link') {
      endpoint = `${EVO_URL}/message/sendText/${EVO_INST}`
      body = { number: numero, text: mensagem }
    } else {
      endpoint = `${EVO_URL}/message/sendMedia/${EVO_INST}`
      body = { number: numero, mediatype: MEDIATYPE[tipo] || 'document', media: mediaUrl, caption: mensagem || '', fileName: fileName || 'arquivo' }
    }
    const r = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: EVO_KEY }, body: JSON.stringify(body) })
    if (!r.ok) { const d = await r.json().catch(() => ({})); return { ok: false, erro: d?.message || `HTTP ${r.status}` } }
    return { ok: true }
  } catch (e) { return { ok: false, erro: String(e?.message || e) } }
}

async function run() {
  // disparo ativo mais antigo
  const ativos = await sbGet('disparos?status=eq.enviando&order=updated_at.asc&limit=1')
  if (!ativos.length) { return }
  const d = ativos[0]

  // respeita intervalo entre lotes (exceto o 1º lote)
  const desdeUpdate = (Date.now() - new Date(d.updated_at).getTime()) / 1000
  if (d.enviados > 0 && desdeUpdate < (d.intervalo_seg || 180)) { return }

  // próximo lote
  const lote = await sbGet(`disparo_envios?disparo_id=eq.${d.id}&status=eq.pendente&limit=${d.lote || 12}`)
  if (!lote.length) { await sbPatch(`disparos?id=eq.${d.id}`, { status: 'concluido', updated_at: new Date().toISOString() }); log('concluido', d.nome); return }

  let env = 0, fal = 0
  for (const e of lote) {
    if (e.contato_id) {
      const c = await sbGet(`mkt_contatos?id=eq.${e.contato_id}&select=status`)
      if (c[0] && c[0].status !== 'ativo') { await sbPatch(`disparo_envios?id=eq.${e.id}`, { status: 'cancelado', erro: 'opt-out' }); continue }
    }
    const res = await enviar(d.tipo, d.mensagem, d.media_url, d.file_name, e.telefone)
    if (res.ok) { env++; await sbPatch(`disparo_envios?id=eq.${e.id}`, { status: 'enviado', enviado_em: new Date().toISOString() }) }
    else { fal++; await sbPatch(`disparo_envios?id=eq.${e.id}`, { status: 'falha', erro: res.erro }) }
    await sleep(rand(1500, 3500))
  }

  const rest = await sbGet(`disparo_envios?disparo_id=eq.${d.id}&status=eq.pendente&select=id`)
  await sbPatch(`disparos?id=eq.${d.id}`, {
    enviados: (d.enviados || 0) + env, falhas: (d.falhas || 0) + fal,
    status: rest.length === 0 ? 'concluido' : 'enviando', updated_at: new Date().toISOString(),
  })
  log(`lote de "${d.nome}": +${env} enviados, ${fal} falhas, ${rest.length} restantes`)
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
