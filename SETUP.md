# Alcance+ — Guia Completo de Configuração

> Siga esta ordem. Cada etapa desbloqueia mais funcionalidades do sistema.

---

## ✅ ETAPA 1 — Supabase (Banco de Dados)

**O que desbloqueia:** Dashboard, Clientes, Pipeline, Financeiro, Projetos, Propostas, Calendário, Equipe

### Passo a passo:

1. Acesse **https://supabase.com** e crie uma conta gratuita
2. Clique em **"New Project"**
   - Nome: `alcance-plus`
   - Senha do banco: anote em lugar seguro
   - Região: `South America (São Paulo)`
3. Aguarde criar (1-2 minutos)
4. Vá em **Settings → API**
5. Copie:
   - `Project URL` → cole em `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → cole em `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Vá em **SQL Editor** → clique em **"New query"**
7. Abra o arquivo `supabase/schema.sql` deste projeto, copie tudo e cole no SQL Editor
8. Clique em **"Run"** — todas as tabelas serão criadas

### No .env.local:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

---

## ✅ ETAPA 2 — Anthropic / Claude IA

**O que desbloqueia:** FIGUEIREDO, Agente de Tráfego, Editor de Vídeos, Expert iFood, Developer IA, Bot WhatsApp

### Passo a passo:

1. Acesse **https://console.anthropic.com**
2. Crie uma conta (ou faça login)
3. Vá em **"API Keys"** no menu lateral
4. Clique em **"Create Key"**
5. Dê um nome: `alcance-plus`
6. Copie a chave (começa com `sk-ant-api03-...`)
7. **Atenção:** essa chave aparece só uma vez — salve agora!

### No .env.local:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxx
```

---

## ✅ ETAPA 3 — Meta Ads (Facebook + Instagram)

**O que desbloqueia:** Agente de Tráfego Meta, relatórios de campanhas Facebook/Instagram

### Passo a passo:

1. Acesse **https://developers.facebook.com/tools/explorer**
2. Faça login com sua conta do Facebook que tem acesso ao Gerenciador de Anúncios
3. Selecione o app (ou crie um em developers.facebook.com → "My Apps" → "Create App")
4. Em **"Permissions"**, adicione:
   - `ads_management`
   - `ads_read`
   - `business_management`
5. Clique em **"Generate Access Token"**
6. Copie o token gerado

> 💡 Para um token de longa duração (não expira em 1h), use o **Token de Acesso do Sistema** no Meta Business Suite → Configurações → Usuários do Sistema

### No .env.local:
```
META_ADS_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxx
```

---

## ✅ ETAPA 4 — Google Ads

**O que desbloqueia:** Agente de Tráfego Google, relatórios Google Ads

### Passo a passo:

**4.1 — Developer Token:**
1. Acesse **https://ads.google.com/aw/apicenter**
2. Clique em **"Solicitar acesso à API"**
3. Preencha o formulário (pode levar alguns dias para aprovação)
4. Após aprovado, copie o **Developer Token**

**4.2 — OAuth Credentials:**
1. Acesse **https://console.cloud.google.com**
2. Crie um projeto: `alcance-plus`
3. Vá em **"APIs & Services" → "Library"** → ative **Google Ads API**
4. Vá em **"Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"**
   - Tipo: Web Application
   - Redirect URI: `http://localhost:3000`
5. Copie `Client ID` e `Client Secret`

**4.3 — Refresh Token:**
1. Use a ferramenta: **https://developers.google.com/oauthplayground**
2. Cole seu Client ID e Secret
3. Autorize o escopo: `https://www.googleapis.com/auth/adwords`
4. Clique em **"Exchange authorization code for tokens"**
5. Copie o **Refresh Token**

**4.4 — Manager Account ID (MCC):**
- Se você tem conta MCC, encontre o ID em: ads.google.com → ID da conta no topo (formato: XXX-XXX-XXXX)

### No .env.local:
```
GOOGLE_ADS_DEVELOPER_TOKEN=seu_developer_token
GOOGLE_ADS_CLIENT_ID=xxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_ADS_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxx
GOOGLE_ADS_REFRESH_TOKEN=1//xxxxxxxxxxxxxxx
GOOGLE_ADS_MANAGER_ACCOUNT_ID=123-456-7890
```

---

## ✅ ETAPA 5 — TikTok Ads

**O que desbloqueia:** Agente de Tráfego TikTok, relatórios TikTok Ads

### Passo a passo:

1. Acesse **https://ads.tiktok.com/marketing_api/apps/**
2. Faça login com conta de anunciante TikTok
3. Clique em **"Create an app"**
   - Nome: `Alcance Plus`
   - Tipo: `Web`
4. Após criar, vá em **"App Detail"**
5. Copie o `App ID` e o `Secret`
6. Para gerar o Access Token:
   - Vá em **https://business-api.tiktok.com/portal/docs**
   - Siga o fluxo OAuth para gerar o token de longa duração

### No .env.local:
```
TIKTOK_ADS_ACCESS_TOKEN=seu_access_token_tiktok
```

---

## ✅ ETAPA 6 — WhatsApp via Evolution API

**O que desbloqueia:** Bot do WhatsApp respondendo como FIGUEIREDO + todos os agentes IA

### Opção A — Hospedagem na Railway (Recomendado — mais fácil)

1. Acesse **https://railway.app** e crie conta gratuita
2. Clique em **"New Project" → "Deploy from Template"**
3. Busque por `Evolution API` e clique em Deploy
4. Aguarde o deploy (2-3 minutos)
5. Vá em **Settings** do serviço e copie a URL pública (ex: `https://evolution-xxx.railway.app`)
6. Acesse a URL + `/manager` para entrar no painel
7. Crie uma instância:
   - Nome: `alcance`
   - Clique em **"Connect WhatsApp"**
   - Escaneie o QR Code com seu WhatsApp
8. Vá em **Instances → alcance → Webhook**
   - URL: `https://SEU-DOMINIO.com/api/whatsapp/webhook`
   - Events: marque `MESSAGES_UPSERT`
9. Salve e copie a `API Key` da instância

### Opção B — Docker local (para desenvolvimento)
```bash
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=minha-chave-secreta \
  atendai/evolution-api:latest
```

### No .env.local:
```
EVOLUTION_API_URL=https://evolution-xxx.railway.app
EVOLUTION_API_KEY=sua-api-key-aqui
EVOLUTION_INSTANCE_NAME=alcance
```

### ⚠️ IMPORTANTE — Para o webhook funcionar, o sistema precisa estar online!
Se estiver só no seu computador, use **ngrok** para expor localmente:
```bash
npx ngrok http 3000
```
Copie a URL https gerada e use no webhook da Evolution.

---

## ✅ ETAPA 7 — Magnific AI (Criador de Arte)

**O que desbloqueia:** Upscaling e enhancement de imagens com IA

### Passo a passo:

1. Acesse **https://magnific.ai**
2. Crie uma conta
3. Vá em **Settings → API Keys**
4. Clique em **"Create new key"**
5. Copie a chave

### No .env.local:
```
MAGNIFIC_API_KEY=sua-chave-magnific
```

---

## 🚀 Publicar o sistema online (para WhatsApp funcionar)

### Recomendado: Vercel (gratuito)

1. Acesse **https://vercel.com** e crie conta com GitHub
2. Suba o projeto para o GitHub:
   ```bash
   git init
   git add .
   git commit -m "Alcance+ inicial"
   git remote add origin https://github.com/SEU-USUARIO/alcance-plus.git
   git push -u origin main
   ```
3. No Vercel: **"New Project" → importe o repositório**
4. Em **"Environment Variables"**, adicione todas as chaves do `.env.local`
5. Clique em **Deploy**
6. Você receberá uma URL como `https://alcance-plus.vercel.app`
7. Use essa URL no webhook da Evolution API

---

## 📋 Checklist Final

```
[ ] 1. Supabase — URL e chave anon configuradas + schema.sql executado
[ ] 2. Anthropic — sk-ant-... configurada
[ ] 3. Meta Ads — token configurado
[ ] 4. Google Ads — todas as 5 chaves configuradas
[ ] 5. TikTok Ads — token configurado
[ ] 6. WhatsApp — Evolution API rodando + webhook apontado + QR escaneado
[ ] 7. Magnific — chave configurada
[ ] 8. Sistema online (Vercel ou outro) para WhatsApp funcionar
```

---

## ❓ Ordem de prioridade se quiser ir por etapas

| Prioridade | O que fazer primeiro |
|---|---|
| 🔴 Hoje | Supabase + Anthropic — liga 80% do sistema |
| 🟠 Esta semana | Meta Ads + WhatsApp — adiciona tráfego e bot |
| 🟡 Próximas semanas | Google Ads + TikTok + Magnific |

---

> Dúvidas? Me manda qualquer etapa e eu te ajudo passo a passo!
