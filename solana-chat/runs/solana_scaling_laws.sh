#!/bin/bash
# Solana Chat scaling laws experiment — sweep model depth and evaluate Solana knowledge.
#
# Trains models at multiple depths and evaluates Solana knowledge at each.
# Helps find the optimal model size for Solana domain proficiency.
#
# Usage:
#   bash runs/solana_scaling_laws.sh

export OMP_NUM_THREADS=1
export NANOCHAT_BASE_DIR="$HOME/.cache/solana-chat"
mkdir -p $NANOCHAT_BASE_DIR

# Setup
command -v uv &> /dev/null || curl -LsSf https://astral.sh/uv/install.sh | sh
[ -d ".venv" ] || uv venv
uv sync --extra gpu
source .venv/bin/activate

# Generate Solana dataset first
python -m solana.dataset

# Sweep depths
for DEPTH in 6 12 16 20 24; do
    echo ""
    echo "====================================================================="
    echo " Training depth=$DEPTH"
    echo "====================================================================="
    
    python -m scripts.base_train \
        --depth=$DEPTH \
        --run="solana-scaling-d${DEPTH}" \
        --target-param-data-ratio=10.5 \
        --device-batch-size=16 \
        --fp8 \
        --core-metric-every=999999 \
        --sample-every=-1 \
        --save-every=-1
    
    echo ""
    echo "--- Evaluating Solana knowledge at depth=$DEPTH ---"
    python -m scripts.solana_eval --model-tag d${DEPTH} --max-questions=18
done

echo ""
echo "=== Scaling laws experiment complete ==="
echo "Check the report for per-depth Solana knowledge scores."