/**
 * Aster DEX Perpetuals Connector
 * Futures trading on https://fapi.asterdex.com
 * Implements the official Aster Finance Futures API
 *
 * Public endpoints (NONE auth): exchangeInfo, depth, trades, klines, premiumIndex, ticker
 * Signed endpoints (HMAC SHA256): balance, positionRisk, orders
 */
import { createHmac } from "crypto";
const ASTER_FAPI = "https://fapi.asterdex.com";
// ── Connector ───────────────────────────────────────────────────────────
export class AsterConnector {
    apiKey;
    apiSecret;
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey ?? process.env.ASTER_API_KEY ?? "";
        this.apiSecret = apiSecret ?? process.env.ASTER_API_SECRET ?? "";
    }
    // ── Public Market Data (no auth) ────────────────────────────────────
    /** GET /fapi/v1/exchangeInfo — all available futures markets */
    async getMarkets() {
        const data = await this.publicGet("/fapi/v1/exchangeInfo");
        return data.symbols ?? [];
    }
    /** GET /fapi/v1/exchangeInfo — single market info */
    async getMarket(symbol) {
        const markets = await this.getMarkets();
        return markets.find((m) => m.symbol === symbol) ?? null;
    }
    /** GET /fapi/v1/depth — order book */
    async getOrderBook(symbol, limit = 20) {
        return this.publicGet(`/fapi/v1/depth?symbol=${symbol}&limit=${limit}`);
    }
    /** GET /fapi/v1/trades — recent trades */
    async getRecentTrades(symbol, limit = 50) {
        return this.publicGet(`/fapi/v1/trades?symbol=${symbol}&limit=${limit}`);
    }
    /** GET /fapi/v1/klines — candlestick data */
    async getKlines(symbol, interval = "1h", limit = 100) {
        const raw = await this.publicGet(`/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
        return raw.map((k) => ({
            openTime: k[0],
            open: k[1],
            high: k[2],
            low: k[3],
            close: k[4],
            volume: k[5],
            closeTime: k[6],
            quoteVolume: k[7],
            trades: k[8],
        }));
    }
    /** GET /fapi/v1/premiumIndex — mark price + funding rate */
    async getFundingRate(symbol) {
        return this.publicGet(`/fapi/v1/premiumIndex?symbol=${symbol}`);
    }
    /** GET /fapi/v1/premiumIndex — all funding rates */
    async getAllFundingRates() {
        return this.publicGet("/fapi/v1/premiumIndex");
    }
    /** GET /fapi/v1/fundingRate — funding rate history */
    async getFundingHistory(symbol, limit = 20) {
        return this.publicGet(`/fapi/v1/fundingRate?symbol=${symbol}&limit=${limit}`);
    }
    /** GET /fapi/v1/ticker/24hr — 24h price change statistics */
    async getTicker24h(symbol) {
        const endpoint = symbol
            ? `/fapi/v1/ticker/24hr?symbol=${symbol}`
            : "/fapi/v1/ticker/24hr";
        return this.publicGet(endpoint);
    }
    /** GET /fapi/v1/ticker/price — latest price */
    async getPrice(symbol) {
        return this.publicGet(`/fapi/v1/ticker/price?symbol=${symbol}`);
    }
    /** GET /fapi/v1/ticker/bookTicker — best bid/ask */
    async getBookTicker(symbol) {
        return this.publicGet(`/fapi/v1/ticker/bookTicker?symbol=${symbol}`);
    }
    // ── Signed endpoints (require HMAC SHA256) ──────────────────────────
    /** GET /fapi/v2/positionRisk — open positions */
    async getPositions(symbol) {
        const params = {};
        if (symbol)
            params.symbol = symbol;
        return this.signedGet("/fapi/v2/positionRisk", params);
    }
    /** GET /fapi/v2/balance — account balances */
    async getBalance() {
        return this.signedGet("/fapi/v2/balance");
    }
    // ── Higher-level helpers ────────────────────────────────────────────
    /** Get a market digest: top markets by volume */
    async getMarketDigest() {
        const tickers = (await this.getTicker24h());
        const sorted = [...tickers].sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
        const totalVolume = tickers.reduce((s, t) => s + parseFloat(t.quoteVolume || "0"), 0);
        return {
            marketCount: tickers.length,
            topByVolume: sorted.slice(0, 10),
            totalVolume,
        };
    }
    /** Generate a simple signal from funding rate + price action */
    async generateSignal(symbol) {
        const [funding, ticker] = await Promise.all([
            this.getFundingRate(symbol),
            this.getTicker24h(symbol),
        ]);
        const fr = parseFloat(funding.lastFundingRate);
        const pch = parseFloat(ticker.priceChangePercent);
        const markPrice = parseFloat(funding.markPrice);
        // Very negative funding + positive price = long; very positive funding + negative price = short
        let direction = "neutral";
        let confidence = 0.3;
        if (fr < -0.0005 && pch > 0) {
            direction = "long";
            confidence = Math.min(0.9, 0.5 + Math.abs(fr) * 100);
        }
        else if (fr > 0.0005 && pch < 0) {
            direction = "short";
            confidence = Math.min(0.9, 0.5 + Math.abs(fr) * 100);
        }
        return {
            symbol,
            direction,
            fundingRate: fr,
            markPrice,
            priceChange24h: pch,
            confidence,
        };
    }
    // ── HTTP helpers ────────────────────────────────────────────────────
    async publicGet(endpoint) {
        const url = `${ASTER_FAPI}${endpoint}`;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const res = await fetch(url, {
                    headers: this.apiKey ? { "X-MBX-APIKEY": this.apiKey } : {},
                    signal: AbortSignal.timeout(10000),
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Aster HTTP ${res.status}: ${text}`);
                }
                return (await res.json());
            }
            catch (e) {
                if (attempt === 2)
                    throw e;
                await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            }
        }
        throw new Error("Aster fetch failed");
    }
    async signedGet(path, params = {}) {
        if (!this.apiKey || !this.apiSecret) {
            throw new Error("Aster API key and secret required for signed endpoints");
        }
        const timestamp = Date.now().toString();
        const queryParts = { ...params, timestamp, recvWindow: "5000" };
        const queryString = Object.entries(queryParts)
            .map(([k, v]) => `${k}=${v}`)
            .join("&");
        const signature = createHmac("sha256", this.apiSecret)
            .update(queryString)
            .digest("hex");
        const url = `${ASTER_FAPI}${path}?${queryString}&signature=${signature}`;
        const res = await fetch(url, {
            headers: { "X-MBX-APIKEY": this.apiKey },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Aster signed HTTP ${res.status}: ${text}`);
        }
        return (await res.json());
    }
}
//# sourceMappingURL=aster.js.map