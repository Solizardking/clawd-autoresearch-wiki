/**
 * Birdeye API Connector
 * Comprehensive Solana token analytics and price data
 */
export interface BirdeyeTokenPrice {
    address: string;
    value: number;
    updateUnixTime: number;
    updateHumanTime: string;
    priceChange24h: number;
}
export interface BirdeyeOHLCV {
    address: string;
    unixTime: number;
    o: number;
    h: number;
    l: number;
    c: number;
    v: number;
}
export interface BirdeyeTokenOverview {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    price: number;
    priceChange24hPercent: number;
    volume24h: number;
    marketCap: number;
    fdv: number;
    supply: number;
    holder: number;
    trade24h: number;
    buy24h: number;
    sell24h: number;
    uniqueWallet24h: number;
    liquidity: number;
    lastTradeUnixTime: number;
}
export interface BirdeyeTopTrader {
    address: string;
    volume: number;
    volumeUsd: number;
    tradeCount: number;
    side: "buy" | "sell";
}
export interface BirdeyeWalletPortfolio {
    wallet: string;
    totalUsd: number;
    items: Array<{
        address: string;
        symbol: string;
        decimals: number;
        balance: number;
        uiAmount: number;
        priceUsd: number;
        valueUsd: number;
        name: string;
    }>;
}
export type OHLCVInterval = "1m" | "3m" | "5m" | "15m" | "30m" | "1H" | "2H" | "4H" | "6H" | "8H" | "12H" | "1D" | "3D" | "1W" | "1M";
export declare class BirdeyeConnector {
    private apiKey;
    private chain;
    constructor(apiKey: string, chain?: string);
    getTokenPrice(address: string): Promise<BirdeyeTokenPrice>;
    getMultipleTokenPrices(addresses: string[]): Promise<Record<string, BirdeyeTokenPrice>>;
    getTokenOverview(address: string): Promise<BirdeyeTokenOverview>;
    getOHLCV(address: string, interval?: OHLCVInterval, limit?: number): Promise<BirdeyeOHLCV[]>;
    getTechnicalSignals(address: string): Promise<{
        rsi14: number;
        ema20: number;
        ema50: number;
        vwap: number;
        volume24h: number;
        volumeChange: number;
        trend: "bullish" | "bearish" | "neutral";
        signal: "buy" | "sell" | "hold";
    }>;
    getTopTraders(address: string, timeframe?: string): Promise<BirdeyeTopTrader[]>;
    getTrades(address: string, limit?: number): Promise<unknown[]>;
    getWalletPortfolio(wallet: string): Promise<BirdeyeWalletPortfolio>;
    getWalletPnL(wallet: string): Promise<{
        realizedPnl: number;
        unrealizedPnl: number;
        totalTrades: number;
        winRate: number;
    }>;
    getTrendingTokens(limit?: number): Promise<BirdeyeTokenOverview[]>;
    getNewListings(limit?: number): Promise<BirdeyeTokenOverview[]>;
    private computeRSI;
    private computeEMA;
    private computeVWAP;
    private get;
}
//# sourceMappingURL=birdeye.d.ts.map