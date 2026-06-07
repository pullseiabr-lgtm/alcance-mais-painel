/**
 * Motor de alertas do módulo Tráfego (Alcance Growth AI).
 * Avalia uma linha diária de métricas contra limiares e retorna os alertas disparados.
 * Limiares pensados para o segmento de food service / eventos (referência: benchmarks do módulo).
 */

export type LinhaMetrica = {
  campanha_id: string | null
  cliente_id: string | null
  canal: 'meta' | 'google' | 'tiktok'
  data: string
  cliques: number
  gasto: number
  conversoes: number
  ctr: number
  cpc: number
  frequencia: number
}

export type Alerta = {
  campanha_id: string | null
  cliente_id: string | null
  canal: string
  tipo: 'cpc_alto' | 'ctr_baixo' | 'frequencia_alta' | 'sem_conversao'
  severidade: 'atencao' | 'critico'
  mensagem: string
  valor: number
  limite: number
  data: string
}

const LIMITES = {
  cpc_alto: { atencao: 1.5, critico: 3.0 },
  ctr_baixo: { atencao: 1.0, critico: 0.5 },
  frequencia_alta: { atencao: 3.0, critico: 5.0 },
  gasto_minimo_sem_conversao: 50, // só alerta "sem conversão" se já gastou o suficiente para ter sinal
}

export function avaliarAlertas(linha: LinhaMetrica, nomeCampanha: string): Alerta[] {
  const alertas: Alerta[] = []
  const base = {
    campanha_id: linha.campanha_id,
    cliente_id: linha.cliente_id,
    canal: linha.canal,
    data: linha.data,
  }

  // 🔴 CPC alto
  if (linha.cliques > 0 && linha.cpc > LIMITES.cpc_alto.atencao) {
    const critico = linha.cpc > LIMITES.cpc_alto.critico
    alertas.push({
      ...base,
      tipo: 'cpc_alto',
      severidade: critico ? 'critico' : 'atencao',
      valor: linha.cpc,
      limite: LIMITES.cpc_alto.atencao,
      mensagem: `CPC de R$ ${linha.cpc.toFixed(2)} na campanha "${nomeCampanha}" está acima do recomendado (R$ ${LIMITES.cpc_alto.atencao.toFixed(2)}).`,
    })
  }

  // 🔴 CTR baixo
  if (linha.cliques + linha.gasto > 0 && linha.ctr < LIMITES.ctr_baixo.atencao) {
    const critico = linha.ctr < LIMITES.ctr_baixo.critico
    alertas.push({
      ...base,
      tipo: 'ctr_baixo',
      severidade: critico ? 'critico' : 'atencao',
      valor: linha.ctr,
      limite: LIMITES.ctr_baixo.atencao,
      mensagem: `CTR de ${linha.ctr.toFixed(2)}% na campanha "${nomeCampanha}" está abaixo do recomendado (${LIMITES.ctr_baixo.atencao.toFixed(2)}%). Revise criativos e segmentação.`,
    })
  }

  // 🔴 Frequência alta (Meta Ads)
  if (linha.canal === 'meta' && linha.frequencia > LIMITES.frequencia_alta.atencao) {
    const critico = linha.frequencia > LIMITES.frequencia_alta.critico
    alertas.push({
      ...base,
      tipo: 'frequencia_alta',
      severidade: critico ? 'critico' : 'atencao',
      valor: linha.frequencia,
      limite: LIMITES.frequencia_alta.atencao,
      mensagem: `Frequência de ${linha.frequencia.toFixed(1)} na campanha "${nomeCampanha}" indica saturação do público — considere ampliar segmentação ou trocar criativos.`,
    })
  }

  // 🔴 Campanha sem conversão (apesar de investimento relevante)
  if (linha.conversoes === 0 && linha.gasto >= LIMITES.gasto_minimo_sem_conversao) {
    alertas.push({
      ...base,
      tipo: 'sem_conversao',
      severidade: linha.gasto >= LIMITES.gasto_minimo_sem_conversao * 2 ? 'critico' : 'atencao',
      valor: linha.gasto,
      limite: LIMITES.gasto_minimo_sem_conversao,
      mensagem: `A campanha "${nomeCampanha}" gastou R$ ${linha.gasto.toFixed(2)} sem gerar conversões — avalie pausar ou revisar a estratégia.`,
    })
  }

  return alertas
}
