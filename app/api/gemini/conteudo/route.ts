import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const runtime = 'nodejs'
export const maxDuration = 30

// Tipos de conteúdo que o Gemini pode gerar
const PROMPTS: Record<string, (ctx: Record<string, string>) => string> = {

  // ── Cards ──────────────────────────────────────────────────────────────────
  copy_card: (ctx) => `
Você é um especialista em marketing digital brasileiro e copywriter para redes sociais.

Crie o CONTEÚDO TEXTUAL completo para um card de marketing com estas informações:
- Cliente/Marca: ${ctx.cliente || 'restaurante'}
- Plataforma: ${ctx.plataforma || 'Instagram'}
- Tipo: ${ctx.tipo || 'Feed'}
- Campanha: ${ctx.campanha || ''}
- Produto/Serviço: ${ctx.produto || ''}
- Objetivo: ${ctx.objetivo || 'engajamento'}
- Estilo visual: ${ctx.estilo || 'premium'}

Gere EXATAMENTE neste formato JSON:
{
  "titulo": "título principal do card (máx 5 palavras, impactante)",
  "subtitulo": "subtítulo complementar (máx 8 palavras)",
  "cta": "botão de ação (máx 4 palavras)",
  "legenda": "legenda completa para o post com emojis e hashtags (máx 300 chars)",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "variacao_2": "segunda opção de título",
  "variacao_3": "terceira opção de título"
}

Retorne APENAS o JSON, sem explicações.`,

  // ── Social Media ──────────────────────────────────────────────────────────
  legenda_post: (ctx) => `
Você é um social media manager especialista em gastronomia e marketing local brasileiro.

Crie uma legenda profissional para post de ${ctx.plataforma || 'Instagram'} (${ctx.tipo || 'Feed'}):
- Marca: ${ctx.cliente || 'restaurante'}
- Tema: ${ctx.tema || ctx.titulo || ''}
- Campanha: ${ctx.campanha || ''}
- Tom: ${ctx.tom || 'animado e próximo'}

Gere neste formato JSON:
{
  "legenda_curta": "versão curta até 150 chars com emojis",
  "legenda_completa": "versão completa até 400 chars com emojis e hashtags",
  "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"],
  "cta": "chamada para ação sugerida",
  "melhor_horario": "horário sugerido para publicar"
}

Retorne APENAS o JSON.`,

  // ── Vídeo Script ──────────────────────────────────────────────────────────
  script_video: (ctx) => `
Você é um roteirista especialista em vídeos curtos para TikTok, Reels e Stories no Brasil.

Crie um roteiro completo para vídeo de ${ctx.duracao || '30'}s:
- Marca: ${ctx.cliente || 'restaurante'}
- Produto/Tema: ${ctx.produto || ctx.tema || ''}
- Plataforma: ${ctx.plataforma || 'Instagram Reels'}
- Objetivo: ${ctx.objetivo || 'engajamento e viralização'}
- Estilo: ${ctx.estilo || 'dinâmico e apetitoso'}

Gere neste formato JSON:
{
  "hook": "primeiros 3 segundos — o gancho que prende atenção",
  "desenvolvimento": "do 3s ao 25s — o que mostrar e falar",
  "cta_final": "últimos 5 segundos — chamada para ação",
  "descricao_ia": "prompt em inglês para gerar o vídeo com IA (fal.ai)",
  "legenda": "legenda do post com emojis e hashtags",
  "musica_sugerida": "estilo/tom de música sugerido",
  "dicas_producao": ["dica 1", "dica 2", "dica 3"]
}

Retorne APENAS o JSON.`,

  // ── Ideia de Conteúdo ─────────────────────────────────────────────────────
  ideia_conteudo: (ctx) => `
Você é um estrategista de conteúdo digital especialista em food service e restaurantes brasileiros.

Gere 5 ideias criativas de conteúdo para:
- Marca: ${ctx.cliente || 'restaurante'}
- Período: ${ctx.periodo || 'esta semana'}
- Plataformas: ${ctx.plataformas || 'Instagram, TikTok'}
- Campanhas ativas: ${ctx.campanhas || ''}

Formato JSON:
{
  "ideias": [
    {
      "titulo": "nome da ideia",
      "formato": "Feed|Story|Reels|TikTok",
      "descricao": "o que produzir e como",
      "texto": "legenda sugerida com emojis",
      "potencial_viral": "alto|médio|baixo",
      "dificuldade": "fácil|médio|difícil"
    }
  ],
  "tema_semana": "tema central sugerido para a semana",
  "data_ideal": "melhor dia/horário para publicar"
}

Retorne APENAS o JSON.`,

  // ── Campanha Completa ─────────────────────────────────────────────────────
  briefing_campanha: (ctx) => `
Você é um diretor de criação de agência de marketing digital brasileira.

Crie um briefing criativo completo para:
- Cliente: ${ctx.cliente || ''}
- Campanha: ${ctx.campanha || ''}
- Objetivo: ${ctx.objetivo || ''}
- Período: ${ctx.periodo || ''}
- Budget: ${ctx.budget || ''}

Formato JSON:
{
  "conceito": "conceito criativo central da campanha",
  "mensagem_chave": "mensagem principal em 1 frase",
  "tom_de_voz": "como falar com o público",
  "copies": {
    "feed": "copy para feed",
    "story": "copy para story",
    "reels": "copy para reels",
    "whatsapp": "copy para WhatsApp"
  },
  "hashtags_campanha": ["tag1", "tag2", "tag3"],
  "ideias_criativas": ["ideia 1", "ideia 2", "ideia 3"],
  "referencias_visuais": "estilo visual sugerido"
}

Retorne APENAS o JSON.`,
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY não configurada', needsKey: true }, { status: 400 })
  }

  try {
    const { tipo, contexto } = await req.json()

    const promptFn = PROMPTS[tipo]
    if (!promptFn) {
      return NextResponse.json({ error: `Tipo desconhecido: ${tipo}. Use: ${Object.keys(PROMPTS).join(', ')}` }, { status: 400 })
    }

    const prompt = promptFn(contexto ?? {})

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
    })

    const result   = await model.generateContent(prompt)
    const text     = result.response.text()
    const parsed   = JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())

    return NextResponse.json({ ok: true, data: parsed, modelo: 'gemini-1.5-flash' })
  } catch (err) {
    console.error('[gemini/conteudo]', err)
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
