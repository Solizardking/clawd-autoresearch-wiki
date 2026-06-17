---
id: decisions-20260311-1efpj
category: decisions
title: OODA Observation
tags: []
score: 0.5
createdAt: '2026-03-11T08:35:19.697Z'
updatedAt: '2026-03-11T08:35:19.697Z'
---
## OODA Observation

**Slot:** 405658467
**Time:** 2026-03-11T08:35:07.785Z

### Perps Digest (Aster)
Markets: 370 | Total Volume: $2,678,965,291.86
Top by Volume:
  BTCUSDT: $69526.3 | 24h: -1.957% | Vol: $1,429,104,681.62
  ETHUSDT: $2018.60 | 24h: -2.294% | Vol: $771,800,950.51
  SOLUSDT: $85.3400 | 24h: -2.066% | Vol: $136,491,893.64
  BNBUSDT: $641.400 | 24h: -0.973% | Vol: $48,772,077.2
  ASTERUSDT: $0.69190 | 24h: -2.163% | Vol: $46,718,228.89

### Decision
{
  "action": "hold",
  "rationale": "{\n  \"action\": \"research\",\n  \"target\": \"SOLUSDT\",\n  \"size\": 0.0,\n  \"rationale\": \"Broad tape is red across majors: BTC -1.957%, ETH -2.294%, SOL -2.066%. That reads as mild market-wide risk-off, not a clean SOL-specific edge. SOL perps volume is healthy at $136.49M, but without funding, OI delta, basis, liquidation clusters, or spot/on-chain confirmation, risk/reward is asymmetric against immediate deployment. No ape without signals. Best move is to stay flat and wait for either downside continuation confirmation or a washed-out mean-reversion setup.\",\n  \"signals\": {\n    \"market_breadth\": \"negative across majors\",\n    \"sol_24h_change\": -2.066,\n    \"btc_24h_change\": -1.957,\n    \"eth_24h_change\": -2.294,\n    \"sol_perps_volume_usd\": 136491893.64,\n    \"regime_guess\": \"broad risk-off / possible chop-to-down\",\n    \"edge_quality\": \"low\",\n    \"missing_confirmations\": [\n      \"funding rate\",\n      \"open interest delta\",\n      \"mark-index basis\",\n      \"liquidation map\",\n      \"spot VWAP/EMA structure\",\n      \"on-chain flows\"\n    ]\n  },\n  \"confidence\": 0.82,\n  \"stopLoss\": null,\n  \"takeProfit\": null\n}\n\nObserve: majors are bleeding together, so the first read is macro pressure rather than isolated SOL weakness. Orient/Decide/Act: with no funding, OI, or on-chain confirmation, I can’t separate trend continuation from a short-term flush, so the claw stays off the trigger and shifts to research until cleaner signals print.",
  "signals": {
    "timestamp": "2026-03-11T08:35:07.785Z",
    "solanaSlot": 405658467,
    "watchlist": [],
    "perpsDigest": {
      "marketCount": 370,
      "topByVolume": [
        {
          "symbol": "BTCUSDT",
          "priceChange": "-1388.0",
          "priceChangePercent": "-1.957",
          "weightedAvgPrice": "70302.9",
          "lastPrice": "69526.3",
          "lastQty": "0.487",
          "openPrice": "70914.3",
          "highPrice": "71735.5",
          "lowPrice": "69245.6",
          "volume": "20327.809",
          "quoteVolume": "1429104681.62",
          "openTime": 1773131700000,
          "closeTime": 1773218105427,
          "firstId": 127579340,
          "lastId": 127729296,
          "count": 149954
        },
        {
          "symbol": "ETHUSDT",
          "priceChange": "-47.40",
          "priceChangePercent": "-2.294",
          "weightedAvgPrice": "2044.58",
          "lastPrice": "2018.60",
          "lastQty": "0.463",
          "openPrice": "2066.00",
          "highPrice": "2086.90",
          "lowPrice": "2006.20",
          "volume": "377486.279",
          "quoteVolume": "771800950.51",
          "openTime": 1773131700000,
          "closeTime": 1773218106137,
          "firstId": 69508632,
          "lastId": 69653125,
          "count": 144492
        },
        {
          "symbol": "SOLUSDT",
          "priceChange": "-1.8000",
          "priceChangePercent": "-2.066",
          "weightedAvgPrice": "86.6180",
          "lastPrice": "85.3400",
          "lastQty": "0.07",
          "openPrice": "87.1400",
          "highPrice": "88.7500",
          "lowPrice": "84.8700",
          "volume": "1575792.17",
          "quoteVolume": "136491893.6400",
          "openTime": 1773131700000,
          "closeTime": 1773218106478,
          "firstId": 33040656,
          "lastId": 33111670,
          "count": 71015
        },
        {
          "symbol": "BNBUSDT",
          "priceChange": "-6.300",
          "priceChangePercent": "-0.973",
          "weightedAvgPrice": "643.998",
          "lastPrice": "641.400",
          "lastQty": "4.65",
          "openPrice": "647.700",
          "highPrice": "652.200",
          "lowPrice": "637.800",
          "volume": "75733.28",
          "quoteVolume": "48772077.200",
          "openTime": 1773131700000,
          "closeTime": 1773218103312,
          "firstId": 20054951,
          "lastId": 20091656,
          "count": 36706
        },
        {
          "symbol": "ASTERUSDT",
          "priceChange": "-0.01530",
          "priceChangePercent": "-2.163",
          "weightedAvgPrice": "0.70150",
          "lastPrice": "0.69190",
          "lastQty": "987.09",
          "openPrice": "0.70720",
          "highPrice": "0.71120",
          "lowPrice": "0.69100",
          "volume": "66597524.81",
          "quoteVolume": "46718228.89000",
          "openTime": 1773131700000,
          "closeTime": 1773218106501,
          "firstId": 73003089,
          "lastId": 73067032,
          "count": 63943
        },
        {
          "symbol": "CLUSDT",
          "priceChange": "-2.4100",
          "priceChangePercent": "-2.771",
          "weightedAvgPrice": "83.7575",
          "lastPrice": "84.5600",
          "lastQty": "0.886",
          "openPrice": "86.9700",
          "highPrice": "89.8600",
          "lowPrice": "76.6600",
          "volume": "510575.209",
          "quoteVolume": "42764517.9100",
          "openTime": 1773131640000,
          "closeTime": 1773218097871,
          "firstId": 184605,
          "lastId": 232981,
          "count": 48377
        },
        {
          "symbol": "XRPUSDT",
          "priceChange": "-0.0260",
          "priceChangePercent": "-1.855",
          "weightedAvgPrice": "1.3994",
          "lastPrice": "1.3757",
          "lastQty": "1102.4",
          "openPrice": "1.4017",
          "highPrice": "1.4418",
          "lowPrice": "1.3719",
          "volume": "28026109.3",
          "quoteVolume": "39218796.6100",
          "openTime": 1773131700000,
          "closeTime": 1773218104211,
          "firstId": 13754083,
          "lastId": 13789432,
          "count": 35350
        },
        {
          "symbol": "DOGEUSDT",
          "priceChange": "-0.001230",
          "priceChangePercent": "-1.318",
          "weightedAvgPrice": "0.095448",
          "lastPrice": "0.092120",
          "lastQty": "10482",
          "openPrice": "0.093350",
          "highPrice": "0.100400",
          "lowPrice": "0.091420",
          "volume": "329737902",
          "quoteVolume": "31472855.300000",
          "openTime": 1773131700000,
          "closeTime": 1773218105158,
          "firstId": 16221049,
          "lastId": 16257404,
          "count": 36356
        },
        {
          "symbol": "HYPEUSDT",
          "priceChange": "-0.57000",
          "priceChangePercent": "-1.627",
          "weightedAvgPrice": "34.48261",
          "lastPrice": "34.46800",
          "lastQty": "30.76",
          "openPrice": "35.03800",
          "highPrice": "35.16700",
          "lowPrice": "33.59300",
          "volume": "688742.02",
          "quoteVolume": "23749620.36000",
          "openTime": 1773131700000,
          "closeTime": 1773218102517,
          "firstId": 12137852,
          "lastId": 12177319,
          "count": 39468
        },
        {
          "symbol": "XAGUSDT",
          "priceChange": "-2.1400",
          "priceChangePercent": "-2.403",
          "weightedAvgPrice": "88.3518",
          "lastPrice": "86.9100",
          "lastQty": "3.031",
          "openPrice": "89.0500",
          "highPrice": "89.7400",
          "lowPrice": "86.4400",
          "volume": "207858.642",
          "quoteVolume": "18364695.2800",
          "openTime": 1773131700000,
          "closeTime": 1773218104545,
          "firstId": 2067359,
          "lastId": 2102491,
          "count": 35133
        }
      ],
      "totalVolume": 2678965291.8599963
    }
  },
  "confidence": 0.5
}
