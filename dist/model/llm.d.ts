/**
 * OpenRouter LLM Client — GPT-5.4 with Reasoning
 *
 * Routes through OpenRouter API using the OpenAI SDK.
 * Supports reasoning (chain-of-thought) for improved trading decisions.
 * Preserves reasoning_details across multi-turn conversations.
 */
export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}
export interface LlmMessage {
    role: "user" | "assistant" | "system";
    content: string;
    reasoning_details?: unknown;
}
export interface LlmCallOptions {
    model?: string;
    systemPrompt?: string;
    reasoning?: boolean;
    maxTokens?: number;
    temperature?: number;
    signal?: AbortSignal;
}
export interface LlmResult {
    content: string;
    reasoning_details?: unknown;
    usage?: TokenUsage;
    rawMessage?: unknown;
}
export declare function callLlm(prompt: string, options?: LlmCallOptions): Promise<LlmResult>;
export declare function callLlmMultiTurn(messages: LlmMessage[], options?: LlmCallOptions): Promise<LlmResult>;
//# sourceMappingURL=llm.d.ts.map