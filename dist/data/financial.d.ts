/**
 * FinancialDatasets — Equity + macro data connector
 *
 * Uses financialdatasets.ai API for:
 *   - Stock price snapshots
 *   - OHLCV candles
 *   - Financial statements
 *   - Sector performance
 */
export interface PriceSnapshot {
    ticker: string;
    price: number;
    change_pct: number;
    volume: number;
    market_cap: number;
    timestamp: string;
}
export interface OHLCVCandle {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export interface FinancialStatement {
    ticker: string;
    period: string;
    revenue: number;
    net_income: number;
    eps: number;
    pe_ratio: number;
}
declare class FinancialDatasetsClient {
    getPriceSnapshot(ticker: string): Promise<PriceSnapshot>;
    getOHLCV(ticker: string, opts?: {
        interval?: string;
        limit?: number;
    }): Promise<OHLCVCandle[]>;
    getFinancials(ticker: string): Promise<FinancialStatement | null>;
    getSectorPerformance(): Promise<Record<string, number>>;
}
export declare const financialDatasets: FinancialDatasetsClient;
export {};
//# sourceMappingURL=financial.d.ts.map