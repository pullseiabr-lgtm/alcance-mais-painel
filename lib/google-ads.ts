/**
 * Google Ads API Client — v18
 * Requer no .env.local:
 *   GOOGLE_ADS_DEVELOPER_TOKEN
 *   GOOGLE_ADS_CLIENT_ID
 *   GOOGLE_ADS_CLIENT_SECRET
 *   GOOGLE_ADS_REFRESH_TOKEN
 *   GOOGLE_ADS_MANAGER_ACCOUNT_ID   (MCC, ex: 123-456-7890)
 */

const GOOGLE_ADS_BASE = 'https://googleads.googleapis.com/v18'
const OAUTH_URL = 'https://oauth2.googleapis.com/token'

// ── Auth ──────────────────────────────────────────────────────────────────────

let cachedAccessToken: string | null = null
let tokenExpiry = 0

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiry - 60_000) {
    return cachedAccessToken
  }

  const { GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN } = process.env

  if (!GOOGLE_ADS_CLIENT_ID || !GOOGLE_ADS_CLIENT_SECRET || !GOOGLE_ADS_REFRESH_TOKEN) {
    throw new Error('Credenciais Google Ads não configuradas (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)')
  }

  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_ADS_CLIENT_ID,
      client_secret: GOOGLE_ADS_CLIENT_SECRET,
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }).toString(),
  })

  const data = await res.json()
  if (!res.ok || !data.access_token) {
    throw new Error(`Google OAuth erro: ${data.error_description || data.error}`)
  }

  cachedAccessToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in || 3600) * 1000
  return cachedAccessToken!
}

function devToken(): string {
  return process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''
}

function notConfigured() {
  return {
    error: true,
    message: 'Google Ads não configurado. Adicione GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET e GOOGLE_ADS_REFRESH_TOKEN no .env.local',
  }
}

async function gaqlQuery(customerId: string, query: string) {
  if (!devToken()) return notConfigured()

  try {
    const accessToken = await getAccessToken()
    const cleanId = customerId.replace(/-/g, '')

    const res = await fetch(`${GOOGLE_ADS_BASE}/customers/${cleanId}/googleAds:search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': devToken(),
        'Content-Type': 'application/json',
        ...(process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID
          ? { 'login-customer-id': process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID.replace(/-/g, '') }
          : {}),
      },
      body: JSON.stringify({ query }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`)
    return data
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

// ── Contas ────────────────────────────────────────────────────────────────────

export async function getAccessibleCustomers() {
  if (!devToken()) return notConfigured()

  try {
    const accessToken = await getAccessToken()
    const res = await fetch(`${GOOGLE_ADS_BASE}/customers:listAccessibleCustomers`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': devToken(),
      },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`)
    return data
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

// ── Campanhas ─────────────────────────────────────────────────────────────────

export async function getCampaigns(customerId: string, status?: string) {
  const statusFilter = status && status !== 'ALL'
    ? `AND campaign.status = '${status}'`
    : ''

  return gaqlQuery(customerId, `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.bidding_strategy_type,
      campaign_budget.amount_micros,
      campaign_budget.delivery_method,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.conversions,
      metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date DURING LAST_30_DAYS
    ${statusFilter}
    ORDER BY metrics.cost_micros DESC
    LIMIT 50
  `)
}

// ── Insights ──────────────────────────────────────────────────────────────────

const GAQL_DATE: Record<string, string> = {
  today: 'TODAY',
  yesterday: 'YESTERDAY',
  last_7d: 'LAST_7_DAYS',
  last_30d: 'LAST_30_DAYS',
  last_90d: 'LAST_90_DAYS',
}

export async function getInsights(customerId: string, period: string, level: string = 'campaign') {
  const dateRange = GAQL_DATE[period] || 'LAST_30_DAYS'

  const levelMap: Record<string, string> = {
    campaign: 'campaign',
    adset: 'ad_group',
    ad: 'ad_group_ad',
    account: 'customer',
  }

  const resource = levelMap[level] || 'campaign'

  const queries: Record<string, string> = {
    campaign: `
      SELECT
        campaign.id, campaign.name, campaign.status,
        metrics.impressions, metrics.clicks, metrics.ctr,
        metrics.cost_micros, metrics.average_cpc, metrics.average_cpm,
        metrics.conversions, metrics.cost_per_conversion,
        metrics.all_conversions_value, metrics.view_through_conversions
      FROM campaign
      WHERE segments.date DURING ${dateRange}
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `,
    ad_group: `
      SELECT
        campaign.name, ad_group.id, ad_group.name, ad_group.status,
        metrics.impressions, metrics.clicks, metrics.ctr,
        metrics.cost_micros, metrics.average_cpc,
        metrics.conversions, metrics.cost_per_conversion
      FROM ad_group
      WHERE segments.date DURING ${dateRange}
      ORDER BY metrics.cost_micros DESC
      LIMIT 50
    `,
    customer: `
      SELECT
        metrics.impressions, metrics.clicks, metrics.ctr,
        metrics.cost_micros, metrics.average_cpc, metrics.average_cpm,
        metrics.conversions, metrics.cost_per_conversion,
        metrics.all_conversions_value
      FROM customer
      WHERE segments.date DURING ${dateRange}
    `,
  }

  return gaqlQuery(customerId, queries[resource] || queries.campaign)
}

// ── Gerenciamento ─────────────────────────────────────────────────────────────

async function mutateCampaign(customerId: string, campaignId: string, fields: Record<string, unknown>) {
  if (!devToken()) return notConfigured()

  try {
    const accessToken = await getAccessToken()
    const cleanId = customerId.replace(/-/g, '')

    const res = await fetch(`${GOOGLE_ADS_BASE}/customers/${cleanId}/campaigns:mutate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': devToken(),
        'Content-Type': 'application/json',
        ...(process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID
          ? { 'login-customer-id': process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID.replace(/-/g, '') }
          : {}),
      },
      body: JSON.stringify({
        operations: [{
          update: {
            resourceName: `customers/${cleanId}/campaigns/${campaignId}`,
            ...fields,
          },
          updateMask: Object.keys(fields).join(','),
        }],
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`)
    return data
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function pauseCampaign(customerId: string, campaignId: string) {
  return mutateCampaign(customerId, campaignId, { status: 'PAUSED' })
}

export async function enableCampaign(customerId: string, campaignId: string) {
  return mutateCampaign(customerId, campaignId, { status: 'ENABLED' })
}

export async function updateBudget(customerId: string, budgetId: string, amountMicros: number) {
  if (!devToken()) return notConfigured()

  try {
    const accessToken = await getAccessToken()
    const cleanId = customerId.replace(/-/g, '')

    const res = await fetch(`${GOOGLE_ADS_BASE}/customers/${cleanId}/campaignBudgets:mutate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': devToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [{
          update: {
            resourceName: `customers/${cleanId}/campaignBudgets/${budgetId}`,
            amountMicros,
          },
          updateMask: 'amount_micros',
        }],
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`)
    return data
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

export async function createCampaign(
  customerId: string,
  name: string,
  channelType: string,
  budgetAmountMicros: number,
  status: string = 'PAUSED',
) {
  if (!devToken()) return notConfigured()

  try {
    const accessToken = await getAccessToken()
    const cleanId = customerId.replace(/-/g, '')

    // 1. Create budget
    const budgetRes = await fetch(`${GOOGLE_ADS_BASE}/customers/${cleanId}/campaignBudgets:mutate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': devToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [{
          create: {
            name: `${name} — Budget`,
            amountMicros: budgetAmountMicros,
            deliveryMethod: 'STANDARD',
          },
        }],
      }),
    })

    const budgetData = await budgetRes.json()
    if (!budgetRes.ok) throw new Error(budgetData?.error?.message || 'Erro ao criar orçamento')

    const budgetResourceName = budgetData.results[0].resourceName

    // 2. Create campaign
    const campaignRes = await fetch(`${GOOGLE_ADS_BASE}/customers/${cleanId}/campaigns:mutate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': devToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operations: [{
          create: {
            name,
            status,
            advertisingChannelType: channelType || 'SEARCH',
            campaignBudget: budgetResourceName,
            targetSpend: {},
          },
        }],
      }),
    })

    const campaignData = await campaignRes.json()
    if (!campaignRes.ok) throw new Error(campaignData?.error?.message || 'Erro ao criar campanha')
    return campaignData
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}
