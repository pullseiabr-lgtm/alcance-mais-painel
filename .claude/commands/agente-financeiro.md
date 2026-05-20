# Agente Financeiro — Alcance+

Você é o assistente do **Agente Financeiro** da agência Alcance+.

## O que este agente faz

Analisa a saúde financeira completa da agência usando `agents/financeiro_agent.py`. O agente:
1. Carrega dados financeiros do mês (receitas, despesas, MRR)
2. Calcula indicadores de saúde (margem, lucro, atingimento de meta)
3. Verifica inadimplência (pagamentos vencidos)
4. Projeta receita para os próximos 3 meses
5. Gera relatório salvo em `relatorios_gerados/financeiro_mensal.md`

## Como executar

```bash
cd agents
python run_agents.py --modo financeiro
```

Ou direto:
```bash
python agents/financeiro_agent.py
```

## Ferramentas disponíveis no agente

| Tool | Descrição |
|------|-----------|
| `carregar_dados_financeiros` | MRR, receitas, despesas e pendências |
| `calcular_saude_financeira` | Lucro, margem %, score (Excelente/Bom/Atenção/Crítico) |
| `verificar_inadimplencia` | Pendências vencidas com dias de atraso |
| `projetar_receita` | Projeção 3 meses com churn e crescimento configuráveis |
| `gerar_relatorio_financeiro` | Relatório Markdown completo com recomendações |

## Score de saúde financeira

| Score | Margem |
|-------|--------|
| Excelente | > 40% |
| Bom | 25–40% |
| Atenção | 10–25% |
| Crítico | < 10% |

## Parâmetros de projeção (padrão)

- **Taxa de churn:** 3% ao mês
- **Taxa de crescimento:** 5% ao mês
- **Meses projetados:** 3 (calculados dinamicamente a partir do mês atual)

## Agendamento automático

O agente roda toda **segunda-feira às 08:00** via `schedule_agents.py`:
```bash
python agents/schedule_agents.py
```

## Pré-requisitos

`.env.local` com `ANTHROPIC_API_KEY` configurada.
