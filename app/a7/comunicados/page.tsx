'use client'
import { useA7, fmtDataHora } from '@/lib/a7-client'
import { Cabecalho, Estado } from '../ui'

export default function Comunicados() {
  const { dados, carregando, erro } = useA7('comunicados')
  return (
    <div className="a7-page">
      <Cabecalho titulo="Comunicados" sub="Avisos e novidades da Alcance+ para a sua marca." />
      <Estado carregando={carregando} erro={erro} vazio={!carregando && dados.length === 0} msgVazio="Nenhum comunicado por enquanto." />
      <div className="a7-grid">
        {dados.map(c => (
          <div key={c.id} className="a7-card">
            <div style={{ fontWeight: 800, fontSize: 16 }}>{c.titulo}</div>
            <small style={{ color: 'var(--mut)' }}>{fmtDataHora(c.created_at)}</small>
            <p style={{ whiteSpace: 'pre-wrap', margin: '10px 0 0', lineHeight: 1.6 }}>{c.corpo}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
