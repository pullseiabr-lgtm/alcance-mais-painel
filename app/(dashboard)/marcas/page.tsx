'use client'
import { useState, useEffect } from 'react'
import { db, type BrandKit } from '@/lib/db'
import { createClient } from '@/lib/supabase/client'

const SEGMENTOS = [
  'Restaurante','Delivery / iFood','Pizzaria','Hamburgueria','Sushi / Japonês',
  'Padaria / Confeitaria','Cafeteria','Churrascaria','Loja de Roupas',
  'Salão de Beleza','Academia / Fitness','Imobiliária','Clínica / Saúde',
  'Agência de Marketing','E-commerce','Advocacia','Tecnologia','Outro',
]

const EMPTY: Omit<BrandKit, 'id'|'created_at'> = {
  cliente_id: null,
  nome: '',
  logo_url: '',
  cor_primaria: '#00C4B4',
  cor_secundaria: '#1A1D28',
  cor_acento: '#FFFFFF',
  fontes: [],
  tagline: '',
  segmento: '',
  site: '',
}

const FONTES_SUGERIDAS = ['Inter','Montserrat','Roboto','Open Sans','Poppins','Playfair Display','Bebas Neue','Raleway','Nunito','Lato']

export default function MarcasPage() {
  const [kits, setKits]         = useState<BrandKit[]>([])
  const [clientes, setClientes] = useState<{id:string,nome:string}[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [form, setForm]         = useState(EMPTY)
  const [editing, setEditing]   = useState<string|null>(null)
  const [saving, setSaving]     = useState(false)
  const [preview, setPreview]   = useState<BrandKit|null>(null)

  const sb = createClient()

  async function load() {
    setLoading(true)
    const [{ data: k }, { data: cls }] = await Promise.all([
      db.brandKits.listar(),
      sb.from('clientes').select('id,nome').order('nome'),
    ])
    setKits(k ?? [])
    setClientes(cls ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.nome) return
    setSaving(true)
    if (editing) {
      await db.brandKits.atualizar(editing, form)
    } else {
      await db.brandKits.criar(form)
    }
    setSaving(false); setModal(false); setForm(EMPTY); setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Remover este Brand Kit?')) return
    await db.brandKits.deletar(id); load()
  }

  function openEdit(k: BrandKit) {
    const { id, created_at, ...rest } = k
    setForm(rest); setEditing(id); setPreview(null); setModal(true)
  }

  function toggleFonte(f: string) {
    setForm(prev => ({
      ...prev,
      fontes: prev.fontes.includes(f) ? prev.fontes.filter(x=>x!==f) : [...prev.fontes, f]
    }))
  }

  return (
    <>
      <div className="topbar">
        <div>
          <span className="tb-title">Brand Kit</span>
          <span className="tb-sub">{kits.length} marcas cadastradas</span>
        </div>
        <button className="btn btn-primary" onClick={()=>{setForm(EMPTY);setEditing(null);setPreview(null);setModal(true)}}>+ Novo Brand Kit</button>
      </div>

      <div className="content">
        {loading ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>⟳ Carregando marcas…</div>
        ) : kits.length===0 ? (
          <div style={{ textAlign:'center', padding:'48px 0', color:'var(--gr3)' }}>
            Nenhum Brand Kit cadastrado.<br/>
            <button className="btn btn-primary btn-sm" style={{ marginTop:12 }} onClick={()=>{setForm(EMPTY);setEditing(null);setModal(true)}}>+ Criar Brand Kit</button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {kits.map(k=>(
              <div key={k.id} className="card" style={{ padding:0, overflow:'hidden', cursor:'pointer' }} onClick={()=>setPreview(k)}>
                {/* Header com cores da marca */}
                <div style={{ background:`linear-gradient(135deg, ${k.cor_primaria}, ${k.cor_secundaria})`, padding:'24px 20px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    {k.logo_url ? (
                      <img src={k.logo_url} alt={k.nome} style={{ height:40, objectFit:'contain', marginBottom:8, display:'block' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                    ) : (
                      <div style={{ width:40, height:40, borderRadius:8, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'#fff', marginBottom:8 }}>
                        {k.nome.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>{k.nome}</div>
                    {k.tagline&&<div style={{ fontSize:11, color:'rgba(255,255,255,0.75)', marginTop:2 }}>{k.tagline}</div>}
                  </div>
                  <div style={{ display:'flex', gap:6 }} onClick={e=>e.stopPropagation()}>
                    <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'none' }} onClick={()=>openEdit(k)}>✏️</button>
                    <button className="btn btn-sm" style={{ background:'rgba(255,0,0,0.2)', color:'#fff', border:'none' }} onClick={()=>remove(k.id)}>🗑</button>
                  </div>
                </div>
                {/* Paleta de cores */}
                <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--gr)' }}>
                  <div style={{ fontSize:10, color:'var(--gr3)', fontWeight:700, marginBottom:8 }}>PALETA DE CORES</div>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {[
                      { cor: k.cor_primaria, label:'Primária' },
                      { cor: k.cor_secundaria, label:'Secundária' },
                      { cor: k.cor_acento, label:'Acento' },
                    ].map(({ cor, label })=>(
                      <div key={label} style={{ textAlign:'center' }}>
                        <div style={{ width:32, height:32, borderRadius:8, background:cor, border:'2px solid var(--gr)', marginBottom:3 }}/>
                        <div style={{ fontSize:9, color:'var(--gr3)' }}>{label}</div>
                        <div style={{ fontSize:9, color:'var(--gr3)', fontFamily:'var(--mono)' }}>{cor}</div>
                      </div>
                    ))}
                    <div style={{ flex:1 }}/>
                    {k.segmento&&<span className="badge badge-al" style={{ fontSize:9 }}>{k.segmento}</span>}
                  </div>
                </div>
                {/* Rodapé */}
                <div style={{ padding:'10px 20px', display:'flex', gap:8, justifyContent:'space-between', alignItems:'center' }}>
                  {k.fontes.length>0 ? (
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {k.fontes.slice(0,2).map(f=><span key={f} className="badge" style={{ fontSize:9 }}>Aa {f}</span>)}
                      {k.fontes.length>2&&<span className="badge" style={{ fontSize:9 }}>+{k.fontes.length-2}</span>}
                    </div>
                  ) : <span style={{ fontSize:11, color:'var(--gr3)' }}>—</span>}
                  {k.site&&<a href={k.site} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontSize:10, color:'var(--al)' }}>🌐 Site</a>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de preview completo */}
      {preview&&!modal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)setPreview(null)}}>
          <div className="modal" style={{ maxWidth:600 }}>
            <div style={{ background:`linear-gradient(135deg, ${preview.cor_primaria}, ${preview.cor_secundaria})`, borderRadius:'12px 12px 0 0', padding:'28px 28px 24px', margin:'-24px -24px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  {preview.logo_url && <img src={preview.logo_url} alt={preview.nome} style={{ height:48, objectFit:'contain', marginBottom:10, display:'block' }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>}
                  <div style={{ fontSize:22, fontWeight:900, color:'#fff' }}>{preview.nome}</div>
                  {preview.tagline&&<div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', marginTop:4 }}>"{preview.tagline}"</div>}
                  {preview.segmento&&<span style={{ background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:11, padding:'3px 8px', borderRadius:20, display:'inline-block', marginTop:8 }}>{preview.segmento}</span>}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'none' }} onClick={()=>openEdit(preview)}>✏️ Editar</button>
                  <button className="btn btn-sm" style={{ background:'rgba(255,255,255,0.1)', color:'#fff', border:'none' }} onClick={()=>setPreview(null)}>✕</button>
                </div>
              </div>
            </div>

            <div style={{ display:'grid', gap:20 }}>
              {/* Paleta */}
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>PALETA DE CORES</div>
                <div style={{ display:'flex', gap:16 }}>
                  {[
                    { cor:preview.cor_primaria, label:'Cor Primária' },
                    { cor:preview.cor_secundaria, label:'Cor Secundária' },
                    { cor:preview.cor_acento, label:'Cor de Acento' },
                  ].map(({ cor, label })=>(
                    <div key={label} style={{ flex:1 }}>
                      <div style={{ height:60, borderRadius:10, background:cor, border:'2px solid var(--gr)', marginBottom:8 }}/>
                      <div style={{ fontSize:11, color:'var(--wh)', fontWeight:600, marginBottom:2 }}>{label}</div>
                      <div style={{ fontSize:12, fontFamily:'var(--mono)', color:'var(--al)' }}>{cor}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipografia */}
              {preview.fontes.length>0&&(
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--gr3)', marginBottom:12 }}>TIPOGRAFIA</div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {preview.fontes.map(f=>(
                      <div key={f} className="card" style={{ padding:'10px 16px' }}>
                        <div style={{ fontSize:16, fontWeight:700, color:'var(--wh)' }}>Aa</div>
                        <div style={{ fontSize:11, color:'var(--gr3)' }}>{f}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Infos */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { l:'Site', v: preview.site, href: preview.site },
                  { l:'Segmento', v: preview.segmento, href: '' },
                ].filter(f=>f.v).map(f=>(
                  <div key={f.l} style={{ background:'var(--bk3)', borderRadius:8, padding:'12px 14px' }}>
                    <div style={{ fontSize:10, color:'var(--gr3)', fontWeight:700, marginBottom:4 }}>{f.l.toUpperCase()}</div>
                    {f.href ? <a href={f.href} target="_blank" rel="noreferrer" style={{ fontSize:13, color:'var(--al)' }}>{f.v}</a>
                      : <div style={{ fontSize:13, color:'var(--wh)' }}>{f.v}</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal form */}
      {modal&&(
        <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget){setModal(false);setForm(EMPTY);setEditing(null)}}}>
          <div className="modal" style={{ maxWidth:580 }}>
            <div className="modal-hd">
              <span>{editing?'Editar Brand Kit':'Novo Brand Kit'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>✕</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Nome da Marca *</label>
                <input className="inp" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} placeholder="Ex: Bella Cafeteria"/>
              </div>
              <div>
                <label className="lbl">Cliente (Supabase)</label>
                <select className="inp" value={form.cliente_id??''} onChange={e=>setForm(f=>({...f,cliente_id:e.target.value||null}))}>
                  <option value="">Sem vínculo</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Segmento</label>
                <select className="inp" value={form.segmento} onChange={e=>setForm(f=>({...f,segmento:e.target.value}))}>
                  <option value="">Selecionar…</option>
                  {SEGMENTOS.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Tagline / Slogan</label>
                <input className="inp" value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} placeholder="Ex: Sabor que conecta pessoas"/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">URL do Logo (Google Drive, Imgur, etc.)</label>
                <input className="inp" value={form.logo_url} onChange={e=>setForm(f=>({...f,logo_url:e.target.value}))} placeholder="https://drive.google.com/uc?id=..."/>
                {form.logo_url&&(
                  <img src={form.logo_url} alt="preview" style={{ height:48, objectFit:'contain', marginTop:8, borderRadius:6, background:'var(--bk3)', padding:4 }} onError={e=>{(e.target as HTMLImageElement).style.display='none'}}/>
                )}
              </div>
              <div>
                <label className="lbl">Cor Primária</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="color" value={form.cor_primaria} onChange={e=>setForm(f=>({...f,cor_primaria:e.target.value}))} style={{ width:48, height:36, border:'none', borderRadius:6, cursor:'pointer', background:'none' }}/>
                  <input className="inp" value={form.cor_primaria} onChange={e=>setForm(f=>({...f,cor_primaria:e.target.value}))} style={{ fontFamily:'var(--mono)', fontSize:12 }}/>
                </div>
              </div>
              <div>
                <label className="lbl">Cor Secundária</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="color" value={form.cor_secundaria} onChange={e=>setForm(f=>({...f,cor_secundaria:e.target.value}))} style={{ width:48, height:36, border:'none', borderRadius:6, cursor:'pointer', background:'none' }}/>
                  <input className="inp" value={form.cor_secundaria} onChange={e=>setForm(f=>({...f,cor_secundaria:e.target.value}))} style={{ fontFamily:'var(--mono)', fontSize:12 }}/>
                </div>
              </div>
              <div>
                <label className="lbl">Cor de Acento</label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="color" value={form.cor_acento} onChange={e=>setForm(f=>({...f,cor_acento:e.target.value}))} style={{ width:48, height:36, border:'none', borderRadius:6, cursor:'pointer', background:'none' }}/>
                  <input className="inp" value={form.cor_acento} onChange={e=>setForm(f=>({...f,cor_acento:e.target.value}))} style={{ fontFamily:'var(--mono)', fontSize:12 }}/>
                </div>
              </div>
              <div>
                <label className="lbl">Site</label>
                <input className="inp" value={form.site} onChange={e=>setForm(f=>({...f,site:e.target.value}))} placeholder="https://..."/>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label className="lbl">Tipografia (fontes utilizadas)</label>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:4 }}>
                  {FONTES_SUGERIDAS.map(fn=>(
                    <button key={fn} type="button"
                      className={`btn btn-sm ${form.fontes.includes(fn)?'btn-primary':'btn-ghost'}`}
                      onClick={()=>toggleFonte(fn)} style={{ fontSize:11 }}>{fn}</button>
                  ))}
                </div>
              </div>

              {/* Preview live */}
              {form.nome&&(
                <div style={{ gridColumn:'1/-1' }}>
                  <label className="lbl">Preview da Marca</label>
                  <div style={{ borderRadius:10, overflow:'hidden', border:'1px solid var(--gr)' }}>
                    <div style={{ background:`linear-gradient(135deg, ${form.cor_primaria}, ${form.cor_secundaria})`, padding:'20px 24px' }}>
                      <div style={{ fontSize:20, fontWeight:900, color:'#fff' }}>{form.nome}</div>
                      {form.tagline&&<div style={{ fontSize:12, color:'rgba(255,255,255,0.75)', marginTop:2 }}>"{form.tagline}"</div>}
                    </div>
                    <div style={{ background:'var(--bk2)', padding:'12px 16px', display:'flex', gap:10 }}>
                      {[form.cor_primaria, form.cor_secundaria, form.cor_acento].map((cor,i)=>(
                        <div key={i} style={{ width:28, height:28, borderRadius:6, background:cor, border:'2px solid var(--gr)' }}/>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end', marginTop:20 }}>
              <button className="btn btn-ghost" onClick={()=>{setModal(false);setForm(EMPTY);setEditing(null)}}>Cancelar</button>
              <button className="btn btn-primary" onClick={save} disabled={saving||!form.nome}>
                {saving?'Salvando…':editing?'Salvar':'Criar Brand Kit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
