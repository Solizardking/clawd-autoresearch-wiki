/**
 * ClawVault — Persistent Markdown Memory System for ClawdBot
 *
 * Architecture: Session → Observe → Score → Route → Store → Reflect → Promote
 *
 * Vault structure:
 *   vault/decisions/   — trade decisions with rationale
 *   vault/lessons/     — learned patterns and insights
 *   vault/trades/      — trade outcomes and P&L
 *   vault/research/    — auto-research experiment logs
 *   vault/tasks/       — pending agent tasks
 *   vault/backlog/     — deferred items
 *   vault/inbox/       — raw incoming observations
 *
 * Internal state (.clawvault/):
 *   graph-index.json   — cross-document link graph
 *   last-checkpoint.json — wake/sleep state
 *   config.json        — vault configuration
 */
export type VaultCategory = "decisions" | "lessons" | "trades" | "research" | "tasks" | "backlog" | "inbox";
export interface VaultEntry {
    id: string;
    category: VaultCategory;
    title: string;
    content: string;
    tags: string[];
    links: string[];
    score: number;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, unknown>;
}
export interface GraphNode {
    id: string;
    category: VaultCategory;
    title: string;
    tags: string[];
    score: number;
    links: string[];
    path: string;
}
export interface GraphIndex {
    nodes: Record<string, GraphNode>;
    edges: Array<{
        from: string;
        to: string;
        weight: number;
    }>;
    lastUpdated: string;
}
export interface Checkpoint {
    sessionId: string;
    agentState: Record<string, unknown>;
    activePositions: unknown[];
    pendingResearch: string[];
    lastObservation: string;
    memory: {
        shortTerm: string[];
        promotedIds: string[];
    };
    createdAt: string;
}
export declare class ClawVault {
    private vaultPath;
    private clawvaultPath;
    private graphIndex;
    private shortTermBuffer;
    private readonly SHORT_TERM_MAX;
    constructor(vaultPath?: string);
    init(): Promise<void>;
    /**
     * !remember — Store knowledge in vault
     * Routes content to appropriate category based on scoring
     */
    remember(content: string, opts?: {
        category?: VaultCategory;
        title?: string;
        tags?: string[];
        metadata?: Record<string, unknown>;
        score?: number;
    }): Promise<VaultEntry>;
    /**
     * !recall — Retrieve relevant memories
     * Combines keyword search + tag matching + graph traversal
     */
    recall(query: string, opts?: {
        category?: VaultCategory;
        limit?: number;
        minScore?: number;
    }): Promise<VaultEntry[]>;
    /**
     * Short-term context — recent entries without disk IO
     */
    getShortTermContext(limit?: number): VaultEntry[];
    linkEntries(fromId: string, toId: string, weight?: number): Promise<void>;
    traverseGraph(startId: string, depth?: number): Promise<VaultEntry[]>;
    saveCheckpoint(state: Omit<Checkpoint, "createdAt" | "memory">): Promise<void>;
    loadCheckpoint(): Promise<Checkpoint | null>;
    recordTrade(trade: {
        token: string;
        mint: string;
        side: "long" | "short" | "buy" | "sell";
        size: number;
        entryPrice: number;
        exitPrice?: number;
        pnlUsd?: number;
        pnlPct?: number;
        rationale: string;
        signals: Record<string, unknown>;
        outcome?: "win" | "loss" | "neutral";
    }): Promise<VaultEntry>;
    getTradeHistory(token?: string, limit?: number): Promise<VaultEntry[]>;
    /**
     * Promote high-value inbox entries to their proper categories.
     * Run this during sleep/checkpoint cycles.
     */
    reflect(): Promise<{
        promoted: number;
        archived: number;
    }>;
    private autoRoute;
    private scoreContent;
    private computeRelevance;
    private extractTitle;
    private extractTags;
    private generateId;
    private entryPath;
    private loadEntry;
    private loadAllEntries;
    private saveGraphIndex;
    buildContextProfile(query: string): Promise<string>;
}
//# sourceMappingURL=vault.d.ts.map