"""
Agente Financeiro — Alcance+
Monitora saúde financeira, detecta inadimplência e projeta receita.
"""

import json
import anthropic
from config import ANTHROPIC_API_KEY, MODEL, MOCK_CLIENTES, MOCK_FINANCEIRO

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

tools = [
    {
        "name": "carregar_dados_financeiros",
        "description": "Carrega todos os dados financeiros do mês atual.",
        "input_schema": {"type": "object", "properties": {}, "required": []}
    },
    {
        "name": "calcular_saude_financeira",
        "description": "Calcula indicadores de saúde financeira da agência.",
        "input_schema": {
            "type": "object",
            "properties": {
                "receitas": {"type": "number"},
                "despesas": {"type": "number"},
                "meta_receita": {"type": "number"}
            },
            "required": ["receitas", "despesas"]
        }
    },
    {
        "name": "verificar_inadimplencia",
        "description": "Verifica pagamentos pendentes e gera lista de inadimplentes.",
        "input_schema": {
            "type": "object",
            "properties": {
                "pendentes": {
                    "type": "array",
                    "items": {"type": "object"}
                }
            },
            "required": ["pendentes"]
        }
    },
    {
        "name": "projetar_receita",
        "description": "Projeta receita dos próximos 3 meses com base no MRR atual.",
        "input_schema": {
            "type": "object",
            "properties": {
                "mrr_atual": {"type": "number"},
                "taxa_churn_pct": {"type": "number"},
                "taxa_crescimento_pct": {"type": "number"}
            },
            "required": ["mrr_atual"]
        }
    },
    {
        "name": "gerar_relatorio_financeiro",
        "description": "Gera relatório financeiro completo em Markdown.",
        "input_schema": {
            "type": "object",
            "properties": {
                "indicadores": {"type": "object"},
                "inadimplentes": {"type": "array", "items": {"type": "object"}},
                "projecao": {"type": "object"},
                "recomendacoes": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["indicadores", "inadimplentes", "projecao", "recomendacoes"]
        }
    }
]


def carregar_dados_financeiros() -> dict:
    mrr = sum(c['mensalidade'] for c in MOCK_CLIENTES if c['status'] == 'ativo')
    return {**MOCK_FINANCEIRO, "mrr": mrr, "clientes_ativos": len([c for c in MOCK_CLIENTES if c['status'] == 'ativo'])}


def calcular_saude_financeira(receitas: float, despesas: float, meta_receita: float = 100000) -> dict:
    lucro   = receitas - despesas
    margem  = (lucro / receitas * 100) if receitas > 0 else 0
    atingimento_meta = (receitas / meta_receita * 100) if meta_receita > 0 else 0

    score = "Excelente" if margem > 40 else "Bom" if margem > 25 else "Atenção" if margem > 10 else "Crítico"
    return {
        "receitas": receitas,
        "despesas": despesas,
        "lucro_liquido": round(lucro, 2),
        "margem_pct": round(margem, 1),
        "atingimento_meta_pct": round(atingimento_meta, 1),
        "score_saude": score
    }


def verificar_inadimplencia(pendentes: list) -> dict:
    from datetime import datetime
    hoje = datetime.now().date()
    inadimplentes = []
    for p in pendentes:
        venc = datetime.strptime(p.get('vencimento', '2099-01-01'), '%Y-%m-%d').date()
        dias_atraso = (hoje - venc).days
        if dias_atraso > 0:
            inadimplentes.append({**p, "dias_atraso": dias_atraso, "urgente": dias_atraso > 10})

    return {
        "total_pendente": sum(p['valor'] for p in pendentes),
        "total_inadimplente": sum(p['valor'] for p in inadimplentes),
        "inadimplentes": inadimplentes,
        "a_vencer": [p for p in pendentes if p not in inadimplentes]
    }


def projetar_receita(mrr_atual: float, taxa_churn_pct: float = 3.0, taxa_crescimento_pct: float = 5.0) -> dict:
    projecoes = []
    val = mrr_atual
    mes_atual = datetime.now().month
    nomes_pt = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
    meses = [nomes_pt[(mes_atual - 1 + i) % 12] for i in range(1, 4)]
    for mes in meses:
        val = val * (1 - taxa_churn_pct / 100) * (1 + taxa_crescimento_pct / 100)
        projecoes.append({"mes": mes, "receita_projetada": round(val, 2)})
    return {
        "mrr_atual": mrr_atual,
        "projecoes": projecoes,
        "receita_anual_estimada": round(mrr_atual * 12 * (1 + taxa_crescimento_pct / 100), 2)
    }


def gerar_relatorio_financeiro(indicadores: dict, inadimplentes: list,
                                projecao: dict, recomendacoes: list) -> str:
    from datetime import datetime
    linhas = [
        f"# 💰 Relatório Financeiro — Alcance+",
        f"**Período:** {datetime.now().strftime('%B %Y')} | **Score:** {indicadores.get('score_saude', '—')}",
        "",
        "## 📊 Indicadores",
        f"- **Receitas:** R$ {indicadores.get('receitas', 0):,.0f}",
        f"- **Despesas:** R$ {indicadores.get('despesas', 0):,.0f}",
        f"- **Lucro Líquido:** R$ {indicadores.get('lucro_liquido', 0):,.0f}",
        f"- **Margem:** {indicadores.get('margem_pct', 0):.1f}%",
        f"- **Atingimento da meta:** {indicadores.get('atingimento_meta_pct', 0):.1f}%",
        "",
    ]

    if inadimplentes:
        linhas += ["## ⚠️ Inadimplência"]
        for i in inadimplentes:
            linhas.append(f"- **{i['descricao']}** — R$ {i['valor']:,.0f} ({i.get('dias_atraso', 0)} dias atraso)")
        linhas.append("")

    if projecao.get('projecoes'):
        linhas += ["## 📈 Projeção 3 meses"]
        for p in projecao['projecoes']:
            linhas.append(f"- **{p['mes']}:** R$ {p['receita_projetada']:,.0f}")
        linhas.append("")

    if recomendacoes:
        linhas += ["## 💡 Recomendações", *[f"- {r}" for r in recomendacoes]]

    relatorio = "\n".join(linhas)

    # Salva
    import os
    pasta = os.path.join(os.path.dirname(__file__), '..', 'relatorios_gerados')
    os.makedirs(pasta, exist_ok=True)
    with open(os.path.join(pasta, 'financeiro_mensal.md'), 'w', encoding='utf-8') as f:
        f.write(relatorio)

    return relatorio


def executar_ferramenta(nome: str, args: dict) -> str:
    fns = {
        "carregar_dados_financeiros":  lambda: carregar_dados_financeiros(),
        "calcular_saude_financeira":   lambda: calcular_saude_financeira(**args),
        "verificar_inadimplencia":     lambda: verificar_inadimplencia(**args),
        "projetar_receita":            lambda: projetar_receita(**args),
        "gerar_relatorio_financeiro":  lambda: gerar_relatorio_financeiro(**args),
    }
    fn = fns.get(nome)
    return json.dumps(fn() if fn else {"erro": f"'{nome}' não encontrada"}, ensure_ascii=False, default=str)


def analisar_financeiro() -> str:
    print("\n🤖 Agente Financeiro iniciado...")
    messages = [{
        "role": "user",
        "content": (
            "Analise a saúde financeira completa da agência Alcance+ para o mês atual. "
            "Carregue os dados, calcule indicadores, verifique inadimplência, "
            "projete receita para os próximos 3 meses e gere um relatório completo "
            "com recomendações estratégicas em Markdown."
        )
    }]

    while True:
        response = client.messages.create(
            model=MODEL, max_tokens=4096, tools=tools, messages=messages
        )

        if response.stop_reason == "end_turn":
            for bloco in response.content:
                if hasattr(bloco, 'text'):
                    return bloco.text
            return "Análise concluída."

        if response.stop_reason == "tool_use":
            messages.append({"role": "assistant", "content": response.content})
            resultados = []
            for bloco in response.content:
                if bloco.type == "tool_use":
                    print(f"   🔧 {bloco.name}")
                    resultados.append({
                        "type": "tool_result",
                        "tool_use_id": bloco.id,
                        "content": executar_ferramenta(bloco.name, bloco.input)
                    })
            messages.append({"role": "user", "content": resultados})
        else:
            break

    return "Erro."


if __name__ == "__main__":
    from rich.console import Console
    from rich.markdown import Markdown
    console = Console()
    resultado = analisar_financeiro()
    console.print(Markdown(resultado))
