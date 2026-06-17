/**
 * Helius Data Connector
 * Real-time Solana data via Helius RPC + Enhanced API
 * - WebSocket subscriptions for live txn stream
 * - Enhanced transaction parsing
 * - Token metadata + balances
 * - Priority fee oracle
 */
import WebSocket from "ws";
import { EventEmitter } from "events";
const HELIUS_BASE = "https://api.helius.xyz/v0";
export class HeliusConnector extends EventEmitter {
    apiKey;
    rpcUrl;
    wsUrl;
    ws = null;
    subscriptions = new Map(); // id → subscription id
    reconnectTimer = null;
    isConnected = false;
    constructor(apiKey, rpcUrl, wsUrl) {
        super();
        this.apiKey = apiKey;
        this.rpcUrl = rpcUrl;
        this.wsUrl = wsUrl ?? rpcUrl.replace("https://", "wss://");
    }
    // ── WebSocket Stream ─────────────────────────────────────────────────
    async connectWebSocket() {
        return new Promise((resolve, reject) => {
            this.ws = new WebSocket(this.wsUrl);
            this.ws.on("open", () => {
                this.isConnected = true;
                console.log("🔌 Helius WebSocket connected");
                resolve();
            });
            this.ws.on("message", (data) => {
                try {
                    const msg = JSON.parse(data.toString());
                    this.handleWebSocketMessage(msg);
                }
                catch (e) {
                    // ignore malformed
                }
            });
            this.ws.on("close", () => {
                this.isConnected = false;
                console.log("⚡ Helius WS disconnected, reconnecting in 5s...");
                this.scheduleReconnect();
            });
            this.ws.on("error", (err) => {
                console.error("Helius WS error:", err.message);
                reject(err);
            });
        });
    }
    handleWebSocketMessage(msg) {
        if (msg.method === "logsNotification") {
            const params = msg.params;
            this.emit("log", params?.result?.value);
        }
        else if (msg.method === "accountNotification") {
            const params = msg.params;
            this.emit("accountUpdate", {
                type: "accountUpdate",
                data: params?.result?.value,
                subscription: params?.subscription,
            });
        }
        else if (msg.result !== undefined && typeof msg.id === "string") {
            // Subscription confirmation
            this.subscriptions.set(msg.id, msg.result);
        }
    }
    subscribeToAccount(pubkey) {
        if (!this.ws || !this.isConnected)
            return;
        const id = `account-${pubkey}`;
        const request = {
            jsonrpc: "2.0",
            id,
            method: "accountSubscribe",
            params: [pubkey, { encoding: "jsonParsed", commitment: "confirmed" }],
        };
        this.ws.send(JSON.stringify(request));
    }
    subscribeToLogs(mentions) {
        if (!this.ws || !this.isConnected)
            return;
        const filter = mentions ? { mentions } : "all";
        const request = {
            jsonrpc: "2.0",
            id: "logs-sub",
            method: "logsSubscribe",
            params: [filter, { commitment: "confirmed" }],
        };
        this.ws.send(JSON.stringify(request));
    }
    scheduleReconnect() {
        if (this.reconnectTimer)
            return;
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectWebSocket().catch(console.error);
        }, 5000);
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
    // ── Enhanced Transactions ────────────────────────────────────────────
    async getEnhancedTransactions(address, limit = 10, type) {
        const url = new URL(`${HELIUS_BASE}/addresses/${address}/transactions`);
        url.searchParams.set("api-key", this.apiKey);
        url.searchParams.set("limit", limit.toString());
        if (type)
            url.searchParams.set("type", type);
        const res = await this.fetchWithRetry(url.toString());
        return res;
    }
    async parseTransaction(signature) {
        const url = `${HELIUS_BASE}/transactions?api-key=${this.apiKey}`;
        const res = await this.fetchWithRetry(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: [signature] }),
        });
        const arr = res;
        return arr[0] ?? null;
    }
    // ── Token Data ───────────────────────────────────────────────────────
    async getTokenMetadata(mints) {
        const url = `${HELIUS_BASE}/token-metadata?api-key=${this.apiKey}`;
        const res = await this.fetchWithRetry(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mintAccounts: mints }),
        });
        return res;
    }
    async getTokenHolders(mint, limit = 20) {
        const url = `${HELIUS_BASE}/token-holders?api-key=${this.apiKey}&mint=${mint}&limit=${limit}`;
        const res = await this.fetchWithRetry(url);
        return res;
    }
    async getAccountBalance(pubkey) {
        const rpcRes = await this.rpcCall("getBalance", [pubkey]);
        const sol = rpcRes.value / 1e9;
        const tokenRes = await this.rpcCall("getTokenAccountsByOwner", [
            pubkey,
            { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
            { encoding: "jsonParsed" },
        ]);
        const tokens = (tokenRes.value ?? []);
        return { sol, tokens };
    }
    // ── Priority Fees ────────────────────────────────────────────────────
    async getPriorityFeeEstimate(accountKeys) {
        const url = `${HELIUS_BASE}/priority-fee-estimate?api-key=${this.apiKey}`;
        const res = await this.fetchWithRetry(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountKeys }),
        });
        return res;
    }
    // ── Webhooks (for persistent monitoring) ────────────────────────────
    async createWebhook(opts) {
        const url = `${HELIUS_BASE}/webhooks?api-key=${this.apiKey}`;
        const res = await this.fetchWithRetry(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                webhookURL: opts.webhookURL,
                transactionTypes: ["Any"],
                accountAddresses: opts.addresses,
                webhookType: opts.type,
            }),
        });
        return res;
    }
    // ── RPC Helpers ──────────────────────────────────────────────────────
    async rpcCall(method, params) {
        const res = await this.fetchWithRetry(this.rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        });
        const rpcRes = res;
        if (rpcRes.error)
            throw new Error(`RPC error: ${rpcRes.error.message}`);
        return rpcRes.result;
    }
    async getSlot() {
        return (await this.rpcCall("getSlot", []));
    }
    async getRecentBlockhash() {
        const res = await this.rpcCall("getLatestBlockhash", [{ commitment: "finalized" }]);
        return (res.value.blockhash);
    }
    // ── Network Utils ────────────────────────────────────────────────────
    async fetchWithRetry(url, opts = {}, retries = 3) {
        let lastErr = new Error("unknown");
        for (let i = 0; i < retries; i++) {
            try {
                const res = await fetch(url, {
                    ...opts,
                    signal: AbortSignal.timeout(10000),
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status}: ${text}`);
                }
                return await res.json();
            }
            catch (e) {
                lastErr = e;
                if (i < retries - 1) {
                    await new Promise((r) => setTimeout(r, 1000 * 2 ** i));
                }
            }
        }
        throw lastErr;
    }
}
//# sourceMappingURL=helius.js.map