/**
 * ClawdBot Strategy — Types
 * Parameter schema, results, and changelog for the RSI/EMA adaptive strategy.
 */
export interface ClawdBotParams {
    rsiOverbought: number;
    rsiOversold: number;
    emaFastPeriod: number;
    emaSlowPeriod: number;
    minVolume24h: number;
    minLiquidity: number;
    maxSlippage: number;
    stopLossPct: number;
    takeProfitPct: number;
    positionSizePct: number;
    fundingRateThreshold: number;
    usePerps: boolean;
}
export declare const DEFAULT_PARAMS: ClawdBotParams;
export interface OHLCVBar {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}
export type StrategyDirection = 'long' | 'short' | 'neutral';
export interface StrategySignal {
    direction: StrategyDirection;
    strength: number;
    confidence: number;
    entry_price: number;
    stop_loss: number;
    take_profit: number;
    position_size_pct: number;
    reasons: string[];
    indicators: {
        rsi: number | null;
        ema_fast: number | null;
        ema_slow: number | null;
        ema_cross: 'bullish' | 'bearish' | 'none';
        price_vs_ema_fast: 'above' | 'below' | 'at';
        funding_rate: number | null;
        funding_bias: 'long' | 'short' | 'neutral';
        volume_ok: boolean;
        liquidity_ok: boolean;
    };
    filtered: boolean;
    filter_reason?: string;
}
export interface StrategyChangelogEntry {
    id: string;
    timestamp: string;
    previous_params: ClawdBotParams;
    new_params: ClawdBotParams;
    delta: Partial<ClawdBotParams>;
    reason: string;
    triggered_by: 'manual' | 'auto_optimize' | 'learning_feedback';
    metric_before: number;
    metric_after: number | null;
    metric_name: string;
}
export interface StrategyRegistryState {
    active_params: ClawdBotParams;
    best_metric: number;
    metric_name: string;
    last_updated: string;
    changelog: StrategyChangelogEntry[];
}
//# sourceMappingURL=types.d.ts.map