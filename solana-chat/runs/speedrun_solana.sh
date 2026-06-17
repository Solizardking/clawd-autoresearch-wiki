#!/bin/bash
# Solana Chat speedrun — train a Solana-native GPT model from scratch.
#
# This script extends nanochat's speedrun with Solana-specific SFT data
# injection and Solana knowledge evaluation.
#
# Requires an 8XH100 GPU node. Takes ~3.5 hours.
#
# Usage:
#   bash runs/speedrun_solana.sh
#   WANDB_RUN=solana-chat-d24 bash runs/speedrun_solana.sh

export OMP_NUM_THREADS=1
export NANOCHAT_BASE_DIR="$HOME/.cache/solana-chat"
mkdir -p $NANOCHAT_BASE_DIR

# ── Setup ──
command -v uv &> /dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
[ -d ".venv" ] || uv venv
uv sync --extra gpu
source .venv/bin/activate

if [ -z "$WANDB_RUN" ]; then
    WANDB_RUN=dummy
fi

python -m nanochat.report reset

# ── Step 1: Generate Solana SFT data ──
echo "=== Step 1: Generating Solana SFT data ==="
python -m solana.dataset
# This writes data/solana_chat_seed.jsonl and data/solana_chat_eval.jsonl

# ── Step 2: Download base dataset + train tokenizer ──
echo "=== Step 2: Dataset download + tokenizer ==="
python -m nanochat.dataset -n 8
python -m nanochat.dataset -n 170 &
DATASET_DOWNLOAD_PID=$!
python -m scripts.tok_train
python -m scripts.tok_eval

# ── Step 3: Pretrain base model ──
echo "=== Step 3: Pretraining (d24) ==="
wait $DATASET_DOWNLOAD_PID
torchrun --standalone --nproc_per_node=8 -m scripts.base_train \
    --depth=24 \
    --target-param-data-ratio=9.5 \
    --device-batch-size=16 \
    --fp8 \
    --run=$WANDB_RUN

# ── Step 4: Evaluate base model (CORE + Solana knowledge) ──
echo "=== Step 4: Evaluating base model ==="
torchrun --standalone --nproc_per_node=8 -m scripts.base_eval --device-batch-size=16
python -m scripts.solana_eval --model-tag d24 --max-questions=18

# ── Step 5: SFT with Solana data ──
echo "=== Step 5: SFT with Clawd voice ==="
torchrun --standalone --nproc_per_node=8 -m scripts.chat_sft \
    --device-batch-size=16 \
    --run=$WANDB_RUN

# ── Step 6: Final evaluation ──
echo "=== Step 6: Final evaluation ==="
torchrun --standalone --nproc_per_node=8 -m scripts.base_eval --device-batch-size=16
python -m scripts.solana_eval --model-tag d24 --max-questions=18

# Generate report
python -m nanochat.report generate

echo ""
echo "=== Solana Chat speedrun complete! ==="
echo "Try: python -m scripts.chat_cli -p 'What is a PDA on Solana?'"
echo "Or:  python -m scripts.chat_web"