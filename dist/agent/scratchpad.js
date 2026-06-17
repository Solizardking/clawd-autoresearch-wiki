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
import { existsSync, mkdirSync, appendFileSync, readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";
export class TokenCounter {
    usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    add(usage) {
        if (!usage)
            return;
        this.usage.inputTokens += usage.inputTokens;
        this.usage.outputTokens += usage.outputTokens;
        this.usage.totalTokens += usage.totalTokens;
    }
    getUsage() {
        return this.usage.totalTokens > 0 ? { ...this.usage } : undefined;
    }
    getTokensPerSecond(elapsedMs) {
        if (this.usage.totalTokens === 0 || elapsedMs <= 0)
            return undefined;
        return this.usage.totalTokens / (elapsedMs / 1000);
    }
}
// ── Rough token estimator (no tokenizer dependency) ──────────────────
export function estimateTokens(text) {
    return Math.ceil(text.length / 3.5);
}
export const CONTEXT_THRESHOLD = 100_000; // ~100k token threshold
export const KEEP_TOOL_USES = 5;
// ── Scratchpad ────────────────────────────────────────────────────────
const DEFAULT_LIMIT_CONFIG = {
    maxCallsPerTool: 5,
    similarityThreshold: 0.7,
};
export class Scratchpad {
    scratchpadDir;
    filepath;
    limitConfig;
    toolCallCounts = new Map();
    toolQueries = new Map();
    clearedToolIndices = new Set();
    constructor(query, scratchpadDir = "./.clawvault/scratchpad", limitConfig) {
        this.scratchpadDir = scratchpadDir;
        this.limitConfig = { ...DEFAULT_LIMIT_CONFIG, ...limitConfig };
        if (!existsSync(this.scratchpadDir)) {
            mkdirSync(this.scratchpadDir, { recursive: true });
        }
        const hash = createHash("md5").update(query).digest("hex").slice(0, 12);
        const timestamp = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", "-")
            .replace(/:/g, "");
        this.filepath = join(this.scratchpadDir, `${timestamp}_${hash}.jsonl`);
        this.append({
            type: "init",
            content: query,
            timestamp: new Date().toISOString(),
        });
    }
    // ── Add entries ────────────────────────────────────────────────────
    addToolResult(toolName, args, result) {
        this.append({
            type: "tool_result",
            timestamp: new Date().toISOString(),
            toolName,
            args,
            result: this.parseResultSafely(result),
        });
    }
    addThinking(thought) {
        this.append({
            type: "thinking",
            content: thought,
            timestamp: new Date().toISOString(),
        });
    }
    addObservation(observation) {
        this.append({
            type: "observation",
            content: observation,
            timestamp: new Date().toISOString(),
        });
    }
    addDecision(decision) {
        this.append({
            type: "decision",
            content: decision,
            timestamp: new Date().toISOString(),
        });
    }
    // ── Tool Limit Checking ─────────────────────────────────────────────
    canCallTool(toolName, query) {
        const currentCount = this.toolCallCounts.get(toolName) ?? 0;
        const maxCalls = this.limitConfig.maxCallsPerTool;
        if (currentCount >= maxCalls) {
            return {
                allowed: true,
                warning: `Tool '${toolName}' called ${currentCount}× (limit: ${maxCalls}). Consider a different approach.`,
            };
        }
        if (query) {
            const previousQueries = this.toolQueries.get(toolName) ?? [];
            const similar = this.findSimilarQuery(query, previousQueries);
            if (similar) {
                return {
                    allowed: true,
                    warning: `Similar query already sent to '${toolName}'. Try different terms.`,
                };
            }
        }
        return { allowed: true };
    }
    recordToolCall(toolName, query) {
        const count = this.toolCallCounts.get(toolName) ?? 0;
        this.toolCallCounts.set(toolName, count + 1);
        if (query) {
            const queries = this.toolQueries.get(toolName) ?? [];
            queries.push(query);
            this.toolQueries.set(toolName, queries);
        }
    }
    // ── Context Management ──────────────────────────────────────────────
    getToolResults() {
        const entries = this.readEntries();
        let toolResultIndex = 0;
        const formatted = [];
        for (const entry of entries) {
            if (entry.type !== "tool_result" || !entry.toolName)
                continue;
            if (this.clearedToolIndices.has(toolResultIndex)) {
                formatted.push(`[Tool result #${toolResultIndex + 1} cleared from context]`);
                toolResultIndex++;
                continue;
            }
            const argsStr = entry.args
                ? Object.entries(entry.args)
                    .map(([k, v]) => `${k}=${v}`)
                    .join(", ")
                : "";
            const resultStr = typeof entry.result === "string"
                ? entry.result
                : JSON.stringify(entry.result);
            formatted.push(`### ${entry.toolName}(${argsStr})\n${resultStr}`);
            toolResultIndex++;
        }
        return formatted.join("\n\n");
    }
    clearOldestToolResults(keepCount) {
        const entries = this.readEntries();
        const indices = [];
        let idx = 0;
        for (const entry of entries) {
            if (entry.type === "tool_result") {
                if (!this.clearedToolIndices.has(idx)) {
                    indices.push(idx);
                }
                idx++;
            }
        }
        const toClear = Math.max(0, indices.length - keepCount);
        if (toClear === 0)
            return 0;
        for (let i = 0; i < toClear; i++) {
            this.clearedToolIndices.add(indices[i]);
        }
        return toClear;
    }
    getToolCallRecords() {
        return this.readEntries()
            .filter((e) => e.type === "tool_result" && e.toolName)
            .map((e) => ({
            tool: e.toolName,
            args: e.args,
            result: typeof e.result === "string" ? e.result : JSON.stringify(e.result),
        }));
    }
    hasToolResults() {
        return this.readEntries().some((e) => e.type === "tool_result");
    }
    getToolUsageStatus() {
        const statuses = [];
        for (const [toolName, callCount] of this.toolCallCounts) {
            const maxCalls = this.limitConfig.maxCallsPerTool;
            statuses.push({
                toolName,
                callCount,
                maxCalls,
                remainingCalls: Math.max(0, maxCalls - callCount),
                recentQueries: (this.toolQueries.get(toolName) ?? []).slice(-3),
            });
        }
        return statuses;
    }
    formatToolUsageForPrompt() {
        const statuses = this.getToolUsageStatus();
        if (statuses.length === 0)
            return null;
        const lines = statuses.map((s) => {
            const status = s.callCount >= s.maxCalls
                ? `${s.callCount} calls (over limit of ${s.maxCalls})`
                : `${s.callCount}/${s.maxCalls} calls`;
            return `- ${s.toolName}: ${status}`;
        });
        return `## Tool Usage This Query\n\n${lines.join("\n")}`;
    }
    // ── Full work log for context ───────────────────────────────────────
    getFullLog() {
        const entries = this.readEntries();
        const sections = [];
        for (const entry of entries) {
            if (entry.type === "init") {
                sections.push(`## Query\n${entry.content}`);
            }
            else if (entry.type === "thinking") {
                sections.push(`## Thinking\n${entry.content}`);
            }
            else if (entry.type === "observation") {
                sections.push(`## Observation\n${entry.content}`);
            }
            else if (entry.type === "decision") {
                sections.push(`## Decision\n${entry.content}`);
            }
            else if (entry.type === "tool_result") {
                const result = typeof entry.result === "string"
                    ? entry.result
                    : JSON.stringify(entry.result, null, 2);
                sections.push(`## Tool: ${entry.toolName}\n${result}`);
            }
        }
        return sections.join("\n\n");
    }
    // ── Private Helpers ─────────────────────────────────────────────────
    findSimilarQuery(newQuery, previousQueries) {
        const newWords = this.tokenize(newQuery);
        for (const prev of previousQueries) {
            const prevWords = this.tokenize(prev);
            const intersection = [...newWords].filter((w) => prevWords.has(w)).length;
            const union = new Set([...newWords, ...prevWords]).size;
            const similarity = union > 0 ? intersection / union : 0;
            if (similarity >= this.limitConfig.similarityThreshold)
                return prev;
        }
        return null;
    }
    tokenize(query) {
        return new Set(query
            .toLowerCase()
            .replace(/[^\w\s]/g, " ")
            .split(/\s+/)
            .filter((w) => w.length > 2));
    }
    parseResultSafely(result) {
        try {
            return JSON.parse(result);
        }
        catch {
            return result;
        }
    }
    append(entry) {
        appendFileSync(this.filepath, JSON.stringify(entry) + "\n");
    }
    readEntries() {
        if (!existsSync(this.filepath))
            return [];
        return readFileSync(this.filepath, "utf-8")
            .split("\n")
            .filter((line) => line.trim())
            .map((line) => {
            try {
                const parsed = JSON.parse(line);
                return parsed && typeof parsed === "object" && "type" in parsed
                    ? parsed
                    : null;
            }
            catch {
                return null;
            }
        })
            .filter((e) => e !== null);
    }
}
//# sourceMappingURL=scratchpad.js.map