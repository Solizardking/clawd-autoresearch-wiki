# 🦞 ClawdBot Agent v2.0

**Persistent Memory + Sentient Solana Intelligence**
LLM: OpenRouter GPT-5.4 (reasoning enabled) | Memory: ClawVault + Dexter Scratchpad
Foundation: OpenClaw Agent Runtime + NanoClaw Framework

```
Data Flow: Session → Observe → Score → Route → Store → Reflect → Promote
OODA Loop: Observe → Orient → Decide → Act
Memory:    Short-Term Context → Long-Term Vault → Graph Traversal
Strategy:  RSI/EMA Indicators → ClawdBotStrategy → StrategyRegistry (auto-optimize)
Bridge:    Python ↔ TypeScript HTTP API (port 3777)
```

---

## Architecture

```
ClawdBot Agent v2.0
├── Strategy Engine (NEW)
│   ├── src/strategy/types.ts         ← ClawdBotParams, StrategySignal, changelog
│   ├── src/strategy/indicators.ts    ← RSI, EMA, ATR, Volume (pure math)
│   ├── src/strategy/ClawdBotStrategy.ts  ← RSI+EMA cross strategy engine
│   └── src/strategy/StrategyRegistry.ts ← Param management, auto-optimize, persistence
│
├── ClawVault (Memory)
│   ├── vault/decisions/     ← trade decisions + rationale
│   ├── vault/lessons/       ← learned patterns, insights
│   ├── vault/trades/        ← trade outcomes + P&L
│   ├── vault/research/      ← experiment logs
│   ├── vault/tasks/         ← agent task queue
│   ├── vault/backlog/       ← deferred items
│   └── vault/inbox/         ← raw observations (auto-routed)
│
├── .clawvault/ (Internal State)
│   ├── graph-index.json     ← cross-document knowledge graph
│   ├── strategy-state.json  ← strategy params + changelog (auto-optimize)
│   └── last-checkpoint.json ← wake/sleep state
│
├── Data Connectors
│   ├── Helius               ← Real-time Solana (RPC + WebSocket)
│   ├── Birdeye              ← Token analytics, OHLCV, technicals
│   └── Aster DEX            ← Perpetual futures, funding rates
│
├── Agent Core (ClawdBot v2)
│   ├── OpenRouter GPT-5.4   ← With deep reasoning (reasoning_details preserved)
│   ├── Dexter Scratchpad    ← JSONL work log + token tracking
│   ├── OODA Loop            ← Autonomous decision cycle
│   ├── Chat Interface       ← Natural language memory commands
│   └── Trade Recorder       ← Auto-learns from outcomes
│
├── Bridge Server (port 3777)
│   ├── /api/agent/chat      ← Chat with ClawdBot
│   ├── /api/agent/observe   ← Trigger OODA observation
│   ├── /api/agent/research  ← Start auto-research
│   ├── /api/python/result   ← Report Python training results
│   └── /api/automate/full   ← Full automation cycle
│
├── NanoClaw Integration
│   ├── ClawdBot Channel      ← Routes NanoClaw messages to ClawdBot
│   ├── Group Management     ← Multi-channel support
│   └── Task Scheduler       ← Cron + interval tasks
│
└── Research Loop
    ├── program.md           ← Research instructions
    ├── strategy.md          ← Current best strategy (agent edits this)
    └── Overnight Experiments← Hypothesis → Backtest → Accept/Reject
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Run interactive chat
npm run chat

# 4. Run live OODA agent
npm run live

# 5. Run overnight research
npm run research

# 6. Query memory vault
npm run recall "lessons about RSI"

# 7. Start bridge server (Python ↔ TS)
npm run bridge
```

---

## Environment Variables

```bash
# LLM (required)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=openai/gpt-5.4

# Data Sources (required)
HELIUS_API_KEY=
HELIUS_RPC_URL=
HELIUS_WSS_URL=           # Optional: WebSocket URL
BIRDEYE_API_KEY=
ASTER_API_KEY=

# Agent Config
WALLET_PUBKEY=             # Your Solana wallet (read-only for balance)
WATCHLIST=mint1,mint2      # Comma-separated token mints to watch
VAULT_PATH=./vault         # Memory vault location
OODA_INTERVAL_MS=60000     # OODA cycle interval (default: 1 min)
MAX_EXPERIMENTS=50         # Research loop: experiments per session

# Bridge
BRIDGE_PORT=3777           # HTTP bridge port
```

---

## Strategy Engine

ClawdBot v2.0 includes a quantitative strategy engine with auto-optimization:

### Indicators (pure TypeScript, no deps)
- **RSI** — Wilder's Relative Strength Index with configurable period
- **EMA** — Exponential Moving Average with SMA seed
- **ATR** — Average True Range for volatility-based SL adjustment
- **Volume** — Rolling average volume filter

### Strategy (ClawdBotStrategy)
- RSI + EMA cross signal generation
- Volume & liquidity pre-filters
- Funding rate bias from perps
- ATR-adjusted stop-loss and take-profit
- Full indicator breakdown in every signal

### Auto-Optimize (StrategyRegistry)
- Hill-climbing parameter optimization
- Automatic RSI threshold tightening on low win rate
- Stop-loss widening on frequent stop-outs
- Position size scaling on strong performance
- Full changelog with before/after metrics

### Active Parameters
See `strategy.md` — updated by the auto-optimizer.

---

## Memory Commands

```
!remember <content>   → Store knowledge to vault (auto-routed to category)
!recall <query>       → Search long-term memory
!trades               → Review recent trade history
!lessons              → Surface learned patterns
!research <mint>      → Deep research a token and store analysis
!checkpoint           → Save agent state to .clawvault/
!tokens               → Token usage statistics
```

---

## Database Schema

The `schema.sql` file contains the Supabase/PostgreSQL schema for:
- `agent_memories` — epistemological memory (known/learned/inferred) with pgvector
- `trade_records` — all executed/simulated trades
- `market_snapshots` — raw API data with TTL
- `research_reports` — synthesized analysis
- `learning_events` — belief update audit trail
- `knowledge_index` — what the agent knows about each entity
- `strategy_state` — ClawdBot params + changelog persistence

---

## Production Checklist

- [x] Retry logic on all RPC/API calls (3 retries, exponential backoff)
- [x] WebSocket with auto-reconnect
- [x] Explicit timeouts on all network ops (10s default)
- [x] Graceful shutdown with vault checkpoint
- [x] Circuit breaker pattern (connection failures don't crash loop)
- [x] Structured logging with timestamps
- [x] Memory persistence across sessions
- [x] Auto-reflect and promote inbox entries
- [x] Strategy auto-optimization via hill climbing
- [x] GPT-5.4 reasoning preservation across multi-turn
- [x] Python ↔ TypeScript bridge server
- [x] NanoClaw framework integration

---

## License

8BIT Labs / Factory Division — Internal use.
