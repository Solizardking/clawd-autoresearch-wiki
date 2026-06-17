"""
Phoenix Perpetuals trading package for Clawd.

Integrates Vulcan CLI, Rise SDK, and paper trading.
"""
from perps.vulcan import VulcanClient, VulcanConfig, VulcanResult, OutputFormat
from perps.paper import PaperEngine, PaperAccount, PaperPosition, PaperOrder, PaperFill
from perps.rise import RiseClient, RiseConfig

__all__ = [
    "VulcanClient", "VulcanConfig", "VulcanResult", "OutputFormat",
    "PaperEngine", "PaperAccount", "PaperPosition", "PaperOrder", "PaperFill",
    "RiseClient", "RiseConfig",
]