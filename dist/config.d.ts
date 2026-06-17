/**
 * Config — Centralized configuration from environment variables
 *
 * All config reads from process.env at import time.
 * Supabase, OpenRouter, data source keys, and agent behavior.
 */
export declare const config: {
    supabase: {
        url: string;
        serviceKey: string;
        anonKey: string;
    };
    openrouter: {
        apiKey: string;
        model: string;
    };
    helius: {
        apiKey: string;
        rpcUrl: string;
        wsUrl: string;
    };
    birdeye: {
        apiKey: string;
        baseUrl: string;
    };
    aster: {
        apiKey: string;
    };
    coingecko: {
        apiKey: string;
        baseUrl: string;
    };
    financialDatasets: {
        apiKey: string;
        baseUrl: string;
    };
    agent: {
        mode: "simulation" | "paper" | "live";
        walletPubkey: string;
        watchlist: string[];
        equityWatchlist: string[];
        vaultPath: string;
        oodaIntervalMs: number;
        maxExperiments: number;
        cyclePeriodMs: number;
        learnPeriodMs: number;
        minSignalStrength: number;
        minConfidence: number;
        maxPositions: number;
    };
    bridge: {
        port: number;
    };
    features: {
        useSupabase: boolean;
        usePerps: boolean;
        reasoningEnabled: boolean;
    };
};
//# sourceMappingURL=config.d.ts.map