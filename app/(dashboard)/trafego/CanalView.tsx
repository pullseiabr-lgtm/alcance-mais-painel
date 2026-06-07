'use client'
import { useEffect, useState } from 'react'

type Campanha = {
  nome: string
  impressoes: number
  cliques: number
  gasto: number
  ctr: number
  cpc: number
  conversoes: number
  frequencia: number
}
type Grupo = { cliente: string; cliente_id: string; campanhas: Campanha[]; erro?: string }

const PERIODOS = [
  { id: 'today', label: 'Hoje' },
  { id: 'yesterday', label: 'Ontem' },
  { id: 'last_7d', label: '7 dias' },
  { id: 'last_30d', label: '30 dias' },
]

function moeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
}

const CORES: Record<'meta' | 'google', { grad: string; nome: string }> = {
  meta:   { grad: 'linear-gradient(135deg,#1877F2,#0a4ea8)', nome: 'Meta Ads' },
  google: { grad: 'linear-gradient(135deg,#4285F4,#1a56c4)', nome: 'Google Ads' },
}

export default function CanalView({ canal }: { canal: 'meta' | 'google' }) {
  const [periodo, setPeriodo] = useState('last_7d')
  const [grupos, setGrupos] = useState<Grupo[] | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    setCarregando(true)
    setErro('')
    fetch(`/api/trafego/canal?canal=${canal}&periodo=${periodo}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setErro(json.error)
        else setGrupos(json.grupos)
      })
      .catch(() => setErro('Falha ao consultar a API'))
      .finally(() => setCarregando(false))
  }, [canal, periodo])

  const cor = CORES[canal]

  return (
    <div style={{ padding: 28, overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wh)' }}>{canal === 'meta' ? '📘' : '🔍'} {cor.nome}</div>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>Dados ao vivo via API — campanhas dos clientes com conta vinculada</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIODOS.map(p => (
            <button key={p.id} onClick={() => setPeriodo(p.id)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 10, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: periodo === p.id ? 'rgba(245,158,11,.2)' : 'var(--bk3)',
              color: periodo === p.id ? '#F59E0B' : 'var(--gr3)',
              outline: periodo === p.id ? '1px solid rgba(245,158,11,.4)' : '1px solid var(--gr)',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      {carregando && <div style={{ fontSize: 12, color: 'var(--gr3)' }}>Carregando campanhas…</div>}

      {!carregando && erro && (
        <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 16, fontSize: 11, color: 'var(--gr3)' }}>
          ⚠️ {erro}
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--gr)' }}>
            Verifique se {canal === 'meta' ? 'META_ADS_ACCESS_TOKEN' : 'as credenciais do Google Ads'} estão configuradas e se há clientes com {canal === 'meta' ? 'meta_ads_id' : 'google_ads_id'} cadastrado.
          </div>
        </div>
      )}

      {!carregando && !erro && grupos?.length === 0 && (
        <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 16, fontSize: 11, color: 'var(--gr3)' }}>
          Nenhum cliente com conta de {cor.nome} vinculada. Cadastre o {canal === 'meta' ? 'meta_ads_id' : 'google_ads_id'} no perfil do cliente.
        </div>
      )}

      {!carregando && grupos?.map(g => (
        <div key={g.cliente_id} style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8, background: cor.grad,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 800,
            }}>{g.cliente.slice(0, 1).toUpperCase()}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--wh)' }}>{g.cliente}</div>
          </div>

          {g.erro && (
            <div style={{ fontSize: 10, color: 'var(--gr3)', background: 'var(--bk3)', borderRadius: 8, padding: '8px 12px' }}>⚠️ {g.erro}</div>
          )}

          {!g.erro && g.campanhas.length === 0 && (
            <div style={{ fontSize: 10, color: 'var(--gr3)', background: 'var(--bk3)', borderRadius: 8, padding: '8px 12px' }}>Nenhuma campanha no período selecionado.</div>
          )}

          {!g.erro && g.campanhas.length > 0 && (
            <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ background: 'var(--bk3)', color: 'var(--gr3)', textTransform: 'uppercase', fontSize: 9, letterSpacing: '.06em' }}>
                    <th style={{ textAlign: 'left', padding: '8px 14px' }}>Campanha</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Impressões</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Cliques</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>CTR</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>CPC</th>
                    <th style={{ textAlign: 'right', padding: '8px 10px' }}>Gasto</th>
                    <th style={{ textAlign: 'right', padding: '8px 14px' }}>Conversões</th>
                  </tr>
                </thead>
                <tbody>
                  {g.campanhas.map((c, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--gr)' }}>
                      <td style={{ padding: '8px 14px', color: 'var(--lgt)', fontWeight: 600 }}>{c.nome}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--gr3)' }}>{c.impressoes.toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--gr3)' }}>{c.cliques.toLocaleString('pt-BR')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: c.ctr < 1 ? '#EF4444' : 'var(--gr3)' }}>{c.ctr.toFixed(2)}%</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: c.cpc > 1.5 ? '#EF4444' : 'var(--gr3)' }}>{moeda(c.cpc)}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--lgt)', fontWeight: 600 }}>{moeda(c.gasto)}</td>
                      <td style={{ padding: '8px 14px', textAlign: 'right', color: c.conversoes === 0 ? '#EF4444' : 'var(--ok)', fontWeight: 700 }}>{c.conversoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
