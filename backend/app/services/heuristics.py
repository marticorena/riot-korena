"""Heuristics Engine for analyzing raw Riot match data.

This module processes League of Legends matches to extract player habits
and recommend actionable coaching concepts.
"""

import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)

# Heuristic Processing Constants
MAX_MATCHES_TO_ANALYZE = 10
LATE_ROAM_SECONDS_THRESHOLD = 45  # Seconds out of lane without an assist/kill.
CRITICAL_DEATH_SECONDS_THRESHOLD = 45  # Seconds dying before an objective spawns.
MIN_WARDS_BEFORE_OBJECTIVE = 2  # Minimum wards expected before an objective.
WARDING_WINDOW_SECONDS = 60  # Time window before objective to check wards.


class CoachingHeuristicsEngine:
    """Core heuristics processing engine for player progression."""

    def __init__(self) -> None:
        """Initialize the Heuristics engine."""
        pass

    async def analyze_match(
        self, match_data: Dict[str, Any], timeline_data: Dict[str, Any], puuid: str
    ) -> Dict[str, Any]:
        """Execute Phase 1 heuristics parsing timeline frames and Support habits.

        Args:
            match_data (Dict[str, Any]): Raw match state from Riot API.
            timeline_data (Dict[str, Any]): Expanded time-series events.
            puuid (str): The Player Unique Identifier.

        Returns:
            Dict[str, Any]: Dictionary matching CoachingReport properties.
        """
        logger.info(f"Running heuristics analysis for PUUID {puuid[:8]}...")

        participant_id = None
        for p in match_data.get("info", {}).get("participants", []):
            if p.get("puuid") == puuid:
                participant_id = p.get("participantId")
                break

        if not participant_id:
            return {
                "critical_moments": {},
                "habits": {},
                "training_plan": {"focus": "Unable to locate player in match data."}
            }

        frames = timeline_data.get("info", {}).get("frames", [])
        
        wards_placed = []
        deaths = []
        epic_monster_kills = []
        event_timeline = []

        # Extract temporal events
        for frame in frames:
            for event in frame.get("events", []):
                event_type = event.get("type")
                timestamp = event.get("timestamp", 0) / 1000.0  # ms to seconds
                
                if event_type == "WARD_PLACED" and event.get("creatorId") == participant_id:
                    wards_placed.append(timestamp)
                    event_timeline.append({"timestamp": timestamp, "type": "WARD", "color": "gray"})
                elif event_type == "CHAMPION_KILL" and event.get("victimId") == participant_id:
                    deaths.append(timestamp)
                    event_timeline.append({"timestamp": timestamp, "type": "DEATH", "color": "red"})
                elif event_type == "ELITE_MONSTER_KILL":
                    epic_monster_kills.append(timestamp)
                    event_timeline.append({"timestamp": timestamp, "type": "OBJECTIVE", "color": "cyan"})
                elif event_type == "CHAMPION_KILL" and event.get("killerId") == participant_id:
                    event_timeline.append({"timestamp": timestamp, "type": "KILL", "color": "green"})

        # Habit: Warding Window
        good_warding_instances = 0
        for obj_time in epic_monster_kills:
            wards_in_window = sum(1 for w in wards_placed if obj_time - WARDING_WINDOW_SECONDS <= w <= obj_time)
            if wards_in_window >= MIN_WARDS_BEFORE_OBJECTIVE:
                good_warding_instances += 1
                
        warding_score = good_warding_instances / max(1, len(epic_monster_kills))
        ward_placement_efficiency = "good" if warding_score > 0.5 else "needs improvement"

        # Habit: Positioning (Critical deaths)
        critical_deaths = 0
        for death_time in deaths:
            for obj_time in epic_monster_kills:
                if 0 < obj_time - death_time <= CRITICAL_DEATH_SECONDS_THRESHOLD:
                    critical_deaths += 1
                    break
        
        positioning_score = 1.0 - (critical_deaths / max(1, len(deaths)))
        positioning_status = "good" if critical_deaths <= 2 else "needs improvement"

        game_length = match_data.get("info", {}).get("gameDuration", 0)
        game_minutes = game_length / 60.0 if game_length > 0 else 1.0

        vs = 0
        cs = 0
        kp = 0.0
        kda = 0.0

        for p in match_data.get("info", {}).get("participants", []):
            if p.get("puuid") == puuid:
                vs = p.get("visionScore", 0)
                cs = p.get("totalMinionsKilled", 0) + p.get("neutralMinionsKilled", 0)
                
                # Try getting KP directly computed from challenges, or fallback
                kp = p.get("challenges", {}).get("killParticipation", 0.0) * 100
                
                kills = p.get("kills", 0)
                deaths = p.get("deaths", 0)
                assists = p.get("assists", 0)
                kda = (kills + assists) / float(max(1, deaths))
                break

        vs_per_min = round(vs / game_minutes, 2)
        cs_per_min = round(cs / game_minutes, 2)
        kp_percent = round(kp, 1)
        kda_ratio = round(kda, 2)

        # Habit: Roams (Dummy fallback for MVP since spatial analysis is complex without positional polylines)
        # We assume if they have high vision + low deaths, their roams are okay.
        roam_score = (warding_score + positioning_score) / 2
        roam_timing = "good" if roam_score > 0.5 else "needs improvement"

        # Rule Engine (Training Plan)
        focus = []
        if ward_placement_efficiency == "needs improvement":
            focus.append("Place vision 60s before Epic Monsters spawn to establish area control.")
        if positioning_status == "needs improvement":
            focus.append("Avoid dying within 45s of dragon/baron spawns. Recall early to group safely.")
        if roam_timing == "needs improvement":
            focus.append("Ensure roams result in takedowns or deep vision within 45s window.")
        
        if not focus:
            focus.append("Consistency is key. Maintain your current objective setup habits.")

        return {
            "critical_moments": {
                "deaths_before_objectives": critical_deaths,
                "total_epic_monsters_secured": len(epic_monster_kills),
                "event_timeline": event_timeline
            },
            "habits": {
                "ward_placement_efficiency": ward_placement_efficiency,
                "positioning": positioning_status,
                "roam_timing": roam_timing,
                "vision_score_per_minute": vs_per_min,
                "cs_per_minute": cs_per_min,
                "kill_participation_percent": kp_percent,
                "kda": kda_ratio,
            },
            "training_plan": {"focus": " | ".join(focus)},
        }


heuristics_engine = CoachingHeuristicsEngine()
