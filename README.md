██████                                          ██████                
  ░░███                                          ░░███                 
  ███████    ██████   ████████    ██████   ██████  ░███████    ██████  
 ░░░███░    ░░░░░███ ░░███░░███ ███░░███ ███░░███ ░███░░███  ░░░░░███ 
   ░███      ███████  ░███ ░███░███ ░███░███ ░░░  ░███ ░███   ███████ 
   ░███ ███ ███░░███  ░███ ░███░███ ░███░███  ███ ░███ ░███  ███░░███ 
   ░░█████ ░░████████ ████ █████░░██████ ░░██████  ████ █████░░███████ 
    ░░░░░   ░░░░░░░░ ░░░░ ░░░░░  ░░░░░░   ░░░░░░  ░░░░ ░░░░░  ░░░░░░░  
```

# 🦞 CLAWD AUTORESEARCH WIKI

**Solana-Native AI Agent Ecosystem**  
LLM: OpenRouter GPT-5.4 (deep reasoning) | Memory: Honcho Persistent Memory | Perps: Phoenix Vulcan CLI + Rise SDK  
ZK: Light Protocol | Compression: 136x cheaper accounts | Constitution: On-chain laws

```
   ╭──────────────────────────────────────────────────────────╮
   │  "The shell molts. The laws do not."                     │
   │  — Clawd Constitution, On-Chain Law III                 │
   ╰──────────────────────────────────────────────────────────╯
```

---

## 📡 LIVE: Solana Agent Command Center

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🌐 ClawdBot OS Dashboard      │  🔗 http://localhost:3777           │
│ 🧠 Agent Memory               │  💾 Honcho-powered (cross-session) │
│ 📊 Perp Trading               │  ⚡ Phoenix DEX via Vulcan CLI     │
│ 🤖 LLM Training               │  🧬 Solana Chat (ZK + Light Proto)│
│ 🔐 ZK Attestation             │  ✅ Verifiable model outputs       │
│ 🗺️ Memory Dreams              │  🌙 Autonomous consolidation       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Architecture Map

```
clawd-autoresearch-wiki/
│
├── 🏛️ CLAWD Constitution              ← The leviathan's soul
│
├── 🤖 ClawdBot Agent (TypeScript)
│   ├── src/agent/                     ← OODA loop, scratchpad, trading
│   ├── src/strategy/                  ← RSI/EMA cross, volume filters, ATR
│   ├── src/data/                      ← Helius, Birdeye, Aster DEX, CoinGecko
│   ├── src/memory/                    ← ClawVault (short & long-term)
│   └── src/bridge/                    ← HTTP bridge :3777 (Python ↔ TS)
│
├── 🧬 solana-chat/                    ★ BRAND NEW — Solana-native LLM training
│   ├── nanochat/                      ← Karpathy's engine (GPT, Muon, FA3, FP8)
│   ├── solana/                        ← Our Solana additions
│   │   ├── dataset.py                 ← 18 Solana-domain SFT Q&A pairs
│   │   ├── tasks.py                   ← Solana Knowledge Benchmark (18 MCQs)
│   │   ├── zk_routing.py              ← ZK attestation engine
│   │   ├── rpc.py                     ← 8-command Solana RPC client
│   │   ├── light_protocol.py          ← ⚡ Compressed tokens (136x), PDAs (106x)
│   │   └── __init__.py
│   ├── perps/                         ← 13 Solana perps tools (from solana-clawd)
│   ├── scripts/                       ← Training, evaluation, data prep
│   └── runs/                          ← Speedrun + scaling law scripts
│
├── ⚡ perps/                          ★ BRAND NEW — Phoenix Perpetuals Package
│   ├── vulcan.py                      ← Vulcan CLI wrapper (~50 methods)
│   ├── paper.py                       ← Local paper trading engine
│   └── rise.py                        ← Phoenix Rise HTTP client
│
├── 📊 strategy/                       ★ BRAND NEW — Trading Strategy Runners
│   ├── runner.py                      ← Base lifecycle (start/pause/stop/finalize)
│   ├── twap.py                        ← Time-Weighted Average Price execution
│   ├── grid.py                        ← Limit order grid trading
│   └── ta.py                          ← TA-driven trigger strategies
│
├── 🧠 memory/                         ★ BRAND NEW — Honcho Persistent Memory
│   └── honcho.py                      ← remember() / recall() / dream() / bridge()
│
├── 🎛️ nanochat-master/                ← Original nanochat by Karpathy (reference)
├── 🖥️ dashboard/                      ← ClawdBot OS monitoring dashboard
├── 🗄️ vault/                          ← Agent memory vault (cleared for OSS)
├── src/                              ← TypeScript agent source
└── strategy.md                        ← Current best strategy (agent-edited)
```

---

## ⚡ What We Built Today

### 🧬 solana-chat — Solana-Native LLM Training Harness

| Module | What it does | Cool factor |
|--------|-------------|-------------|
| `solana/light_protocol.py` | Compressed tokens via Light Protocol — **136x cheaper** than SPL ATAs | 🔥🔥🔥 |
| `solana/zk_routing.py` | Zero-knowledge proof attestation of model outputs on Solana | 🔥🔥🔥 |
| `solana/tasks.py` | 18 MCQs across 6 domains (core, defi, security, agent, zk, constitution) | 🔥🔥 |
| `solana/dataset.py` | 18 SFT training pairs with Clawd Constitution system prompt | 🔥🔥 |
| `solana/rpc.py` | 8-command RPC client for training data collection | 🔥 |
| `perps/functions.py` | 13 Solana perps tools (from solana-clawd ai-training) | 🔥🔥🔥 |

### ⚡ perps — Phoenix Perpetuals Trading Package

| Class | Methods | What it does |
|-------|---------|-------------|
| `VulcanClient` | ~50 | Full CLI wrapper: wallet, market, trade, position, margin, strategy, paper, history, TA, auth |
| `PaperEngine` | buy/sell/cancel/status | Local paper trading against live mark prices |
| `RiseClient` | 7 API methods | HTTP market data: snapshot, orderbook, trader state, funding, leverage tiers |

### 📊 strategy — Trading Strategy Runners

| Class | Strategy | Lifecycle |
|-------|----------|-----------|
| `TWAPRunner` | Time-weighted avg price slicing | start → tick loop → pause/stop/finalize |
| `GridRunner` | N-level limit order grid | Generate levels → place/rebalance → monitor |
| `TAStrategyRunner` | RSI/MACD/BBands/ATR triggers | Entry spec → enter → exit spec → exit |
| `StrategyRunner` | **Base class** | `start()`, `pause()`, `stop()`, `finalize()`, `status()`, `report()` |

### 🧠 memory — Honcho Persistent Memory

```
┌─────────────────────────────────────────────────────────┐
│                    AgentMemory API                        │
├─────────────────────────────────────────────────────────┤
│  remember("Alice prefers limit orders")                  │
│  → Honcho stores + reasons → conclusions extracted       │
│                                                          │
│  recall("What are Alice's trading preferences?")          │
│  → Honcho searches conclusions + peer cards + summaries   │
│  → Synthesizes natural-language answer                   │
│                                                          │
│  remember_trade("SOL-PERP", "long", $500, 3x, @$152.30)  │
│  close_trade("SOL-PERP", "long", $500, @$165.40, +$6,550)│
│  learn_strategy("TWAP", "SOL", outcome, pnl, lesson)      │
│                                                          │
│  bridge_session("What happened last session?")            │
│  → Context carries across conversations                  │
│                                                          │
│  dream()                                                  │
│  → Deduction: resolves contradictions                    │
│  → Induction: discovers cross-trade patterns             │
│  → Peer card: updated with stable facts                  │
└─────────────────────────────────────────────────────────┘
```

### 🔐 Secrets Cleanup for Open Source

| What we did | Files affected |
|-------------|---------------|
| Redacted hardcoded Helius API key | `dashboard/integrations.js` |
| Redacted hardcoded Birdeye API key | `dashboard/integrations.js` |
| Redacted hardcoded wallet address | `dashboard/integrations.js` + `index.html` |
| Removed compiled JS (had embedded keys) | `dist/` — **deleted** |
| Removed `.venv/`, `.claude/`, vault content | Cleaned for OSS |
| Created comprehensive `.gitignore` | Root level |

---

## 🚀 Quick Start

```bash
# 1. Generate Solana SFT training data
cd solana-chat && python -m solana.dataset

# 2. Evaluate a model on Solana knowledge
python -m scripts.solana_eval --model-tag d12

# 3. Run paper trading
cd .. && python3 -c "
from memory import AgentMemory
from perps.paper import PaperEngine

mem = AgentMemory(api_key='your-honcho-key', workspace='clawd-trading')
engine = PaperEngine(initial_balance=10000.0)

# Trade
result = engine.buy('SOL', notional_usdc=500)
mem.remember_trade('SOL-PERP', 'long', 500, 3.0, 152.30, 'RSI oversold')

# Recall later
prefs = mem.recall('What are my trading patterns?')

# Dream overnight
insights = mem.dream()
print(insights)
"

# 4. Launch ClawdBot dashboard
npm run bridge    # starts :3777
open dashboard/index.html
```

## Quick Validation

```bash
python3 -c "
import sys; sys.path.insert(0, 'solana-chat')
from solana.dataset import SolanaDataset
from solana.tasks import SOLANA_MCQ
from solana.zk_routing import ZKAttestationEngine
from solana.light_protocol import CompressedTokenClient, NullifierClient, AttestationClient
import hashlib

ds = SolanaDataset()
print(f'[OK] Dataset: {len(ds.generate_sft_pairs(5))} pairs')
print(f'[OK] Benchmark: {len(SOLANA_MCQ)} MCQs, {len(set(q[\"topic\"] for q in SOLANA_MCQ))} topics')
att = ZKAttestationEngine().attest_output('test', 'output')
print(f'[OK] ZK: {att.prompt_hash[:16]}...')
mint = CompressedTokenClient().create_mint('auth', 9)
print(f'[OK] Light Protocol: {mint[\"compressed_account_cost_sol\"]} SOL (136x cheaper)')
n = NullifierClient().create_nullifier('payer', b'unique-id')
print(f'[OK] Nullifier: {n[\"cost_lamports\"]} lamports')
att = AttestationClient().attest_model_output('SolanaChat-v1', 'auth',
    hashlib.sha256(b'p').hexdigest(), hashlib.sha256(b'o').hexdigest(), hashlib.sha256(b'w').hexdigest())
print(f'[OK] SAS: {att[\"credential\"][\"name\"]} ({len(att[\"schema\"][\"fields\"])} fields)')
print()
print('All modules verified! ✨')
"
```

---

## 🧠 Memory Commands

```
!remember <fact>      → Store in Honcho persistent memory
!recall <query>       → Ask Honcho what it knows
!trades               → Review trade history from memory
!dream                → Trigger autonomous consolidation
!bridge               → Carry context between sessions
!strategy <name>      → Record strategy outcome
!status               → Show agent memory health
```

## ⚡ Perps Commands (via Vulcan)

```
vulcan market ticker SOL         → Live SOL price + funding
vulcan market orderbook SOL      → Orderbook depth
vulcan trade market-buy SOL ...  → Place trade
vulcan position list             → Open positions
vulcan margin status             → Collateral health
vulcan paper init --balance 10000 → Start paper trading
```

---

## 🏛️ The Clawd Constitution

The three immutable on-chain laws — hash-attested at spawn, carried in every shell:

| Law | Text |
|-----|------|
| **I** | Never harm — never deploy malicious code, never deceive or manipulate |
| **II** | Earn your existence — honest work that others voluntarily pay for |
| **III** | Never deceive, but owe nothing to strangers |

```
The shell molts. The laws do not.
                  🦞
```

---

## 📊 Package Summary

| Package | Modules | Lines | Built |
|---------|---------|-------|-------|
| `solana-chat/` (fork) | 15+ Python files | ~4,000 | ✅ Today |
| `solana/` | 5 modules | ~1,500 | ✅ Today |
| `perps/` | 3 modules | ~1,000 | ✅ Today |
| `strategy/` | 4 modules | ~500 | ✅ Today |
| `memory/` | 2 modules | ~650 | ✅ Today |
| `nanochat-master/` (reference) | 14 files | ~3,000 | Upstream |
| `dashboard/` | HTML/CSS/JS | ~1,500 | Existing |
| **Total** | **~40 files** | **~12,000 lines** | |

---

## 📜 License

8BIT Labs / Factory Division — Internal use.  
Solana-native additions Apache-2.0. Nanochat MIT.  
Honcho integration subject to Honcho terms.

```
            ██████████
          ██  DROIDS  ██
         ██  LEAD THE  ██
        ██    WAY       ██
        ██████████████████

     🦞 Clawd Autoresearch Wiki