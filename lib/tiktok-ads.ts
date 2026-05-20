/**
 * TikTok Business API v1.3
 * Requer no .env.local:
 *   TIKTOK_ADS_ACCESS_TOKEN
 *   TIKTOK_ADS_APP_ID
 *   TIKTOK_ADS_SECRET
 */

const TIKTOK_BASE = 'https://business-api.tiktok.com/open_api/v1.3'

function accessToken(): string {
  return process.env.TIKTOK_ADS_ACCESS_TOKEN || ''
}

function notConfigured() {
  return {
    error: true,
    message: 'TikTok Ads não configurado. Adicione TIKTOK_ADS_ACCESS_TOKEN no .env.local',
  }
}

async function tikTokGet(path: string, params: Record<string, string> = {}) {
  if (!accessToken()) return notConfigured()

  try {
    const url = new URL(`${TIKTOK_BASE}${path}`)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

    const res = await fetch(url.toString(), {
      headers: {
        'Access-Token': accessToken(),
        'Content-Type': 'application/json',
      },
    })

    const data = await res.json()
    if (data.code !== 0) throw new Error(data.message || `Erro TikTok: ${data.code}`)
    return data.data
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

async function tikTokPost(path: string, body: Record<string, unknown>) {
  if (!accessToken()) return notConfigured()

  try {
    const res = await fetch(`${TIKTOK_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Access-Token': accessToken(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    if (data.code !== 0) throw new Error(data.message || `Erro TikTok: ${data.code}`)
    return data.data
  } catch (err) {
    return { error: true, message: err instanceof Error ? err.message : 'Erro desconhecido' }
  }
}

// ── Contas ────────────────────────────────────────────────────────────────────

export async function getAdAccounts() {
  return tikTokGet('/oauth2/advertiser/get/')
}

// ── Campanhas ─────────────────────────────────────────────────────────────────

export async function getCampaigns(advertiserId: string, status?: string) {
  const params: Record<string, string> = { advertiser_id: advertiserId }
  if (status && status !== 'ALL') params.primary_status = status

  return tikTokGet('/campaign/get/', params)
}

// ── Insights ──────────────────────────────────────────────────────────────────

function getDateRange(daysBack: number, endDaysBack: number) {
  const end = new Date()
  end.setDate(end.getDate() - endDaysBack)
  const start = new Date()
  start.setDate(start.getDate() - daysBack)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

function getDateRangeForPeriod(period: string) {
  const map: Record<string, () => { start: string; end: string }> = {
    today:     () => getDateRange(0, 0),
    yesterday: () => getDateRange(1, 1),
    last_7d:   () => getDateRange(7, 0),
    last_30d:  () => getDateRange(30, 0),
    last_90d:  () => getDateRange(90, 0),
  }
  return (map[period] ?? map.last_30d)()
}

export async function getInsights(advertiserId: string, period: string, level: string = 'CAMPAIGN') {
  const range = getDateRangeForPeriod(period)

  const levelMap: Record<string, string> = {
    campaign: 'CAMPAIGN',
    adset: 'ADGROUP',
    ad: 'AD',
    account: 'ADVERTISER',
  }

  const dataLevel = levelMap[level] || 'CAMPAIGN'

  return tikTokPost('/report/integrated/get/', {
    advertiser_id: advertiserId,
    report_type: 'BASIC',
    data_level: dataLevel,
    dimensions: ['campaign_id', 'stat_time_day'],
    metrics: [
      'campaign_name',
      'spend',
      'impressions',
      'clicks',
      'ctr',
      'cpc',
      'cpm',
      'reach',
      'frequency',
      'conversion',
      'cost_per_conversion',
      'video_play_actions',
      'video_watched_2s',
      'video_watched_6s',
    ],
    start_date: range.start,
    end_date: range.end,
    page_size: 50,
  })
}

// ── Gerenciamento ─────────────────────────────────────────────────────────────

export async function pauseCampaign(advertiserId: string, campaignId: string) {
  return tikTokPost('/campaign/status/update/', {
    advertiser_id: advertiserId,
    campaign_ids: [campaignId],
    operation_status: 'DISABLE',
  })
}

export async function enableCampaign(advertiserId: string, campaignId: string) {
  return tikTokPost('/campaign/status/update/', {
    advertiser_id: advertiserId,
    campaign_ids: [campaignId],
    operation_status: 'ENABLE',
  })
}

export async function updateBudget(advertiserId: string, campaignId: string, budget: number) {
  return tikTokPost('/campaign/update/', {
    advertiser_id: advertiserId,
    campaign_id: campaignId,
    budget,
  })
}

export async function createCampaign(
  advertiserId: string,
  name: string,
  objective: string,
  budget: number,
  budgetMode: string = 'BUDGET_MODE_DAY',
) {
  return tikTokPost('/campaign/create/', {
    advertiser_id: advertiserId,
    campaign_name: name,
    objective_type: objective || 'TRAFFIC',
    budget_mode: budgetMode,
    budget,
    operation_status: 'DISABLE',
  })
}
