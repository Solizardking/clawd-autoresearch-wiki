/**
 * ClawdBot Auto-Research Loop
 *
 * LLM: OpenRouter GPT-5.4 with reasoning
 * Pattern: autoresearch (hypothesis → experiment → evaluate → keep/discard)
 * Scratchpad: Dexter-pattern JSONL logging per experiment
 *
 * Flow: Read program.md → Generate hypothesis → Run experiment →
 *       Evaluate → Store lesson → Repeat
 */
export interface Experiment {
    id: string;
    hypothesis: string;
    strategyParams: Record<string, unknown>;
    startedAt: string;
    endedAt?: string;
    result?: ExperimentResult;
    accepted: boolean;
}
export interface ExperimentResult {
    trades: number;
    winRate: number;
    avgPnlPct: number;
    maxDrawdown: number;
    sharpe: number;
    metric: number;
    comparison: "better" | "worse" | "neutral";
    delta: number;
}
export interface StrategyParams {
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
export declare class ResearchLoop {
    private vault;
    private birdeye;
    private aster;
    private tokenCounter;
    private programPath;
    private strategyPath;
    private currentStrategy;
    private bestStrategy;
    private bestMetric;
    private experiments;
    private isRunning;
    constructor(config: {
        birdeyeApiKey: string;
        asterApiKey: string;
        vaultPath?: string;
        programPath?: string;
        strategyPath?: string;
    });
    init(): Promise<void>;
    run(maxExperiments?: number, experimentBudgetMs?: number): Promise<void>;
    stop(): void;
    private generateHypothesis;
    private mutateStrategy;
    private runExperiment;
    private backtestStrategy;
    private computeResult;
    private mockExperimentResult;
    private logExperiment;
    private generateSummary;
    private loadStrategy;
    private saveStrategy;
    private readProgram;
    private computeRSI;
    private computeEMA;
}
//# sourceMappingURL=loop.d.ts.map