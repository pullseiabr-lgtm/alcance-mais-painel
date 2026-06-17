'use client'

import { useState, useRef, useEffect } from 'react'

interface Msg { role: 'user' | 'assistant'; content: string; ts: string; tools?: string[] }

const QUICK = [
  'Olá! Vi vocês no Instagram, queria saber sobre gestão de redes sociais',
  'Tenho um restaurante e quero atrair mais clientes, vocês ajudam?',
  'Quanto custa para fazer tráfego pago?',
  'Quero agendar uma conversa com a equipe',
]

export default function AgenteComercialPage() {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessao] = useState(() => `com-${Date.now()}`)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  async function enviar(texto?: string) {
    const msg = (texto || input).trim()
    if (!msg || loading) return
    setInput('')
    setMsgs(p => [...p, { role: 'user', content: msg, ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }])
    setLoading(true)
    try {
      const r = await fetch('/api/agente-comercial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensagem: msg, sessao }) })
      const d = await r.json()
      setMsgs(p => [...p, { role: 'assistant', content: d.resposta || 'Sem resposta.', ts: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), tools: d.ferramentas }])
    } catch { setMsgs(p => [...p, { role: 'assistant', content: '❌ Erro ao conectar.', ts: '' }]) }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center text-white text-lg font-bold">C</div>
        <div className="flex-1">
          <h1 className="font-bold text-gray-900">Agente Comercial · SDR</h1>
          <p className="text-xs text-gray-500">Vendas, prospecção e atendimento — registra leads no CRM automaticamente</p>
        </div>
        <button onClick={() => setMsgs([])} className="text-xs text-gray-400 hover:text-gray-600">🗑 Limpar</button>
      </div>

      <div className="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto">
        {QUICK.map(q => <button key={q} onClick={() => enviar(q)} className="text-xs bg-gray-50 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 rounded-full px-3 py-1.5 whitespace-nowrap">{q.slice(0, 38)}…</button>)}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 pb-20">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-700 rounded-3xl flex items-center justify-center text-white text-3xl">C</div>
            <p className="text-gray-500 text-sm max-w-xs">Agente Comercial da Alcance+. Simule um cliente chegando pelo WhatsApp — ele responde, qualifica e cria o lead no CRM.</p>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
            {m.role === 'assistant' && <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">C</div>}
            <div className="max-w-[78%] flex flex-col gap-0.5">
              <div className={`px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-teal-600 text-white rounded-br-sm' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'}`}>{m.content}</div>
              {m.tools && m.tools.length > 0 && <span className="text-[10px] text-teal-600 px-1">🗂️ CRM: {Array.from(new Set(m.tools)).join(', ')}</span>}
              {m.ts && <span className="text-[10px] text-gray-400 px-1">{m.ts}</span>}
            </div>
          </div>
        ))}
        {loading && <div className="flex justify-start gap-2"><div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">C</div><div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex gap-1.5"><span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" /><span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} /></div></div>}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() } }} placeholder="Simule a mensagem de um cliente…" rows={1} className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 max-h-32" style={{ minHeight: 46 }} />
          <button onClick={() => enviar()} disabled={!input.trim() || loading} className="w-11 h-11 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-200 text-white rounded-2xl flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
