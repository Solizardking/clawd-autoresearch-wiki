/**
 * CoinGecko — Global crypto market data connector
 *
 * Provides:
 *   - Global market sentiment (BTC dominance, total market cap)
 *   - Trending tokens
 *   - Token price + metadata by contract address
 */
import { logger } from '../utils/logger.js';
import { config } from '../config.js';
const BASE_URL = config.coingecko.baseUrl;
const API_KEY = config.coingecko.apiKey;
async function fetchCG(path, params = {}) {
    const url = new URL(path, BASE_URL);
    for (const [k, v] of Object.entries(params))
        url.searchParams.set(k, v);
    const headers = { 'Accept': 'application/json' };
    if (API_KEY)
        headers['x-cg-demo-api-key'] = API_KEY;
    const res = await fetch(url.toString(), { headers, signal: AbortSignal.timeout(10000) });
    if (!res.ok) {
        throw new Error(`CoinGecko ${res.status}: ${await res.text().catch(() => 'no body')}`);
    }
    return res.json();
}
// ── Public API ──────────────────────────────────────────────────────────────
class CoinGeckoClient {
    async getCryptoSentiment() {
        try {
            const data = await fetchCG('/global');
            return {
                total_market_cap: data.data.total_market_cap?.usd ?? 0,
                total_volume: data.data.total_volume?.usd ?? 0,
                btc_dominance: data.data.market_cap_percentage?.btc ?? 0,
                market_cap_change_24h: data.data.market_cap_change_percentage_24h_usd ?? 0,
                active_cryptocurrencies: data.data.active_cryptocurrencies ?? 0,
            };
        }
        catch (err) {
            logger.warn('[CoinGecko] getCryptoSentiment failed', { err: err.message });
            return {
                total_market_cap: 0,
                total_volume: 0,
                btc_dominance: 0,
                market_cap_change_24h: 0,
                active_cryptocurrencies: 0,
            };
        }
    }
    async getTrending() {
        try {
            const data = await fetchCG('/search/trending');
            return (data.coins ?? []).map(c => ({
                id: c.item.id,
                name: c.item.name,
                symbol: c.item.symbol,
                market_cap_rank: c.item.market_cap_rank,
                price_btc: c.item.price_btc,
                score: c.item.score,
            }));
        }
        catch (err) {
            logger.warn('[CoinGecko] getTrending failed', { err: err.message });
            return [];
        }
    }
    async getTokenPrice(contractAddress, platform = 'solana') {
        try {
            const data = await fetchCG(`/simple/token_price/${platform}`, {
                contract_addresses: contractAddress,
                vs_currencies: 'usd',
                include_24hr_change: 'true',
                include_market_cap: 'true',
            });
            const entry = data[contractAddress.toLowerCase()] ?? {};
            return {
                usd: entry.usd ?? 0,
                usd_24h_change: entry.usd_24h_change ?? 0,
                usd_market_cap: entry.usd_market_cap ?? 0,
            };
        }
        catch (err) {
            logger.warn('[CoinGecko] getTokenPrice failed', { err: err.message });
            return { usd: 0, usd_24h_change: 0, usd_market_cap: 0 };
        }
    }
}
export const coingecko = new CoinGeckoClient();
//# sourceMappingURL=coingecko.js.map