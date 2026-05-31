'use client'
import { useState, useRef, useEffect, ChangeEvent, DragEvent } from 'react'
import { Brand, listarMarcas, salvarMarca, deletarMarca, novaMarca, fileToBase64 } from '@/lib/brands'

// ─── Constants ────────────────────────────────────────────────────────────────

const SEGMENTOS = [
  'Restaurante', 'Delivery / iFood', 'Pizzaria', 'Hamburgueria', 'Sushi / Japonês',
  'Padaria / Confeitaria', 'Cafeteria', 'Churrascaria', 'Loja de Roupas',
  'Salão de Beleza', 'Academia / Fitness', 'Imobiliária', 'Clínica / Saúde',
  'Agência de Marketing', 'E-commerce', 'Advocacia', 'Tecnologia', 'Outro',
]

// ─── Editor Modal ─────────────────────────────────────────────────────────────

function BrandEditor({
  brand, onSave, onClose,
}: {
  brand: Brand
  onSave: (b: Brand) => void
  onClose: () => void
}) {
  const [b, setB]           = useState<Brand>({ ...brand })
  const [isDrag, setIsDrag] = useState(false)
  const fileRef             = useRef<HTMLInputElement>(null)

  function set<K extends keyof Brand>(k: K, v: Brand[K]) {
    setB(prev => ({ ...prev, [k]: v }))
  }

  async function handleLogoFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 5 * 1024 * 1024) { alert('Logo máx. 5 MB'); return }
    const { base64, mime } = await fileToBase64(file)
    setB(prev => ({ ...prev, logoBase64: base64, logoMime: mime }))
  }

  function onFilePick(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (f) handleLogoFile(f); e.target.value = ''
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setIsDrag(false)
    const f = e.dataTransfer.files[0]; if (f) handleLogoFile(f)
  }

  const logoSrc = b.logoBase64 && b.logoMime ? `data:${b.logoMime};base64,${b.logoBase64}` : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bk2)', border: '1px solid var(--gr)',
        borderRadius: 20, width: '100%', maxWidth: 540,
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.6)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 22px', borderBottom: '1px solid var(--gr)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--wh)' }}>
            {brand.nome ? `✏️ Editar — ${brand.nome}` : '➕ Nova Marca'}
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--gr3)',
            fontSize: 18, cursor: 'pointer', padding: 4,
          }}>✕</button>
        </div>

        <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Logo upload */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
              🖼️ Logo da Marca
            </div>
            <div
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setIsDrag(true) }}
              onDragLeave={() => setIsDrag(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${isDrag ? 'var(--al)' : logoSrc ? 'rgba(0,196,180,.4)' : 'var(--gr)'}`,
                borderRadius: 12, cursor: 'pointer', overflow: 'hidden',
                background: isDrag ? 'var(--alb)' : 'var(--bk3)',
                transition: 'all .2s',
                minHeight: logoSrc ? 0 : 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {logoSrc ? (
                <div style={{ position: 'relative', width: '100%' }}>
                  <img src={logoSrc} alt="Logo" style={{
                    maxHeight: 120, maxWidth: '100%',
                    display: 'block', margin: '0 auto', padding: 16,
                    objectFit: 'contain',
                  }} />
                  <div style={{
                    position: 'absolute', bottom: 0, right: 0,
                    background: 'rgba(0,0,0,.65)', padding: '4px 10px',
                    fontSize: 9, color: 'rgba(255,255,255,.7)',
                  }}>Clique para trocar</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--gr3)' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--lgt)' }}>Arraste o logo aqui</div>
                  <div style={{ fontSize: 9, marginTop: 3 }}>PNG, SVG, JPG — máx. 5 MB</div>
                  <div style={{ fontSize: 9, marginTop: 2, color: 'var(--al)' }}>
                    Recomendado: PNG com fundo transparente
                  </div>
                </div>
              )}
            </div>
            {logoSrc && (
              <button onClick={() => setB(prev => ({ ...prev, logoBase64: null, logoMime: null }))}
                style={{
                  marginTop: 6, fontSize: 9, color: 'var(--er)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}>🗑️ Remover logo</button>
            )}
          </div>

          {/* Nome */}
          <div className="field">
            <label>Nome da Marca *</label>
            <input className="inp" type="text" value={b.nome}
              onChange={e => set('nome', e.target.value)}
              placeholder="Ex: Amore Restaurante" style={{ fontSize: 13 }} autoFocus />
          </div>

          {/* Tagline */}
          <div className="field">
            <label>Tagline / Slogan</label>
            <input className="inp" type="text" value={b.tagline}
              onChange={e => set('tagline', e.target.value)}
              placeholder="Ex: Sabor que une as pessoas" style={{ fontSize: 12 }} />
          </div>

          {/* Segmento */}
          <div className="field">
            <label>Segmento</label>
            <select className="inp" value={b.segmento} onChange={e => set('segmento', e.target.value)} style={{ fontSize: 12 }}>
              <option value="">Selecionar...</option>
              {SEGMENTOS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Cores */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gr3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>
              🎨 Cores da Marca
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { key: 'cor1' as const, label: 'Cor Principal' },
                { key: 'cor2' as const, label: 'Cor Secundária' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div style={{ fontSize: 9, color: 'var(--gr3)', marginBottom: 5 }}>{label}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="color" value={b[key] ?? '#000000'} onChange={e => set(key, e.target.value)}
                      style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid var(--gr)', cursor: 'pointer', background: 'none' }} />
                    <input type="text" value={b[key]} onChange={e => set(key, e.target.value)}
                      className="inp" style={{ flex: 1, fontSize: 10, padding: '8px', fontFamily: 'var(--mono)' }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Preview */}
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 10,
              background: `linear-gradient(135deg, ${b.cor1}, ${b.cor2})`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {logoSrc && <img src={logoSrc} alt="" style={{ height: 24, objectFit: 'contain' }} />}
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {b.nome || 'Preview'} {b.tagline ? `— ${b.tagline}` : ''}
              </span>
            </div>
          </div>

          {/* Site */}
          <div className="field">
            <label>Site / Instagram</label>
            <input className="inp" type="text" value={b.site}
              onChange={e => set('site', e.target.value)}
              placeholder="Ex: @amorerestaurante" style={{ fontSize: 12 }} />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 10, padding: '16px 22px',
          borderTop: '1px solid var(--gr)',
        }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center', padding: 10 }} onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-al"
            style={{ flex: 2, justifyContent: 'center', padding: 10, fontSize: 13 }}
            onClick={() => { if (!b.nome.trim()) { alert('Nome é obrigatório'); return } onSave({ ...b, ts: Date.now() }) }}
          >
            💾 Salvar Marca
          </button>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFilePick} />
    </div>
  )
}

// ─── Brand Card ───────────────────────────────────────────────────────────────

function BrandCard({ brand, onEdit, onDelete }: { brand: Brand; onEdit: () => void; onDelete: () => void }) {
  const logoSrc = brand.logoBase64 && brand.logoMime
    ? `data:${brand.logoMime};base64,${brand.logoBase64}` : null

  return (
    <div style={{
      background: 'var(--bk2)', border: '1px solid var(--gr)',
      borderRadius: 16, overflow: 'hidden',
      transition: 'border-color .2s, transform .2s',
    }}>
      {/* Color bar + logo */}
      <div style={{
        height: 90, position: 'relative', overflow: 'hidden',
        background: `linear-gradient(135deg, ${brand.cor1}20, ${brand.cor2}30)`,
        borderBottom: `3px solid ${brand.cor1}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {logoSrc ? (
          <img src={logoSrc} alt={brand.nome} style={{
            maxHeight: 70, maxWidth: '80%', objectFit: 'contain',
          }} />
        ) : (
          <div style={{
            width: 60, height: 60, borderRadius: 14,
            background: `linear-gradient(135deg, ${brand.cor1}, ${brand.cor2})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 900, color: '#fff',
            boxShadow: `0 4px 16px ${brand.cor1}50`,
          }}>
            {brand.nome.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Color swatches */}
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: brand.cor1, border: '2px solid rgba(255,255,255,.3)' }} />
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: brand.cor2, border: '2px solid rgba(255,255,255,.3)' }} />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--wh)', marginBottom: 3 }}>
          {brand.nome}
        </div>
        {brand.segmento && (
          <span style={{
            fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 12,
            background: `${brand.cor1}20`, color: brand.cor1,
            border: `1px solid ${brand.cor1}40`, display: 'inline-block', marginBottom: 4,
          }}>{brand.segmento}</span>
        )}
        {brand.tagline && (
          <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2, fontStyle: 'italic' }}>
            "{brand.tagline}"
          </div>
        )}
        {brand.site && (
          <div style={{ fontSize: 9, color: 'var(--al)', marginTop: 4 }}>{brand.site}</div>
        )}
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex', gap: 8, padding: '10px 14px',
        borderTop: '1px solid var(--gr)',
      }}>
        <button className="btn btn-al" style={{ flex: 1, justifyContent: 'center', padding: '7px', fontSize: 10 }}
          onClick={onEdit}>
          ✏️ Editar
        </button>
        <button className="btn" style={{ padding: '7px 10px', fontSize: 10, color: 'var(--er)' }}
          onClick={onDelete}>
          🗑️
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MarcasPage() {
  const [brands, setBrands]   = useState<Brand[]>([])
  const [editing, setEditing] = useState<Brand | null>(null)
  const [search, setSearch]   = useState('')
  const [toast, setToast]     = useState<{ msg: string; type: 'ok' | 'er' } | null>(null)

  useEffect(() => { setBrands(listarMarcas()) }, [])

  function showToast(msg: string, type: 'ok' | 'er' = 'ok') {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  function handleSave(b: Brand) {
    salvarMarca(b)
    setBrands(listarMarcas())
    setEditing(null)
    showToast(`✅ Marca "${b.nome}" salva com sucesso!`)
  }

  function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir a marca "${nome}"?`)) return
    deletarMarca(id)
    setBrands(listarMarcas())
    showToast(`🗑️ Marca "${nome}" excluída.`)
  }

  const filtered = brands.filter(b =>
    b.nome.toLowerCase().includes(search.toLowerCase()) ||
    b.segmento.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ padding: '24px 28px', maxWidth: 1300 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          padding: '10px 16px', borderRadius: 'var(--r2)', fontSize: 12, fontWeight: 600,
          background: toast.type === 'ok' ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)',
          border: `1px solid ${toast.type === 'ok' ? 'rgba(34,197,94,.35)' : 'rgba(239,68,68,.35)'}`,
          color: toast.type === 'ok' ? 'var(--ok)' : 'var(--er)',
          backdropFilter: 'blur(10px)', boxShadow: 'var(--sh)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 0 20px rgba(236,72,153,.4)',
          }}>🏷️</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--wh)', letterSpacing: '-.03em' }}>
                Brand Kit — Marcas
              </h1>
              <span style={{
                fontSize: 8, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                background: 'rgba(236,72,153,.12)', color: '#EC4899',
                border: '1px solid rgba(236,72,153,.3)', borderRadius: 20, padding: '2px 8px',
              }}>{brands.length} marca{brands.length !== 1 ? 's' : ''}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--gr3)', marginTop: 2 }}>
              Logos, cores e identidade visual dos clientes — usados automaticamente nos cards e vídeos
            </div>
          </div>
        </div>
        <button className="btn btn-al" style={{ padding: '10px 18px', fontSize: 12 }}
          onClick={() => setEditing(novaMarca())}>
          ➕ Adicionar Marca
        </button>
      </div>

      {/* Search */}
      {brands.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <input
            className="inp"
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Buscar marca ou segmento..."
            style={{ width: 320, fontSize: 12 }}
          />
        </div>
      )}

      {/* Empty state */}
      {brands.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          background: 'var(--bk2)', border: '1px solid var(--gr)',
          borderRadius: 20,
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🏷️</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--wh)', marginBottom: 8 }}>
            Nenhuma marca cadastrada
          </div>
          <div style={{ fontSize: 12, color: 'var(--gr3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Adicione as marcas dos seus clientes com logo, cores e identidade visual.
            O Studio de Cards e o Gerador de Vídeo usarão automaticamente.
          </div>
          <button className="btn btn-al" style={{ padding: '12px 28px', fontSize: 13 }}
            onClick={() => setEditing(novaMarca())}>
            ➕ Adicionar Primeira Marca
          </button>
          <div style={{ marginTop: 24, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Amore Restaurante', 'Pizza Express', 'Burger House'].map(ex => (
              <div key={ex} style={{
                padding: '8px 14px', borderRadius: 20,
                background: 'var(--bk3)', border: '1px solid var(--gr)',
                fontSize: 10, color: 'var(--gr3)', cursor: 'pointer',
              }} onClick={() => {
                const b = novaMarca()
                b.nome = ex
                setEditing(b)
              }}>+ {ex}</div>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(b => (
            <BrandCard
              key={b.id}
              brand={b}
              onEdit={() => setEditing({ ...b })}
              onDelete={() => handleDelete(b.id, b.nome)}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 && brands.length > 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--gr3)' }}>
          Nenhuma marca encontrada para "{search}"
        </div>
      )}

      {/* Info footer */}
      {brands.length > 0 && (
        <div style={{
          marginTop: 32, padding: 16,
          background: 'var(--bk2)', border: '1px solid var(--gr)', borderRadius: 12,
          display: 'flex', gap: 24, flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: 10, color: 'var(--gr3)', lineHeight: 1.6 }}>
            💡 <strong style={{ color: 'var(--lgt)' }}>Como usar:</strong> No Studio de Cards, selecione a marca no topo para aplicar logo, cores e identidade automaticamente nos cards gerados.
          </div>
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <BrandEditor brand={editing} onSave={handleSave} onClose={() => setEditing(null)} />
      )}
    </div>
  )
}
