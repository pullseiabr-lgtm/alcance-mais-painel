"""
Agente Orquestrador — Alcance+
Coordena todos os sub-agentes de forma autônoma conforme planejamento.
Usa o padrão multi-agente: este agente decide quais sub-agentes chamar e quando.
"""

import json
import anthropic
from datetime import datetime
from config import ANTHROPIC_API_KEY, MODEL

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# ── Ferramentas: cada tool chama um sub-agente ─────────────────────────────────

tools = [
    {
        "name": "executar_agente_relatorios",
        "description": "Executa o agente de relatórios para um cliente específico.",
        "input_schema": {
            "type": "object",
            "properties": {
                "cliente_nome": {"type": "string"},
                "periodo": {"type": "string", "description": "Formato YYYY-MM"}
            },
            "required": ["cliente_nome"]
        }
    },
    {
        "name": "executar_agente_campanhas",
        "description": "Executa o agente de monitoramento de campanhas e retorna alertas.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "executar_agente_financeiro",
        "description": "Executa o agente financeiro e retorna análise e projeções.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "gerar_plano_acao",
        "description": "Consolida os resultados de todos os agentes e gera um plano de ação semanal priorizado.",
        "input_schema": {
            "type": "object",
            "properties": {
                "resultados_agentes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "agente": {"type": "string"},
                            "sumario": {"type": "string"},
                            "acoes_urgentes": {"type": "array", "items": {"type": "string"}}
                        }
                    }
                },
                "data_execucao": {"type": "string"}
            },
            "required": ["resultados_agentes", "data_execucao"]
        }
    },
    {
        "name": "salvar_plano_execucao",
        "description": "Salva o plano de ação gerado em arquivo Markdown.",
        "input_schema": {
            "type": "object",
            "properties": {
                "conteudo": {"type": "string"},
                "data": {"type": "string"}
            },
            "required": ["conteudo", "data"]
        }
    }
]

# ── Implementações das ferramentas ─────────────────────────────────────────────

def executar_agente_relatorios(cliente_nome: str, periodo: str | None = None) -> dict:
    from relatorio_agent import gerar_relatorio_cliente
    try:
        resultado = gerar_relatorio_cliente(cliente_nome, periodo)
        return {"status": "sucesso", "cliente": cliente_nome, "relatorio_gerado": True,
                "preview": resultado[:300] + "..." if len(resultado) > 300 else resultado}
    except Exception as e:
        return {"status": "erro", "cliente": cliente_nome, "erro": str(e)}

def executar_agente_campanhas() -> dict:
    from campanha_agent import monitorar_campanhas, alertas_gerados
    try:
        resultado = monitorar_campanhas()
        return {"status": "sucesso", "alertas": alertas_gerados,
                "sumario": resultado[:400] + "..." if len(resultado) > 400 else resultado}
    except Exception as e:
        return {"status": "erro", "erro": str(e)}

def executar_agente_financeiro() -> dict:
    from financeiro_agent import analisar_financeiro
    try:
        resultado = analisar_financeiro()
        return {"status": "sucesso",
                "sumario": resultado[:400] + "..." if len(resultado) > 400 else resultado}
    except Exception as e:
        return {"status": "erro", "erro": str(e)}

def gerar_plano_acao(resultados_agentes: list, data_execucao: str) -> str:
    linhas = [
        f"# 🗓️ Plano de Ação Semanal — Alcance+",
        f"**Gerado em:** {data_execucao}",
        f"**Agentes executados:** {len(resultados_agentes)}",
        "",
        "---",
        ""
    ]
    for i, r in enumerate(resultados_agentes, 1):
        linhas.append(f"## {i}. Agente: {r.get('agente', '—')}")
        linhas.append(f"{r.get('sumario', '')}")
        acoes = r.get('acoes_urgentes', [])
        if acoes:
            linhas.append("\n**Ações urgentes:**")
            linhas.extend(f"- {a}" for a in acoes)
        linhas.append("")

    linhas += [
        "---",
        "## ✅ Próximos Passos",
        "1. Revisar alertas de campanhas com a equipe de tráfego",
        "2. Enviar cobranças para clientes inadimplentes",
        "3. Preparar relatórios pendentes para envio",
        "4. Agendar reunião de pipeline com a equipe comercial",
        "",
        "*Plano gerado automaticamente pelos agentes Alcance+ 🤖*"
    ]
    return "\n".join(linhas)

def salvar_plano_execucao(conteudo: str, data: str) -> dict:
    import os
    pasta = os.path.join(os.path.dirname(__file__), '..', 'relatorios_gerados')
    os.makedirs(pasta, exist_ok=True)
    nome = f"plano_execucao_{data.replace('/', '-').replace(' ', '_')[:10]}.md"
    caminho = os.path.join(pasta, nome)
    with open(caminho, 'w', encoding='utf-8') as f:
        f.write(conteudo)
    print(f"\n📁 Plano salvo em: {caminho}")
    return {"status": "salvo", "arquivo": caminho}

def executar_ferramenta(nome: str, args: dict) -> str:
    fns = {
        "executar_agente_relatorios": lambda: executar_agente_relatorios(**args),
        "executar_agente_campanhas":  lambda: executar_agente_campanhas(),
        "executar_agente_financeiro": lambda: executar_agente_financeiro(),
        "gerar_plano_acao":           lambda: gerar_plano_acao(**args),
        "salvar_plano_execucao":      lambda: salvar_plano_execucao(**args),
    }
    fn = fns.get(nome)
    return json.dumps(fn() if fn else {"erro": f"'{nome}' não encontrada"}, ensure_ascii=False, default=str)

# ── Loop principal do orquestrador ────────────────────────────────────────────

def executar_planejamento_autonomo(clientes_relatorio: list | None = None) -> str:
    if not clientes_relatorio:
        clientes_relatorio = ['TechNova Solutions', 'Imobiliária Prime']

    agora = datetime.now().strftime('%d/%m/%Y %H:%M')
    print(f"\n{'='*60}")
    print(f"🤖 ORQUESTRADOR ALCANCE+ — {agora}")
    print(f"{'='*60}")

    messages = [{
        "role": "user",
        "content": (
            f"Execute o planejamento autônomo completo da agência Alcance+ para {agora}. "
            f"Siga este plano em ordem:\n"
            f"1. Execute o agente financeiro para analisar a saúde da agência\n"
            f"2. Execute o agente de campanhas para monitorar e gerar alertas\n"
            f"3. Execute o agente de relatórios para os clientes: {', '.join(clientes_relatorio)}\n"
            f"4. Consolide tudo em um plano de ação semanal priorizado\n"
            f"5. Salve o plano de execução\n\n"
            f"Seja autônomo — execute cada etapa sem esperar confirmação."
        )
    }]

    while True:
        response = client.messages.create(
            model=MODEL, max_tokens=8096, tools=tools, messages=messages
        )

        print(f"\n→ stop_reason: {response.stop_reason}")

        if response.stop_reason == "end_turn":
            for bloco in response.content:
                if hasattr(bloco, 'text'):
                    return bloco.text
            return "✅ Planejamento autônomo concluído."

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            resultados = []
            for bloco in response.content:
                if bloco.type == "tool_use":
                    print(f"\n🔧 Orquestrador → {bloco.name}")
                    resultado = executar_ferramenta(bloco.name, bloco.input)
                    resultados.append({
                        "type": "tool_result",
                        "tool_use_id": bloco.id,
                        "content": resultado
                    })
            messages.append({"role": "user", "content": resultados})
        else:
            break

    return "Erro no orquestrador."


if __name__ == "__main__":
    from rich.console import Console
    from rich.markdown import Markdown
    console = Console()
    resultado = executar_planejamento_autonomo()
    console.print(Markdown(resultado))
