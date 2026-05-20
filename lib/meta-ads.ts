/**
 * Meta Ads Graph API Client
 * Requer: META_ADS_ACCESS_TOKEN no .env.local
 * Documentação: https://developers.facebook.com/docs/marketing-apis
 */

const META_BASE = 'https://graph.facebook.com/v19.0'

function token() {
  return process.env.META_ADS_ACCESS_TOKEN || ''
}

function notConfigured() {
  return {
    error: true,
    message: 'META_ADS_ACCESS_TOKEN não configurado. Adicione no .env.local e reinicie o servidor.',
  }
}

async function apiFetch(url: string, options?: RequestInit) {
  if (!token()) return notConfigured()
  try {
    const res = await fetch(url, options)
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`)
    return data
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

// ── Contas ──────────────────────────────────────────────────────────────────

export async function getAdAccounts() {
  const fields = 'id,name,account_status,currency,timezone_name,amount_spent,balance'
  return apiFetch(`${META_BASE}/me/adaccounts?fields=${fields}&access_token=${token()}`)
}

// ── Campanhas ────────────────────────────────────────────────────────────────

export async function getCampaigns(accountId: string, status?: string) {
  const fields = 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,spend_cap,buying_type'
  const statusParam = status && status !== 'ALL'
    ? `&effective_status=["${status}"]`
    : ''
  return apiFetch(
    `${META_BASE}/${accountId}/campaigns?fields=${fields}${statusParam}&access_token=${token()}`
  )
}

export async function getAdSets(campaignId: string) {
  const fields = 'id,name,status,daily_budget,targeting,optimization_goal,billing_event,bid_amount'
  return apiFetch(
    `${META_BASE}/${campaignId}/adsets?fields=${fields}&access_token=${token()}`
  )
}

export async function getAds(adSetId: string) {
  const fields = 'id,name,status,creative,adset_id,campaign_id'
  return apiFetch(
    `${META_BASE}/${adSetId}/ads?fields=${fields}&access_token=${token()}`
  )
}

// ── Insights / Métricas ──────────────────────────────────────────────────────

const DATE_PRESETS: Record<string, string> = {
  today: 'today',
  yesterday: 'yesterday',
  last_7d: 'last_7_d',
  last_30d: 'last_30_d',
  last_90d: 'last_90_d',
}

export async function getInsights(
  accountId: string,
  period: string,
  level: string = 'campaign',
  campaignId?: string,
) {
  const datePreset = DATE_PRESETS[period] || 'last_30_d'
  const endpoint = campaignId
    ? `${META_BASE}/${campaignId}/insights`
    : `${META_BASE}/${accountId}/insights`

  const fields = [
    'campaign_name', 'campaign_id',
    'impressions', 'reach', 'frequency',
    'clicks', 'unique_clicks', 'ctr', 'unique_ctr',
    'spend', 'cpm', 'cpc', 'cpp',
    'actions', 'action_values',
    'conversions', 'cost_per_conversion',
    'purchase_roas',
  ].join(',')

  return apiFetch(
    `${endpoint}?fields=${fields}&date_preset=${datePreset}&level=${level}&access_token=${token()}`
  )
}

// ── Gerenciamento de campanhas ────────────────────────────────────────────────

export async function pauseCampaign(campaignId: string) {
  return apiFetch(`${META_BASE}/${campaignId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ status: 'PAUSED', access_token: token() }).toString(),
  })
}

export async function activateCampaign(campaignId: string) {
  return apiFetch(`${META_BASE}/${campaignId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ status: 'ACTIVE', access_token: token() }).toString(),
  })
}

export async function updateBudget(
  campaignId: string,
  dailyBudget?: number,
  lifetimeBudget?: number,
) {
  const params: Record<string, string> = { access_token: token() }
  if (dailyBudget) params.daily_budget = String(dailyBudget)
  if (lifetimeBudget) params.lifetime_budget = String(lifetimeBudget)

  return apiFetch(`${META_BASE}/${campaignId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
}

export async function createCampaign(
  accountId: string,
  name: string,
  objective: string,
  dailyBudget: number,
  status: string = 'PAUSED',
) {
  const params = new URLSearchParams({
    name,
    objective,
    daily_budget: String(dailyBudget),
    status,
    special_ad_categories: '[]',
    access_token: token(),
  })

  return apiFetch(`${META_BASE}/${accountId}/campaigns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  })
}

// ── Benchmarks e análise ──────────────────────────────────────────────────────

export async function getIndustryBenchmarks(accountId: string) {
  return apiFetch(
    `${META_BASE}/${accountId}?fields=business_country_code,currency&access_token=${token()}`
  )
}
