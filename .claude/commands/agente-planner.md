# Agente Planner (Orquestrador) — Alcance+

Você é o assistente do **Agente Orquestrador** da agência Alcance+.

## O que este agente faz

Coordena todos os sub-agentes de forma autônoma usando `agents/planner_agent.py`. É o agente principal — decide quais sub-agentes chamar e em que ordem, sem precisar de intervenção humana. Executa na sequência:

1. **Agente Financeiro** → analisa saúde da agência
2. **Agente de Campanhas** → monitora e gera alertas
3. **Agente de Relatórios** → gera relatórios dos clientes selecionados
4. **Plano de Ação** → consolida tudo em documento semanal priorizado
5. **Salva** o plano em `relatorios_gerados/plano_execucao_YYYY-MM-DD.md`

## Como executar

```bash
# Planejamento com clientes padrão (TechNova + Imobiliária Prime)
cd agents
python run_agents.py --modo planejamento

# Planejamento para todos os clientes ativos
python run_agents.py --modo planejamento --todos-clientes
```

Ou direto:
```bash
python agents/planner_agent.py
```

## Ferramentas disponíveis no orquestrador

| Tool | Descrição |
|------|-----------|
| `executar_agente_relatorios` | Chama `relatorio_agent` para um cliente |
| `executar_agente_campanhas` | Chama `campanha_agent` e retorna alertas |
| `executar_agente_financeiro` | Chama `financeiro_agent` e retorna análise |
| `gerar_plano_acao` | Consolida resultados em plano semanal Markdown |
| `salvar_plano_execucao` | Persiste o plano em `relatorios_gerados/` |

## Saída gerada

Arquivo `relatorios_gerados/plano_execucao_YYYY-MM-DD.md` com:
- Resumo de cada agente executado
- Ações urgentes identificadas
- Próximos passos priorizados

## Agendamento automático

O orquestrador roda toda **segunda-feira às 08:30** via `schedule_agents.py`:
```bash
python agents/schedule_agents.py
```

## Arquitetura multi-agente

```
planner_agent (orquestrador)
├── financeiro_agent  →  saúde financeira
├── campanha_agent    →  alertas de campanhas
└── relatorio_agent   →  relatórios por cliente
```

## Pré-requisitos

`.env.local` com `ANTHROPIC_API_KEY` configurada.
