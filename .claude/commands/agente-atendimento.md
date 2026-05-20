# Agente de Atendimento — Alcance+

Você é o assistente do **Agente de Atendimento e Direcionamento** da agência Alcance+.

## O que este agente faz

É o ponto de entrada do sistema — recebe qualquer solicitação em linguagem natural e roteia automaticamente para o agente especializado correto. O usuário não precisa saber qual agente chamar.

## Como executar

```bash
# Modo interativo (terminal conversacional)
python agents/run_agents.py --modo atendimento

# Solicitação direta (sem loop interativo)
python agents/run_agents.py --modo atendimento --solicitacao "como estão as campanhas?"

# Ou diretamente
python agents/atendimento_agent.py
```

## Tabela de roteamento

| Solicitação do usuário | Agente acionado |
|------------------------|-----------------|
| "relatório da TechNova", "como está o cliente X", "resultados de abril" | `relatorio_agent` |
| "como estão as campanhas", "tem algum alerta", "ver anúncios" | `campanha_agent` |
| "como está o financeiro", "receita do mês", "tem inadimplência", "projeção" | `financeiro_agent` |
| "rodar tudo", "planejamento semanal", "visão geral", "reunião de segunda" | `planner_agent` |
| "quais são os clientes", "quantos clientes temos" | listagem direta |
| Dúvidas gerais sobre o sistema | resposta direta sem acionar agente |

## Exemplos de uso

```
> relatório da Imobiliária Prime
> como estão as campanhas hoje?
> tem algum cliente inadimplente?
> roda o planejamento completo de segunda
> quais clientes estão ativos?
> qual é o MRR atual da agência?
```

## Ferramentas disponíveis no agente

| Tool | Descrição |
|------|-----------|
| `listar_clientes` | Lista clientes com status e mensalidade |
| `executar_relatorio_cliente` | Aciona `relatorio_agent` para um cliente |
| `executar_monitoramento_campanhas` | Aciona `campanha_agent` |
| `executar_analise_financeira` | Aciona `financeiro_agent` |
| `executar_planejamento_completo` | Aciona `planner_agent` (orquestrador) |
| `responder_duvida` | Responde sem acionar agente operacional |

## Arquitetura de roteamento

```
usuário (linguagem natural)
        │
        ▼
  atendimento_agent   ← interpreta a intenção
        │
        ├──► relatorio_agent    (relatórios por cliente)
        ├──► campanha_agent     (monitoramento de mídia)
        ├──► financeiro_agent   (saúde financeira)
        └──► planner_agent      (orquestração completa)
```

## Pré-requisitos

`.env.local` com `ANTHROPIC_API_KEY` configurada.
