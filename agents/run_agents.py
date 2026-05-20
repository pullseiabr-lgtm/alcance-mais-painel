"""
Runner dos Agentes Alcance+
Execute: python run_agents.py [--modo atendimento|planejamento|relatorio|campanha|financeiro]
"""

import argparse
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich import print as rprint

console = Console()

def banner():
    console.print(Panel.fit(
        "[bold cyan]Alcance+[/bold cyan] [white]— Sistema de Agentes Autônomos[/white]\n"
        "[dim]Powered by Claude claude-sonnet-4-6[/dim]",
        border_style="cyan"
    ))

def modo_planejamento(clientes: list | None = None):
    from planner_agent import executar_planejamento_autonomo
    resultado = executar_planejamento_autonomo(clientes)
    console.print(Markdown(resultado))

def modo_relatorio(cliente: str):
    from relatorio_agent import gerar_relatorio_cliente
    resultado = gerar_relatorio_cliente(cliente)
    console.print(Markdown(resultado))

def modo_campanha():
    from campanha_agent import monitorar_campanhas
    resultado = monitorar_campanhas()
    console.print(Markdown(resultado))

def modo_financeiro():
    from financeiro_agent import analisar_financeiro
    resultado = analisar_financeiro()
    console.print(Markdown(resultado))

def modo_atendimento(solicitacao: str | None = None):
    from atendimento_agent import atender, modo_interativo
    if solicitacao:
        resultado = atender(solicitacao)
        console.print(Markdown(resultado))
    else:
        modo_interativo()


def main():
    parser = argparse.ArgumentParser(description='Agentes Autônomos Alcance+')
    parser.add_argument('--modo', choices=['planejamento', 'relatorio', 'campanha', 'financeiro', 'atendimento'],
                        default='atendimento', help='Modo de execução')
    parser.add_argument('--cliente', type=str, default='TechNova Solutions',
                        help='Nome do cliente (para modo relatorio)')
    parser.add_argument('--todos-clientes', action='store_true',
                        help='Gera relatórios para todos os clientes')
    parser.add_argument('--solicitacao', type=str, default=None,
                        help='Solicitação direta para o agente de atendimento (opcional)')
    args = parser.parse_args()

    # Verifica API key
    from config import ANTHROPIC_API_KEY
    if not ANTHROPIC_API_KEY:
        console.print("[red]❌ ANTHROPIC_API_KEY não configurada no .env.local[/red]")
        console.print("Adicione: [cyan]ANTHROPIC_API_KEY=sua_chave[/cyan] no arquivo .env.local")
        sys.exit(1)

    banner()

    if args.modo == 'planejamento':
        clientes = None
        if args.todos_clientes:
            from config import MOCK_CLIENTES
            clientes = [c['nome'] for c in MOCK_CLIENTES if c['status'] == 'ativo']
        modo_planejamento(clientes)

    elif args.modo == 'relatorio':
        if args.todos_clientes:
            from config import MOCK_CLIENTES
            for c in MOCK_CLIENTES:
                if c['status'] == 'ativo':
                    console.rule(f"[cyan]{c['nome']}[/cyan]")
                    modo_relatorio(c['nome'])
        else:
            modo_relatorio(args.cliente)

    elif args.modo == 'campanha':
        modo_campanha()

    elif args.modo == 'financeiro':
        modo_financeiro()

    elif args.modo == 'atendimento':
        modo_atendimento(args.solicitacao)


if __name__ == '__main__':
    main()
