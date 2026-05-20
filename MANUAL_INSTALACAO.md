# ALCANCE+ — Manual Completo de Instalação

---

## OPÇÃO A — INSTALAÇÃO AUTOMÁTICA (Windows)

A forma mais rápida. Abre o PowerShell e executa um único comando:

```powershell
PowerShell -ExecutionPolicy Bypass -File "C:\Users\SEU_USUARIO\alcance+\scripts\instalar.ps1"
```

O script faz tudo sozinho:
- Verifica o Node.js
- Instala as dependências (`npm install`)
- Cria o arquivo `.env.local`
- Cria atalho na Área de Trabalho
- Inicia o servidor

---

## OPÇÃO B — INSTALAÇÃO MANUAL (passo a passo)

### PASSO 1 — Instalar o Node.js

1. Acesse **nodejs.org**
2. Clique no botão verde **"LTS"** (versão estável)
3. Baixe e instale normalmente (Next, Next, Finish)
4. **Reinicie o computador** após instalar
5. Para confirmar, abra o PowerShell e rode:
   ```powershell
   node --version
   npm --version
   ```
   Ambos devem mostrar um número de versão.

---

### PASSO 2 — Instalar as dependências

Abra o PowerShell na pasta do projeto e rode:

```powershell
cd C:\Users\SEU_USUARIO\alcance+
npm install
```

Aguarde terminar (pode demorar 2-5 minutos na primeira vez).

---

### PASSO 3 — Criar o arquivo de configuração

Na pasta `C:\Users\SEU_USUARIO\alcance+`, crie um arquivo chamado **`.env.local`**

> No Windows: abra o Bloco de Notas → Arquivo → Salvar Como → mude "Documentos de Texto" para "Todos os Arquivos" → salve como `.env.local`

Cole este conteúdo e preencha as chaves:

```env
NEXT_PUBLIC_SUPABASE_URL=cole_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=cole_aqui
ANTHROPIC_API_KEY=cole_aqui
```

---

### PASSO 4 — Configurar o Supabase

1. Acesse **supabase.com** → crie uma conta gratuita
2. Clique em **"New Project"**
3. Dê o nome `alcance-plus`, escolha uma senha e clique em criar
4. Aguarde ~2 minutos
5. Vá em **Project Settings → API**
6. Copie:
   - **Project URL** → cole em `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Vá em **SQL Editor → New Query**
8. Cole o conteúdo do arquivo `supabase/migrations/001_initial.sql`
9. Clique em **RUN**

---

### PASSO 5 — Configurar a API da Anthropic (Agentes IA)

1. Acesse **console.anthropic.com**
2. Crie uma conta e faça login
3. Vá em **API Keys → Create Key**
4. Copie a chave (começa com `sk-ant-...`)
5. Cole em `ANTHROPIC_API_KEY` no `.env.local`

---

### PASSO 6 — Rodar o sistema

```powershell
npm run dev
```

Abra o navegador em: **http://localhost:3000**

---

## WHATSAPP — INTEGRAÇÃO COM OS AGENTES IA

Para que os agentes IA (Tráfego, Editor, iFood, Dev) respondam no WhatsApp automaticamente.

### O QUE É A EVOLUTION API?

A Evolution API é um software gratuito e open-source que conecta seu número de WhatsApp a sistemas externos. É muito usada no Brasil para automações.

- **GitHub:** github.com/EvolutionAPI/evolution-api
- **Documentação:** doc.evolution-api.com

---

### OPÇÃO 1 — Evolution API no seu computador (local)

Funciona apenas enquanto o computador estiver ligado. Bom para testar.

#### Pré-requisito: instalar o Docker Desktop

1. Acesse **docker.com/products/docker-desktop**
2. Baixe e instale o Docker Desktop para Windows
3. Reinicie o computador

#### Instalar a Evolution API

Abra o PowerShell e rode:

```powershell
# Criar pasta para a Evolution API
mkdir C:\evolution-api
cd C:\evolution-api

# Baixar o arquivo de configuração
curl -o docker-compose.yml https://raw.githubusercontent.com/EvolutionAPI/evolution-api/main/docker-compose.yml
```

Crie um arquivo `C:\evolution-api\.env` com:

```env
AUTHENTICATION_API_KEY=alcance_key_segura_123
```

Rode a Evolution API:

```powershell
docker-compose up -d
```

Acesse o painel em: **http://localhost:8080**

---

#### Conectar o WhatsApp

1. Acesse **http://localhost:8080**
2. Use a API Key: `alcance_key_segura_123`
3. Crie uma instância:
   ```
   POST http://localhost:8080/instance/create
   Headers: apikey: alcance_key_segura_123
   Body: { "instanceName": "alcance", "qrcode": true }
   ```
4. Escaneie o QR Code com o WhatsApp do celular
5. Instância conectada ✅

---

#### Configurar o Webhook (receber mensagens)

Configure para o Alcance+ receber as mensagens:

```
POST http://localhost:8080/webhook/set/alcance
Headers: apikey: alcance_key_segura_123
Body:
{
  "url": "http://localhost:3000/api/whatsapp/webhook",
  "webhook_by_events": false,
  "events": ["MESSAGES_UPSERT"]
}
```

---

#### Atualizar o `.env.local`

```env
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=alcance_key_segura_123
EVOLUTION_INSTANCE_NAME=alcance
```

Reinicie o Alcance+:
```powershell
npm run dev
```

**Pronto!** Mensagens enviadas ao WhatsApp conectado serão respondidas automaticamente pelo agente IA correto.

---

### OPÇÃO 2 — Evolution API em servidor online (recomendado para produção)

Para funcionar 24 horas sem precisar manter o computador ligado.

#### Serviços recomendados (gratuitos ou baratos):

| Serviço | Preço | Link |
|---------|-------|------|
| Railway | ~$5/mês | railway.app |
| Render | Gratuito (limitado) | render.com |
| VPS Hostinger | ~R$30/mês | hostinger.com.br |

#### Deploy na Railway (mais simples):

1. Acesse **railway.app** e crie uma conta
2. Clique em **"New Project" → "Deploy from GitHub repo"**
3. Fork o repositório: `github.com/EvolutionAPI/evolution-api`
4. Configure as variáveis de ambiente:
   ```
   AUTHENTICATION_API_KEY=sua_chave_segura
   DATABASE_ENABLED=true
   ```
5. Aguarde o deploy
6. Copie a URL gerada (ex: `https://evolution-api-production.up.railway.app`)
7. Use essa URL no `.env.local` do Alcance+

---

### TESTAR A INTEGRAÇÃO

Envie uma mensagem para o número do WhatsApp conectado:

```
"Tenho uma hamburgueria, quais produtos devo colocar no iFood?"
```

O sistema deve:
1. Detectar que é uma pergunta sobre iFood
2. Acionar o Expert iFood IA
3. Responder automaticamente no WhatsApp em segundos

**Outros exemplos de teste:**
- `"Como pausar minha campanha do Meta Ads?"` → Agente de Tráfego responde
- `"Crie um roteiro de Reel viral"` → Editor de Vídeos responde
- `"Estou com erro no npm install"` → Developer IA responde

---

## DEPLOY NA INTERNET (para acessar de qualquer lugar)

### Vercel (gratuito — recomendado)

1. Acesse **vercel.com** e crie uma conta com Google
2. Instale a CLI da Vercel:
   ```powershell
   npm install -g vercel
   ```
3. Na pasta do projeto:
   ```powershell
   cd C:\Users\SEU_USUARIO\alcance+
   vercel
   ```
4. Siga as instruções (Enter em tudo para aceitar padrões)
5. Quando perguntar "Overrides?" → N
6. Copie a URL gerada
7. Adicione as variáveis de ambiente em:
   **Vercel Dashboard → seu projeto → Settings → Environment Variables**
   
   Adicione todas as variáveis do `.env.local`

8. Redeploy:
   ```powershell
   vercel --prod
   ```

---

## PROBLEMAS COMUNS

| Erro | Causa | Solução |
|------|-------|---------|
| `node não reconhecido` | Node.js não instalado | Instale em nodejs.org e reinicie o PC |
| `Cannot find module` | npm install não rodou | Rode `npm install` na pasta do projeto |
| Tela branca após login | Supabase não configurado | Verifique URL e chave no .env.local |
| `ANTHROPIC_API_KEY invalid` | Chave errada ou expirada | Gere uma nova chave em console.anthropic.com |
| Agente não responde no WhatsApp | Webhook não configurado | Verifique a URL do webhook na Evolution API |
| `Port 3000 already in use` | Outro processo na porta | Rode `npx kill-port 3000` e tente novamente |

---

## SUPORTE TÉCNICO

Use o **Developer IA** dentro do próprio Alcance+ (`/dev`) para:
- Resolver qualquer erro de instalação
- Criar novas funcionalidades
- Configurar integrações
- Otimizar o sistema

O Developer IA sabe tudo sobre o projeto e entrega soluções prontas para copiar e colar.
