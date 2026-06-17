/**
 * TradingAgent
 * Autonomous agent that:
 * 1. Monitors markets (crypto + equities)
 * 2. Recalls what it knows and has learned
 * 3. Generates signals from multi-source analysis
 * 4. Executes or simulates trades
 * 5. Records outcomes and learns from them
 * 6. Continuously improves via feedback loop
 */
import { EventEmitter } from 'eventemitter3';
import { type TradingSignal } from '../analysis/SignalGenerator.js';
import type { TradeRecord } from '../memory/types.js';
interface AgentConfig {
    cryptoWatchlist: string[];
    equityWatchlist: string[];
    minSignalStrength: number;
    minConfidence: number;
    maxPositions: number;
    cyclePeriodMs: number;
    learnPeriodMs: number;
}
interface OpenPosition {
    tradeId: string;
    signal: TradingSignal;
    entryTime: number;
    maxHoldMs: number;
}
export declare class TradingAgent extends EventEmitter {
    private running;
    private openPositions;
    private cycleTimer;
    private learnTimer;
    private cfg;
    private cycleCount;
    private lastCycleAt;
    private recentSignals;
    private birdeye;
    constructor(cfg?: Partial<AgentConfig>);
    start(): Promise<void>;
    stop(): void;
    private runCycle;
    private analyzeAndTrade;
    private openPosition;
    private checkOpenPositions;
    private runLearning;
    private gatherMacroContext;
    private logEpistemicState;
    isRunning(): boolean;
    getCycleCount(): number;
    getLastCycleAt(): number | null;
    getOpenPositions(): OpenPosition[];
    getRecentSignals(limit?: number): TradingSignal[];
    getTradeHistory(limit?: number): Promise<TradeRecord[]>;
    runCycleNow(): Promise<void>;
    /**
     * Human-readable summary of what the agent knows vs has learned.
     */
    getKnowledgeSummary(asset?: string): Promise<string>;
}
export {};
//# sourceMappingURL=TradingAgent.d.ts.map