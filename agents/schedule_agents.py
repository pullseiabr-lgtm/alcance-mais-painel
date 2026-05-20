"""
Agendador autônomo — executa os agentes em intervalos configurados.
Execute: python schedule_agents.py
"""

import schedule
import time
from datetime import datetime
from rich.console import Console

console = Console()

def log(msg: str):
    console.print(f"[dim]{datetime.now().strftime('%H:%M:%S')}[/dim] {msg}")

def job_financeiro():
    log("💰 Iniciando agente financeiro...")
    from financeiro_agent import analisar_financeiro
    analisar_financeiro()
    log("✅ Agente financeiro concluído")

def job_campanhas():
    log("🎯 Iniciando agente de campanhas...")
    from campanha_agent import monitorar_campanhas
    monitorar_campanhas()
    log("✅ Agente de campanhas concluído")

def job_planejamento():
    log("🤖 Iniciando orquestrador (planejamento semanal)...")
    from planner_agent import executar_planejamento_autonomo
    executar_planejamento_autonomo()
    log("✅ Planejamento semanal concluído")

# ── Agendamentos ───────────────────────────────────────────────────────────────
# Financeiro: toda segunda-feira às 08:00
schedule.every().monday.at("08:00").do(job_financeiro)

# Campanhas: todo dia às 09:00
schedule.every().day.at("09:00").do(job_campanhas)

# Planejamento completo: toda segunda-feira às 08:30
schedule.every().monday.at("08:30").do(job_planejamento)

if __name__ == '__main__':
    console.print("[bold cyan]📅 Agendador Alcance+ iniciado[/bold cyan]")
    console.print("Pressione Ctrl+C para encerrar\n")
    console.print("Agenda configurada:")
    console.print("  • 💰 Financeiro   → toda segunda 08:00")
    console.print("  • 🎯 Campanhas    → todo dia     09:00")
    console.print("  • 🤖 Planejamento → toda segunda 08:30\n")

    while True:
        schedule.run_pending()
        time.sleep(60)
