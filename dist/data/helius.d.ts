/**
 * Helius Data Connector
 * Real-time Solana data via Helius RPC + Enhanced API
 * - WebSocket subscriptions for live txn stream
 * - Enhanced transaction parsing
 * - Token metadata + balances
 * - Priority fee oracle
 */
import { EventEmitter } from "events";
export interface HeliusTokenMetadata {
    mint: string;
    symbol: string;
    name: string;
    decimals: number;
    supply: number;
    logoURI?: string;
}
export interface HeliusTransaction {
    signature: string;
    timestamp: number;
    fee: number;
    feePayer: string;
    type: string;
    source: string;
    tokenTransfers: Array<{
        mint: string;
        fromUserAccount: string;
        toUserAccount: string;
        tokenAmount: number;
    }>;
    nativeTransfers: Array<{
        fromUserAccount: string;
        toUserAccount: string;
        amount: number;
    }>;
    accountData: Array<{
        account: string;
        nativeBalanceChange: number;
        tokenBalanceChanges: unknown[];
    }>;
    events?: Record<string, unknown>;
}
export interface PriorityFeeEstimate {
    min: number;
    low: number;
    medium: number;
    high: number;
    veryHigh: number;
    unsafeMax: number;
}
export interface TokenHolder {
    address: string;
    amount: number;
    decimals: number;
    owner: string;
    rank: number;
}
export type HeliusEvent = {
    type: "transaction";
    data: HeliusTransaction;
} | {
    type: "accountUpdate";
    data: {
        pubkey: string;
        lamports: number;
    };
} | {
    type: "tokenPrice";
    data: {
        mint: string;
        price: number;
    };
};
export declare class HeliusConnector extends EventEmitter {
    private apiKey;
    private rpcUrl;
    private wsUrl;
    private ws;
    private subscriptions;
    private reconnectTimer;
    private isConnected;
    constructor(apiKey: string, rpcUrl: string, wsUrl?: string);
    connectWebSocket(): Promise<void>;
    private handleWebSocketMessage;
    subscribeToAccount(pubkey: string): void;
    subscribeToLogs(mentions?: string[]): void;
    private scheduleReconnect;
    disconnect(): void;
    getEnhancedTransactions(address: string, limit?: number, type?: string): Promise<HeliusTransaction[]>;
    parseTransaction(signature: string): Promise<HeliusTransaction | null>;
    getTokenMetadata(mints: string[]): Promise<HeliusTokenMetadata[]>;
    getTokenHolders(mint: string, limit?: number): Promise<TokenHolder[]>;
    getAccountBalance(pubkey: string): Promise<{
        sol: number;
        tokens: unknown[];
    }>;
    getPriorityFeeEstimate(accountKeys: string[]): Promise<PriorityFeeEstimate>;
    createWebhook(opts: {
        webhookURL: string;
        addresses: string[];
        type: "enhanced" | "raw" | "discord";
    }): Promise<{
        webhookID: string;
    }>;
    rpcCall(method: string, params: unknown[]): Promise<unknown>;
    getSlot(): Promise<number>;
    getRecentBlockhash(): Promise<string>;
    private fetchWithRetry;
}
//# sourceMappingURL=helius.d.ts.map