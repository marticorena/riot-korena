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
    if (!res.ok) throw new Error('Failed to fetch player')
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
   * @returns Array of Coaching Reports.
   */
  async getReports(puuid: string): Promise<CoachingReport[]> {
    const res = await fetch(`${BASE_URL}/reports/${puuid}`)
    if (!res.ok) throw new Error('Failed to fetch reports')
    return res.json()
  }
}

