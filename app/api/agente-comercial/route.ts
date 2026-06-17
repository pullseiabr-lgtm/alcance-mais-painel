import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { CRM_WRITE_TOOLS, CRM_TOOLS, executarToolEscrita, executarToolCRM } from '@/lib/maestro-crm'

export const dynamic = 'force-dynamic'

const MODELO = 'claude-sonnet-4-5'
function ia() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) }

// Sessões por número/telefone (memória; reinicia a cada deploy)
const sessoes = new Map<string, { role: 'user' | 'assistant'; content: any }[]>()

const SYSTEM = `Você é o AGENTE COMERCIAL da Alcance+ Agência de Marketing — especialista em VENDAS e PROSPECÇÃO, atendendo via WhatsApp.

IDENTIDADE & TOM
- Consultivo, simpático, profissional e objetivo. Humano, nunca robótico.
- Frases como "Será um prazer te ajudar!", "Me conta um pouco sobre seu negócio?", "Posso te mostrar como podemos ajudar".
- Mensagens curtas (máx ~250 palavras), com emojis moderados e *negrito* nos pontos-chave.

SERVIÇOS DA ALCANCE+ (domine e explique):
✅ Gestão de Redes Sociais (Instagram, Facebook, TikTok)
✅ Tráfego Pago (Meta Ads, Google Ads)
✅ Criação de Conteúdo (artes, reels, copy)
✅ Branding e Identidade Visual
✅ Sites e Landing Pages
✅ Consultoria de Marketing e Growth
✅ Disparos de WhatsApp (campanhas)

OBJETIVO (nesta ordem):
1. ACOLHER o contato e entender a necessidade (segmento, objetivo, desafio).
2. QUALIFICAR como SPIN: Situação, Problema, Implicação, Necessidade.
3. APRESENTAR a solução da Alcance+ que resolve o problema dele.
4. CONDUZIR para o próximo passo: agendar uma conversa/diagnóstico.
5. REGISTRAR o lead no CRM (use a ferramenta criar_lead com empresa + contato; depois qualificar_lead com a probabilidade).

USO DAS FERRAMENTAS (CRM):
- Assim que tiver o NOME e a EMPRESA/segmento do interessado, use *criar_lead* para registrar no CRM (origem "WhatsApp").
- Conforme avança a conversa, use *qualificar_lead* (probabilidade 0-100) e *mover_pipeline* (qualificacao/proposta/negociacao).
- Pode consultar dados com as ferramentas de leitura quando útil.
- Faça isso em segundo plano — NÃO diga ao cliente termos técnicos do CRM.

AGENDAMENTO
- Quando o cliente topar avançar, ofereça horários e confirme: "Perfeito! Vou agendar e nossa equipe te confirma. 📅". Registre como observação no lead.

REGRAS
- Nunca invente preços fechados; diga que o investimento é montado conforme o escopo e que um especialista passa a proposta.
- Não prometa prazos sem validação.
- Se o cliente pedir humano/reclamação séria → "Vou te encaminhar para um especialista da nossa equipe. 🤝"

Fale sempre em português do Brasil.`

export async function POST(req: NextRequest) {
  try {
    const { mensagem, sessao, telefone } = await req.json()
    if (!mensagem?.trim()) return NextResponse.json({ error: 'mensagem vazia' }, { status: 400 })
    const chave = sessao || telefone || 'anon'

    if (sessoes.size > 300) sessoes.clear()
    const hist = sessoes.get(chave) || []
    hist.push({ role: 'user', content: mensagem })

    const tools = [...CRM_TOOLS, ...CRM_WRITE_TOOLS]
    const messages: Anthropic.MessageParam[] = hist.slice(-20) as any
    const client = ia()
    let resposta = ''
    const ferramentasUsadas: string[] = []

    for (let i = 0; i < 6; i++) {
      const res = await client.messages.create({ model: MODELO, max_tokens: 1024, system: SYSTEM, tools, messages })
      if (res.stop_reason !== 'tool_use') {
        resposta = res.content.find(b => b.type === 'text')?.text || ''
        messages.push({ role: 'assistant', content: res.content })
        break
      }
      messages.push({ role: 'assistant', content: res.content })
      const results: Anthropic.ToolResultBlockParam[] = []
      for (const b of res.content) {
        if (b.type === 'tool_use') {
          ferramentasUsadas.push(b.name)
          const out = b.name.startsWith('criar_') || b.name.startsWith('qualificar') || b.name.startsWith('mover') || b.name === 'criar_cliente'
            ? await executarToolEscrita(b.name, b.input as Record<string, unknown>)
            : await executarToolCRM(b.name, b.input as Record<string, unknown>)
          results.push({ type: 'tool_result', tool_use_id: b.id, content: out })
        }
      }
      messages.push({ role: 'user', content: results })
    }

    sessoes.set(chave, [...hist, { role: 'assistant' as const, content: resposta }].slice(-20))
    return NextResponse.json({ resposta, ferramentas: ferramentasUsadas })
  } catch (e) {
    console.error('[agente-comercial]', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erro' }, { status: 500 })
  }
}
