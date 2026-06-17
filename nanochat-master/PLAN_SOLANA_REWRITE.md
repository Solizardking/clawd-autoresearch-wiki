# Solana Chat — Rewrite Plan

## Vision
Merge Karpathy's nanochat (from-scratch GPT training, single-dial simplicity, speedrun culture) with the Solana Clawd ecosystem (constitutional agents, perps/DeFi, ZK primitives, onchain verification) into a new Solana-native LLM training harness.

## Key additions to nanochat

### 1. Solana Data Pipeline (`solana/`)
- **ZK compression via Light Protocol** for onchain model attestation
- **Solana domain eval tasks**: PDA knowledge, DeFi reasoning, perps analysis
- **RPC client** for onchain data collection and model verification

### 2. ZK Routing (`solana/zk_routing.py`)
- Zero-knowledge proofs of model inference correctness
- Light Protocol compressed account state verification
- Onchain attestation of model outputs via ZK

### 3. Solana Leaderboard
- New speedrun category: "Time to Solana-Llama" (Solana domain expertise)
- Evaluation on Solana-specific benchmarks
- CORE-style metric for Solana knowledge

### 4. Constitution Integration
- System prompt derived from Clawd Constitution
- Three-laws enforcement in training data
- Brain/hands split pattern