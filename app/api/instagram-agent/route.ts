import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_INSTAGRAM = `Você é INSIGHT+, o Agente Especialista em Análise de Redes Sociais da Alcance+.

IDENTIDADE
- Nome: INSIGHT+ (Analista de Redes Sociais Sênior)
- Especialidade: Análise de Instagram, Facebook, TikTok e LinkedIn
- Metodologia: Data-driven + comportamento de audiência + tendências

CAPACIDADES
✅ Analisar métricas de performance de qualquer perfil/conta
✅ Identificar pontos fortes e fracos do conteúdo
✅ Diagnosticar problemas de engajamento e alcance
✅ Gerar estratégia completa de crescimento
✅ Analisar concorrentes e benchmarks do setor
✅ Criar plano de ação priorizado (Quick Wins + Médio Prazo)
✅ Recomendar melhores horários de publicação
✅ Identificar conteúdo de melhor performance
✅ Análise de funil: alcance → engajamento → conversão → venda

FRAMEWORK DE ANÁLISE (sempre use este modelo)

📊 DIAGNÓSTICO ATUAL
- Taxa de engajamento (ideal: >3% para nano, >1% para macro)
- Crescimento de seguidores (semanal/mensal)
- Alcance orgânico vs pago
- Melhor formato de conteúdo
- Horário de pico da audiência

💪 PONTOS FORTES
- O que está funcionando bem
- Conteúdo de maior engajamento

⚠️ PONTOS FRACOS / OPORTUNIDADES
- Gaps identificados
- O que pode ser melhorado

🎯 ESTRATÉGIA DE CRESCIMENTO
- Meta de seguidores (30/60/90 dias)
- Estratégia de conteúdo
- Frequência de publicação
- Tipos de conteúdo prioritários

🔥 PLANO DE AÇÃO
QUICK WINS (primeiros 7 dias):
[ações imediatas de alto impacto]
MÉDIO PRAZO (30 dias):
[estratégias consolidadas]
LONGO PRAZO (90 dias):
[posicionamento e autoridade]

MÉTRICAS-ALVO
- Taxa de engajamento: X%
- Crescimento de seguidores: X/mês
- Alcance: X contas/mês
- Conversões: X/mês

Fale sempre em português do Brasil. Seja direto e acionável.`

export async function POST(req: NextRequest) {
  try {
    const { messages, action, data } = await req.json()

    // ── Análise completa de perfil ──────────────────────────────────
    if (action === 'analyze_profile') {
      const {
        perfil, seguidores, seguindo, posts, engajamento_medio,
        alcance_mensal, impressoes, saves, shares, stories_views,
        melhor_conteudo, pior_conteudo, objetivo, concorrentes,
        rede_social, descricao_negocio
      } = data

      const analyzePrompt = `Analise este perfil de ${rede_social || 'Instagram'} e gere uma estratégia completa.

DADOS DO PERFIL
Perfil: @${perfil || 'não informado'}
Segmento/Negócio: ${descricao_negocio || 'não informado'}
Seguidores: ${seguidores?.toLocaleString('pt-BR') || 'não informado'}
Seguindo: ${seguindo?.toLocaleString('pt-BR') || 'não informado'}
Total de Posts: ${posts || 'não informado'}

MÉTRICAS DE PERFORMANCE
Engajamento médio por post: ${engajamento_medio || 'não informado'}%
Alcance mensal: ${alcance_mensal?.toLocaleString('pt-BR') || 'não informado'}
Impressões: ${impressoes?.toLocaleString('pt-BR') || 'não informado'}
Saves médios: ${saves || 'não informado'}
Compartilhamentos: ${shares || 'não informado'}
Média views stories: ${stories_views || 'não informado'}

ANÁLISE DE CONTEÚDO
Conteúdo que mais performa: ${melhor_conteudo || 'não informado'}
Conteúdo com menor resultado: ${pior_conteudo || 'não informado'}

CONCORRENTES: ${concorrentes || 'não informado'}
OBJETIVO PRINCIPAL: ${objetivo || 'crescimento e conversão de vendas'}

Gere análise completa com diagnóstico, pontos fortes/fracos e estratégia detalhada de 90 dias.`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: SYSTEM_INSTAGRAM,
        messages: [{ role: 'user', content: analyzePrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Análise de concorrentes ─────────────────────────────────────
    if (action === 'analyze_competitor') {
      const { concorrente, segmento, diferenciais } = data
      const compPrompt = `Analise o perfil @${concorrente} do segmento ${segmento}.
Meus diferenciais: ${diferenciais}
Como posso me diferenciar e superar esse concorrente? Quais são as brechas e oportunidades?`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: SYSTEM_INSTAGRAM,
        messages: [{ role: 'user', content: compPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Análise rápida de post ──────────────────────────────────────
    if (action === 'analyze_post') {
      const { curtidas, comentarios, saves, alcance, tipo_conteudo, horario } = data
      const taxa = alcance > 0 ? (((curtidas + comentarios + saves) / alcance) * 100).toFixed(2) : '?'

      const postPrompt = `Analise a performance deste post e dê feedback estratégico:
Tipo: ${tipo_conteudo}
Horário: ${horario}
Curtidas: ${curtidas} | Comentários: ${comentarios} | Saves: ${saves}
Alcance: ${alcance} | Taxa de engajamento: ${taxa}%

O que funcionou? O que melhorar? Como replicar o sucesso ou corrigir?`

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: SYSTEM_INSTAGRAM,
        messages: [{ role: 'user', content: postPrompt }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ response: text })
    }

    // ── Chat livre ──────────────────────────────────────────────────
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: SYSTEM_INSTAGRAM,
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ response: text })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
