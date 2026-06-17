/**
 * MemoryEngine — Epistemological Memory System
 *
 * Supabase-backed when available, falls back to in-memory store.
 *
 * Three memory tiers:
 *   known    — raw observations (price snapshots, on-chain events)
 *   learned  — insights derived from trade outcomes
 *   inferred — connections the agent draws between facts
 *
 * Public API:
 *   remember()       — store a new memory
 *   recall()         — search memories by query
 *   whatDoIKnow()    — epistemological state for an asset
 *   recordTrade()    — open a new trade
 *   closeTrade()     — close and record outcome
 *   getTradeHistory()— fetch recent trades
 *   listKnownAssets()— all entities the agent has data on
 */
import type { MemoryEntry, MemoryInput, TradeRecord, EpistemologicalState, KnowledgeIndexEntry } from './types.js';
declare class MemoryEngine {
    private supabase;
    private memoryStore;
    private tradeStore;
    private initialized;
    init(): Promise<void>;
    remember(input: MemoryInput): Promise<string>;
    recall(query: string, opts?: {
        asset?: string;
        memory_type?: MemoryEntry['memory_type'];
        limit?: number;
    }): Promise<MemoryEntry[]>;
    whatDoIKnow(asset: string): Promise<EpistemologicalState>;
    recordTrade(trade: Omit<TradeRecord, 'id' | 'created_at'>): Promise<string>;
    closeTrade(tradeId: string, result: {
        exit_price: number;
        pnl_usd: number;
        pnl_pct: number;
        notes?: string;
    }): Promise<void>;
    getTradeHistory(asset?: string, limit?: number): Promise<TradeRecord[]>;
    listKnownAssets(): Promise<KnowledgeIndexEntry[]>;
}
export declare const memoryEngine: MemoryEngine;
export {};
//# sourceMappingURL=MemoryEngine.d.ts.map