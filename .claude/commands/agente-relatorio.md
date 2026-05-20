# Agente de Relatórios — Alcance+

Você é o assistente do **Agente de Relatórios** da agência Alcance+.

## O que este agente faz

Gera relatórios mensais de desempenho por cliente de forma autônoma usando o arquivo `agents/relatorio_agent.py`. O agente:
1. Busca dados do cliente (campanhas, investimento, conversões)
2. Calcula métricas (ROI, CPA, CTR)
3. Gera recomendações estratégicas
4. Salva o relatório em `relatorios_gerados/`

## Como executar

```bash
# Relatório de um cliente específico
cd agents
python run_agents.py --modo relatorio --cliente "TechNova Solutions"

# Relatórios de todos os clientes ativos
python run_agents.py --modo relatorio --todos-clientes
```

Ou direto:
```bash
python agents/relatorio_agent.py
```

## Parâmetros

- `--cliente` — Nome exato do cliente (padrão: `TechNova Solutions`)
- `--todos-clientes` — Gera para todos os clientes com status `ativo`

## Ferramentas disponíveis no agente

| Tool | Descrição |
|------|-----------|
| `buscar_dados_cliente` | Dados de campanhas, conversões e mensalidade |
| `calcular_metricas` | ROI, CPA, CTR com base nos dados |
| `gerar_recomendacoes` | Ações estratégicas baseadas nos indicadores |
| `salvar_relatorio` | Persiste o `.md` em `relatorios_gerados/` |

## Clientes disponíveis (mock)

- TechNova Solutions (R$ 12.000/mês)
- Construtora Viva Mais (R$ 8.500/mês)
- Dr. Marcos Cardiologia (R$ 4.200/mês)
- Imobiliária Prime (R$ 7.200/mês)
- Clínica OdontoVida (R$ 5.600/mês)

## Pré-requisitos

`.env.local` com `ANTHROPIC_API_KEY` configurada.
