"""Riot API Proxy and Client.

This module encapsulates HTTP interactions with the official Riot Games API,
implementing required rate-limiting via Token Buckets.
"""

import asyncio
from collections import defaultdict
import logging
import time
from typing import Any, Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class RateLimiter:
    """Token bucket allowing X requests across a rotating window respecting Riot thresholds."""

    def __init__(self, max_calls: int, period: float) -> None:
        """Initialize the basic single-bucket rate limiter.

        Args:
            max_calls (int): Maximum network calls allowed.
            period (float): The sliding time window in seconds.
        """
        self.max_calls = max_calls
        self.period = period
        self.calls: List[float] = []
        self.lock = asyncio.Lock()

    async def wait(self) -> None:
        """Asynchronously wait if the bucket limit has been exceeded."""
        async with self.lock:
            now = time.monotonic()
            self.calls = [c for c in self.calls if now - c <= self.period]

            if len(self.calls) >= self.max_calls:
                sleep_time = self.period - (now - self.calls[0])
                if sleep_time > 0:
                    await asyncio.sleep(sleep_time)
                now = time.monotonic()
                self.calls = [c for c in self.calls if now - c <= self.period]

            self.calls.append(time.monotonic())


class RoutingRateLimiter:
    """Handles both the short and long limiters sequentially for a unified routing zone."""

    def __init__(self) -> None:
        """Initialize both the App-level Short and Long token buckets."""
        self.short_limiter = RateLimiter(20, 1.2)  # slightly padded above 1s
        self.long_limiter = RateLimiter(100, 120.0)  # exactly 100 per 2m

    async def wait(self) -> None:
        """Asynchronously wait resolving both limits sequentially."""
        await self.long_limiter.wait()
        await self.short_limiter.wait()


class RiotClient:
    """Comprehensive Riot API proxy enforcing local structural limits per routing zone."""

    def __init__(self) -> None:
        """Initialize the core HTTPX client properties and limiters."""
        self.api_key = settings.RIOT_API_KEY
        self.headers = {"X-Riot-Token": self.api_key}
        self.timeout = httpx.Timeout(10.0)
        self.limiters: Dict[str, RoutingRateLimiter] = defaultdict(RoutingRateLimiter)

    async def _get(self, url: str, routing: str) -> Optional[Dict[str, Any]]:
        """Asynchronously execute the HTTP GET request managing 429 retries cleanly.

        Args:
            url (str): The calculated fully-qualified Riot URL.
            routing (str): The routing partition (e.g. 'americas', 'europe').

        Returns:
            Optional[Dict[str, Any]]: The successful JSON response or None.
        """
        limiter = self.limiters[routing]

        for attempt in range(3):
            await limiter.wait()
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                try:
                    response = await client.get(url, headers=self.headers)
                    if response.status_code == 429:
                        retry_after = int(response.headers.get("Retry-After", 5))
                        logger.warning(
                            f"Riot 429 Rate Limit directly triggered. Halting for {retry_after}s."
                        )
                        await asyncio.sleep(retry_after)
                        continue

                    response.raise_for_status()
                    return response.json()
                except httpx.HTTPStatusError as exc:
                    logger.error(
                        f"HTTP error {exc.response.status_code} mapped from {url}"
                    )
                    return None
                except Exception as e:
                    logger.error(f"Connection error requesting {url}: {str(e)}")
                    return None
        return None

    def _get_regional_routing(self, region: str) -> str:
        """Map generic cluster server regions to primary continental routing bounds."""
        mapping = {
            "NA1": "americas",
            "BR1": "americas",
            "LA1": "americas",
            "LA2": "americas",
            "EUW1": "europe",
            "EUN1": "europe",
            "TR1": "europe",
            "RU": "europe",
            "KR": "asia",
            "JP1": "asia",
        }
        return mapping.get(region.upper(), "americas")

    async def get_account_by_riot_id(
        self, game_name: str, tag_line: str, region: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch Riot PUUID using natural GameName + TagLine."""
        routing = self._get_regional_routing(region)
        url = f"https://{routing}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        return await self._get(url, routing)

    async def get_summoner_by_puuid(
        self, puuid: str, region: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch local Summoner detail (Level, Server ID) using PUUID."""
        routing = region.lower()
        url = f"https://{routing}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        return await self._get(url, routing)

    async def get_match_ids_by_puuid(
        self, puuid: str, region: str, count: int = 5
    ) -> Optional[list[str]]:
        """Resolve Match History IDs for a specific PUUID."""
        routing = self._get_regional_routing(region)
        url = f"https://{routing}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids?count={count}"
        return await self._get(url, routing)

    async def get_match_by_id(
        self, match_id: str, region: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch general properties for a specific Match ID."""
        routing = self._get_regional_routing(region)
        url = f"https://{routing}.api.riotgames.com/lol/match/v5/matches/{match_id}"
        return await self._get(url, routing)

    async def get_match_timeline_by_id(
        self, match_id: str, region: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch deeply nested event timeline for a specific Match ID."""
        routing = self._get_regional_routing(region)
        url = f"https://{routing}.api.riotgames.com/lol/match/v5/matches/{match_id}/timeline"
        return await self._get(url, routing)


riot_client = RiotClient()
