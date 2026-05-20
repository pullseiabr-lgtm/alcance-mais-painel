"""
Agente de Monitoramento de Campanhas — Alcance+
Monitora desempenho em tempo real e gera alertas automáticos.
"""

import json
import anthropic
from config import ANTHROPIC_API_KEY, MODEL, MOCK_CAMPANHAS

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

tools = [
    {
        "name": "listar_campanhas_ativas",
        "description": "Lista todas as campanhas ativas com métricas atuais.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "analisar_campanha",
        "description": "Analisa uma campanha específica e detecta anomalias.",
        "input_schema": {
            "type": "object",
            "properties": {
                "nome": {"type": "string"},
                "orcamento": {"type": "number"},
                "gasto": {"type": "number"},
                "conversoes": {"type": "number"},
                "status": {"type": "string"}
            },
            "required": ["nome", "orcamento", "gasto", "conversoes"]
        }
    },
    {
        "name": "criar_alerta",
        "description": "Cria um alerta para a equipe sobre uma campanha problemática.",
        "input_schema": {
            "type": "object",
            "properties": {
                "campanha": {"type": "string"},
                "tipo_alerta": {
                    "type": "string",
                    "enum": ["orcamento_critico", "baixa_conversao", "alto_cpa", "campanha_pausada", "desempenho_excelente"]
                },
                "mensagem": {"type": "string"},
                "prioridade": {"type": "string", "enum": ["alta", "media", "baixa"]}
            },
            "required": ["campanha", "tipo_alerta", "mensagem", "prioridade"]
        }
    },
    {
        "name": "sugerir_otimizacao",
        "description": "Sugere ações de otimização para uma campanha com base nos dados.",
        "input_schema": {
            "type": "object",
            "properties": {
                "campanha": {"type": "string"},
                "canal": {"type": "string"},
                "problema": {"type": "string"}
            },
            "required": ["campanha", "canal", "problema"]
        }
    },
    {
        "name": "gerar_sumario_monitoramento",
        "description": "Gera um sumário executivo do monitoramento de todas as campanhas.",
        "input_schema": {
            "type": "object",
            "properties": {
                "alertas": {"type": "array", "items": {"type": "object"}},
                "campanhas_ok": {"type": "integer"},
                "campanhas_atencao": {"type": "integer"}
            },
            "required": ["alertas", "campanhas_ok", "campanhas_atencao"]
        }
    }
]

alertas_gerados: list[dict] = []

def listar_campanhas_ativas() -> list[dict]:
    return [c for c in MOCK_CAMPANHAS if c['status'] == 'ativa']

def analisar_campanha(nome: str, orcamento: float, gasto: float,
                      conversoes: int, status: str = "ativa") -> dict:
    pct_gasto = (gasto / orcamento * 100) if orcamento > 0 else 0
    cpa = (gasto / conversoes) if conversoes > 0 else float('inf')

    problemas = []
    if pct_gasto > 90:
        problemas.append("orçamento_quase_esgotado")
    if conversoes == 0 and gasto > 500:
        problemas.append("sem_conversoes")
    if cpa > 200:
        problemas.append("cpa_alto")
    if status == "pausada":
        problemas.append("campanha_pausada")

    return {
        "nome": nome,
        "pct_orcamento_gasto": round(pct_gasto, 1),
        "cpa": round(cpa, 2) if cpa != float('inf') else None,
        "problemas": problemas,
        "saudavel": len(problemas) == 0
    }

def criar_alerta(campanha: str, tipo_alerta: str, mensagem: str, prioridade: str) -> dict:
    alerta = {
        "campanha": campanha,
        "tipo": tipo_alerta,
        "mensagem": mensagem,
        "prioridade": prioridade,
        "timestamp": __import__('datetime').datetime.now().isoformat()
    }
    alertas_gerados.append(alerta)
    emoji = {"alta": "🔴", "media": "🟡", "baixa": "🟢"}.get(prioridade, "⚪")
    print(f"   {emoji} ALERTA [{prioridade.upper()}]: {campanha} — {mensagem}")
    return {"status": "alerta_criado", "alerta": alerta}

def sugerir_otimizacao(campanha: str, canal: str, problema: str) -> dict:
    sugestoes = {
        "orçamento_quase_esgotado": [
            "Solicitar aprovação de aumento de orçamento ao cliente",
            "Pausar palavras-chave de menor desempenho",
            "Focar em conversões de menor custo"
        ],
        "sem_conversoes": [
            "Revisar página de destino (landing page)",
            "Testar novos anúncios com CTAs diferentes",
            "Revisar segmentação de público"
        ],
        "cpa_alto": [
            "Otimizar funil de conversão",
            "Excluir públicos de baixo desempenho",
            "Testar novos formatos de anúncio"
        ],
        "campanha_pausada": [
            "Verificar motivo da pausa com o cliente",
            "Revisar conformidade dos anúncios",
            "Atualizar criativos se necessário"
        ]
    }

    canal_dicas = {
        "Google Ads": "Verificar Quality Score e Ad Rank",
        "Meta Ads": "Testar públicos lookalike 1-3%",
        "Instagram": "Usar Reels para maior alcance orgânico"
    }

    return {
        "campanha": campanha,
        "acoes": sugestoes.get(problema, ["Analisar dados historicos e ajustar estratégia"]),
        "dica_canal": canal_dicas.get(canal, ""),
    }

def gerar_sumario_monitoramento(alertas: list, campanhas_ok: int, campanhas_atencao: int) -> str:
    total = campanhas_ok + campanhas_atencao
    from datetime import datetime
    return (
        f"# 📊 Sumário de Monitoramento — {datetime.now().strftime('%d/%m/%Y %H:%M')}\n\n"
        f"**Total de campanhas:** {total}\n"
        f"✅ Saudáveis: {campanhas_ok} | ⚠️ Atenção: {campanhas_atencao}\n\n"
        f"**Alertas gerados:** {len(alertas)}\n"
    )

def executar_ferramenta(nome: str, args: dict) -> str:
    fns = {
        "listar_campanhas_ativas":     lambda: listar_campanhas_ativas(),
        "analisar_campanha":           lambda: analisar_campanha(**args),
        "criar_alerta":                lambda: criar_alerta(**args),
        "sugerir_otimizacao":          lambda: sugerir_otimizacao(**args),
        "gerar_sumario_monitoramento": lambda: gerar_sumario_monitoramento(**args),
    }
    fn = fns.get(nome)
    return json.dumps(fn() if fn else {"erro": f"'{nome}' não encontrada"}, ensure_ascii=False)

def monitorar_campanhas() -> str:
    print("\n🤖 Agente de Campanhas iniciado...")
    messages = [{
        "role": "user",
        "content": (
            "Monitore todas as campanhas ativas da agência Alcance+. "
            "Para cada campanha: analise os dados, crie alertas se necessário e sugira otimizações. "
            "Ao final gere um sumário executivo completo em Markdown."
        )
    }]

    while True:
        response = client.messages.create(
            model=MODEL, max_tokens=4096, tools=tools, messages=messages
        )

        if response.stop_reason == "end_turn":
            for bloco in response.content:
                if hasattr(bloco, 'text'):
                    return bloco.text
            return "Monitoramento concluído."

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            resultados = []
            for bloco in response.content:
                if bloco.type == "tool_use":
                    print(f"   🔧 {bloco.name}")
                    resultados.append({
                        "type": "tool_result",
                        "tool_use_id": bloco.id,
                        "content": executar_ferramenta(bloco.name, bloco.input)
                    })
            messages.append({"role": "user", "content": resultados})
        else:
            break

    return "Erro no loop agentico."


if __name__ == "__main__":
    from rich.console import Console
    from rich.markdown import Markdown
    console = Console()
    resultado = monitorar_campanhas()
    console.print(Markdown(resultado))
