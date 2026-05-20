import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.local'))

ANTHROPIC_API_KEY = os.environ.get('ANTHROPIC_API_KEY', '')
SUPABASE_URL      = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY      = os.environ.get('NEXT_PUBLIC_SUPABASE_ANON_KEY', '')
MODEL             = 'claude-sonnet-4-6'

# Dados mock (usados quando Supabase não está configurado)
MOCK_CLIENTES = [
    {'nome': 'TechNova Solutions',       'mensalidade': 12000, 'status': 'ativo'},
    {'nome': 'Construtora Viva Mais',    'mensalidade': 8500,  'status': 'ativo'},
    {'nome': 'Dr. Marcos Cardiologia',   'mensalidade': 4200,  'status': 'onboarding'},
    {'nome': 'Sabor & Arte Restaurante', 'mensalidade': 3800,  'status': 'ativo'},
    {'nome': 'Academia FitLife',         'mensalidade': 2900,  'status': 'pausado'},
    {'nome': 'Imobiliária Prime',        'mensalidade': 7200,  'status': 'ativo'},
    {'nome': 'Clínica OdontoVida',       'mensalidade': 5600,  'status': 'ativo'},
]

MOCK_CAMPANHAS = [
    {'nome': 'Google Ads TechNova',    'canal': 'Google Ads', 'orcamento': 5000, 'gasto': 2840, 'conversoes': 87,  'status': 'ativa'},
    {'nome': 'Meta Ads Construtora',   'canal': 'Meta Ads',   'orcamento': 3000, 'gasto': 1560, 'conversoes': 43,  'status': 'ativa'},
    {'nome': 'Google Ads Dr. Marcos',  'canal': 'Google Ads', 'orcamento': 1800, 'gasto': 340,  'conversoes': 22,  'status': 'ativa'},
    {'nome': 'Instagram Sabor & Arte', 'canal': 'Instagram',  'orcamento': 1200, 'gasto': 800,  'conversoes': 0,   'status': 'pausada'},
    {'nome': 'SEO Imobiliária Prime',  'canal': 'SEO',        'orcamento': 2500, 'gasto': 2500, 'conversoes': 156, 'status': 'ativa'},
]

MOCK_FINANCEIRO = {
    'receitas': 84500,
    'despesas': 35500,
    'pendentes': [
        {'descricao': 'Mensalidade Dr. Marcos', 'valor': 4200, 'vencimento': '2026-05-15'},
        {'descricao': 'Mensalidade FitLife',    'valor': 2900, 'vencimento': '2026-05-20'},
    ]
}

MOCK_PIPELINE = [
    {'empresa': 'E-commerce Moda Urbana',   'etapa': 'Proposta',     'valor': 8000, 'prob': 70},
    {'empresa': 'Clínica Dermato Plus',     'etapa': 'Qualificação', 'valor': 5500, 'prob': 40},
    {'empresa': 'Auto Peças Veloz',         'etapa': 'Negociação',   'valor': 3200, 'prob': 85},
    {'empresa': 'Academia Sport Center',    'etapa': 'Prospecção',   'valor': 4800, 'prob': 20},
    {'empresa': 'Advocacia Mendes & Assoc.','etapa': 'Proposta',     'valor': 6000, 'prob': 60},
]
