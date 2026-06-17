/**
 * Aster DEX Perpetuals Connector
 * Futures trading on https://fapi.asterdex.com
 * Implements the official Aster Finance Futures API
 *
 * Public endpoints (NONE auth): exchangeInfo, depth, trades, klines, premiumIndex, ticker
 * Signed endpoints (HMAC SHA256): balance, positionRisk, orders
 */
export interface AsterMarket {
    symbol: string;
    baseAsset: string;
    quoteAsset: string;
    status: string;
    contractType: string;
    pricePrecision: number;
    quantityPrecision: number;
}
export interface AsterOrderBookEntry {
    price: string;
    qty: string;
}
export interface AsterOrderBook {
    lastUpdateId: number;
    bids: [string, string][];
    asks: [string, string][];
}
export interface AsterTrade {
    id: number;
    price: string;
    qty: string;
    quoteQty: string;
    time: number;
    isBuyerMaker: boolean;
}
export interface AsterKline {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteVolume: string;
    trades: number;
}
export interface AsterFundingRate {
    symbol: string;
    markPrice: string;
    indexPrice: string;
    lastFundingRate: string;
    nextFundingTime: number;
    time: number;
}
export interface AsterTicker24h {
    symbol: string;
    priceChange: string;
    priceChangePercent: string;
    lastPrice: string;
    volume: string;
    quoteVolume: string;
    highPrice: string;
    lowPrice: string;
    openPrice: string;
}
export interface AsterPosition {
    symbol: string;
    positionSide: string;
    positionAmt: string;
    entryPrice: string;
    markPrice: string;
    unRealizedProfit: string;
    liquidationPrice: string;
    leverage: string;
    marginType: string;
}
export interface AsterBalance {
    asset: string;
    balance: string;
    availableBalance: string;
    crossUnPnl: string;
}
export declare class AsterConnector {
    private apiKey;
    private apiSecret;
    constructor(apiKey?: string, apiSecret?: string);
    /** GET /fapi/v1/exchangeInfo — all available futures markets */
    getMarkets(): Promise<AsterMarket[]>;
    /** GET /fapi/v1/exchangeInfo — single market info */
    getMarket(symbol: string): Promise<AsterMarket | null>;
    /** GET /fapi/v1/depth — order book */
    getOrderBook(symbol: string, limit?: number): Promise<AsterOrderBook>;
    /** GET /fapi/v1/trades — recent trades */
    getRecentTrades(symbol: string, limit?: number): Promise<AsterTrade[]>;
    /** GET /fapi/v1/klines — candlestick data */
    getKlines(symbol: string, interval?: string, limit?: number): Promise<AsterKline[]>;
    /** GET /fapi/v1/premiumIndex — mark price + funding rate */
    getFundingRate(symbol: string): Promise<AsterFundingRate>;
    /** GET /fapi/v1/premiumIndex — all funding rates */
    getAllFundingRates(): Promise<AsterFundingRate[]>;
    /** GET /fapi/v1/fundingRate — funding rate history */
    getFundingHistory(symbol: string, limit?: number): Promise<{
        symbol: string;
        fundingRate: string;
        fundingTime: number;
    }[]>;
    /** GET /fapi/v1/ticker/24hr — 24h price change statistics */
    getTicker24h(symbol?: string): Promise<AsterTicker24h | AsterTicker24h[]>;
    /** GET /fapi/v1/ticker/price — latest price */
    getPrice(symbol: string): Promise<{
        symbol: string;
        price: string;
    }>;
    /** GET /fapi/v1/ticker/bookTicker — best bid/ask */
    getBookTicker(symbol: string): Promise<{
        symbol: string;
        bidPrice: string;
        bidQty: string;
        askPrice: string;
        askQty: string;
    }>;
    /** GET /fapi/v2/positionRisk — open positions */
    getPositions(symbol?: string): Promise<AsterPosition[]>;
    /** GET /fapi/v2/balance — account balances */
    getBalance(): Promise<AsterBalance[]>;
    /** Get a market digest: top markets by volume */
    getMarketDigest(): Promise<{
        marketCount: number;
        topByVolume: AsterTicker24h[];
        totalVolume: number;
    }>;
    /** Generate a simple signal from funding rate + price action */
    generateSignal(symbol: string): Promise<{
        symbol: string;
        direction: "long" | "short" | "neutral";
        fundingRate: number;
        markPrice: number;
        priceChange24h: number;
        confidence: number;
    }>;
    private publicGet;
    private signedGet;
}
//# sourceMappingURL=aster.d.ts.map