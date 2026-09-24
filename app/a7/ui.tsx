'use client'
import { LABEL_STATUS } from '@/lib/a7-config'

export function Badge({ s }: { s: string }) {
  const l = LABEL_STATUS[s] ?? { txt: s, cor: '#94a3b8' }
  return <span className="a7-badge" style={{ background: l.cor }}>{l.txt}</span>
}

export function Modal({ titulo, onClose, children }: { titulo: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="a7-modal-bg" onClick={onClose}>
      <div className="a7-modal" onClick={e => e.stopPropagation()}>
        <div className="a7-row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <b style={{ fontSize: 16 }}>{titulo}</b>
          <button className="a7-btn sec" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Cabecalho({ titulo, sub, acao }: { titulo: string; sub?: string; acao?: React.ReactNode }) {
  return (
    <div className="a7-row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
      <div><h1 className="a7-h1">{titulo}</h1>{sub && <p className="a7-sub" style={{ margin: 0 }}>{sub}</p>}</div>
      {acao}
    </div>
  )
}

export function Estado({ carregando, erro, vazio, msgVazio }: { carregando: boolean; erro: string; vazio: boolean; msgVazio: string }) {
  if (erro) return <div className="a7-err">{erro}</div>
  if (carregando) return <div className="a7-empty">Carregando…</div>
  if (vazio) return <div className="a7-empty">{msgVazio}</div>
  return null
}

export const REDE_ICO: Record<string, string> = {
  instagram: '📸', facebook: '👍', tiktok: '🎵', linkedin: '💼', youtube: '▶️', whatsapp: '💬', outro: '🌐',
}
