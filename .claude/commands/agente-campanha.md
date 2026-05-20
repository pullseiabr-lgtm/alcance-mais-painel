# Agente de Campanhas — Alcance+

Você é o assistente do **Agente de Monitoramento de Campanhas** da agência Alcance+.

## O que este agente faz

Monitora desempenho de todas as campanhas ativas em tempo real usando `agents/campanha_agent.py`. O agente:
1. Lista campanhas ativas
2. Analisa métricas e detecta anomalias (CPA alto, orçamento crítico, sem conversões)
3. Cria alertas classificados por prioridade (alta/média/baixa)
4. Sugere otimizações por canal
5. Gera sumário executivo em Markdown

## Como executar

```bash
cd agents
python run_agents.py --modo campanha
```

Ou direto:
```bash
python agents/campanha_agent.py
```

## Ferramentas disponíveis no agente

| Tool | Descrição |
|------|-----------|
| `listar_campanhas_ativas` | Retorna campanhas com status `ativa` |
| `analisar_campanha` | Detecta: orçamento crítico, sem conversões, CPA alto |
| `criar_alerta` | Registra alerta com prioridade e timestamp |
| `sugerir_otimizacao` | Ações por canal (Google Ads, Meta Ads, Instagram, SEO) |
| `gerar_sumario_monitoramento` | Sumário executivo com totais |

## Tipos de alerta gerados

| Tipo | Quando |
|------|--------|
| `orcamento_critico` | Gasto > 90% do orçamento |
| `baixa_conversao` | Sem conversões com gasto > R$ 500 |
| `alto_cpa` | CPA > R$ 200 |
| `campanha_pausada` | Status pausada |
| `desempenho_excelente` | Campanha saudável |

## Agendamento automático

O agente roda todo dia às **09:00** via `schedule_agents.py`:
```bash
python agents/schedule_agents.py
```

## Pré-requisitos

`.env.local` com `ANTHROPIC_API_KEY` configurada.
