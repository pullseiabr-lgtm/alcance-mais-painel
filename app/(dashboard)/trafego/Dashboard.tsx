'use client'
import { useEffect, useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, Cell,
} from 'recharts'
import CriarCampanha from './CriarCampanha'

type DashboardData = {
  periodo: { desde: string; ate: string; dias: number }
  kpis: {
    investimento_hoje: number
    investimento_periodo: number
    impressoes: number
    cliques: number
    conversoes: number
    ctr: number
    cpc: number
    custo_por_conversao: number
  }
  serie: { data: string; investimento: number; cliques: number; conversoes: number }[]
  canais: { canal: string; investimento: number; cliques: number; conversoes: number }[]
}

const CANAL_LABEL: Record<string, string> = { meta: 'Meta Ads', google: 'Google Ads', tiktok: 'TikTok Ads' }
const CANAL_COR: Record<string, string> = { meta: '#1877F2', google: '#4285F4', tiktok: '#EF4444' }

const ALERTA_ICONE: Record<string, string> = {
  cpc_alto: '🔴', ctr_baixo: '🔴', frequencia_alta: '🔴', sem_conversao: '🔴',
}
const ALERTA_LABEL: Record<string, string> = {
  cpc_alto: 'CPC alto', ctr_baixo: 'CTR baixo', frequencia_alta: 'Frequência alta', sem_conversao: 'Sem conversão',
}

type Alerta = {
  id: string
  canal: string
  tipo: string
  severidade: 'atencao' | 'critico'
  mensagem: string
  data: string
  resolvido: boolean
}

function PainelAlertas() {
  const [alertas, setAlertas] = useState<Alerta[] | null>(null)
  const [carregando, setCarregando] = useState(true)

  function carregar() {
    setCarregando(true)
    fetch('/api/trafego/alertas')
      .then(r => r.json())
      .then(json => setAlertas(json.alertas || []))
      .finally(() => setCarregando(false))
  }

  useEffect(() => { carregar() }, [])

  async function resolver(id: string) {
    setAlertas(prev => prev?.filter(a => a.id !== id) ?? prev)
    await fetch('/api/trafego/alertas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
  }

  return (
    <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
        🔔 Alertas de Performance
      </div>

      {carregando && <div style={{ fontSize: 11, color: 'var(--gr3)' }}>Carregando alertas…</div>}

      {!carregando && alertas?.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--ok)' }}>✅ Nenhum alerta ativo. Tudo dentro dos parâmetros recomendados.</div>
      )}

      {!carregando && alertas && alertas.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {alertas.map(a => (
            <div key={a.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'var(--bk3)', border: `1px solid ${a.severidade === 'critico' ? 'rgba(239,68,68,.4)' : 'var(--gr)'}`,
              borderRadius: 8, padding: '10px 12px',
            }}>
              <span style={{ fontSize: 14 }}>{ALERTA_ICONE[a.tipo] || '⚠️'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: a.severidade === 'critico' ? '#EF4444' : '#F59E0B' }}>
                    {ALERTA_LABEL[a.tipo] || a.tipo}
                  </span>
                  <span style={{ fontSize: 8, color: 'var(--gr3)', textTransform: 'uppercase' }}>{CANAL_LABEL[a.canal] || a.canal} · {a.data}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--lgt)', lineHeight: 1.5 }}>{a.mensagem}</div>
              </div>
              <button onClick={() => resolver(a.id)} style={{
                fontSize: 9, fontWeight: 700, color: 'var(--gr3)', background: 'transparent',
                border: '1px solid var(--gr)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', flexShrink: 0,
              }}>Resolver</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function moeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 })
}

function numero(v: number) {
  return v.toLocaleString('pt-BR')
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [criarAberto, setCriarAberto] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch('/api/trafego/dashboard?dias=30')
      .then(r => r.json())
      .then(json => {
        if (json.error) setErro(json.error)
        else setData(json)
      })
      .catch(() => setErro('Falha ao carregar métricas'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div style={{ padding: 28, color: 'var(--gr3)', fontSize: 12 }}>Carregando métricas…</div>
  }

  if (erro) {
    return (
      <div style={{ padding: 28 }}>
        <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 20, color: 'var(--gr3)', fontSize: 12 }}>
          ⚠️ {erro}
          <div style={{ marginTop: 6, fontSize: 10, color: 'var(--gr)' }}>
            Verifique se a migration 002_metricas_trafego.sql foi executada e se o job de sincronização (/api/trafego/sync) já rodou.
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const { kpis, serie, canais, periodo } = data
  const semDados = serie.length === 0

  return (
    <div style={{ padding: 28, overflowY: 'auto', height: '100%' }}>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wh)' }}>📊 Dashboard Executivo</div>
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>
            Período: {periodo.desde} a {periodo.ate} · {periodo.dias} dias
          </div>
        </div>
        <button onClick={() => setCriarAberto(true)} style={{
          padding: '10px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
          background: 'linear-gradient(135deg,#F59E0B,#EF4444)', color: '#fff',
        }}>🤖 Criar Campanha</button>
      </div>

      {criarAberto && <CriarCampanha onClose={() => setCriarAberto(false)} />}

      <PainelAlertas />

      {semDados && (
        <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 16, marginBottom: 18, fontSize: 11, color: 'var(--gr3)' }}>
          Nenhuma métrica sincronizada ainda. O job diário (/api/trafego/sync) ainda não rodou ou não há clientes com meta_ads_id/google_ads_id configurados.
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        <KpiCard label="Investimento hoje"  value={moeda(kpis.investimento_hoje)} color="#F59E0B" />
        <KpiCard label={`Investimento (${periodo.dias}d)`} value={moeda(kpis.investimento_periodo)} color="#F59E0B" />
        <KpiCard label="Impressões"  value={numero(kpis.impressoes)} color="var(--lgt)" />
        <KpiCard label="Cliques"     value={numero(kpis.cliques)} color="var(--lgt)" />
        <KpiCard label="Conversões"  value={numero(kpis.conversoes)} color="var(--ok)" />
        <KpiCard label="CTR"         value={`${kpis.ctr.toFixed(2)}%`} color="var(--pu)" />
        <KpiCard label="CPC médio"   value={moeda(kpis.cpc)} color="var(--al)" />
        <KpiCard label="Custo / conversão" value={moeda(kpis.custo_por_conversao)} color="var(--al)" />
      </div>

      {/* Série temporal */}
      <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
          Investimento e cliques por dia
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={serie}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gr)" />
            <XAxis dataKey="data" tick={{ fontSize: 9, fill: 'var(--gr3)' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: 'var(--gr3)' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: 'var(--gr3)' }} />
            <Tooltip contentStyle={{ background: 'var(--bk2)', border: '1px solid var(--gr)', fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line yAxisId="left"  type="monotone" dataKey="investimento" name="Investimento (R$)" stroke="#F59E0B" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="cliques"      name="Cliques"           stroke="#4285F4" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="conversoes"   name="Conversões"        stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Quebra por canal */}
      <div style={{ background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12, padding: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>
          Investimento por canal
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={canais.map(c => ({ ...c, label: CANAL_LABEL[c.canal] || c.canal }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--gr)" />
            <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'var(--gr3)' }} />
            <YAxis tick={{ fontSize: 9, fill: 'var(--gr3)' }} />
            <Tooltip contentStyle={{ background: 'var(--bk2)', border: '1px solid var(--gr)', fontSize: 11 }} />
            <Bar dataKey="investimento" name="Investimento (R$)" radius={[6, 6, 0, 0]}>
              {canais.map((c, i) => <Cell key={i} fill={CANAL_COR[c.canal] || '#888'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
