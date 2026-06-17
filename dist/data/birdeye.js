/**
 * Birdeye API Connector
 * Comprehensive Solana token analytics and price data
 */
const BIRDEYE_BASE = "https://public-api.birdeye.so";
export class BirdeyeConnector {
    apiKey;
    chain;
    constructor(apiKey, chain = "solana") {
        this.apiKey = apiKey;
        this.chain = chain;
    }
    // ── Price Data ───────────────────────────────────────────────────────
    async getTokenPrice(address) {
        return this.get(`/defi/price?address=${address}`);
    }
    async getMultipleTokenPrices(addresses) {
        const list = addresses.join(",");
        const res = await this.get(`/defi/multi_price?list_address=${list}`);
        return res.data;
    }
    async getTokenOverview(address) {
        const res = await this.get(`/defi/token_overview?address=${address}`);
        return res.data;
    }
    // ── OHLCV ────────────────────────────────────────────────────────────
    async getOHLCV(address, interval = "1H", limit = 100) {
        const now = Math.floor(Date.now() / 1000);
        const intervalSeconds = {
            "1m": 60, "3m": 180, "5m": 300, "15m": 900, "30m": 1800,
            "1H": 3600, "2H": 7200, "4H": 14400, "6H": 21600, "8H": 28800, "12H": 43200,
            "1D": 86400, "3D": 259200, "1W": 604800, "1M": 2592000,
        };
        const timeFrom = now - intervalSeconds[interval] * limit;
        const res = await this.get(`/defi/ohlcv?address=${address}&type=${interval}&time_from=${timeFrom}&time_to=${now}`);
        return res.data.items;
    }
    // ── Technical Indicators (computed from OHLCV) ───────────────────────
    async getTechnicalSignals(address) {
        const candles = await this.getOHLCV(address, "1H", 100);
        if (candles.length < 50) {
            return {
                rsi14: 50, ema20: 0, ema50: 0, vwap: 0,
                volume24h: 0, volumeChange: 0, trend: "neutral", signal: "hold",
            };
        }
        const closes = candles.map((c) => c.c);
        const volumes = candles.map((c) => c.v);
        const rsi14 = this.computeRSI(closes, 14);
        const ema20 = this.computeEMA(closes, 20);
        const ema50 = this.computeEMA(closes, 50);
        const vwap = this.computeVWAP(candles.slice(-24));
        const volume24h = volumes.slice(-24).reduce((a, b) => a + b, 0);
        const volumePrev24h = volumes.slice(-48, -24).reduce((a, b) => a + b, 0);
        const volumeChange = volumePrev24h > 0 ? (volume24h - volumePrev24h) / volumePrev24h : 0;
        // Trend classification
        const trend = ema20 > ema50 ? "bullish" : ema20 < ema50 ? "bearish" : "neutral";
        // Signal generation
        let signal = "hold";
        if (rsi14 < 30 && trend === "bullish")
            signal = "buy";
        else if (rsi14 > 70 && trend === "bearish")
            signal = "sell";
        else if (ema20 > ema50 && volumeChange > 0.2)
            signal = "buy";
        else if (ema20 < ema50 && volumeChange < -0.2)
            signal = "sell";
        return { rsi14, ema20, ema50, vwap, volume24h, volumeChange, trend, signal };
    }
    // ── Trading Activity ─────────────────────────────────────────────────
    async getTopTraders(address, timeframe = "24h") {
        const res = await this.get(`/defi/v2/tokens/top_traders?address=${address}&time_frame=${timeframe}&sort_type=volume&offset=0&limit=10`);
        return res.data.items;
    }
    async getTrades(address, limit = 20) {
        const res = await this.get(`/defi/txs/token?address=${address}&limit=${limit}&tx_type=swap`);
        return res.data.items;
    }
    // ── Wallet Analytics ─────────────────────────────────────────────────
    async getWalletPortfolio(wallet) {
        const res = await this.get(`/v1/wallet/token_list?wallet=${wallet}`);
        return res.data;
    }
    async getWalletPnL(wallet) {
        const res = await this.get(`/v1/wallet/gain_loss?wallet=${wallet}`);
        return {
            realizedPnl: res.data.realized_profit,
            unrealizedPnl: res.data.unrealized_profit,
            totalTrades: res.data.total_trade,
            winRate: res.data.win_rate,
        };
    }
    // ── Token Discovery ──────────────────────────────────────────────────
    async getTrendingTokens(limit = 20) {
        const res = await this.get(`/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=${limit}`);
        return res.data.tokens;
    }
    async getNewListings(limit = 20) {
        const res = await this.get(`/defi/v3/token/new_listing?limit=${limit}`);
        return res.data.tokens;
    }
    // ── Technical Computations ───────────────────────────────────────────
    computeRSI(closes, period) {
        if (closes.length < period + 1)
            return 50;
        const changes = closes.slice(1).map((c, i) => c - closes[i]);
        const recent = changes.slice(-period);
        const gains = recent.map((c) => (c > 0 ? c : 0));
        const losses = recent.map((c) => (c < 0 ? -c : 0));
        const avgGain = gains.reduce((a, b) => a + b, 0) / period;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
        if (avgLoss === 0)
            return 100;
        const rs = avgGain / avgLoss;
        return 100 - 100 / (1 + rs);
    }
    computeEMA(values, period) {
        if (values.length < period)
            return values[values.length - 1] ?? 0;
        const k = 2 / (period + 1);
        let ema = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
        for (const v of values.slice(period)) {
            ema = v * k + ema * (1 - k);
        }
        return ema;
    }
    computeVWAP(candles) {
        let pv = 0;
        let totalVolume = 0;
        for (const c of candles) {
            const typical = (c.h + c.l + c.c) / 3;
            pv += typical * c.v;
            totalVolume += c.v;
        }
        return totalVolume > 0 ? pv / totalVolume : 0;
    }
    // ── HTTP ─────────────────────────────────────────────────────────────
    async get(endpoint) {
        const url = `${BIRDEYE_BASE}${endpoint}`;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const res = await fetch(url, {
                    headers: {
                        "X-API-KEY": this.apiKey,
                        "x-chain": this.chain,
                    },
                    signal: AbortSignal.timeout(10000),
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Birdeye HTTP ${res.status}: ${text}`);
                }
                return (await res.json());
            }
            catch (e) {
                if (attempt === 2)
                    throw e;
                await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            }
        }
        throw new Error("Birdeye fetch failed");
    }
}
//# sourceMappingURL=birdeye.js.map