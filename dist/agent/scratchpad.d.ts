/**
 * Scratchpad — Append-only work log for agent reasoning
 *
 * Adapted from Dexter's Scratchpad pattern:
 * - JSONL file for debugging/persistence
 * - In-memory tool call tracking with soft limits
 * - Context clearing for long-running sessions
 * - Token usage tracking
 *
 * Standalone — no LangChain dependency
 */
export interface ToolCallRecord {
    tool: string;
    args: Record<string, unknown>;
    result: string;
}
export interface ScratchpadEntry {
    type: "init" | "tool_result" | "thinking" | "observation" | "decision";
    timestamp: string;
    content?: string;
    toolName?: string;
    args?: Record<string, unknown>;
    result?: unknown;
}
export interface ToolLimitConfig {
    maxCallsPerTool: number;
    similarityThreshold: number;
}
export interface ToolUsageStatus {
    toolName: string;
    callCount: number;
    maxCalls: number;
    remainingCalls: number;
    recentQueries: string[];
}
export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}
export declare class TokenCounter {
    private usage;
    add(usage?: TokenUsage): void;
    getUsage(): TokenUsage | undefined;
    getTokensPerSecond(elapsedMs: number): number | undefined;
}
export declare function estimateTokens(text: string): number;
export declare const CONTEXT_THRESHOLD = 100000;
export declare const KEEP_TOOL_USES = 5;
export declare class Scratchpad {
    private readonly scratchpadDir;
    private readonly filepath;
    private readonly limitConfig;
    private toolCallCounts;
    private toolQueries;
    private clearedToolIndices;
    constructor(query: string, scratchpadDir?: string, limitConfig?: Partial<ToolLimitConfig>);
    addToolResult(toolName: string, args: Record<string, unknown>, result: string): void;
    addThinking(thought: string): void;
    addObservation(observation: string): void;
    addDecision(decision: string): void;
    canCallTool(toolName: string, query?: string): {
        allowed: boolean;
        warning?: string;
    };
    recordToolCall(toolName: string, query?: string): void;
    getToolResults(): string;
    clearOldestToolResults(keepCount: number): number;
    getToolCallRecords(): ToolCallRecord[];
    hasToolResults(): boolean;
    getToolUsageStatus(): ToolUsageStatus[];
    formatToolUsageForPrompt(): string | null;
    getFullLog(): string;
    private findSimilarQuery;
    private tokenize;
    private parseResultSafely;
    private append;
    private readEntries;
}
//# sourceMappingURL=scratchpad.d.ts.map