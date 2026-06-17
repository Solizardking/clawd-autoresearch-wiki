/**
 * CoinGecko — Global crypto market data connector
 *
 * Provides:
 *   - Global market sentiment (BTC dominance, total market cap)
 *   - Trending tokens
 *   - Token price + metadata by contract address
 */
interface GlobalCryptoSentiment {
    total_market_cap: number;
    total_volume: number;
    btc_dominance: number;
    market_cap_change_24h: number;
    active_cryptocurrencies: number;
}
interface TrendingToken {
    id: string;
    name: string;
    symbol: string;
    market_cap_rank: number;
    price_btc: number;
    score: number;
}
declare class CoinGeckoClient {
    getCryptoSentiment(): Promise<GlobalCryptoSentiment>;
    getTrending(): Promise<TrendingToken[]>;
    getTokenPrice(contractAddress: string, platform?: string): Promise<{
        usd: number;
        usd_24h_change: number;
        usd_market_cap: number;
    }>;
}
export declare const coingecko: CoinGeckoClient;
export {};
//# sourceMappingURL=coingecko.d.ts.map