"""
Agente de Relatórios — Alcance+
Gera relatórios mensais de desempenho por cliente de forma autônoma.
"""

import json
import anthropic
from datetime import datetime
from config import ANTHROPIC_API_KEY, MODEL, MOCK_CLIENTES, MOCK_CAMPANHAS, MOCK_FINANCEIRO

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# ── Ferramentas disponíveis para o agente ──────────────────────────────────────

tools = [
    {
        "name": "buscar_dados_cliente",
        "description": "Busca dados de desempenho de um cliente: campanhas ativas, investimento, conversões e receita.",
        "input_schema": {
            "type": "object",
            "properties": {
                "cliente_nome": {"type": "string", "description": "Nome do cliente"}
            },
            "required": ["cliente_nome"]
        }
    },
    {
        "name": "calcular_metricas",
        "description": "Calcula métricas de desempenho: ROI, CPA, CTR, crescimento MoM.",
        "input_schema": {
            "type": "object",
            "properties": {
                "investimento": {"type": "number"},
                "receita_gerada": {"type": "number"},
                "conversoes": {"type": "number"},
                "cliques": {"type": "number"},
                "impressoes": {"type": "number"}
            },
            "required": ["investimento", "receita_gerada", "conversoes"]
        }
    },
    {
        "name": "gerar_recomendacoes",
        "description": "Gera recomendações estratégicas com base nos dados analisados.",
        "input_schema": {
            "type": "object",
            "properties": {
                "roi": {"type": "number"},
                "cpa": {"type": "number"},
                "tendencia": {"type": "string", "enum": ["crescimento", "estavel", "queda"]},
                "canal_principal": {"type": "string"}
            },
            "required": ["roi", "cpa", "tendencia"]
        }
    },
    {
        "name": "salvar_relatorio",
        "description": "Salva o relatório gerado em arquivo.",
        "input_schema": {
            "type": "object",
            "properties": {
                "cliente_nome": {"type": "string"},
                "conteudo": {"type": "string"},
                "periodo": {"type": "string"}
            },
            "required": ["cliente_nome", "conteudo", "periodo"]
        }
    }
]

# ── Implementação das ferramentas ──────────────────────────────────────────────

def buscar_dados_cliente(cliente_nome: str) -> dict:
    cliente = next((c for c in MOCK_CLIENTES if c['nome'] == cliente_nome), None)
    if not cliente:
        return {"erro": f"Cliente '{cliente_nome}' não encontrado"}

    campanhas = [c for c in MOCK_CAMPANHAS if cliente_nome.split()[0] in c['nome']]
    return {
        "cliente": cliente,
        "campanhas": campanhas,
        "total_investido": sum(c['gasto'] for c in campanhas),
        "total_conversoes": sum(c['conversoes'] for c in campanhas),
        "receita_mensalidade": cliente['mensalidade']
    }

def calcular_metricas(investimento: float, receita_gerada: float,
                      conversoes: int, cliques: int = 0, impressoes: int = 0) -> dict:
    roi   = ((receita_gerada - investimento) / investimento * 100) if investimento > 0 else 0
    cpa   = (investimento / conversoes) if conversoes > 0 else 0
    ctr   = (cliques / impressoes * 100) if impressoes > 0 else 0
    return {
        "roi_pct":     round(roi, 1),
        "cpa_brl":     round(cpa, 2),
        "ctr_pct":     round(ctr, 2),
        "conversoes":  conversoes,
        "investimento": investimento
    }

def gerar_recomendacoes(roi: float, cpa: float,
                        tendencia: str, canal_principal: str = "") -> list[str]:
    recomendacoes = []
    if roi < 100:
        recomendacoes.append("⚠️ ROI abaixo de 100% — revisar segmentação e criativos")
    elif roi > 300:
        recomendacoes.append("🚀 ROI excelente — considerar escalar o investimento")
    else:
        recomendacoes.append("✅ ROI saudável — manter estratégia atual")

    if tendencia == "queda":
        recomendacoes.append("📉 Tendência de queda — realizar teste A/B urgente")
    elif tendencia == "crescimento":
        recomendacoes.append("📈 Crescimento consistente — explorar novos canais")

    if cpa > 200:
        recomendacoes.append(f"💰 CPA alto (R${cpa:.0f}) — otimizar funil de conversão")

    if canal_principal == "Google Ads":
        recomendacoes.append("🔍 Verificar Score de Qualidade das palavras-chave")
    elif canal_principal == "Meta Ads":
        recomendacoes.append("🎯 Testar novos públicos lookalike baseados em conversores")

    return recomendacoes

def salvar_relatorio(cliente_nome: str, conteudo: str, periodo: str) -> dict:
    import os
    pasta = os.path.join(os.path.dirname(__file__), '..', 'relatorios_gerados')
    os.makedirs(pasta, exist_ok=True)
    nome_arquivo = f"{cliente_nome.replace(' ', '_')}_{periodo}.md"
    caminho = os.path.join(pasta, nome_arquivo)
    with open(caminho, 'w', encoding='utf-8') as f:
        f.write(conteudo)
    return {"status": "salvo", "arquivo": caminho}

def executar_ferramenta(nome: str, args: dict) -> str:
    if nome == "buscar_dados_cliente":
        return json.dumps(buscar_dados_cliente(**args), ensure_ascii=False)
    elif nome == "calcular_metricas":
        return json.dumps(calcular_metricas(**args), ensure_ascii=False)
    elif nome == "gerar_recomendacoes":
        return json.dumps(gerar_recomendacoes(**args), ensure_ascii=False)
    elif nome == "salvar_relatorio":
        return json.dumps(salvar_relatorio(**args), ensure_ascii=False)
    return json.dumps({"erro": f"Ferramenta '{nome}' não encontrada"})

# ── Loop agentico ──────────────────────────────────────────────────────────────

def gerar_relatorio_cliente(cliente_nome: str, periodo: str | None = None) -> str:
    if not periodo:
        periodo = datetime.now().strftime('%Y-%m')

    print(f"\n🤖 Agente de Relatórios iniciado para: {cliente_nome} ({periodo})")

    messages = [
        {
            "role": "user",
            "content": (
                f"Gere um relatório completo de desempenho para o cliente '{cliente_nome}' "
                f"referente ao período {periodo}. "
                "Use as ferramentas disponíveis para: buscar os dados, calcular métricas, "
                "gerar recomendações e salvar o relatório. "
                "O relatório deve ser profissional, em português, com emojis e formatação Markdown."
            )
        }
    ]

    # Loop agentico com tool_use
    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            tools=tools,
            messages=messages,
        )

        print(f"   → stop_reason: {response.stop_reason}")

        if response.stop_reason == "end_turn":
            # Extrai texto final
            for bloco in response.content:
                if hasattr(bloco, 'text'):
                    return bloco.text
            return "Relatório gerado com sucesso."

        if response.stop_reason == "tool_use":
            # Adiciona resposta do assistente
            messages.append({"role": "assistant", "content": response.content})

            # Executa cada ferramenta solicitada
            resultados = []
            for bloco in response.content:
                if bloco.type == "tool_use":
                    print(f"   🔧 Executando: {bloco.name}({list(bloco.input.keys())})")
                    resultado = executar_ferramenta(bloco.name, bloco.input)
                    resultados.append({
                        "type": "tool_result",
                        "tool_use_id": bloco.id,
                        "content": resultado
                    })

            messages.append({"role": "user", "content": resultados})
        else:
            break

    return "Erro: loop agentico encerrado inesperadamente."


if __name__ == "__main__":
    from rich.console import Console
    from rich.markdown import Markdown

    console = Console()
    for cliente in ['TechNova Solutions', 'Imobiliária Prime']:
        relatorio = gerar_relatorio_cliente(cliente)
        console.print(Markdown(relatorio))
        console.rule()
