/**
 * ClawdBot Dashboard — Interactive JavaScript Controller
 * Auto-detects Railway backend or falls back to localhost
 * Real-time Birdeye + Aster data panels
 */

const BRIDGE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3777'
  : 'https://backend-production-a65f.up.railway.app';
let connected = false;
let tokenUsage = { input: 0, output: 0, total: 0 };

// SOL token address for default data
const SOL_ADDRESS = 'So11111111111111111111111111111111111111112';
let activeToken = SOL_ADDRESS;

// ── Init ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  checkConnection();
  setInterval(checkConnection, 10000);
  loadStrategyFile();

  // Auto-refresh live data every 15s
  setInterval(() => {
    if (connected) {
      loadTokenData(activeToken);
      loadRecentTrades(activeToken);
    }
  }, 15000);
});

// ── Connection Check ────────────────────────────────────────────────────

async function checkConnection() {
  const badge = document.getElementById('status-badge');
  const text = document.getElementById('status-text');

  try {
    const res = await fetch(`${BRIDGE_URL}/api/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = await res.json();
      connected = true;
      badge.className = 'status-badge online';
      text.textContent = 'Bridge Online';

      document.getElementById('stat-model').textContent = data.model || 'GPT-5.4';
      document.getElementById('stat-model-sub').textContent = 'OpenRouter';

      // Auto-load live data on first connect
      if (data.birdeye) {
        loadTokenData(activeToken);
        loadRecentTrades(activeToken);
        loadTrendingTokens();
      }
      return;
    }
  } catch {}

  connected = false;
  badge.className = 'status-badge offline';
  text.textContent = 'Offline';
  document.getElementById('stat-model').textContent = 'GPT-5.4';
}

// ── Chat ────────────────────────────────────────────────────────────────

async function sendChat() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  addChatMessage('You', message, 'user');
  input.value = '';

  if (!connected) {
    addChatMessage('ClawdBot', '⚠️ Bridge is offline. Start it with: npm run bridge', 'bot');
    return;
  }

  try {
    const res = await fetch(`${BRIDGE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (data.response) {
      addChatMessage('ClawdBot', data.response, 'bot');
    } else if (data.error) {
      addChatMessage('ClawdBot', `❌ ${data.error}`, 'bot');
    }

    if (data.tokenUsage) {
      tokenUsage.input += data.tokenUsage.inputTokens || 0;
      tokenUsage.output += data.tokenUsage.outputTokens || 0;
      tokenUsage.total += data.tokenUsage.totalTokens || 0;
      document.getElementById('stat-tokens').textContent = formatNumber(tokenUsage.total);
    }
  } catch (err) {
    addChatMessage('ClawdBot', `❌ Connection error: ${err.message}`, 'bot');
  }
}

function sendCommand(cmd) {
  document.getElementById('chat-input').value = cmd;
  sendChat();
}

function addChatMessage(sender, content, type) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${type}`;
  msg.innerHTML = `
    <span class="sender">${sender}</span>
    <span class="content">${escapeHtml(content)}</span>
  `;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

// ── Token Data (Real-Time Birdeye) ──────────────────────────────────────

async function loadTokenData(address) {
  if (!connected) return;
  activeToken = address;

  try {
    const [overviewRes, signalsRes] = await Promise.all([
      fetch(`${BRIDGE_URL}/api/birdeye/token/${address}`),
      fetch(`${BRIDGE_URL}/api/birdeye/signals/${address}`),
    ]);

    if (overviewRes.ok) {
      const token = await overviewRes.json();
      renderTokenOverview(token);
    }

    if (signalsRes.ok) {
      const signals = await signalsRes.json();
      renderTechnicalSignals(signals);
    }
  } catch (err) {
    console.error('Token data load failed:', err);
  }
}

function renderTokenOverview(t) {
  const el = document.getElementById('token-overview');
  if (!el) return;

  const changePct = t.priceChange24hPercent ?? 0;
  const changeClass = changePct >= 0 ? 'positive' : 'negative';
  const changeSign = changePct >= 0 ? '+' : '';

  el.innerHTML = `
    <div class="token-header">
      <div class="token-name">${t.symbol || 'Unknown'} <span class="token-name-full">${t.name || ''}</span></div>
      <div class="token-price">$${formatPrice(t.price)}</div>
      <div class="stat-change ${changeClass}">${changeSign}${changePct.toFixed(2)}%</div>
    </div>
    <div class="token-meta-grid">
      <div class="tm-item"><span class="tm-label">Market Cap</span><span class="tm-value">$${formatLargeNum(t.marketCap)}</span></div>
      <div class="tm-item"><span class="tm-label">FDV</span><span class="tm-value">$${formatLargeNum(t.fdv)}</span></div>
      <div class="tm-item"><span class="tm-label">24h Volume</span><span class="tm-value">$${formatLargeNum(t.volume24h)}</span></div>
      <div class="tm-item"><span class="tm-label">Liquidity</span><span class="tm-value">$${formatLargeNum(t.liquidity)}</span></div>
      <div class="tm-item"><span class="tm-label">Holders</span><span class="tm-value">${formatNumber(t.holder || 0)}</span></div>
      <div class="tm-item"><span class="tm-label">24h Trades</span><span class="tm-value">${formatNumber(t.trade24h || 0)}</span></div>
      <div class="tm-item"><span class="tm-label">Buy/Sell</span><span class="tm-value">${formatNumber(t.buy24h || 0)}/${formatNumber(t.sell24h || 0)}</span></div>
      <div class="tm-item"><span class="tm-label">Unique Wallets</span><span class="tm-value">${formatNumber(t.uniqueWallet24h || 0)}</span></div>
    </div>
  `;
}

function renderTechnicalSignals(s) {
  // Update indicator values
  document.getElementById('ind-rsi').textContent = s.rsi14?.toFixed(1) ?? '—';
  document.getElementById('ind-ema').textContent = s.trend ?? '—';
  document.getElementById('ind-volume').textContent = s.volume24h ? '$' + formatLargeNum(s.volume24h) : '—';
  document.getElementById('ind-atr').textContent = s.vwap ? '$' + formatPrice(s.vwap) : '—';

  // Signal direction
  const dir = document.getElementById('signal-dir');
  const signalMap = { buy: 'long', sell: 'short', hold: 'neutral' };
  const mapped = signalMap[s.signal] || 'neutral';
  dir.textContent = mapped.toUpperCase();
  dir.className = `signal-direction ${mapped}`;

  document.getElementById('signal-str').textContent = s.signal?.toUpperCase() ?? '—';

  document.getElementById('stat-signal').textContent = mapped.toUpperCase();
  document.getElementById('stat-signal-sub').textContent = `RSI: ${s.rsi14?.toFixed(0) ?? '?'} | ${s.trend ?? '?'}`;

  // Confidence
  const conf = s.signal === 'buy' || s.signal === 'sell' ? '0.72' : '0.35';
  document.getElementById('ind-confidence').textContent = conf;
}

// ── Recent Trades (Birdeye) ─────────────────────────────────────────────

async function loadRecentTrades(address) {
  if (!connected) return;

  try {
    const res = await fetch(`${BRIDGE_URL}/api/birdeye/trades/${address}?limit=15`);
    if (!res.ok) return;
    const data = await res.json();

    const el = document.getElementById('trades-list');
    if (!el || !data.trades || data.trades.length === 0) return;

    el.innerHTML = data.trades.map(t => {
      const side = t.side || (t.from?.symbol === 'SOL' ? 'BUY' : 'SELL');
      const sideClass = side === 'BUY' || side === 'buy' ? 'positive' : 'negative';
      const amount = t.volumeUsd || t.volume || 0;
      const time = t.blockUnixTime ? new Date(t.blockUnixTime * 1000).toLocaleTimeString() : '';

      return `
        <div class="trade-row">
          <span class="trade-side ${sideClass}">${String(side).toUpperCase()}</span>
          <span class="trade-amount">$${formatLargeNum(amount)}</span>
          <span class="trade-time">${time}</span>
        </div>
      `;
    }).join('');
  } catch (err) {
    console.error('Recent trades load failed:', err);
  }
}

// ── Wallet Portfolio ────────────────────────────────────────────────────

async function loadWallet() {
  if (!connected) return;
  const wallet = document.getElementById('wallet-input')?.value?.trim();
  if (!wallet) {
    addChatMessage('ClawdBot', '⚠️ Enter a wallet address first', 'bot');
    return;
  }

  try {
    const res = await fetch(`${BRIDGE_URL}/api/birdeye/wallet/${wallet}`);
    if (!res.ok) {
      addChatMessage('ClawdBot', `❌ Wallet fetch failed: ${res.status}`, 'bot');
      return;
    }

    const data = await res.json();
    renderWalletPortfolio(data.portfolio, data.pnl);
  } catch (err) {
    addChatMessage('ClawdBot', `❌ ${err.message}`, 'bot');
  }
}

function renderWalletPortfolio(portfolio, pnl) {
  const el = document.getElementById('portfolio-body');
  if (!el) return;

  let html = '';

  // PnL summary
  if (pnl) {
    html += `
      <div class="pnl-summary">
        <div class="pnl-item"><span class="pnl-label">Realized PnL</span><span class="pnl-value ${pnl.realizedPnl >= 0 ? 'positive' : 'negative'}">$${pnl.realizedPnl?.toFixed(2) ?? '0.00'}</span></div>
        <div class="pnl-item"><span class="pnl-label">Unrealized PnL</span><span class="pnl-value ${pnl.unrealizedPnl >= 0 ? 'positive' : 'negative'}">$${pnl.unrealizedPnl?.toFixed(2) ?? '0.00'}</span></div>
        <div class="pnl-item"><span class="pnl-label">Win Rate</span><span class="pnl-value">${((pnl.winRate || 0) * 100).toFixed(1)}%</span></div>
        <div class="pnl-item"><span class="pnl-label">Total Trades</span><span class="pnl-value">${pnl.totalTrades ?? 0}</span></div>
      </div>
    `;
  }

  // Portfolio total
  if (portfolio) {
    html += `<div class="portfolio-total">Total: $${formatLargeNum(portfolio.totalUsd || 0)}</div>`;

    if (portfolio.items && portfolio.items.length > 0) {
      html += `<div class="portfolio-table">`;
      html += portfolio.items.slice(0, 20).map(item => `
        <div class="portfolio-row" onclick="loadTokenData('${item.address}')">
          <span class="port-token">${item.symbol || '?'}</span>
          <span class="port-amount">${formatPrice(item.uiAmount)}</span>
          <span class="port-value">$${formatLargeNum(item.valueUsd)}</span>
        </div>
      `).join('');
      html += `</div>`;
    }
  }

  el.innerHTML = html || '<div class="empty-state"><p>No portfolio data</p></div>';
}

// ── Orderbook (Aster) ───────────────────────────────────────────────────

async function loadOrderbook(symbol) {
  if (!connected) return;
  const sym = symbol || document.getElementById('orderbook-symbol')?.value?.trim() || 'SOL-PERP';

  try {
    const res = await fetch(`${BRIDGE_URL}/api/aster/orderbook/${sym}?depth=10`);
    if (!res.ok) return;
    const book = await res.json();
    renderOrderbook(book);
  } catch (err) {
    console.error('Orderbook load failed:', err);
  }
}

function renderOrderbook(book) {
  const el = document.getElementById('orderbook-body');
  if (!el) return;

  const maxBidSize = Math.max(...(book.bids || []).map(b => b[1]), 1);
  const maxAskSize = Math.max(...(book.asks || []).map(a => a[1]), 1);

  let html = '<div class="ob-header"><span>Price</span><span>Size</span></div>';

  // Asks (top, reversed — lowest ask at bottom)
  const asks = (book.asks || []).slice(0, 10).reverse();
  for (const [price, size] of asks) {
    const pct = (size / maxAskSize * 100).toFixed(0);
    html += `<div class="ob-row ask" style="--bar-width:${pct}%"><span class="ob-price">${formatPrice(price)}</span><span class="ob-size">${size.toFixed(4)}</span></div>`;
  }

  html += '<div class="ob-spread">· · ·</div>';

  // Bids
  const bids = (book.bids || []).slice(0, 10);
  for (const [price, size] of bids) {
    const pct = (size / maxBidSize * 100).toFixed(0);
    html += `<div class="ob-row bid" style="--bar-width:${pct}%"><span class="ob-price">${formatPrice(price)}</span><span class="ob-size">${size.toFixed(4)}</span></div>`;
  }

  el.innerHTML = html;
}

// ── Aster Positions ─────────────────────────────────────────────────────

async function loadPositions() {
  if (!connected) return;
  const wallet = document.getElementById('wallet-input')?.value?.trim();
  if (!wallet) return;

  try {
    const res = await fetch(`${BRIDGE_URL}/api/aster/positions/${wallet}`);
    if (!res.ok) return;
    const data = await res.json();
    renderPositions(data.positions);
  } catch (err) {
    console.error('Positions load failed:', err);
  }
}

function renderPositions(positions) {
  const el = document.getElementById('positions-body');
  if (!el) return;

  if (!positions || positions.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="icon">📊</div><p>No open positions</p></div>';
    return;
  }

  el.innerHTML = positions.map(p => `
    <div class="position-row">
      <div class="pos-market">${p.market} <span class="pos-side ${p.side}">${p.side.toUpperCase()}</span></div>
      <div class="pos-details">
        <span>Size: ${p.size.toFixed(4)}</span>
        <span>Entry: $${formatPrice(p.entryPrice)}</span>
        <span>Liq: $${formatPrice(p.liquidationPrice)}</span>
        <span class="${p.unrealizedPnl >= 0 ? 'positive' : 'negative'}">PnL: $${p.unrealizedPnl?.toFixed(2)} (${p.unrealizedPnlPct?.toFixed(2)}%)</span>
      </div>
    </div>
  `).join('');
}

// ── Trending Tokens ─────────────────────────────────────────────────────

async function loadTrendingTokens() {
  if (!connected) return;

  try {
    const res = await fetch(`${BRIDGE_URL}/api/birdeye/trending`);
    if (!res.ok) return;
    const data = await res.json();
    renderTrending(data.tokens);
  } catch (err) {
    console.error('Trending load failed:', err);
  }
}

function renderTrending(tokens) {
  const el = document.getElementById('trending-list');
  if (!el || !tokens) return;

  el.innerHTML = tokens.slice(0, 10).map((t, i) => {
    const changePct = t.priceChange24hPercent ?? 0;
    const changeClass = changePct >= 0 ? 'positive' : 'negative';
    return `
      <div class="trending-row" onclick="loadTokenData('${t.address}')">
        <span class="trending-rank">${i + 1}</span>
        <span class="trending-symbol">${t.symbol || '?'}</span>
        <span class="trending-price">$${formatPrice(t.price)}</span>
        <span class="stat-change ${changeClass}">${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%</span>
        <span class="trending-vol">$${formatLargeNum(t.volume24h)}</span>
      </div>
    `;
  }).join('');
}

// ── Trading Agent Controls ──────────────────────────────────────────────

async function startTrading() {
  if (!connected) return;
  try {
    const res = await fetch(`${BRIDGE_URL}/api/trading/start`, { method: 'POST' });
    const data = await res.json();
    addChatMessage('ClawdBot', `🤖 Trading Agent: ${data.status}`, 'bot');
  } catch (err) {
    addChatMessage('ClawdBot', `❌ ${err.message}`, 'bot');
  }
}

async function stopTrading() {
  if (!connected) return;
  try {
    const res = await fetch(`${BRIDGE_URL}/api/trading/stop`, { method: 'POST' });
    const data = await res.json();
    addChatMessage('ClawdBot', `🤖 Trading Agent: ${data.status}`, 'bot');
  } catch (err) {
    addChatMessage('ClawdBot', `❌ ${err.message}`, 'bot');
  }
}

// ── Strategy ────────────────────────────────────────────────────────────

async function loadStrategy() {
  try {
    const res = await fetch(`${BRIDGE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '!recall strategy parameters RSI EMA' }),
    });
    const data = await res.json();
    if (data.response) {
      addChatMessage('ClawdBot', data.response, 'bot');
    }
  } catch {}
  loadStrategyFile();
}

function loadStrategyFile() {
  const defaultParams = {
    rsiOverbought: 70, rsiOversold: 30,
    emaFastPeriod: 20, emaSlowPeriod: 50,
    minVolume24h: '$100K', minLiquidity: '$50K',
    maxSlippage: '2%', stopLossPct: '8%',
    takeProfitPct: '20%', positionSizePct: '10%',
    fundingThreshold: '0.05%', usePerps: 'true',
  };

  const grid = document.getElementById('params-grid');
  grid.innerHTML = Object.entries(defaultParams)
    .map(([k, v]) => `<div class="param-row"><span class="param-key">${k}</span><span class="param-value">${v}</span></div>`)
    .join('');
}

// ── Memory ──────────────────────────────────────────────────────────────

async function loadMemories(category) {
  if (!connected) {
    showMemoryEmpty('Bridge offline — start with npm run bridge');
    return;
  }

  const query = category ? `!recall ${category}` : '!recall recent entries';

  try {
    const res = await fetch(`${BRIDGE_URL}/api/agent/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query }),
    });

    const data = await res.json();

    if (data.response && data.response.length > 10) {
      const list = document.getElementById('memory-list');
      const entries = data.response.split('---').filter(e => e.trim());

      if (entries.length > 0) {
        list.innerHTML = entries.map((entry, i) => {
          const title = entry.match(/\*\*(.+?)\*\*/)?.[1] || `Memory #${i + 1}`;
          return `
            <div class="memory-entry">
              <div class="title">${escapeHtml(title)}</div>
              <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:4px">${escapeHtml(entry.slice(0, 200))}</div>
              <div class="meta"><span class="tag">${category || 'all'}</span></div>
            </div>
          `;
        }).join('');
        document.getElementById('memory-count').textContent = `${entries.length} entries`;
        document.getElementById('stat-memories').textContent = entries.length;
      } else {
        showMemoryEmpty(`No ${category || ''} memories found.`);
      }
    } else {
      showMemoryEmpty(data.response || 'No results.');
    }
  } catch (err) {
    showMemoryEmpty(`Error: ${err.message}`);
  }
}

function showMemoryEmpty(msg) {
  document.getElementById('memory-list').innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>${escapeHtml(msg)}</p></div>`;
}

// ── Research ────────────────────────────────────────────────────────────

async function triggerResearch() {
  if (!connected) { addChatMessage('ClawdBot', '⚠️ Bridge offline.', 'bot'); return; }
  addChatMessage('You', '!research SOL', 'user');
  try {
    const res = await fetch(`${BRIDGE_URL}/api/agent/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start' }),
    });
    const data = await res.json();
    addChatMessage('ClawdBot', data.response || data.message || 'Research started.', 'bot');
  } catch (err) {
    addChatMessage('ClawdBot', `❌ ${err.message}`, 'bot');
  }
}

// ── Refresh All ─────────────────────────────────────────────────────────

async function refreshAll() {
  await checkConnection();
  loadStrategyFile();
  if (connected) {
    loadTokenData(activeToken);
    loadRecentTrades(activeToken);
    loadTrendingTokens();
    loadMemories();
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

function formatLargeNum(n) {
  if (!n || isNaN(n)) return '0';
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toFixed(2);
}

function formatPrice(n) {
  if (!n || isNaN(n)) return '0.00';
  if (n >= 1000) return n.toFixed(2);
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.001) return n.toFixed(6);
  return n.toFixed(8);
}

// ── Keyboard shortcut ───────────────────────────────────────────────────

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('chat-input').focus();
  }
});
