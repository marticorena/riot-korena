"""Comparisons engine for baseline player metrics.

This module provides statically cached or pre-computed baselines for Professional
players to benchmark against general users.
"""

from typing import Any, Dict

# Pre-computed aggregate baseline averages for T1 Keria
# This prevents dynamically querying 10+ recent Pro matches and avoids Rate Limits.
KERIA_BASELINE: Dict[str, Any] = {
    "pro_name": "Keria",
    "metrics": {
        "vision_score_per_minute": 4.2,
        "cs_per_minute": 1.5,
        "kill_participation_percent": 68.0,
    }
}

class BaselineComparisonService:
    """Service to retrieve standard comparison baseline datasets."""
    
    def get_pro_baseline(self, pro_name: str = "Keria") -> Dict[str, Any]:
        """Fetch the pre-computed baseline for requested Pro player.
        
        Args:
            pro_name (str): The common identifier for the pro player.
            
        Returns:
            Dict[str, Any]: Basic aggregation metrics.
        """
        # In a generic implementation, this would query a dedicated Pro Metrics table
        if pro_name.lower() == "keria":
            return KERIA_BASELINE
        
        return {}

comparison_service = BaselineComparisonService()
