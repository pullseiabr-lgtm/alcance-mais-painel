'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface RelCliente {
  id: string
  nome: string
  telefone: string
  campanhas: number
  investimento: number
  impressoes: number
  cliques: number
  conversoes: number
  ctr: string
  cpc: string
  roas: string
}

export default function RelatoriosPage() {
  const [clientes, setClientes] = useState<RelCliente[]>([])
  const [loading, setLoading]   = useState(true)
  const [periodo, setPeriodo]   = useState('30')

  useEffect(() => { loadRelatorio() }, [periodo])

  async function loadRelatorio() {
    setLoading(true)
    const sb = createClient()

    const [{ data: cls }, { data: camp }, { data: metricas }] = await Promise.all([
      sb.from('clientes').select('id,nome,telefone').eq('status','ativo'),
      sb.from('campanhas').select('id,cliente_id,gasto,impressoes,cliques,conversoes').eq('status','ativa'),
      sb.from('metricas_diarias').select('cliente_id,gasto,impressoes,cliques,conversoes')
        .gte('data', new Date(Date.now() - +periodo * 86400000).toISOString().slice(0,10)),
    ])

    const resultado: RelCliente[] = (cls ?? []).map(c => {
      const campCliente = (camp ?? []).filter(cam => cam.cliente_id === c.id)
      const metCliente  = (metricas ?? []).filter(m => m.cliente_id === c.id)

      // Usa metricas_diarias se disponível, senão usa campanhas
      const fonte = metCliente.length > 0 ? metCliente : campCliente
      const investimento = fonte.reduce((s, r) => s + (r.gasto || 0), 0)
      const impressoes   = fonte.reduce((s, r) => s + (r.impressoes || 0), 0)
      const cliques      = fonte.reduce((s, r) => s + (r.cliques || 0), 0)
      const conversoes   = fonte.reduce((s, r) => s + (r.conversoes || 0), 0)
      const ctr  = impressoes > 0 ? ((cliques/impressoes)*100).toFixed(2) : '0.00'
      const cpc  = cliques > 0 ? (investimento/cliques).toFixed(2) : '0.00'
      const roas = investimento > 0 ? (conversoes * 150 / investimento).toFixed(1) : '0.0'

      return { id:c.id, nome:c.nome, telefone:c.telefone||'', campanhas:campCliente.length, investimento, impressoes, cliques, conversoes, ctr, cpc, roas }
    })

    setClientes(resultado)
    setLoading(false)
  }

  function waLink(cliente: RelCliente) {
    const phone = cliente.telefone.replace(/\D/g,'')
    const num = phone.startsWith('55') ? phone : `55${phone}`
    const periodo_label = {7:'7 dias',30:'30 dias',60:'60 dias',90:'90 dias'}[+periodo] ?? `${periodo} dias`
    const msg = encodeURIComponent(
      `📊 *Relatório de Marketing — ${periodo_label}*\n\n` +
      `Cliente: *${cliente.nome}*\n\n` +
      `📢 Campanhas ativas: ${cliente.campanhas}\n` +
      `💰 Investimento: R$ ${cliente.investimento.toLocaleString('pt-BR')}\n` +
      `👁 Impressões: ${cliente.impressoes.toLocaleString('pt-BR')}\n` +
      `🖱 Cliques: ${cliente.cliques.toLocaleString('pt-BR')}\n` +
      `📈 CTR: ${cliente.ctr}%\n` +
      `💲 CPC: R$ ${cliente.cpc}\n` +
      `🎯 Conversões: ${cliente.conversoes}\n` +
      `📊 ROAS estimado: ${cliente.roas}x\n\n` +
      `Relatório gerado pela Alcance+ • alcanceplus.com.br`
    )
    return `https://wa.me/${num}?text=${msg}`
  }

  const totalInvestimento = clientes.reduce((s,c)=>s+c.investimento,0)
  const totalConversoes   = clientes.reduce((s,c)=>s+c.conversoes,0)

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Relatórios</span>
          <span className="tb-sub">{clientes.length} clientes · R$ {totalInvestimento.toLocaleString('pt-BR')} investidos</span>
        </div>
        <select className="inp" style={{ width:140 }} value={periodo} onChange={e=>setPeriodo(e.target.value)}>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="60">Últimos 60 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
      </div>

      <div className="content">
        {/* KPIs rápidos */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>
          {[
            { label:'Clientes com Dados',    val: String(clientes.filter(c=>c.campanhas>0||c.impressoes>0).length), color:'var(--al)' },
            { label:'Total Investido',        val:`R$ ${totalInvestimento.toLocaleString('pt-BR')}`,                 color:'var(--ok)' },
            { label:'Total Conversões',       val: String(totalConversoes),                                           color:'var(--pu)' },
            { label:'Relatórios Disponíveis', val: String(clientes.length),                                           color:'var(--bl)' },
          ].map(k=>(
            <div key={k.label} className="card" style={{ padding:'16px 18px' }}>
              <div style={{ fontSize:11, color:'var(--gr3)', marginBottom:6 }}>{k.label}</div>
              <div style={{ fontSize:22, fontWeight:700, fontFamily:'var(--mono)', color:k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando relatórios…</div>
        ) : clientes.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhum cliente ativo encontrado.<br/>
            <a href="/clientes" style={{ color:'var(--al)', fontSize:13 }}>Cadastrar clientes →</a>
          </div>
        ) : (
          <div className="card" style={{ padding:0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Campanhas</th>
                  <th>Investimento</th>
                  <th>Impressões</th>
                  <th>Cliques</th>
                  <th>CTR</th>
                  <th>CPC</th>
                  <th>Conv.</th>
                  <th>ROAS</th>
                  <th>Enviar</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight:600, color:'var(--wh)' }}>{c.nome}</td>
                    <td style={{ fontFamily:'var(--mono)', textAlign:'center' }}>{c.campanhas}</td>
                    <td style={{ fontFamily:'var(--mono)', color:'var(--al)' }}>R$ {c.investimento.toLocaleString('pt-BR')}</td>
                    <td style={{ fontFamily:'var(--mono)' }}>{c.impressoes.toLocaleString('pt-BR')}</td>
                    <td style={{ fontFamily:'var(--mono)' }}>{c.cliques.toLocaleString('pt-BR')}</td>
                    <td style={{ fontFamily:'var(--mono)', color:'var(--bl)' }}>{c.ctr}%</td>
                    <td style={{ fontFamily:'var(--mono)' }}>R$ {c.cpc}</td>
                    <td style={{ fontFamily:'var(--mono)', color:'var(--ok)' }}>{c.conversoes}</td>
                    <td style={{ fontFamily:'var(--mono)', color:+c.roas>=3?'var(--ok)':+c.roas>=1?'var(--wr)':'var(--er)', fontWeight:700 }}>{c.roas}x</td>
                    <td>
                      {c.telefone ? (
                        <a href={waLink(c)} target="_blank" rel="noreferrer">
                          <button className="btn btn-ghost btn-sm" style={{ color:'#25D366' }}>📱 WhatsApp</button>
                        </a>
                      ) : (
                        <span style={{ fontSize:11, color:'var(--gr3)' }}>Sem telefone</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
