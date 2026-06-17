/**
 * SignalGenerator — Multi-source trading signal synthesis
 *
 * Combines:
 *   - ClawdBotStrategy (RSI+EMA+ATR from OHLCV bars)
 *   - Birdeye token analytics (volume, liquidity, holders)
 *   - Aster DEX perpetual data (funding rates, OI)
 *   - FinancialDatasets equity data (for equity watchlist)
 *   - MemoryEngine recalled knowledge (patterns, past outcomes)
 *
 * Outputs a unified TradingSignal with direction, strength, confidence,
 * entry/exit zones, thesis, and source attribution.
 */
export interface TradingSignal {
    asset: string;
    asset_class: 'crypto' | 'equity';
    direction: 'long' | 'short' | 'neutral';
    strength: number;
    confidence: number;
    entry_zone?: [number, number];
    stop_loss?: number;
    take_profit?: number;
    position_size_pct?: number;
    thesis: string;
    sources: string[];
    memory_ids: string[];
    indicators: Record<string, unknown>;
    timestamp: string;
}
declare class SignalGenerator {
    private birdeye;
    private aster;
    constructor();
    /**
     * Generate a signal for a crypto token.
     */
    cryptoSignal(token: {
        address: string;
        symbol?: string;
    }): Promise<TradingSignal>;
    /**
     * Generate a signal for an equity ticker.
     */
    equitySignal(ticker: string): Promise<TradingSignal>;
}
export declare const signalGenerator: SignalGenerator;
export {};
//# sourceMappingURL=SignalGenerator.d.ts.map