'use client'
import { useState, useEffect, useCallback } from 'react'
import { PAGINAS, PERMISSOES_PADRAO, ROLE_LABELS, ROLE_COLORS, type Role, type PageId } from '@/lib/permissoes'

type Usuario = {
  id: string; nome: string; email: string; cargo: string
  role: Role; permissoes: PageId[]; ativo: boolean; created_at: string
}

const ROLES: Role[] = ['admin','gestor','criativo','cliente','viewer']
const SECOES = Array.from(new Set(PAGINAS.map(p => p.secao)))

const emptyForm = { nome:'', email:'', senha:'', cargo:'', role:'gestor' as Role, permissoes: PERMISSOES_PADRAO.gestor }

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'criar'|'editar'|'perms'|null>(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState<string|null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [semServiceKey, setSemServiceKey] = useState(false)
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/usuarios/listar')
    const d = await r.json()
    if (d.error?.includes('SERVICE_ROLE')) { setSemServiceKey(true); setLoading(false); return }
    setUsuarios(d.usuarios ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function abrirCriar() {
    setForm(emptyForm); setEditId(null); setErro(''); setModal('criar')
  }

  function abrirEditar(u: Usuario) {
    setForm({ nome:u.nome, email:u.email, senha:'', cargo:u.cargo, role:u.role, permissoes:u.permissoes })
    setEditId(u.id); setErro(''); setModal('editar')
  }

  function abrirPerms(u: Usuario) {
    setForm({ nome:u.nome, email:u.email, senha:'', cargo:u.cargo, role:u.role, permissoes:[...u.permissoes] })
    setEditId(u.id); setErro(''); setModal('perms')
  }

  function togglePerm(id: PageId) {
    setForm(f => ({
      ...f,
      permissoes: f.permissoes.includes(id)
        ? f.permissoes.filter(p => p !== id)
        : [...f.permissoes, id]
    }))
  }

  function aplicarRole(role: Role) {
    setForm(f => ({ ...f, role, permissoes: [...PERMISSOES_PADRAO[role]] }))
  }

  async function salvar() {
    setSalvando(true); setErro('')
    try {
      let res: Response
      if (modal === 'criar') {
        res = await fetch('/api/usuarios/criar', {
          method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify(form),
        })
      } else {
        const body: Record<string, unknown> = { nome:form.nome, cargo:form.cargo, role:form.role, permissoes:form.permissoes }
        if (form.senha) body.senha = form.senha
        res = await fetch(`/api/usuarios/${editId}`, {
          method:'PUT', headers:{'Content-Type':'application/json'},
          body: JSON.stringify(body),
        })
      }
      const d = await res.json()
      if (d.error) { setErro(d.error); setSalvando(false); return }
      await carregar()
      setModal(null)
    } catch(e) {
      setErro(e instanceof Error ? e.message : 'Erro')
    }
    setSalvando(false)
  }

  async function salvarPerms() {
    setSalvando(true); setErro('')
    const res = await fetch(`/api/usuarios/${editId}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ role:form.role, permissoes:form.permissoes }),
    })
    const d = await res.json()
    if (d.error) { setErro(d.error); setSalvando(false); return }
    await carregar()
    setModal(null)
    setSalvando(false)
  }

  async function toggleAtivo(u: Usuario) {
    await fetch(`/api/usuarios/${u.id}`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ativo:!u.ativo }),
    })
    await carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir usuário permanentemente?')) return
    await fetch(`/api/usuarios/${id}`, { method:'DELETE' })
    await carregar()
  }

  const filtrados = usuarios.filter(u =>
    u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    u.email?.toLowerCase().includes(busca.toLowerCase()) ||
    u.cargo?.toLowerCase().includes(busca.toLowerCase())
  )

  const c = { bg:'#1a1f2e', border:'#2a3347', bg2:'#0d1117', al:'#00C4B4', gr:'#8b9ab0', wh:'#fff' }

  return (
    <div style={{ padding:'2rem', maxWidth:1100, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.6rem', fontWeight:700, color:c.wh, margin:0 }}>Usuários & Acessos</h1>
          <p style={{ color:c.gr, margin:'0.3rem 0 0', fontSize:'0.85rem' }}>
            Gerencie quem acessa o sistema e quais módulos cada um pode usar
          </p>
        </div>
        <button onClick={abrirCriar} style={{
          background:`linear-gradient(135deg,${c.al},#00a896)`, border:'none',
          borderRadius:8, padding:'0.65rem 1.25rem', color:'#000',
          fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
        }}>
          + Novo Usuário
        </button>
      </div>

      {/* Aviso sem service key */}
      {semServiceKey && (
        <div style={{ background:'#FFD70011', border:'1px solid #FFD70044', borderRadius:10, padding:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ fontWeight:700, color:'#FFD700', marginBottom:'0.5rem' }}>⚠️ Configure a Service Role Key</div>
          <div style={{ color:c.gr, fontSize:'0.85rem', lineHeight:1.6 }}>
            Para criar e gerenciar usuários, adicione a chave ao <code style={{color:c.al}}>.env.local</code>:<br/>
            <code style={{color:'#fff'}}>SUPABASE_SERVICE_ROLE_KEY=sua-chave</code><br/><br/>
            Como obter: <strong style={{color:c.wh}}>supabase.com</strong> → seu projeto →{' '}
            <strong style={{color:c.wh}}>Project Settings → API → service_role</strong>
          </div>
        </div>
      )}

      {/* Resumo por role */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'0.75rem', marginBottom:'1.5rem' }}>
        {ROLES.map(role => {
          const n = usuarios.filter(u => u.role === role).length
          return (
            <div key={role} style={{ background:c.bg, borderRadius:10, padding:'0.9rem', border:`1px solid ${c.border}`, textAlign:'center' }}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:ROLE_COLORS[role] }}>{n}</div>
              <div style={{ fontSize:'0.7rem', color:c.gr, marginTop:3 }}>{ROLE_LABELS[role]}</div>
            </div>
          )
        })}
      </div>

      {/* Busca */}
      <input
        placeholder="Buscar por nome, e-mail ou cargo…"
        value={busca} onChange={e => setBusca(e.target.value)}
        style={{ width:'100%', background:c.bg2, border:`1px solid ${c.border}`, borderRadius:8,
          padding:'0.65rem 1rem', color:c.wh, fontSize:'0.9rem', marginBottom:'1rem', boxSizing:'border-box' }}
      />

      {/* Tabela */}
      <div style={{ background:c.bg, borderRadius:12, border:`1px solid ${c.border}`, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${c.border}` }}>
              {['Usuário','Cargo','Perfil','Módulos','Status','Ações'].map(h => (
                <th key={h} style={{ padding:'0.85rem 1rem', textAlign:'left', fontSize:'0.7rem',
                  fontWeight:600, color:c.gr, letterSpacing:'0.05em', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', color:c.gr }}>Carregando…</td></tr>
            ) : filtrados.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:'3rem', textAlign:'center', color:c.gr }}>
                {semServiceKey ? 'Configure a Service Role Key para ver usuários' : 'Nenhum usuário encontrado'}
              </td></tr>
            ) : filtrados.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtrados.length-1 ? `1px solid ${c.border}20` : 'none',
                background: i % 2 === 0 ? 'transparent' : '#ffffff04' }}>
                <td style={{ padding:'0.85rem 1rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', background:`${ROLE_COLORS[u.role]}22`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:ROLE_COLORS[u.role], fontWeight:700, fontSize:'0.85rem', flexShrink:0 }}>
                      {u.nome?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div style={{ color:c.wh, fontWeight:600, fontSize:'0.875rem' }}>{u.nome || '—'}</div>
                      <div style={{ color:c.gr, fontSize:'0.75rem' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:'0.85rem 1rem', color:c.gr, fontSize:'0.85rem' }}>{u.cargo || '—'}</td>
                <td style={{ padding:'0.85rem 1rem' }}>
                  <span style={{ background:`${ROLE_COLORS[u.role]}22`, color:ROLE_COLORS[u.role],
                    borderRadius:6, padding:'3px 10px', fontSize:'0.75rem', fontWeight:600 }}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td style={{ padding:'0.85rem 1rem' }}>
                  <button onClick={() => abrirPerms(u)} style={{ background:'transparent', border:`1px solid ${c.border}`,
                    borderRadius:6, padding:'3px 10px', color:c.gr, fontSize:'0.75rem', cursor:'pointer' }}>
                    {u.permissoes?.length ?? 0} módulos →
                  </button>
                </td>
                <td style={{ padding:'0.85rem 1rem' }}>
                  <button onClick={() => toggleAtivo(u)} style={{ background: u.ativo ? '#00C4B411' : '#ef444411',
                    border:`1px solid ${u.ativo ? '#00C4B444' : '#ef444444'}`,
                    color: u.ativo ? '#00C4B4' : '#ef4444',
                    borderRadius:6, padding:'3px 10px', fontSize:'0.75rem', cursor:'pointer', fontWeight:600 }}>
                    {u.ativo ? 'Ativo' : 'Inativo'}
                  </button>
                </td>
                <td style={{ padding:'0.85rem 1rem' }}>
                  <div style={{ display:'flex', gap:'0.4rem' }}>
                    <button onClick={() => abrirEditar(u)} style={{ background:'#6366f111', border:'1px solid #6366f144',
                      color:'#6366f1', borderRadius:6, padding:'4px 10px', fontSize:'0.75rem', cursor:'pointer' }}>
                      Editar
                    </button>
                    <button onClick={() => excluir(u.id)} style={{ background:'#ef444411', border:'1px solid #ef444444',
                      color:'#ef4444', borderRadius:6, padding:'4px 10px', fontSize:'0.75rem', cursor:'pointer' }}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Criar/Editar */}
      {(modal === 'criar' || modal === 'editar') && (
        <div style={{ position:'fixed', inset:0, background:'#000a', display:'flex', alignItems:'center',
          justifyContent:'center', zIndex:1000 }} onClick={() => setModal(null)}>
          <div style={{ background:'#1a1f2e', borderRadius:14, padding:'2rem', width:480, maxWidth:'90vw',
            border:`1px solid ${c.border}`, maxHeight:'90vh', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color:c.wh, margin:'0 0 1.5rem', fontSize:'1.1rem', fontWeight:700 }}>
              {modal === 'criar' ? '+ Novo Usuário' : 'Editar Usuário'}
            </h2>

            <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {[
                { label:'Nome completo', key:'nome', type:'text', placeholder:'Ex: Maria Silva' },
                { label:'E-mail', key:'email', type:'email', placeholder:'maria@email.com', disabled: modal==='editar' },
                { label:'Senha' + (modal==='editar' ? ' (deixe vazio para manter)' : ''), key:'senha', type:'password', placeholder:'••••••••' },
                { label:'Cargo', key:'cargo', type:'text', placeholder:'Ex: Designer, Gestor...' },
              ].map(({ label, key, type, placeholder, disabled }) => (
                <div key={key}>
                  <label style={{ color:c.gr, fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.05em',
                    display:'block', marginBottom:'0.4rem', textTransform:'uppercase' }}>{label}</label>
                  <input type={type} value={(form as unknown as Record<string, string>)[key]}
                    disabled={disabled}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width:'100%', background:c.bg2, border:`1px solid ${c.border}`, borderRadius:8,
                      padding:'0.6rem 0.9rem', color: disabled ? c.gr : c.wh, fontSize:'0.875rem',
                      boxSizing:'border-box', opacity: disabled ? 0.6 : 1 }} />
                </div>
              ))}

              <div>
                <label style={{ color:c.gr, fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.05em',
                  display:'block', marginBottom:'0.5rem', textTransform:'uppercase' }}>PERFIL DE ACESSO</label>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem' }}>
                  {ROLES.map(r => (
                    <button key={r} onClick={() => aplicarRole(r)} style={{
                      padding:'0.55rem 0.75rem', borderRadius:8, cursor:'pointer', textAlign:'left',
                      background: form.role===r ? `${ROLE_COLORS[r]}22` : c.bg2,
                      border:`1px solid ${form.role===r ? ROLE_COLORS[r] : c.border}`,
                      color: form.role===r ? ROLE_COLORS[r] : c.gr,
                      fontWeight: form.role===r ? 700 : 400, fontSize:'0.8rem',
                    }}>
                      {ROLE_LABELS[r]}
                      <span style={{ fontSize:'0.65rem', opacity:0.7, marginLeft:6 }}>
                        ({PERMISSOES_PADRAO[r].length} módulos)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {erro && <div style={{ background:'#ef444411', border:'1px solid #ef444444', borderRadius:8,
              padding:'0.65rem', color:'#ef4444', fontSize:'0.8rem', marginTop:'1rem' }}>{erro}</div>}

            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:'0.7rem', borderRadius:8,
                background:'transparent', border:`1px solid ${c.border}`, color:c.gr, cursor:'pointer' }}>
                Cancelar
              </button>
              <button onClick={salvar} disabled={salvando} style={{ flex:2, padding:'0.7rem', borderRadius:8,
                background:`linear-gradient(135deg,${c.al},#00a896)`, border:'none',
                color:'#000', fontWeight:700, cursor:'pointer', opacity: salvando ? 0.6 : 1 }}>
                {salvando ? 'Salvando…' : modal === 'criar' ? 'Criar Usuário' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Permissões */}
      {modal === 'perms' && (
        <div style={{ position:'fixed', inset:0, background:'#000a', display:'flex', alignItems:'center',
          justifyContent:'center', zIndex:1000 }} onClick={() => setModal(null)}>
          <div style={{ background:'#1a1f2e', borderRadius:14, padding:'2rem', width:560, maxWidth:'95vw',
            border:`1px solid ${c.border}`, maxHeight:'90vh', overflowY:'auto' }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ color:c.wh, margin:'0 0 0.25rem', fontSize:'1.1rem', fontWeight:700 }}>
              Permissões — {form.nome}
            </h2>
            <p style={{ color:c.gr, fontSize:'0.8rem', margin:'0 0 1.25rem' }}>
              Selecione os módulos que este usuário pode acessar
            </p>

            {/* Aplicar role preset */}
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
              <span style={{ color:c.gr, fontSize:'0.75rem', alignSelf:'center' }}>Preset:</span>
              {ROLES.map(r => (
                <button key={r} onClick={() => aplicarRole(r)} style={{
                  background:`${ROLE_COLORS[r]}22`, border:`1px solid ${ROLE_COLORS[r]}44`,
                  color:ROLE_COLORS[r], borderRadius:6, padding:'3px 10px',
                  fontSize:'0.72rem', fontWeight:600, cursor:'pointer',
                }}>
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>

            {SECOES.map(sec => (
              <div key={sec} style={{ marginBottom:'1.1rem' }}>
                <div style={{ color:c.gr, fontSize:'0.68rem', fontWeight:600, letterSpacing:'0.08em',
                  textTransform:'uppercase', marginBottom:'0.5rem' }}>{sec}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.35rem' }}>
                  {PAGINAS.filter(p => p.secao === sec).map(p => {
                    const on = form.permissoes.includes(p.id as PageId)
                    return (
                      <button key={p.id} onClick={() => togglePerm(p.id as PageId)} style={{
                        padding:'0.5rem 0.75rem', borderRadius:8, cursor:'pointer', textAlign:'left',
                        background: on ? '#00C4B411' : c.bg2,
                        border:`1px solid ${on ? '#00C4B4' : c.border}`,
                        color: on ? c.al : c.gr, fontSize:'0.8rem', fontWeight: on ? 600 : 400,
                        display:'flex', alignItems:'center', gap:6,
                      }}>
                        <span style={{ fontSize:'0.9rem' }}>{on ? '✓' : '○'}</span>
                        {p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            {erro && <div style={{ background:'#ef444411', border:'1px solid #ef444444', borderRadius:8,
              padding:'0.65rem', color:'#ef4444', fontSize:'0.8rem', marginTop:'0.75rem' }}>{erro}</div>}

            <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:'0.7rem', borderRadius:8,
                background:'transparent', border:`1px solid ${c.border}`, color:c.gr, cursor:'pointer' }}>
                Cancelar
              </button>
              <button onClick={salvarPerms} disabled={salvando} style={{ flex:2, padding:'0.7rem', borderRadius:8,
                background:`linear-gradient(135deg,${c.al},#00a896)`, border:'none',
                color:'#000', fontWeight:700, cursor:'pointer', opacity: salvando ? 0.6 : 1 }}>
                {salvando ? 'Salvando…' : `Salvar (${form.permissoes.length} módulos)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
