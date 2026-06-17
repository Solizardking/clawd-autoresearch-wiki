# 🦞 Clawd Autoresearch Wiki

**Solana-Native AI Agent Ecosystem**
LLM: OpenRouter GPT-5.4 (reasoning enabled) | Memory: ClawVault + Dexter Scratchpad
Foundation: OpenClaw Agent Runtime + NanoClaw Framework + Solana Chat (ZK + Light Protocol)

```
Data Flow: Session → Observe → Score → Route → Store → Reflect → Promote
OODA Loop: Observe → Orient → Decide → Act
Memory:    Short-Term Context → Long-Term Vault → Graph Traversal
Strategy:  RSI/EMA Indicators → ClawdBotStrategy → StrategyRegistry (auto-optimize)
Bridge:    Python ↔ TypeScript HTTP API (port 3777)
ZK:        Model inference attestation via Light Protocol compressed accounts
SAS:       Model output credentialing via Solana Attestation Service
```

---

## Repos in this workspace

| Directory | Purpose |
|-----------|---------|
| `src/` | ClawdBot TypeScript agent (trading, analysis, memory, bridge) |
| `solana-chat/` | **NEW** Solana-native LLM training harness (fork of Karpathy's nanochat) |
| `nanochat-master/` | Original nanochat by Karpathy (reference) |
| `dashboard/` | ClawdBot monitoring dashboard |
| `vault/` | Agent memory vault (decisions, lessons, trades, research) |

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
Clawd Autoresearch Wiki
├── ClawdBot Agent (TypeScript)
│   ├── Strategy Engine       ← RSI/EMA cross, volume filters, ATR SL
│   ├── ClawVault Memory      ← decisions, lessons, trades, research
│   ├── Data Connectors       ← Helius, Birdeye, Aster DEX
│   ├── Bridge Server :3777   ← Python ↔ TypeScript bridge
│   └── OODA Loop             ← Autonomous decision cycle
│
├── solana-chat/ (NEW — Solana-native LLM training)
│   ├── nanochat/             ← Karpathy's engine (GPT, Muon, FA3, FP8)
│   ├── solana/               ← Solana-native additions
│   │   ├── dataset.py        ← 20 Solana-domain SFT Q&A pairs
│   │   ├── tasks.py          ← Solana Knowledge Benchmark (18 MCQs)
│   │   ├── zk_routing.py     ← ZK attestation engine
│   │   ├── rpc.py            ← Solana RPC client (8 commands)
│   │   └── light_protocol.py ← Light Protocol SDK (compressed tokens, PDAs, nullifiers, SAS)
│   ├── perps/                ← 13 Solana perps tool functions
│   ├── scripts/              ← Training, evaluation, data prep
│   └── runs/                 ← Speedrun + scaling law scripts
│
├── nanochat-master/          ← Original nanochat by Karpathy (reference)
├── dashboard/                ← ClawdBot monitoring dashboard
└── vault/                    ← Agent memory vault
```

---

## Solana Chat — Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **ZK Routing** | Zero-knowledge attestation of model outputs via Light Protocol compressed accounts | ✅ |
| **Light Protocol** | Compressed tokens (136x cheaper), compressed PDAs (106x cheaper), nullifiers, SAS credentialing | ✅ |
| **Solana Knowledge Benchmark** | 18 MCQs across 6 domains (core, defi, security, agent, zk, constitution) | ✅ |
| **SFT Dataset** | 20+ Q&A pairs covering PDAs, CPI, bonding curves, perps, constitution | ✅ |
| **Perps Tool Suite** | 13 Solana perps tools (price, funding, orderbook, paper trade, risk assessment) | ✅ |
| **Solana Speedrun** | End-to-end training pipeline targeting Solana domain proficiency | ✅ |

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

## Getting Started with solana-chat

```bash
cd solana-chat

# Generate Solana SFT training data
python -m solana.dataset

# Evaluate a trained model on Solana knowledge
python -m scripts.solana_eval --model-tag d12

# Train the Solana-native speedrun (requires 8xH100)
bash runs/speedrun_solana.sh

# Chat with the model over CLI
python -m scripts.chat_cli

# Or launch the web UI
python -m scripts.chat_web
```

## Quick Validation

Run this from the repo root to verify all modules:

```bash
python3 -c "
import sys; sys.path.insert(0, 'solana-chat')
from solana.dataset import SolanaDataset
from solana.tasks import SOLANA_MCQ
from solana.zk_routing import ZKAttestationEngine
from solana.light_protocol import CompressedTokenClient, CompressedPDAClient, NullifierClient, AttestationClient
import hashlib

# Dataset: 20+ SFT pairs
ds = SolanaDataset()
pairs = ds.generate_sft_pairs(count=5)
print(f'[OK] SolanaDataset: {len(pairs)} pairs generated')

# Benchmark: 18 MCQs across 6 topics
print(f'[OK] Benchmark: {len(SOLANA_MCQ)} questions across {len(set(q[\"topic\"] for q in SOLANA_MCQ))} topics')

# ZK: attestation engine works
att = ZKAttestationEngine().attest_output('test', 'output')
print(f'[OK] ZK Attestation: {att.prompt_hash[:16]}...')

# Light Protocol: compressed tokens 136x cheaper
mint = CompressedTokenClient().create_mint('auth', 9)
print(f'[OK] Light Protocol: compressed mint ({mint["compressed_account_cost_sol"]} SOL)')

# Nullifiers: 15K lamports for double-spend prevention
n = NullifierClient().create_nullifier('payer', b'unique-id')
print(f'[OK] Nullifier: {n[\"cost_lamports\"]} lamports')

# SAS: model output credentialing
att = AttestationClient().attest_model_output('SolanaChat-v1', 'auth',
    hashlib.sha256(b'p').hexdigest(), hashlib.sha256(b'o').hexdigest(), hashlib.sha256(b'w').hexdigest())
print(f'[OK] SAS: {att[\"credential\"][\"name\"]} with {len(att[\"schema\"][\"fields\"])} schema fields')

print('\\nAll solana-chat modules verified!')
"
```

---

## License

8BIT Labs / Factory Division — Internal use.
