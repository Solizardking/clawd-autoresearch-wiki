/**
 * PatternRecognizer — Learns from trade outcomes
 *
 * Analyzes trade history to discover:
 *   - Winning/losing patterns (time of day, signal combinations)
 *   - Asset-specific behaviors (e.g. "SOL dumps after rapid pumps")
 *   - Strategy parameter correlations with outcomes
 *
 * Results are stored as 'learned' memories in MemoryEngine.
 */
import type { TradeRecord } from '../memory/types.js';
export interface DiscoveredPattern {
    pattern_type: string;
    description: string;
    confidence: number;
    supporting_trades: number;
    asset?: string;
}
declare class PatternRecognizer {
    /**
     * Learn from a single completed trade.
     * Stores outcome as a 'learned' memory.
     */
    learnFromTrade(trade: TradeRecord): Promise<void>;
    /**
     * Analyze trade history for an asset and discover patterns.
     */
    analyzeTradeHistory(asset: string): Promise<DiscoveredPattern[]>;
}
export declare const patternRecognizer: PatternRecognizer;
export {};
//# sourceMappingURL=PatternRecognizer.d.ts.map