/**
 * ClawdBotStrategy
 *
 * RSI + EMA cross strategy for Solana tokens with:
 *   - Volume and liquidity pre-filters
 *   - Funding rate bias (perps)
 *   - Parameterized TP/SL/position sizing from active params
 *   - Full indicator breakdown in every signal
 *
 * Entry rules:
 *   LONG  → RSI crosses above oversold AND price > EMA_fast AND EMA_fast > EMA_slow
 *   SHORT → RSI crosses below overbought AND price < EMA_fast AND EMA_fast < EMA_slow
 *           (only if usePerps is true)
 *
 * Funding rate:
 *   Positive funding = longs pay → slight short bias
 *   Negative funding = shorts pay → slight long bias
 *   Magnitude > fundingRateThreshold adds a reason and bumps strength.
 */
import type { ClawdBotParams, OHLCVBar, StrategySignal } from './types.js';
export declare class ClawdBotStrategy {
    private params;
    constructor(params: ClawdBotParams);
    /** Update params at runtime (called by StrategyRegistry on param change). */
    updateParams(params: ClawdBotParams): void;
    getParams(): ClawdBotParams;
    /**
     * Main signal evaluation.
     *
     * @param bars     - OHLCV bars, oldest first, at least emaSlowPeriod+RSI_PERIOD bars
     * @param metadata - current market metadata (volume, liquidity, funding rate)
     */
    evaluate(bars: OHLCVBar[], metadata: {
        volume24h: number;
        liquidity: number;
        fundingRate?: number;
        symbol: string;
    }): StrategySignal;
    private filteredSignal;
}
//# sourceMappingURL=ClawdBotStrategy.d.ts.map