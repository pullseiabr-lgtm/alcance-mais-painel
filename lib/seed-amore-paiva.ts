// Seed: Campanha Amore Paiva — Junho & Julho 2026
// Importar e executar no console do browser para popular o sistema:
//   import { seedAmorePaiva } from '@/lib/seed-amore-paiva'; seedAmorePaiva()

export function seedAmorePaiva() {
  const now = '2026-06-01'

  // ── CAMPANHAS ─────────────────────────────────────────────────────────────
  const campanhas = [
    {
      id: 2001,
      nome: 'Todo Dia É Dia de Happy — Amore Paiva',
      cliente: 'Amore Paiva',
      tipo: 'Promoção',
      status: 'Ativa',
      objetivo: 'Tráfego',
      mensagemChave: 'Em homenagem ao Mundial 2026 — happy hour diário com descontração, boa comida e cerveja gelada na Reserva do Paiva.',
      publicoAlvo: 'Adultos 25-50 anos, moradores e frequentadores da Reserva do Paiva, público pós-praia e pós-trabalho',
      faixaEtaria: '25-50',
      localizacao: 'Reserva do Paiva — Pernambuco — raio 5km',
      interesses: ['happy hour','praia','restaurante','futebol','gastronomia','vida noturna'],
      dataInicio: '2026-06-01',
      dataFim:    '2026-07-30',
      orcamentoTotal: 3500,
      orcPlataformas: [
        { plataforma: 'Meta Ads',   valor: 1750, percentual: 50 },
        { plataforma: 'Instagram Orgânico', valor: 700, percentual: 20 },
        { plataforma: 'iFood Ads',  valor: 700, percentual: 20 },
        { plataforma: 'Google Ads', valor: 350, percentual: 10 },
      ],
      metaImpressoes: 200000, metaCliques: 6000, metaConversoes: 400, metaROAS: 5,
      impressoes: 0, cliques: 0, conversoes: 0, gastoReal: 0,
      diferenciais: ['Happy hour DIÁRIO', 'HNK 600ml R$14,90', 'Chopp R$6,90', 'Petiscos premium', 'Melhor localização na Reserva'],
      concorrentes: ['Beira Mar', 'Camarões', 'Coco Bambu'],
      observacoes: 'Foco nos horários 16h-21h. Priorizar vídeos de movimento da casa, drinks sendo servidos, público animado. Tom descontraído.',
      fases: [
        { id:2101, nome:'Lançamento', dataInicio:'2026-06-01', dataFim:'2026-06-07', orcamento:700, objetivo:'Apresentar a campanha e gerar expectativa', status:'Ativa' },
        { id:2102, nome:'Sustentação', dataInicio:'2026-06-08', dataFim:'2026-07-15', orcamento:2100, objetivo:'Manter frequência semanal e consolidar hábito', status:'Planejamento' },
        { id:2103, nome:'Aceleração Final', dataInicio:'2026-07-16', dataFim:'2026-07-30', orcamento:700, objetivo:'Sprint final com promoções exclusivas', status:'Planejamento' },
      ],
      criativos: [
        { id:2201, formato:'Feed',   plataforma:'Instagram', status:'Em Produção', descricao:'Card com tabela de preços happy hour em fundo escuro premium com cores verdes/amarelas', copy:'⚽ Happy Hour DIÁRIO na Amore! Chopp R$6,90 • HNK R$14,90 • Camarão Paraíso R$59,90. Todo dia é dia de Amore! 🍺' },
        { id:2202, formato:'Reels',  plataforma:'Instagram', status:'Briefado', descricao:'Video 15-30s mostrando movimento da casa no horário de happy hour, drinks sendo servidos, clientes animados', copy:'O melhor happy hour da Reserva do Paiva é aqui 🍺⚽ Venha torcer e celebrar com a gente!' },
        { id:2203, formato:'Story',  plataforma:'Instagram', status:'Briefado', descricao:'Stories diários com countdown, produto em destaque e CTA para reserva', copy:'Hoje tem happy hour! 🍺 Reserve sua mesa: [link]' },
        { id:2204, formato:'Banner', plataforma:'iFood Ads', status:'Briefado', descricao:'Banner retangular com produtos delivery em destaque', copy:'Peça agora no iFood 🛵 Promoção Happy Hour até às 21h' },
      ],
      criado: now,
    },
    {
      id: 2002,
      nome: 'Festival de Massas Amore — Sábado Italiano',
      cliente: 'Amore Paiva',
      tipo: 'Sazonal',
      status: 'Ativa',
      objetivo: 'Vendas',
      mensagemChave: 'Toda semana tem Sábado Italiano na Amore. Massas premium, vinhos da prateleira R$49,90 e muito sabor.',
      publicoAlvo: 'Casais e famílias 28-55 anos que apreciam gastronomia italiana, amantes de vinho, público premium da Reserva',
      faixaEtaria: '28-55',
      localizacao: 'Reserva do Paiva — Pernambuco',
      interesses: ['gastronomia italiana','vinho','restaurante premium','família','sábado','massa'],
      dataInicio: '2026-06-07',
      dataFim:    '2026-07-26',
      orcamentoTotal: 2800,
      orcPlataformas: [
        { plataforma: 'Meta Ads',   valor: 1400, percentual: 50 },
        { plataforma: 'Instagram Orgânico', valor: 840, percentual: 30 },
        { plataforma: 'Google Ads', valor: 560, percentual: 20 },
      ],
      metaImpressoes: 120000, metaCliques: 3500, metaConversoes: 200, metaROAS: 6,
      impressoes: 0, cliques: 0, conversoes: 0, gastoReal: 0,
      diferenciais: ['Vinhos prateleira R$49,90','Parmegiana para 2 R$69,90','Lagosta ao Pesto R$189,90','Ambiente italiano','Sábado especial'],
      concorrentes: ['Famiglia Brunetti','Boi Preto','Don Camillo'],
      observacoes: 'Focar em conteúdo visual dos pratos. Explorar a apresentação das massas. Vídeos de close no queijo derretendo. Tom sofisticado mas aconchegante.',
      fases: [
        { id:2104, nome:'Estreia', dataInicio:'2026-06-07', dataFim:'2026-06-14', orcamento:560, objetivo:'Lançar o Festival e gerar primeiras reservas', status:'Ativa' },
        { id:2105, nome:'Frequência', dataInicio:'2026-06-15', dataFim:'2026-07-26', orcamento:2240, objetivo:'Consolidar o Sábado Italiano como tradição', status:'Planejamento' },
      ],
      criativos: [
        { id:2205, formato:'Feed', plataforma:'Instagram', status:'Em Produção', descricao:'Card elegante com foto de massa ao pesto com lagosta, cores quentes, tipografia italiana', copy:'🍝 Todo sábado é dia de Sábado Italiano na Amore! Parmegiana para 2 por R$69,90 e vinhos por R$49,90. Preço especial apenas aos sábados.' },
        { id:2206, formato:'Reels', plataforma:'Instagram', status:'Briefado', descricao:'Video mostrando preparo do ao pesto amore, close no camarão sendo adicionado, finalização com queijo', copy:'Você não vai resistir... 😍🍝 Festival de Massas todo sábado' },
      ],
      criado: now,
    },
    {
      id: 2003,
      nome: 'Dia dos Namorados — Experiência Premium Amore',
      cliente: 'Amore Paiva',
      tipo: 'Sazonal',
      status: 'Ativa',
      objetivo: 'Reservas',
      mensagemChave: 'Surpreenda quem você ama na Amore. Uma experiência gastronômica inesquecível com menu especial, música ao vivo e decoração romântica.',
      publicoAlvo: 'Casais 25-45 anos, renda AB, que buscam experiências premium para datas especiais',
      faixaEtaria: '25-45',
      localizacao: 'Reserva do Paiva — Pernambuco',
      interesses: ['dia dos namorados','jantar romântico','experiência gastronômica','presente','casal','luxo'],
      dataInicio: '2026-06-05',
      dataFim:    '2026-06-12',
      orcamentoTotal: 3000,
      orcPlataformas: [
        { plataforma: 'Meta Ads',    valor: 1500, percentual: 50 },
        { plataforma: 'Google Ads',  valor: 750,  percentual: 25 },
        { plataforma: 'iFood Ads',   valor: 450,  percentual: 15 },
        { plataforma: 'Instagram Orgânico', valor: 300, percentual: 10 },
      ],
      metaImpressoes: 150000, metaCliques: 4500, metaConversoes: 120, metaROAS: 8,
      impressoes: 0, cliques: 0, conversoes: 0, gastoReal: 0,
      diferenciais: ['Menu especial casal','Música ao vivo','Decoração temática','Mesa instagramável','Entrada romântica','Lista VIP reservas'],
      concorrentes: ['Coco Bambu','Camarões','Porto Recife'],
      observacoes: 'Ensaio fotográfico profissional obrigatório. Vídeo teaser até 07/06. Influenciadores até 10/06. Lista VIP fechada até 11/06.',
      fases: [
        { id:2106, nome:'Teaser', dataInicio:'2026-06-05', dataFim:'2026-06-08', orcamento:600, objetivo:'Gerar expectativa e atrair reservas antecipadas', status:'Ativa' },
        { id:2107, nome:'Ativação', dataInicio:'2026-06-09', dataFim:'2026-06-11', orcamento:1800, objetivo:'Maximizar reservas — urgência final', status:'Planejamento' },
        { id:2108, nome:'Evento', dataInicio:'2026-06-12', dataFim:'2026-06-12', orcamento:600, objetivo:'Cobertura ao vivo e conteúdo do evento', status:'Planejamento' },
      ],
      criativos: [
        { id:2207, formato:'Reels', plataforma:'Instagram', status:'Briefado', descricao:'Vídeo teaser: ambiente decorado, mesa posta, flores, luz ambiente, reveal da oferta', copy:'12/06 ❤️ Reserve sua mesa especial. Uma noite que ele/ela nunca vai esquecer.' },
        { id:2208, formato:'Feed',  plataforma:'Instagram', status:'Em Produção', descricao:'Ensaio fotográfico: casal em mesa romântica, champanhe, pratos especiais', copy:'💑 Dia dos Namorados na Amore — Menu especial, música ao vivo e uma experiência única na Reserva do Paiva. Reserve já!' },
        { id:2209, formato:'Story', plataforma:'Instagram', status:'Briefado', descricao:'Stories contagem regressiva com "últimas mesas disponíveis"', copy:'⏰ Últimas mesas! Reserve AGORA ❤️' },
      ],
      criado: now,
    },
    {
      id: 2004,
      nome: 'Seleção Brasileira — Arena Amore',
      cliente: 'Amore Paiva',
      tipo: 'Evento',
      status: 'Planejamento',
      objetivo: 'Tráfego',
      mensagemChave: 'A Amore é a arena oficial da torcida na Reserva do Paiva. Telão, chopp gelado, decoração verde e amarela e muita emoção.',
      publicoAlvo: 'Torcedores 20-50 anos, moradores da Reserva do Paiva e arredores, grupos de amigos e famílias',
      faixaEtaria: '20-50',
      localizacao: 'Reserva do Paiva — Pernambuco',
      interesses: ['futebol','copa do mundo','torcida','boteco','chopp','telão'],
      dataInicio: '2026-06-13',
      dataFim:    '2026-07-13',
      orcamentoTotal: 2500,
      orcPlataformas: [
        { plataforma: 'Meta Ads', valor: 1500, percentual: 60 },
        { plataforma: 'Instagram Orgânico', valor: 750, percentual: 30 },
        { plataforma: 'WhatsApp', valor: 250, percentual: 10 },
      ],
      metaImpressoes: 180000, metaCliques: 5000, metaConversoes: 350, metaROAS: 4,
      impressoes: 0, cliques: 0, conversoes: 0, gastoReal: 0,
      diferenciais: ['Telão principal','Chopp R$5,90 nos jogos','Equipe temática verde/amarela','Sorteios durante os jogos','Reserva antecipada'],
      concorrentes: ['Bares da região','Beira Mar','Outros bares com telão'],
      observacoes: 'Comunicação imediata pós definição de datas dos jogos. Tom de animação/festa. Cobertura ao vivo obrigatória durante cada jogo.',
      fases: [
        { id:2109, nome:'Pré-Jogo', dataInicio:'2026-06-12', dataFim:'2026-06-13', orcamento:500, objetivo:'Anunciar e lotar a casa 24h antes', status:'Planejamento' },
        { id:2110, nome:'Game Day', dataInicio:'2026-06-13', dataFim:'2026-06-13', orcamento:1000, objetivo:'Stories ao vivo, engajamento em tempo real', status:'Planejamento' },
        { id:2111, nome:'Próximos Jogos', dataInicio:'2026-06-20', dataFim:'2026-07-13', orcamento:1000, objetivo:'Repetir padrão para todos os jogos do Brasil', status:'Planejamento' },
      ],
      criativos: [
        { id:2210, formato:'Feed', plataforma:'Instagram', status:'Briefado', descricao:'Card verde/amarelo com telão, data do jogo e promoções', copy:'🇧🇷 JOGO DO BRASIL NA AMORE! Chopp R$5,90 • Telão enorme • Torcida organizada. Garanta sua mesa!' },
        { id:2211, formato:'Story', plataforma:'Instagram', status:'Briefado', descricao:'Contagem regressiva para o jogo com promoções do dia', copy:'⏰ Faltam X horas para o jogo! Reserve já 🇧🇷⚽' },
      ],
      criado: now,
    },
    {
      id: 2005,
      nome: 'Feijoada Amore — Samba & Futebol',
      cliente: 'Amore Paiva',
      tipo: 'Sazonal',
      status: 'Ativa',
      objetivo: 'Vendas',
      mensagemChave: 'Feijoada tradicional Amore todo final de semana. Samba ao vivo, caipirinha e a melhor feijoada da Reserva do Paiva.',
      publicoAlvo: 'Famílias e grupos 28-55 anos que apreciam tradições gastronômicas brasileiras, público do almoço',
      faixaEtaria: '28-55',
      localizacao: 'Reserva do Paiva — Pernambuco',
      interesses: ['feijoada','samba','futebol','almoço em família','comida brasileira','tradição'],
      dataInicio: '2026-06-01',
      dataFim:    '2026-07-30',
      orcamentoTotal: 1800,
      orcPlataformas: [
        { plataforma: 'Meta Ads', valor: 900, percentual: 50 },
        { plataforma: 'Instagram Orgânico', valor: 540, percentual: 30 },
        { plataforma: 'iFood Ads', valor: 360, percentual: 20 },
      ],
      metaImpressoes: 80000, metaCliques: 2500, metaConversoes: 180, metaROAS: 5,
      impressoes: 0, cliques: 0, conversoes: 0, gastoReal: 0,
      diferenciais: ['Feijoada individual R$34,90','Para 2 R$54,90','Para 3 R$69,90','Samba ao vivo','Caipirinha promocional'],
      concorrentes: ['Doméstico','Leite','Oficina do Sabor'],
      observacoes: 'Reels mostrando preparo da feijoada são obrigatórios. Conteúdo ao vivo nos domingos. Clima de boteco brasileiro animado.',
      fases: [
        { id:2112, nome:'Lançamento', dataInicio:'2026-06-01', dataFim:'2026-06-07', orcamento:360, objetivo:'Anunciar a feijoada como nova tradição', status:'Ativa' },
        { id:2113, nome:'Sustentação', dataInicio:'2026-06-08', dataFim:'2026-07-30', orcamento:1440, objetivo:'Manter presença semanal e fidelizar clientes', status:'Planejamento' },
      ],
      criativos: [
        { id:2212, formato:'Reels', plataforma:'Instagram', status:'Briefado', descricao:'Video do preparo da feijoada: feijão no tacho, carnes, fumaça, finalização no prato com acompanhamentos', copy:'🫕 Todo fim de semana tem Feijoada na Amore! Individual R$34,90 • Para 2 R$54,90 • Com samba ao vivo!' },
        { id:2213, formato:'Feed',  plataforma:'Instagram', status:'Briefado', descricao:'Foto do prato montado com acompanhamentos, caipirinha ao lado, mesa bem apresentada', copy:'A feijoada mais gostosa da Reserva do Paiva está te esperando 🫕 Todo domingo na Amore!' },
      ],
      criado: now,
    },
  ]

  // ── TAREFAS ───────────────────────────────────────────────────────────────
  const tarefas = [
    // DESIGN
    { id:3001, titulo:'Criar card feed Happy Hour', descricao:'Card com tabela de preços, visual Copa do Mundo, fundo escuro premium. Formato: 1080x1080', responsavel:'Marina', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'Em Andamento' as const, prazo:'2026-06-03', tags:['design','happy-hour','feed'], checklist:[{id:1,texto:'Receber brief aprovado',feito:true},{id:2,texto:'Criar 3 variações',feito:false},{id:3,texto:'Enviar para aprovação',feito:false}], criado:'2026-06-01' },
    { id:3002, titulo:'Criar stories Happy Hour (15 peças)', descricao:'15 stories animados para a semana. Incluir preços, CTAs, contagem regressiva happy hour', responsavel:'Marina', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-04', tags:['design','stories'], checklist:[], criado:'2026-06-01' },
    { id:3003, titulo:'Identidade visual Dia dos Namorados', descricao:'Criar toda identidade: cores, fontes, elementos visuais. Aplicar em cards, banners, menu especial', responsavel:'Marina', projeto:'Dia dos Namorados — Experiência Premium Amore', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'Em Andamento' as const, prazo:'2026-06-05', tags:['design','namorados','identidade'], checklist:[{id:1,texto:'Moodboard referências',feito:true},{id:2,texto:'Paleta de cores',feito:false},{id:3,texto:'Aplicação cards',feito:false}], criado:'2026-06-01' },
    { id:3004, titulo:'Banner Festival de Massas', descricao:'Card premium para feed e story. Foto de massa ao pesto com camarão. Estética italiana', responsavel:'Marina', projeto:'Festival de Massas Amore — Sábado Italiano', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-06', tags:['design','massas','feed'], checklist:[], criado:'2026-06-01' },
    { id:3005, titulo:'Arte telão Arena Amore (Copa)', descricao:'Layout para projeção no telão interno. Fundo verde/amarelo, escudo Brasil, logomarca Amore, promoções', responsavel:'Carlos', projeto:'Seleção Brasileira — Arena Amore', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-10', tags:['design','copa','telão'], checklist:[], criado:'2026-06-01' },
    { id:3006, titulo:'Menu promocional digital (QR code)', descricao:'Versão digital do cardápio promocional para as campanhas de junho/julho', responsavel:'Carlos', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Média' as const, status:'A Fazer' as const, prazo:'2026-06-08', tags:['design','cardápio','digital'], checklist:[], criado:'2026-06-01' },

    // SOCIAL MEDIA
    { id:3007, titulo:'Calendário editorial junho — Amore Paiva', descricao:'Montar calendário completo de publicações para junho. Incluir todas as campanhas, datas especiais e jogos do Brasil', responsavel:'Ana', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'Em Andamento' as const, prazo:'2026-06-02', tags:['social-media','calendário','planejamento'], checklist:[{id:1,texto:'Mapear datas comemorativas',feito:true},{id:2,texto:'Mapear datas dos jogos',feito:true},{id:3,texto:'Distribuir campanhas no calendário',feito:false},{id:4,texto:'Aprovação com cliente',feito:false}], criado:'2026-06-01' },
    { id:3008, titulo:'Legendas semana 01 (01-07/06)', descricao:'Escrever todas as legendas dos posts da primeira semana. Feed, stories e reels', responsavel:'Ana', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-04', tags:['social-media','copy','legendas'], checklist:[], criado:'2026-06-01' },
    { id:3009, titulo:'Cobertura ao vivo — Dia dos Namorados (12/06)', descricao:'Stories e Reels ao vivo durante o evento. Capturar ambientação, casais, momentos especiais', responsavel:'Ana', projeto:'Dia dos Namorados — Experiência Premium Amore', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-12', tags:['social-media','cobertura','namorados'], checklist:[], criado:'2026-06-01' },
    { id:3010, titulo:'Cobertura ao vivo — Jogo da Seleção (13/06)', descricao:'Stories em tempo real do jogo, torcida, promoções. Pelo menos 10 stories durante o evento', responsavel:'Ana', projeto:'Seleção Brasileira — Arena Amore', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-13', tags:['social-media','copa','cobertura'], checklist:[], criado:'2026-06-01' },

    // TRÁFEGO PAGO
    { id:3011, titulo:'Configurar campanhas Meta Ads — Happy Hour', descricao:'Criar campanha de conversão e reconhecimento. Segmentar raio 5km, 25-50 anos, interesses: happy hour, restaurante, praia', responsavel:'João', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'Em Andamento' as const, prazo:'2026-06-02', tags:['tráfego','meta-ads','happy-hour'], checklist:[{id:1,texto:'Criar público-alvo personalizado',feito:true},{id:2,texto:'Configurar pixel eventos',feito:false},{id:3,texto:'Criar conjuntos de anúncios',feito:false},{id:4,texto:'Subir criativos aprovados',feito:false}], criado:'2026-06-01' },
    { id:3012, titulo:'Campanha Meta Ads — Dia dos Namorados', descricao:'Campanha de conversão para reservas. Objetivo: 120 reservas. Segmentar casais, 25-45 anos, AB. Período: 05-12/06', responsavel:'João', projeto:'Dia dos Namorados — Experiência Premium Amore', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'A Fazer' as const, prazo:'2026-06-05', tags:['tráfego','meta-ads','namorados'], checklist:[], criado:'2026-06-01' },
    { id:3013, titulo:'Campanha Meta Ads — Jogos do Brasil', descricao:'Campanhas boosted 24h antes de cada jogo. Alcance máximo raio 8km. Budget R$300/jogo', responsavel:'João', projeto:'Seleção Brasileira — Arena Amore', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-12', tags:['tráfego','meta-ads','copa'], checklist:[], criado:'2026-06-01' },
    { id:3014, titulo:'Campanha iFood Ads — Delivery Promoções', descricao:'Banner iFood para Happy Hour delivery. Cupons exclusivos. Integrar com campanhas de conversão', responsavel:'João', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Média' as const, status:'A Fazer' as const, prazo:'2026-06-06', tags:['tráfego','ifood','delivery'], checklist:[], criado:'2026-06-01' },
    { id:3015, titulo:'Remarketing — Visitantes site e Instagram', descricao:'Criar público de remarketing para quem visitou perfil/site nos últimos 30 dias. Anúncio específico para quem ainda não reservou', responsavel:'João', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Média' as const, status:'A Fazer' as const, prazo:'2026-06-07', tags:['tráfego','remarketing'], checklist:[], criado:'2026-06-01' },

    // FOTO E VÍDEO
    { id:3016, titulo:'Captação semanal — Semana 01 (03/06)', descricao:'Sessão foto/vídeo: pratos do happy hour, ambiente da casa, bartender preparando drinks. Entregar: 20 fotos + 3 vídeos', responsavel:'Carlos', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-03', tags:['foto','vídeo','captação'], checklist:[{id:1,texto:'Confirmar horário com restaurante',feito:false},{id:2,texto:'Equipamento preparado',feito:false},{id:3,texto:'Lista de shots aprovada',feito:false}], criado:'2026-06-01' },
    { id:3017, titulo:'Ensaio fotográfico — Dia dos Namorados', descricao:'Sessão especial com casal, mesa decorada, menu especial, champanhe. Necessário fotógrafo profissional. Entregar: 40 fotos editadas', responsavel:'Carlos', projeto:'Dia dos Namorados — Experiência Premium Amore', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'A Fazer' as const, prazo:'2026-06-05', tags:['foto','namorados','ensaio'], checklist:[], criado:'2026-06-01' },
    { id:3018, titulo:'Reels preparo Feijoada', descricao:'Vídeo vertical mostrando preparo da feijoada: feijão no tacho, carnes, fumaça. Duração: 20-30s. Com música samba', responsavel:'Carlos', projeto:'Feijoada Amore — Samba & Futebol', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-04', tags:['vídeo','reels','feijoada'], checklist:[], criado:'2026-06-01' },
    { id:3019, titulo:'Reels Festival de Massas', descricao:'Video do ao pesto sendo preparado, lagosta, queijo derretendo. Duração: 15-30s. Música italiana', responsavel:'Carlos', projeto:'Festival de Massas Amore — Sábado Italiano', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-05', tags:['vídeo','reels','massas'], checklist:[], criado:'2026-06-01' },

    // COMERCIAL / OPERAÇÃO
    { id:3020, titulo:'Validar tabela de preços com financeiro', descricao:'Confirmar todos os preços das campanhas com área financeira/comercial. Itens pendentes: Final de Semana Amore (valores não definidos)', responsavel:'Lucia', projeto:'Final de Semana Amore', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'A Fazer' as const, prazo:'2026-06-02', tags:['comercial','financeiro','preços'], checklist:[{id:1,texto:'Listar preços pendentes',feito:false},{id:2,texto:'Reunião com financeiro',feito:false},{id:3,texto:'Validar CMV dos pratos',feito:false}], criado:'2026-06-01' },
    { id:3021, titulo:'Treinar equipe operacional sobre promoções', descricao:'Reunião com garçons e atendentes para apresentar todas as campanhas, preços e ações de junho/julho', responsavel:'Lucia', projeto:'Todo Dia É Dia de Happy — Amore Paiva', cliente:'Amore Paiva', prioridade:'Alta' as const, status:'A Fazer' as const, prazo:'2026-06-04', tags:['operação','treinamento','equipe'], checklist:[], criado:'2026-06-01' },
    { id:3022, titulo:'Reservas VIP — Dia dos Namorados', descricao:'Abrir lista de reservas antecipadas. Configurar formulário, definir capacidade máxima, monitorar inscrições', responsavel:'Lucia', projeto:'Dia dos Namorados — Experiência Premium Amore', cliente:'Amore Paiva', prioridade:'Urgente' as const, status:'A Fazer' as const, prazo:'2026-06-03', tags:['operação','reservas','vip'], checklist:[], criado:'2026-06-01' },
  ]

  // ── SOCIAL PLANNER POSTS ──────────────────────────────────────────────────
  const posts = [
    { id:4001, data:'2026-06-01', hora:'10:00', plataforma:'Instagram', tipo:'Feed', titulo:'Lançamento Happy Hour Amore', legenda:'⚽ Em homenagem ao Mundial 2026 — happy hour DIÁRIO na Amore! Chopp R$6,90 🍺', status:'agendado', cliente:'Amore Paiva', campanha:'Happy Hour', cor:'#E1306C' },
    { id:4002, data:'2026-06-01', hora:'18:00', plataforma:'Instagram', tipo:'Story', titulo:'Story abertura campanha', legenda:'Hoje começa o Happy Hour Diário! 🍺⚽ Vem pra Amore!', status:'agendado', cliente:'Amore Paiva', campanha:'Happy Hour', cor:'#E1306C' },
    { id:4003, data:'2026-06-03', hora:'12:00', plataforma:'Instagram', tipo:'Reels', titulo:'Reels Feijoada domingo', legenda:'🫕 Domingo tem Feijoada na Amore + Samba ao vivo!', status:'agendado', cliente:'Amore Paiva', campanha:'Feijoada', cor:'#E1306C' },
    { id:4004, data:'2026-06-05', hora:'09:00', plataforma:'Instagram', tipo:'Feed', titulo:'Teaser Dia dos Namorados', legenda:'❤️ 12/06 está chegando... Reserve já sua mesa especial', status:'ideia', cliente:'Amore Paiva', campanha:'Namorados', cor:'#E1306C' },
    { id:4005, data:'2026-06-07', hora:'10:00', plataforma:'Instagram', tipo:'Feed', titulo:'Lançamento Festival de Massas', legenda:'🍝 TODO SÁBADO é Sábado Italiano na Amore! Vinhos R$49,90 • Parmegiana para 2 R$69,90', status:'agendado', cliente:'Amore Paiva', campanha:'Festival Massas', cor:'#E1306C' },
    { id:4006, data:'2026-06-12', hora:'11:00', plataforma:'Instagram', tipo:'Story', titulo:'Dia dos Namorados — Abertura', legenda:'❤️ Hoje é DIA DOS NAMORADOS! Última chance de reserva!', status:'ideia', cliente:'Amore Paiva', campanha:'Namorados', cor:'#E1306C' },
    { id:4007, data:'2026-06-13', hora:'14:00', plataforma:'Instagram', tipo:'Story', titulo:'Jogo do Brasil — Cobertura', legenda:'🇧🇷⚽ JOGO DO BRASIL AO VIVO NA AMORE! Chopp R$5,90 hoje!', status:'ideia', cliente:'Amore Paiva', campanha:'Copa', cor:'#E1306C' },
  ]

  // Salva no localStorage
  try {
    localStorage.setItem('alcance_planejamento_v1', JSON.stringify(campanhas))
    localStorage.setItem('alcance_tarefas_v1', JSON.stringify(tarefas))
    localStorage.setItem('alcance_social_planner_v1', JSON.stringify(posts))
    console.log('✅ Dados Amore Paiva carregados com sucesso!')
    console.log(`📣 ${campanhas.length} campanhas criadas`)
    console.log(`✓ ${tarefas.length} tarefas distribuídas`)
    console.log(`📅 ${posts.length} posts agendados`)
  } catch(e) {
    console.error('Erro ao salvar:', e)
  }
}
