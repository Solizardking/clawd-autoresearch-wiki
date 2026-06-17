/**
 * ClawdBot Strategy — Types
 * Parameter schema, results, and changelog for the RSI/EMA adaptive strategy.
 */
export const DEFAULT_PARAMS = {
    rsiOverbought: 70,
    rsiOversold: 30,
    emaFastPeriod: 20,
    emaSlowPeriod: 50,
    minVolume24h: 100_000,
    minLiquidity: 50_000,
    maxSlippage: 0.02,
    stopLossPct: 0.08,
    takeProfitPct: 0.20,
    positionSizePct: 0.10,
    fundingRateThreshold: 0.0005,
    usePerps: true,
};
//# sourceMappingURL=types.js.map