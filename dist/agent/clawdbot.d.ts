/**
 * ClawdBot — Sentient Solana Trading Intelligence
 *
 * LLM: OpenRouter GPT-5.4 with reasoning
 * OODA Loop: Observe → Orient → Decide → Act
 * Memory: ClawVault persistent markdown memory
 * Scratchpad: Dexter-pattern JSONL work log with tool limits
 * Data: Helius (on-chain) + Birdeye (price) + Aster (perps)
 */
import { ClawVault, type VaultEntry } from "../memory/vault.js";
import { HeliusConnector } from "../data/helius.js";
import { BirdeyeConnector } from "../data/birdeye.js";
import { AsterConnector } from "../data/aster.js";
import { Scratchpad, type TokenUsage } from "./scratchpad.js";
export interface AgentObservation {
    timestamp: string;
    solanaSlot: number;
    watchlist: Array<{
        mint: string;
        symbol: string;
        price: number;
        priceChange24h: number;
        signals: Awaited<ReturnType<BirdeyeConnector["getTechnicalSignals"]>>;
    }>;
    perpsDigest?: Awaited<ReturnType<AsterConnector["getMarketDigest"]>>;
    walletBalance?: {
        sol: number;
    };
}
export interface AgentDecision {
    action: "buy" | "sell" | "long" | "short" | "hold" | "research";
    target?: string;
    size?: number;
    rationale: string;
    signals: Record<string, unknown>;
    confidence: number;
    stopLoss?: number;
    takeProfit?: number;
    reasoning_summary?: string;
}
export type AgentEvent = {
    type: "thinking";
    message: string;
} | {
    type: "observation";
    data: AgentObservation;
} | {
    type: "decision";
    data: AgentDecision;
} | {
    type: "tool_start";
    tool: string;
    args: Record<string, unknown>;
} | {
    type: "tool_end";
    tool: string;
    result: string;
    duration: number;
} | {
    type: "tool_error";
    tool: string;
    error: string;
} | {
    type: "context_cleared";
    clearedCount: number;
    keptCount: number;
} | {
    type: "done";
    answer: string;
    iterations: number;
    totalTime: number;
    tokenUsage?: TokenUsage;
};
export declare class ClawdBot {
    private vault;
    private helius;
    private birdeye;
    private aster;
    private sessionId;
    private conversationHistory;
    private watchlist;
    private walletPubkey?;
    private isRunning;
    private oodaIntervalMs;
    private scratchpad;
    private tokenCounter;
    constructor(config: {
        heliusApiKey: string;
        heliusRpcUrl: string;
        heliusWsUrl?: string;
        birdeyeApiKey: string;
        asterApiKey: string;
        vaultPath?: string;
        watchlist?: string[];
        walletPubkey?: string;
        oodaIntervalMs?: number;
    });
    wake(): Promise<void>;
    startOODALoop(): Promise<void>;
    oodaCycleStream(): AsyncGenerator<AgentEvent>;
    private oodaCycle;
    private observe;
    private formatObservation;
    remember(content: string, opts?: Parameters<ClawVault["remember"]>[1]): Promise<VaultEntry>;
    recall(query: string): Promise<VaultEntry[]>;
    recordTrade(trade: Parameters<ClawVault["recordTrade"]>[0]): Promise<VaultEntry>;
    checkpoint(): Promise<void>;
    sleep(): Promise<void>;
    chat(userMessage: string): Promise<string>;
    addToWatchlist(mint: string): void;
    removeFromWatchlist(mint: string): void;
    researchToken(mint: string): Promise<string>;
    get vaultRef(): ClawVault;
    get heliusRef(): HeliusConnector;
    get birdeyeRef(): BirdeyeConnector;
    get asterRef(): AsterConnector;
    get scratchpadRef(): Scratchpad;
    get tokenUsage(): TokenUsage | undefined;
}
//# sourceMappingURL=clawdbot.d.ts.map