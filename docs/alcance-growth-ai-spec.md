# Alcance Growth AI — Especificação Completa (Expansão do módulo Tráfego)

> Módulo nativo do Alcance+ que amplia o `trafego` existente (agente de chat Claude) transformando-o em um centro completo de gestão de tráfego pago, performance e inteligência artificial.

## 0. Estratégia de evolução
- **Não criar módulo paralelo**: o `trafego` atual vira a base do "Alcance Growth AI" — o chat existente passa a ser a aba "🤖 Inteligência Artificial / Assistente IA" dentro do módulo ampliado.
- Reaproveitar `lib/meta-ads.ts`, `lib/google-ads.ts`, `lib/tiktok-ads.ts` e tabelas `campanhas`/`clientes` como base de integração.
- Avaliar uso do conector **Windsor.ai** (já disponível via MCP) para acelerar ingestão de dados de Meta Ads, Google Ads, GA4, Instagram, em vez de construir sync manual do zero.

## 1. Menu Principal (dentro do módulo ampliado)
- 📊 Dashboard Executivo
- 🎯 Tráfego Pago (visão consolidada)
- 📈 Meta Ads
- 🔍 Google Ads
- 📱 Instagram
- 💬 WhatsApp
- 📋 Relatórios
- 🤖 Inteligência Artificial (evolução do chat `trafego` atual)

## 2. Dashboard Executivo
Exibir em tempo real:
- Investimento hoje / mês
- Reservas geradas, leads gerados, faturamento gerado
- ROAS, ticket médio
- Meta x Realizado

**Requisito de infraestrutura**: criar tabela de séries temporais (ex.: `metricas_diarias` por campanha/canal/data) — sem isso não há dado histórico para alimentar gráficos e relatórios. Adicionar lib de gráficos (recharts ou visx — atualmente não há nenhuma no projeto).

## 3. Meta Ads
**Conectar**: conta de anúncios, página Facebook, Instagram
**Analisar**: campanhas, conjuntos, anúncios, criativos
**Alertas automáticos**:
- 🔴 CPC alto
- 🔴 CTR baixo
- 🔴 Frequência alta
- 🔴 Campanhas sem conversão

**Requisito de infraestrutura**: motor de regras/alertas (job periódico que avalia métricas vs. thresholds e gera notificações).

## 4. Google Ads
**Monitorar**: Pesquisa, Performance Max, Maps, Remarketing
**Analisar**: palavras-chave, conversões, CPA, ROAS
**Sugerir** (via IA): novas palavras-chave, palavras negativas, ajustes de orçamento

## 5. Instagram
**Analisar**: Reels, Stories, Feed
**Mostrar**: alcance, compartilhamentos, salvamentos, engajamento
**IA identifica**: melhores horários, melhores formatos, conteúdos com maior conversão

**Status atual**: só existe o campo `instagram` no cadastro de cliente — não há analytics. Módulo precisa ser construído desde a ingestão de dados.

## 6. WhatsApp
- **Pendência a esclarecer antes de especificar**: qual API/provedor de WhatsApp será a fonte de métricas (WhatsApp Business API, Z-API, outro)? Sem isso não há como definir o que sincronizar/exibir.

## 7. Criação Automática de Campanhas (IA)
Botão "CRIAR CAMPANHA" → IA pergunta o objetivo:
- Reservas / Delivery / Evento / Festival / Lançamento

Após selecionar, a IA gera:
- Público, orçamento, criativos, copies, segmentação

**Diferença em relação ao chat atual**: o `trafego` hoje só conversa; este fluxo precisa gerar uma **estrutura de campanha completa e acionável** (não apenas texto), possivelmente com integração direta às APIs de Meta/Google para criação real.

## 8. Relatórios
- Relatório Diário / Semanal / Mensal
- Exportação: PDF, Excel, Power BI

**Status atual**: não existe geração de relatório no projeto — construir do zero (templates + exportação).

## 9. Assistente IA (evolução do chat `trafego`)
Perguntas de exemplo que o agente deve responder com dados reais (não apenas texto genérico):
- "Qual campanha vendeu mais?"
- "Qual anúncio devo pausar?"
- "Quanto investir amanhã?"
- "Qual produto anunciar?"
- "Qual campanha trouxe mais reservas?"

**Requisito**: o agente precisa ter acesso às tabelas de métricas reais (não só ao histórico de chat) para responder com dados — depende diretamente do item 2 (séries temporais).

## 10. Permissões
Papéis: Administrador, Gestor Marketing, Gestor Unidade, Consultor, Visualização — cada usuário vê só o que o admin liberar.

**Pendência a verificar**: confirmar se o Alcance+ já possui RBAC (controle de acesso por papel). Não foi encontrado sinal disso no levantamento — pode ser pré-requisito transversal a todo o módulo.

---

## Lacunas identificadas (ordem sugerida de resolução)
1. Tabela de métricas em série temporal (`metricas_diarias`) — base de tudo
2. Job de sincronização periódica (decidir: Windsor.ai MCP vs. clients próprios `meta-ads.ts`/`google-ads.ts`/`tiktok-ads.ts`)
3. Lib de visualização (recharts/visx) + Dashboard Executivo
4. Motor de alertas (Meta Ads)
5. Analytics de Instagram (ingestão + exibição)
6. Definir fonte de dados do WhatsApp
7. Fluxo de criação automática de campanha (estrutura + integração de criação real via API)
8. Geração/exportação de relatórios (PDF/Excel/Power BI)
9. Evolução do agente `trafego` para consultar dados reais
10. RBAC / permissões granulares

## Decisões resolvidas

### 1. Localização do módulo
✅ **Continua dentro de `trafego`** — ampliação incremental, sem criar rota/módulo paralelo. As novas abas (Dashboard, Meta Ads, Google Ads, Instagram, WhatsApp, Relatórios) entram como sub-seções do módulo `trafego` existente.

### 2. Caminho de sincronização de dados
✅ **Recomendação: pipeline próprio sobre os clients existentes (`meta-ads.ts`, `google-ads.ts`, `tiktok-ads.ts`), NÃO Windsor.ai.**

Motivo: o projeto já possui clients funcionais e autenticados para Meta/Google/TikTok, com CRUD completo (não só leitura). Trocar por Windsor.ai significaria:
- Duplicar credenciais/conexões já configuradas
- Perder a capacidade de **escrita** (pausar campanha, ajustar orçamento) que os clients atuais já têm e que o módulo precisa (ex.: "Qual anúncio devo pausar?" exige ação, não só leitura)
- Adicionar uma dependência externa nova quando o caminho interno já resolve

**Caminho recomendado, sem quebrar nada:**
1. Criar tabela `metricas_diarias` (campanha_id, canal, data, impressões, cliques, gasto, conversões, etc.) via nova migration — aditiva, não altera `campanhas`/`clientes`
2. Criar job agendado (cron route ou Supabase Edge Function) que chama `meta-ads.ts`/`google-ads.ts`/`tiktok-ads.ts` diariamente e grava em `metricas_diarias`
3. Dashboard, alertas e relatórios consultam `metricas_diarias` (read-only, isolado do fluxo de campanhas atual)
4. Se no futuro for necessário cobrir canais sem client próprio (ex. GA4, Search Console), aí sim avaliar Windsor.ai como complemento pontual — não substituição

### 3. Provedor de API do WhatsApp
✅ **Usar o que já existe: Evolution API** (`/lib` + `/app/api/whatsapp/*`, env vars `EVOLUTION_API_URL`/`EVOLUTION_API_KEY`/`EVOLUTION_INSTANCE_NAME`).

Não há motivo para trocar de provedor — a integração já está funcional (status, envio, webhook, QR code). O módulo de métricas de WhatsApp deve:
- Consumir os eventos já capturados pelo webhook (`messages.upsert`) e persistir métricas agregadas (volume de conversas, tempo de resposta, conversões via WhatsApp) em tabela própria (ex. `metricas_whatsapp`)
- Reaproveitar `EVOLUTION_API_URL`/`EVOLUTION_API_KEY` sem novas credenciais

### 4. Permissões/RBAC
✅ **Reaproveitar o sistema existente** — `lib/permissoes.ts` + tabela `profiles` (coluna `role`: admin/gestor/criativo/cliente/viewer + array `permissoes` para overrides) + função `temPermissao()`.

Mapeamento sugerido para o módulo ampliado (alinhado aos 5 papéis já existentes, sem precisar dos papéis "Gestor Unidade"/"Consultor" propostos na spec original — usar os equivalentes já existentes):
- `admin` → acesso total ao Alcance Growth AI (incl. criação/edição de campanhas via IA)
- `gestor` → dashboard, relatórios, alertas, assistente IA, leitura de Meta/Google/Instagram/WhatsApp
- `cliente` → visão restrita: apenas dashboard executivo e relatórios do próprio cliente
- `viewer` → leitura básica do dashboard
- `criativo` → sem acesso direto ao módulo de tráfego (mantém escopo atual)

Basta adicionar os novos PageIds (ex. `trafego-dashboard`, `trafego-meta`, `trafego-google`, `trafego-instagram`, `trafego-whatsapp`, `trafego-relatorios`) ao array de permissões de cada papel em `permissoes.ts` — sem alterar a estrutura da tabela `profiles`.

---

## Ordem de implementação recomendada
1. Migration `metricas_diarias` (+ `metricas_whatsapp`) — aditiva
2. Job de sync diário usando os clients de API existentes
3. Adicionar lib de gráficos (recharts) + Dashboard Executivo dentro de `trafego`
4. Motor de alertas (Meta Ads) lendo `metricas_diarias`
5. Sub-abas Meta Ads / Google Ads / Instagram / WhatsApp dentro de `trafego`
6. Atualizar `permissoes.ts` com os novos PageIds
7. Fluxo "Criar Campanha" guiado por IA (estrutura + chamada real às APIs)
8. Geração/exportação de relatórios (PDF/Excel)
9. Evoluir o agente do `trafego` para consultar `metricas_diarias` em tempo real ao responder perguntas
