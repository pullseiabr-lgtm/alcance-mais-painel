"""
Agente de Atendimento e Direcionamento — Alcance+
Recebe solicitações em linguagem natural e roteia para o agente correto.
"""

import json
import anthropic
from config import ANTHROPIC_API_KEY, MODEL, MOCK_CLIENTES

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# ── Ferramentas de roteamento ──────────────────────────────────────────────────

tools = [
    {
        "name": "listar_clientes",
        "description": "Lista os clientes ativos da agência com seus dados básicos.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "executar_relatorio_cliente",
        "description": (
            "Aciona o agente de relatórios para gerar o relatório de desempenho de um cliente. "
            "Use quando o usuário pedir relatório, desempenho, resultados ou análise de um cliente."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "cliente_nome": {
                    "type": "string",
                    "description": "Nome exato do cliente conforme cadastro"
                },
                "periodo": {
                    "type": "string",
                    "description": "Período no formato YYYY-MM (opcional, padrão: mês atual)"
                }
            },
            "required": ["cliente_nome"]
        }
    },
    {
        "name": "executar_monitoramento_campanhas",
        "description": (
            "Aciona o agente de campanhas para monitorar todas as campanhas ativas e gerar alertas. "
            "Use quando o usuário perguntar sobre campanhas, anúncios, alertas ou desempenho de mídia."
        ),
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "executar_analise_financeira",
        "description": (
            "Aciona o agente financeiro para analisar a saúde financeira da agência. "
            "Use quando o usuário perguntar sobre financeiro, receita, despesas, inadimplência ou projeções."
        ),
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "executar_planejamento_completo",
        "description": (
            "Aciona o orquestrador para rodar todos os agentes e gerar o plano de ação semanal. "
            "Use quando o usuário pedir planejamento completo, reunião semanal ou visão geral da agência."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "clientes_relatorio": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Lista de clientes para gerar relatório (opcional)"
                }
            },
            "required": []
        }
    },
    {
        "name": "responder_duvida",
        "description": (
            "Responde dúvidas gerais sobre a agência, clientes ou funcionamento do sistema "
            "sem acionar nenhum agente operacional. Use para perguntas informativas."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "resposta": {
                    "type": "string",
                    "description": "Resposta clara e objetiva para o usuário"
                }
            },
            "required": ["resposta"]
        }
    }
]

# ── Implementações ─────────────────────────────────────────────────────────────

def listar_clientes() -> dict:
    ativos    = [c for c in MOCK_CLIENTES if c['status'] == 'ativo']
    inativos  = [c for c in MOCK_CLIENTES if c['status'] != 'ativo']
    mrr_total = sum(c['mensalidade'] for c in ativos)
    return {
        "clientes_ativos": ativos,
        "clientes_inativos": inativos,
        "total_clientes": len(MOCK_CLIENTES),
        "mrr_total": mrr_total
    }

def executar_relatorio_cliente(cliente_nome: str, periodo: str | None = None) -> dict:
    from relatorio_agent import gerar_relatorio_cliente
    print(f"\n   📊 Acionando Agente de Relatórios → {cliente_nome}")
    try:
        resultado = gerar_relatorio_cliente(cliente_nome, periodo)
        return {"status": "sucesso", "agente": "relatorio", "cliente": cliente_nome, "resultado": resultado}
    except Exception as e:
        return {"status": "erro", "agente": "relatorio", "erro": str(e)}

def executar_monitoramento_campanhas() -> dict:
    from campanha_agent import monitorar_campanhas, alertas_gerados
    print("\n   🎯 Acionando Agente de Campanhas...")
    try:
        resultado = monitorar_campanhas()
        return {"status": "sucesso", "agente": "campanhas", "alertas": len(alertas_gerados), "resultado": resultado}
    except Exception as e:
        return {"status": "erro", "agente": "campanhas", "erro": str(e)}

def executar_analise_financeira() -> dict:
    from financeiro_agent import analisar_financeiro
    print("\n   💰 Acionando Agente Financeiro...")
    try:
        resultado = analisar_financeiro()
        return {"status": "sucesso", "agente": "financeiro", "resultado": resultado}
    except Exception as e:
        return {"status": "erro", "agente": "financeiro", "erro": str(e)}

def executar_planejamento_completo(clientes_relatorio: list | None = None) -> dict:
    from planner_agent import executar_planejamento_autonomo
    print("\n   🤖 Acionando Orquestrador completo...")
    try:
        resultado = executar_planejamento_autonomo(clientes_relatorio)
        return {"status": "sucesso", "agente": "planner", "resultado": resultado}
    except Exception as e:
        return {"status": "erro", "agente": "planner", "erro": str(e)}

def responder_duvida(resposta: str) -> dict:
    return {"status": "resposta_direta", "conteudo": resposta}

def executar_ferramenta(nome: str, args: dict) -> str:
    fns = {
        "listar_clientes":               lambda: listar_clientes(),
        "executar_relatorio_cliente":    lambda: executar_relatorio_cliente(**args),
        "executar_monitoramento_campanhas": lambda: executar_monitoramento_campanhas(),
        "executar_analise_financeira":   lambda: executar_analise_financeira(),
        "executar_planejamento_completo": lambda: executar_planejamento_completo(**args),
        "responder_duvida":              lambda: responder_duvida(**args),
    }
    fn = fns.get(nome)
    resultado = fn() if fn else {"erro": f"Ferramenta '{nome}' não encontrada"}
    return json.dumps(resultado, ensure_ascii=False, default=str)

# ── Prompt do sistema ──────────────────────────────────────────────────────────

SYSTEM_PROMPT = """Você é o Assistente de Atendimento da Alcance+, agência de marketing digital.

Seu papel é entender a solicitação do usuário e direcionar para o agente correto:

• **Relatório de cliente** → `executar_relatorio_cliente`
  Exemplos: "relatório da TechNova", "como está a Imobiliária Prime", "desempenho do cliente X"

• **Campanhas e anúncios** → `executar_monitoramento_campanhas`
  Exemplos: "como estão as campanhas", "tem algum alerta", "ver anúncios ativos"

• **Financeiro da agência** → `executar_analise_financeira`
  Exemplos: "como está o financeiro", "receita do mês", "tem inadimplência", "projeção de receita"

• **Planejamento completo** → `executar_planejamento_completo`
  Exemplos: "rodar tudo", "planejamento semanal", "visão geral", "reunião de segunda"

• **Dúvidas sobre clientes** → `listar_clientes` ou `responder_duvida`
  Exemplos: "quais são os clientes", "quantos clientes temos", "quem é ativo"

Sempre responda em português. Seja direto, profissional e objetivo.
Quando acionar um agente, informe o usuário que está processando.
Ao receber o resultado do agente, apresente de forma clara e resumida."""

# ── Loop de atendimento ────────────────────────────────────────────────────────

def atender(solicitacao: str) -> str:
    """Processa uma solicitação e retorna a resposta final."""
    messages = [{"role": "user", "content": solicitacao}]

    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=6000,
            system=SYSTEM_PROMPT,
            tools=tools,
            messages=messages
        )

        if response.stop_reason == "end_turn":
            for bloco in response.content:
                if hasattr(bloco, 'text'):
                    return bloco.text
            return "Atendimento concluído."

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            resultados = []
            for bloco in response.content:
                if bloco.type == "tool_use":
                    print(f"\n🔀 Direcionando → {bloco.name}")
                    resultado = executar_ferramenta(bloco.name, bloco.input)
                    resultados.append({
                        "type": "tool_result",
                        "tool_use_id": bloco.id,
                        "content": resultado
                    })
            messages.append({"role": "user", "content": resultados})
        else:
            break

    return "Não foi possível processar a solicitação."


def modo_interativo():
    """Inicia o loop de atendimento interativo no terminal."""
    from rich.console import Console
    from rich.markdown import Markdown
    from rich.panel import Panel

    console = Console()
    console.print(Panel.fit(
        "[bold cyan]Alcance+[/bold cyan] [white]— Assistente de Atendimento[/white]\n"
        "[dim]Digite sua solicitação ou 'sair' para encerrar[/dim]",
        border_style="cyan"
    ))

    while True:
        try:
            solicitacao = console.input("\n[bold cyan]>[/bold cyan] ").strip()
            if not solicitacao:
                continue
            if solicitacao.lower() in ('sair', 'exit', 'quit'):
                console.print("[dim]Encerrando atendimento.[/dim]")
                break

            console.print("[dim]Processando...[/dim]")
            resposta = atender(solicitacao)
            console.print(Markdown(resposta))

        except KeyboardInterrupt:
            console.print("\n[dim]Atendimento encerrado.[/dim]")
            break


if __name__ == "__main__":
    modo_interativo()
