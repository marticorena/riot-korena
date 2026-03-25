const BASE_URL = 'http://localhost:8000/api/v1'

export interface CoachingReport {
  id: string
  puuid: string
  generated_at: string
  critical_moments: Record<string, any>
  habits: Record<string, any>
  training_plan: Record<string, any>
}

export interface Player {
  puuid: string
  game_name: string
  tag_line: string
  region: string
}

export const apiClient = {
  async getPlayer(region: string, gameName: string, tagLine: string): Promise<Player> {
    const res = await fetch(`${BASE_URL}/players/${region}/${gameName}/${tagLine}`)
    if (!res.ok) throw new Error('Failed to fetch player')
    return res.json()
  },

  async ingestMatch(puuid: string, matchData: any, timelineData: any) {
    const res = await fetch(`${BASE_URL}/matches/ingest/${puuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_data: matchData, timeline_data: timelineData })
    })
    if (!res.ok) throw new Error('Failed to ingest match')
    return res.json()
  },

  async getReports(puuid: string): Promise<CoachingReport[]> {
    const res = await fetch(`${BASE_URL}/reports/${puuid}`)
    if (!res.ok) throw new Error('Failed to fetch reports')
    return res.json()
  }
}
