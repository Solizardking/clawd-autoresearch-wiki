/**
 * StrategyRegistry
 *
 * Manages active ClawdBot strategy parameters:
 *   - Loads params from Supabase on startup
 *   - Falls back to DEFAULT_PARAMS if none persisted
 *   - Records every param change in a changelog
 *   - Persists state to `strategy_state` table
 *   - Exposes updateParams() for manual + auto-optimized updates
 *   - Broadcasts param changes via EventEmitter (so ClawdBotStrategy hot-reloads)
 */
import { EventEmitter } from 'eventemitter3';
import type { ClawdBotParams, StrategyChangelogEntry, StrategyRegistryState } from './types.js';
import { ClawdBotStrategy } from './ClawdBotStrategy.js';
export declare class StrategyRegistry extends EventEmitter {
    private supabase;
    private state;
    readonly strategy: ClawdBotStrategy;
    constructor();
    init(): Promise<void>;
    getParams(): ClawdBotParams;
    getState(): StrategyRegistryState;
    getChangelog(): StrategyChangelogEntry[];
    /**
     * Update active parameters.
     * Records a changelog entry, persists to Supabase/file, hot-reloads the strategy.
     */
    updateParams(newParams: Partial<ClawdBotParams>, opts: {
        reason: string;
        triggered_by?: StrategyChangelogEntry['triggered_by'];
        current_metric?: number;
    }): Promise<StrategyChangelogEntry>;
    /**
     * Record that a metric measurement was taken after the last param change.
     * Used to track whether an optimization was beneficial.
     */
    recordMetric(value: number, metricName?: string): Promise<void>;
    /**
     * Reset all strategy parameters back to DEFAULT_PARAMS.
     * Records a changelog entry so the reset is fully auditable.
     */
    resetToDefaults(reason?: string): Promise<void>;
    /**
     * Auto-optimize: apply a small mutation to params if recent performance improved.
     * Uses a simple hill-climbing approach — perturb one param at a time.
     */
    autoOptimize(opts: {
        recentWinRate: number;
        recentPnlAvg: number;
        tradeCount: number;
    }): Promise<void>;
    private save;
    private loadFromSupabase;
    private saveToSupabase;
    private loadFromFile;
    private saveToFile;
}
export declare const strategyRegistry: StrategyRegistry;
//# sourceMappingURL=StrategyRegistry.d.ts.map