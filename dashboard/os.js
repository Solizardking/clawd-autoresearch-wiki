// ── ClawdBot OS — Frontend Controller ────────────────────────────────────
let API = window.location.hostname === 'localhost'
  ? 'http://localhost:3777'
  : 'https://backend-production-a65f.up.railway.app';
let bridgeOk = false;
let agentRunning = false;

// ── INIT ────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  startClock();
  poll();
  setInterval(poll, 8000);
  document.getElementById('api-url-input').value = API;
});

function startClock() {
  setInterval(() => {
    document.getElementById('sb-time').textContent =
      new Date().toLocaleTimeString('en-US', { hour12: false });
  }, 1000);
}

// ── API ─────────────────────────────────────────────────────────────────
async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(`${API}${path}`, opts);
  return r.json();
}

// ── POLL ─────────────────────────────────────────────────────────────────
async function poll() {
  try {
    const h = await api('/api/health');
    bridgeOk = true;
    setBridgeStatus(true);
    document.getElementById('hdr-bridge').textContent = 'ONLINE';
    document.getElementById('hdr-bridge').className = 'top-stat-val green';
  } catch {
    bridgeOk = false;
    setBridgeStatus(false);
    document.getElementById('hdr-bridge').textContent = 'OFFLINE';
    document.getElementById('hdr-bridge').className = 'top-stat-val red';
  }
  if (bridgeOk) {
    loadTradingStatus();
    loadTicker();
  }
}

function setBridgeStatus(ok) {
  document.getElementById('ws-dot').style.background = ok ? '#14F195' : '#ff4060';
  document.getElementById('ws-label').textContent = ok ? 'bridge' : 'offline';
  document.getElementById('ws-label').style.color = ok ? 'var(--g)' : 'var(--red)';
  document.getElementById('sb-bridge').textContent = 'bridge: ' + (ok ? 'online' : 'offline');
  document.getElementById('sb-dot').style.background = ok ? '#14F195' : '#ff4060';
}

// ── TRADING STATUS ──────────────────────────────────────────────────────
async function loadTradingStatus() {
  try {
    const d = await api('/api/trading/status');
    agentRunning = d.running;
    document.getElementById('hdr-status').textContent = d.running ? 'RUNNING' : 'STOPPED';
    document.getElementById('hdr-status').className = 'top-stat-val ' + (d.running ? 'green' : 'red');
    document.getElementById('hdr-cycles').textContent = d.cycleCount ?? '—';
    document.getElementById('hdr-positions').textContent = d.openPositions ?? '0';
    document.getElementById('hdr-mode').textContent = 'SIM';
    document.getElementById('ov-status').textContent = d.running ? 'RUNNING' : 'STOPPED';
    document.getElementById('ov-status').className = 'stat-card-val ' + (d.running ? 'green' : 'red');
    document.getElementById('ov-cycles').textContent = d.cycleCount ?? 0;
    document.getElementById('ov-positions').textContent = d.openPositions ?? 0;
    const tog = document.getElementById('agent-toggle');
    if (d.running) { tog.textContent = 'STOP AGENT'; tog.className = 'stop'; }
    else { tog.textContent = 'START AGENT'; tog.className = ''; }
  } catch {}
}

async function toggleAgent() {
  const ep = agentRunning ? '/api/trading/stop' : '/api/trading/start';
  try {
    const d = await api(ep, 'POST');
    notify(d.status || 'done', 'success');
    appendLog('info', d.status);
    loadTradingStatus();
  } catch (e) { notify('Cannot reach bridge', 'error'); }
}

async function triggerCycle() {
  notify('Manual cycle not implemented yet', 'info');
}

// ── TICKER ──────────────────────────────────────────────────────────────
async function loadTicker() {
  try {
    const d = await api('/api/birdeye/trending');
    if (!d || d.error) return;
    const tokens = Array.isArray(d) ? d : (d.tokens || []);
    if (!tokens.length) return;
    const items = tokens.slice(0, 15).map(t => {
      const ch = t.price24hChangePercent ?? 0;
      const dir = ch >= 0 ? 'up' : 'dn';
      return `<span class="tick-item"><span class="sym">${t.symbol||'?'}</span>$${Number(t.price||0).toFixed(4)} <span class="${dir}">${ch>=0?'+':''}${ch.toFixed(1)}%</span></span>`;
    }).join('');
    if (items) document.getElementById('ticker').innerHTML = items;
  } catch {}
}

// ── SIGNALS ─────────────────────────────────────────────────────────────
async function loadSignals() {
  try {
    const d = await api('/api/trading/signals?limit=30');
    const sigs = d.signals || [];
    document.getElementById('ov-sig-count').textContent = sigs.length;
    const tbody = document.getElementById('signals-tbody');
    const ovbody = document.getElementById('ov-signals-body');
    if (!sigs.length) {
      const e = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-text">No signals</div></div></td></tr>';
      tbody.innerHTML = e;
      ovbody.innerHTML = '<tr><td colspan="4"><div class="empty-state"><div class="empty-state-text">No signals</div></div></td></tr>';
      return;
    }
    tbody.innerHTML = sigs.map(s => sigRow(s, true)).join('');
    ovbody.innerHTML = sigs.slice(0, 6).map(s => sigRow(s, false)).join('');
  } catch (e) { appendLog('error', 'signals: ' + e.message); }
}

function sigRow(s, full) {
  const dc = s.direction === 'long' ? 'badge-long' : s.direction === 'short' ? 'badge-short' : 'badge-neutral';
  const str = s.strength || 0;
  const fc = s.direction === 'short' ? 'short' : '';
  const t = s.timestamp ? new Date(s.timestamp).toLocaleTimeString() : '—';
  if (full) {
    return `<tr class="new-row"><td class="mono">${(s.asset||'—').slice(0,10)}</td><td><span class="badge ${dc}">${(s.direction||'neutral').toUpperCase()}</span></td><td><div class="strength-bar"><div class="bar-track"><div class="bar-fill ${fc}" style="width:${str*100}%"></div></div><span class="text-dim">${str.toFixed(2)}</span></div></td><td>${(s.confidence||0).toFixed(2)}</td><td class="text-dim" style="font-size:10px">${(s.sources||[]).join(', ').slice(0,30)}</td><td class="text-dim">${t}</td></tr>`;
  }
  return `<tr class="new-row"><td class="mono">${(s.asset||'—').slice(0,8)}</td><td><span class="badge ${dc}">${(s.direction||'—').toUpperCase()}</span></td><td><div class="strength-bar"><div class="bar-track"><div class="bar-fill ${fc}" style="width:${str*100}%"></div></div></div></td><td class="text-dim">${t}</td></tr>`;
}

// ── POSITIONS ───────────────────────────────────────────────────────────
async function loadPositions() { loadTradingStatus(); }

// ── TRADES ──────────────────────────────────────────────────────────────
async function loadTrades() {
  try {
    const d = await api('/api/trading/history?limit=30');
    const trades = d.trades || [];
    const tbody = document.getElementById('trades-tbody');
    if (!trades.length) { tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-text">No trades</div></div></td></tr>'; return; }
    tbody.innerHTML = trades.map(t => {
      const pnl = t.pnl_pct ? (t.pnl_pct*100).toFixed(2)+'%' : '—';
      const pc = (t.pnl_pct||0) >= 0 ? 'text-green' : 'text-red';
      return `<tr><td class="mono">${(t.asset||'').slice(0,10)}</td><td><span class="badge badge-${t.direction}">${(t.direction||'').toUpperCase()}</span></td><td>$${Number(t.entry_price||0).toFixed(4)}</td><td>${t.exit_price?'$'+Number(t.exit_price).toFixed(4):'—'}</td><td class="${pc}">${pnl}</td><td><span class="badge ${t.outcome==='win'?'badge-long':t.outcome==='loss'?'badge-short':'badge-neutral'}">${t.outcome||'open'}</span></td><td class="text-dim">${t.entry_time?new Date(t.entry_time).toLocaleString():'—'}</td></tr>`;
    }).join('');
  } catch (e) { appendLog('error', 'trades: ' + e.message); }
}

// ── TOKEN LOOKUP ────────────────────────────────────────────────────────
async function loadToken() {
  const addr = document.getElementById('token-addr').value.trim();
  if (!addr || addr.length < 32) return;
  const el = document.getElementById('token-info');
  el.innerHTML = '<div class="loading-state"><span class="spinner"></span>loading…</div>';
  try {
    const d = await api('/api/birdeye/token/' + addr);
    if (d.error) { el.innerHTML = `<div class="empty-state text-red">${d.error}</div>`; return; }
    el.innerHTML = `
      <div class="kv"><span class="k">Symbol</span><span class="v text-green">${d.symbol||'—'}</span></div>
      <div class="kv"><span class="k">Name</span><span class="v">${d.name||'—'}</span></div>
      <div class="kv"><span class="k">Price</span><span class="v" style="font-family:'Orbitron';font-size:14px">$${Number(d.price||0).toFixed(6)}</span></div>
      <div class="kv"><span class="k">Market Cap</span><span class="v">$${Number(d.marketCap||0).toLocaleString()}</span></div>
      <div class="kv"><span class="k">Volume 24h</span><span class="v">$${Number(d.volume24h||0).toLocaleString()}</span></div>
      <div class="kv"><span class="k">Liquidity</span><span class="v">$${Number(d.liquidity||0).toLocaleString()}</span></div>
      <div class="kv"><span class="k">Holders</span><span class="v">${Number(d.holder||0).toLocaleString()}</span></div>
      <div class="kv"><span class="k">Last Trade</span><span class="v">${d.lastTradeHumanTime||'—'}</span></div>`;
  } catch (e) { el.innerHTML = `<div class="empty-state text-red">${e.message}</div>`; }
}

// ── ORDERBOOK ───────────────────────────────────────────────────────────
async function loadOrderbook() {
  const sym = document.getElementById('ob-symbol').value.trim();
  if (!sym) return;
  const el = document.getElementById('orderbook-display');
  el.innerHTML = '<div class="loading-state"><span class="spinner"></span>loading…</div>';
  try {
    const d = await api('/api/aster/orderbook/' + sym + '?depth=10');
    if (d.error) { el.innerHTML = `<div class="empty-state text-red">${d.error}</div>`; return; }
    const asks = (d.asks || []).slice(0, 8).reverse();
    const bids = (d.bids || []).slice(0, 8);
    const maxQty = Math.max(...[...asks, ...bids].map(r => parseFloat(r[1]) || 0), 1);
    let html = '<div class="ob-header"><span>Price</span><span>Size</span></div>';
    for (const a of asks) {
      const bar = ((parseFloat(a[1])/maxQty)*100).toFixed(0);
      html += `<div class="ob-row ask" style="--bar:${bar}%"><span class="ob-price">${Number(a[0]).toFixed(2)}</span><span class="ob-size">${Number(a[1]).toFixed(4)}</span></div>`;
    }
    if (asks.length && bids.length) {
      const spread = (parseFloat(asks[asks.length-1][0]) - parseFloat(bids[0][0])).toFixed(2);
      html += `<div class="ob-spread">— spread $${spread} —</div>`;
    }
    for (const b of bids) {
      const bar = ((parseFloat(b[1])/maxQty)*100).toFixed(0);
      html += `<div class="ob-row bid" style="--bar:${bar}%"><span class="ob-price">${Number(b[0]).toFixed(2)}</span><span class="ob-size">${Number(b[1]).toFixed(4)}</span></div>`;
    }
    el.innerHTML = html;
  } catch (e) { el.innerHTML = `<div class="empty-state text-red">${e.message}</div>`; }
}

// ── TRENDING ────────────────────────────────────────────────────────────
async function loadTrending() {
  try {
    const d = await api('/api/birdeye/trending');
    const tokens = Array.isArray(d) ? d : (d.tokens || []);
    const el = document.getElementById('trending-list');
    if (!tokens.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-text">No data</div></div>'; return; }
    el.innerHTML = tokens.slice(0, 15).map((t, i) => {
      const ch = t.price24hChangePercent ?? 0;
      return `<div class="kv"><span class="k">#${i+1} <span class="text-green">${t.symbol||'?'}</span></span><span class="v">$${Number(t.price||0).toFixed(4)} <span class="${ch>=0?'text-green':'text-red'}">${ch>=0?'+':''}${ch.toFixed(1)}%</span></span></div>`;
    }).join('');
  } catch (e) { document.getElementById('trending-list').innerHTML = `<div class="empty-state text-red">${e.message}</div>`; }
}

// ── ASTER DIGEST ────────────────────────────────────────────────────────
async function loadAsterDigest() {
  try {
    const d = await api('/api/aster/digest');
    const el = document.getElementById('aster-digest');
    if (d.error) { el.innerHTML = `<div class="empty-state text-red">${d.error}</div>`; return; }
    let html = `<div class="kv"><span class="k">Markets</span><span class="v text-green">${d.marketCount}</span></div>`;
    html += `<div class="kv"><span class="k">Total Volume</span><span class="v">$${Number(d.totalVolume||0).toLocaleString()}</span></div>`;
    for (const t of (d.topByVolume || []).slice(0, 8)) {
      html += `<div class="kv"><span class="k text-green">${t.symbol}</span><span class="v">$${t.lastPrice} <span class="${parseFloat(t.priceChangePercent)>=0?'text-green':'text-red'}">${t.priceChangePercent}%</span></span></div>`;
    }
    el.innerHTML = html;
  } catch (e) { document.getElementById('aster-digest').innerHTML = `<div class="empty-state text-red">${e.message}</div>`; }
}

// ── STRATEGY ────────────────────────────────────────────────────────────
const PARAM_LABELS = {
  rsiOverbought:'RSI Overbought', rsiOversold:'RSI Oversold',
  emaFastPeriod:'EMA Fast', emaSlowPeriod:'EMA Slow',
  minVolume24h:'Min Volume', minLiquidity:'Min Liquidity',
  maxSlippage:'Max Slip', stopLossPct:'Stop Loss %',
  takeProfitPct:'Take Profit %', positionSizePct:'Position Size %',
  fundingRateThreshold:'Funding Thresh', usePerps:'Use Perps'
};

async function loadStrategyState() {
  try {
    const d = await api('/api/agent/status');
    const params = d.strategyParams || d.strategy || {};
    const grid = document.getElementById('params-grid');
    const snap = document.getElementById('ov-strategy-snap');
    if (!Object.keys(params).length) { grid.innerHTML = '<div class="empty-state"><div class="empty-state-text">No strategy data</div></div>'; return; }
    grid.innerHTML = Object.entries(params).map(([k,v]) => `<div class="param-item"><div class="param-label">${PARAM_LABELS[k]||k}</div><div class="param-val">${typeof v==='boolean'?(v?'YES':'NO'):v}</div></div>`).join('');
    if (snap) snap.innerHTML = Object.entries(params).map(([k,v]) => `<div class="kv"><span class="k">${PARAM_LABELS[k]||k}</span><span class="v">${typeof v==='boolean'?(v?'✓':'✗'):v}</span></div>`).join('');
  } catch (e) { appendLog('error', 'strategy: ' + e.message); }
}

// ── MEMORY ──────────────────────────────────────────────────────────────
async function queryMemory() {
  const q = document.getElementById('mem-query').value.trim();
  if (!q) return;
  const el = document.getElementById('mem-results');
  el.innerHTML = '<div class="loading-state"><span class="spinner"></span>searching…</div>';
  try {
    const d = await api('/api/agent/recall?q=' + encodeURIComponent(q));
    const entries = d.entries || d.results || [];
    if (!entries.length) { el.innerHTML = '<div class="empty-state"><div class="empty-state-text">No results</div></div>'; return; }
    el.innerHTML = entries.map(m => `<div class="mem-item"><div class="mem-item-type">${m.category||m.type||'memory'}</div><div class="mem-item-content">${(m.content||m.text||'—').slice(0,200)}</div><div class="mem-item-meta">${m.createdAt||m.timestamp||''}</div></div>`).join('');
  } catch (e) { el.innerHTML = `<div class="empty-state text-red">${e.message}</div>`; }
}

// ── CHAT ────────────────────────────────────────────────────────────────
async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendChat('you', msg);
  try {
    const d = await api('/api/agent/chat', 'POST', { message: msg });
    appendChat('clawdbot', d.response || d.reply || JSON.stringify(d));
  } catch (e) { appendChat('error', e.message); }
}

function appendChat(role, msg) {
  const el = document.getElementById('chat-log');
  const color = role === 'you' ? 'var(--b)' : role === 'clawdbot' ? 'var(--g)' : 'var(--red)';
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span style="color:${color}">${role.toUpperCase()}</span> <span class="msg">${msg.replace(/\n/g,'<br>')}</span>`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
}

// ── HEALTH ──────────────────────────────────────────────────────────────
async function loadHealth() {
  try {
    const d = await api('/api/health');
    document.getElementById('health-info').innerHTML = `
      <div class="kv"><span class="k">Status</span><span class="v text-green">${d.status||'ok'}</span></div>
      <div class="kv"><span class="k">Model</span><span class="v">${d.model||'—'}</span></div>
      <div class="kv"><span class="k">Birdeye</span><span class="v">${d.birdeye?'✓':'✗'}</span></div>
      <div class="kv"><span class="k">Aster</span><span class="v">${d.aster?'✓':'✗'}</span></div>`;
  } catch (e) { document.getElementById('health-info').innerHTML = `<div class="empty-state text-red">${e.message}</div>`; }
}

// ── SETTINGS ────────────────────────────────────────────────────────────
function applySettings() {
  API = document.getElementById('api-url-input').value.trim();
  poll();
  notify('Settings applied', 'success');
}

// ── NAV ─────────────────────────────────────────────────────────────────
function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
  if (name === 'signals') loadSignals();
  if (name === 'positions') { loadPositions(); loadTrades(); }
  if (name === 'market') { loadTrending(); loadAsterDigest(); }
  if (name === 'strategy') loadStrategyState();
  if (name === 'settings') loadHealth();
}

// ── LOG ─────────────────────────────────────────────────────────────────
function appendLog(level, msg) {
  const el = document.getElementById('agent-log');
  const t = new Date().toLocaleTimeString('en-US', { hour12: false });
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="ts">${t}</span><span class="lvl-${level}">${level.toUpperCase().padEnd(6)}</span> <span class="msg">${msg}</span>`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
  if (el.children.length > 200) el.removeChild(el.firstChild);
}

// ── NOTIFY ──────────────────────────────────────────────────────────────
function notify(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  const icons = { success:'✓', error:'✗', warn:'⚠', info:'◎' };
  el.innerHTML = `<span>${icons[type]||'◎'}</span><span>${msg}</span>`;
  document.getElementById('notif-stack').appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity .3s'; setTimeout(()=>el.remove(),300); }, 3000);
}

// ── INITIAL ─────────────────────────────────────────────────────────────
setTimeout(() => { loadStrategyState(); loadSignals(); }, 800);
