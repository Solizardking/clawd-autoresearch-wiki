/**
 * Indicators
 * Pure-function technical indicator implementations used by ClawdBotStrategy.
 * All functions operate on close-price arrays (oldest first).
 */
import type { OHLCVBar } from './types.js';
/**
 * Wilder's RSI (original Relative Strength Index).
 * Returns array of RSI values aligned with closes[period..-1].
 * First `period` values are undefined (warm-up).
 */
export declare function calculateRSI(closes: number[], period?: number): (number | null)[];
/**
 * Latest RSI value from a bars array.
 */
export declare function latestRSI(bars: OHLCVBar[], period?: number): number | null;
/**
 * Exponential Moving Average.
 * Returns array same length as closes; first `period-1` values are null.
 */
export declare function calculateEMA(closes: number[], period: number): (number | null)[];
/**
 * Latest EMA value.
 */
export declare function latestEMA(bars: OHLCVBar[], period: number): number | null;
/**
 * EMA cross direction: 'bullish' if fast > slow, 'bearish' if fast < slow.
 * Also detects cross (prev cross alignment was different).
 */
export declare function emaCrossState(bars: OHLCVBar[], fastPeriod: number, slowPeriod: number): {
    current: 'bullish' | 'bearish';
    crossed: boolean;
    ema_fast: number | null;
    ema_slow: number | null;
};
/**
 * Average True Range — used for volatility-based SL adjustments.
 */
export declare function calculateATR(bars: OHLCVBar[], period?: number): number | null;
/**
 * Average volume over the last N bars.
 */
export declare function avgVolume(bars: OHLCVBar[], n?: number): number;
//# sourceMappingURL=indicators.d.ts.map