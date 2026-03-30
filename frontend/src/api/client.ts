const BASE_URL = 'http://localhost:8000/api/v1'

/**
 * Represents a Coaching Report fetched from the backend.
 */
export interface CoachingReport {
  id: string
  puuid: string
  generated_at: string
  critical_moments: Record<string, unknown>
  habits: Record<string, unknown>
  training_plan: Record<string, unknown>
}

/**
 * Represents a mapped Player profile.
 */
export interface Player {
  puuid: string
  game_name: string
  tag_line: string
  region: string
  summoner_level?: number
  profile_icon_id?: number
  summoner_id?: string
}

/**
 * Rank dictionary schema from League-V4
 */
export interface RankEntry {
  queueType: string
  tier?: string
  rank?: string
  leaguePoints?: number
  wins?: number
  losses?: number
}

/**
 * Response returned from the ingest Match endpoint.
 */
export interface IngestMatchResponse {
  status: string
  report_id: string
}

/**
 * API client to communicate with the FastAPI backend.
 */
export const apiClient = {
  /**
   * Fetch player properties by Riot ID.
   * @param region - The Riot routing region (e.g., NA1).
   * @param gameName - The player's game name.
   * @param tagLine - The player's tag line.
   * @returns Detailed player object.
   */
  async getPlayer(region: string, gameName: string, tagLine: string): Promise<Player> {
    const res = await fetch(`${BASE_URL}/players/${region}/${gameName}/${tagLine}`)
    if (!res.ok) {
      let errMsg = 'Failed to fetch player'
      try {
        const data = await res.json()
        errMsg = data?.detail || errMsg
      } catch (e) {}
      throw new Error(errMsg)
    }
    return res.json()
  },

  /**
   * Upload raw match and timeline payload for heuristic analysis.
   * @param puuid - the specific player PUUID.
   * @param matchData - raw match JSON state.
   * @param timelineData - raw timeline JSON state.
   * @returns Generated report success schema.
   */
  async ingestMatch(puuid: string, matchData: Record<string, unknown>, timelineData: Record<string, unknown>): Promise<IngestMatchResponse> {
    const res = await fetch(`${BASE_URL}/matches/ingest/${puuid}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ match_data: matchData, timeline_data: timelineData })
    })
    if (!res.ok) throw new Error('Failed to ingest match')
    return res.json()
  },

  /**
   * Retrieve all generated coaching reports for a player.
   * @param puuid - the unique player identifier.
   * @param role - optional positional filter bounding queries.
   * @returns Array of Coaching Reports.
   */
  async getReports(puuid: string, role?: string): Promise<CoachingReport[]> {
    const url = role ? `${BASE_URL}/reports/${puuid}?role=${role}` : `${BASE_URL}/reports/${puuid}`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch reports')
    return res.json()
  },

  /**
   * Fast load recent match summaries for the dashboard history view.
   */
  async getMatchHistory(puuid: string, region: string, role?: string): Promise<any[]> {
    const url = role ? `${BASE_URL}/players/${region}/by-puuid/${puuid}/history?role=${role}` : `${BASE_URL}/players/${region}/by-puuid/${puuid}/history`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch history')
    return res.json()
  },

  /**
   * Fetch specific ranked stats nested independently.
   * @param region - The Riot routing region.
   * @param puuid - The player's unique identifier.
   */
  async getPlayerRanks(region: string, puuid: string): Promise<RankEntry[]> {
    const res = await fetch(`${BASE_URL}/players/${region}/by-puuid/${puuid}/ranks`)
    if (!res.ok) {
      // Return empty instead of crashing the UI entirely if rankings fail
      console.warn("Could not fetch rankings.")
      return []
    }
    return res.json()
  },

  /**
   * Auto-fetch and analyze the latest match for a player.
   */
  async analyzeMatch(region: string, puuid: string, role?: string): Promise<CoachingReport> {
    const url = role ? `${BASE_URL}/matches/analyze/${region}/${puuid}?role=${role}` : `${BASE_URL}/matches/analyze/${region}/${puuid}`
    const res = await fetch(url, {
      method: 'POST'
    })
    if (!res.ok) throw new Error('Failed to analyze match')
    return res.json()
  }
}

