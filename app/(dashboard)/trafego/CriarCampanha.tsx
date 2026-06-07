'use client'
import { useState } from 'react'

const OBJETIVOS = [
  { id: 'reservas',   icon: '🍽️', label: 'Reservas' },
  { id: 'delivery',   icon: '📦', label: 'Delivery' },
  { id: 'evento',     icon: '🎪', label: 'Evento' },
  { id: 'festival',   icon: '🎉', label: 'Festival' },
  { id: 'lancamento', icon: '🚀', label: 'Lançamento' },
] as const

type Estrutura = {
  resumo: string
  publico: { descricao: string; idade: string; interesses: string[]; raio_km: string }
  orcamento: { sugestao_mensal: string; distribuicao: { canal: string; percentual: string; justificativa: string }[] }
  campanhas: { nome: string; canal: string; objetivo_plataforma: string; fase: string; segmentacao: string }[]
  criativos: { formato: string; sugestao: string }[]
  copies: { headline: string; descricao: string; cta: string }[]
}

function Bloco({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--bk3)', border: '1px solid var(--gr)', borderRadius: 10, padding: 14, marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{titulo}</div>
      {children}
    </div>
  )
}

export default function CriarCampanha({ onClose }: { onClose: () => void }) {
  const [etapa, setEtapa] = useState<'objetivo' | 'contexto' | 'gerando' | 'resultado'>('objetivo')
  const [objetivo, setObjetivo] = useState<typeof OBJETIVOS[number]['id'] | null>(null)
  const [contexto, setContexto] = useState('')
  const [estrutura, setEstrutura] = useState<Estrutura | null>(null)
  const [erro, setErro] = useState('')

  async function gerar() {
    setEtapa('gerando')
    setErro('')
    try {
      const res = await fetch('/api/trafego/criar-campanha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ objetivo, contexto }),
      })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error || 'Falha ao gerar campanha')
      setEstrutura(json.estrutura)
      setEtapa('resultado')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado')
      setEtapa('contexto')
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 16,
        width: '100%', maxWidth: 680, maxHeight: '88vh', overflowY: 'auto', padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--wh)' }}>🤖 Criar Campanha com IA</div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--gr3)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>

        {etapa === 'objetivo' && (
          <>
            <div style={{ fontSize: 12, color: 'var(--gr3)', marginBottom: 14 }}>Qual o objetivo desta campanha?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
              {OBJETIVOS.map(o => (
                <button key={o.id} onClick={() => { setObjetivo(o.id); setEtapa('contexto') }} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderRadius: 12,
                  background: 'var(--bk3)', border: '1px solid var(--gr)', cursor: 'pointer', textAlign: 'left',
                }}>
                  <span style={{ fontSize: 22 }}>{o.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--lgt)' }}>{o.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {etapa === 'contexto' && (
          <>
            <div style={{ fontSize: 12, color: 'var(--gr3)', marginBottom: 4 }}>
              Objetivo: <strong style={{ color: 'var(--wh)' }}>{OBJETIVOS.find(o => o.id === objetivo)?.label}</strong>
            </div>
            <div style={{ fontSize: 11, color: 'var(--gr3)', marginBottom: 8 }}>
              Conte um pouco sobre o negócio (opcional, ajuda a IA a personalizar): tipo de estabelecimento, cidade/bairro, ticket médio, diferenciais…
            </div>
            <textarea
              value={contexto}
              onChange={e => setContexto(e.target.value)}
              rows={4}
              className="inp"
              placeholder="Ex: Restaurante japonês no Itaim Bibi, SP. Ticket médio R$ 120. Forte em delivery aos finais de semana…"
              style={{ width: '100%', resize: 'none', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}
            />
            {erro && <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 10 }}>⚠️ {erro}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setEtapa('objetivo')} style={{
                padding: '9px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: 'var(--bk3)', border: '1px solid var(--gr)', color: 'var(--gr3)',
              }}>← Voltar</button>
              <button onClick={gerar} style={{
                padding: '9px 18px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: '#fff',
              }}>Gerar campanha →</button>
            </div>
          </>
        )}

        {etapa === 'gerando' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
            <div style={{ fontSize: 12, color: 'var(--gr3)' }}>Gerando público, orçamento, criativos, copies e segmentação…</div>
          </div>
        )}

        {etapa === 'resultado' && estrutura && (
          <div>
            <Bloco titulo="Resumo da Estratégia">
              <div style={{ fontSize: 12, color: 'var(--lgt)', lineHeight: 1.6 }}>{estrutura.resumo}</div>
            </Bloco>

            <Bloco titulo="Público-alvo">
              <div style={{ fontSize: 11, color: 'var(--lgt)', marginBottom: 6 }}>{estrutura.publico?.descricao}</div>
              <div style={{ fontSize: 10, color: 'var(--gr3)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <span>👤 {estrutura.publico?.idade}</span>
                {estrutura.publico?.raio_km && <span>📍 {estrutura.publico.raio_km}</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                {estrutura.publico?.interesses?.map((it, i) => (
                  <span key={i} style={{ fontSize: 9, color: 'var(--gr3)', background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 20, padding: '3px 10px' }}>{it}</span>
                ))}
              </div>
            </Bloco>

            <Bloco titulo="Orçamento">
              <div style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B', marginBottom: 8 }}>{estrutura.orcamento?.sugestao_mensal}</div>
              {estrutura.orcamento?.distribuicao?.map((d, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--gr3)', marginBottom: 4 }}>
                  <strong style={{ color: 'var(--lgt)' }}>{d.canal}</strong> — {d.percentual} · {d.justificativa}
                </div>
              ))}
            </Bloco>

            <Bloco titulo="Estrutura de Campanhas">
              {estrutura.campanhas?.map((c, i) => (
                <div key={i} style={{ borderTop: i > 0 ? '1px solid var(--gr)' : 'none', paddingTop: i > 0 ? 8 : 0, marginTop: i > 0 ? 8 : 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lgt)' }}>{c.nome}</div>
                  <div style={{ fontSize: 9, color: 'var(--gr3)', marginTop: 2 }}>{c.canal} · {c.objetivo_plataforma} · Fase: {c.fase}</div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 4 }}>{c.segmentacao}</div>
                </div>
              ))}
            </Bloco>

            <Bloco titulo="Criativos sugeridos">
              {estrutura.criativos?.map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: 'var(--gr3)', marginBottom: 4 }}>
                  <strong style={{ color: 'var(--lgt)' }}>{c.formato}:</strong> {c.sugestao}
                </div>
              ))}
            </Bloco>

            <Bloco titulo="Copies">
              {estrutura.copies?.map((c, i) => (
                <div key={i} style={{ background: 'var(--bk2)', borderRadius: 8, padding: 10, marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lgt)' }}>{c.headline}</div>
                  <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 3 }}>{c.descricao}</div>
                  <div style={{ fontSize: 9, color: '#F59E0B', marginTop: 4, fontWeight: 700 }}>CTA: {c.cta}</div>
                </div>
              ))}
            </Bloco>

            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button onClick={() => { setEtapa('objetivo'); setEstrutura(null); setObjetivo(null); setContexto('') }} style={{
                padding: '9px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                background: 'var(--bk3)', border: '1px solid var(--gr)', color: 'var(--gr3)',
              }}>↻ Gerar outra</button>
              <button onClick={onClose} style={{
                padding: '9px 18px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: '#fff',
              }}>Concluir</button>
            </div>
            <div style={{ fontSize: 9, color: 'var(--gr)', marginTop: 10, textAlign: 'center' }}>
              Estrutura gerada por IA para revisão da equipe — a criação real das campanhas nas plataformas (Meta/Google) ainda requer execução manual ou integração futura via API.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
