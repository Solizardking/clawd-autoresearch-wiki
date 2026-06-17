// ── CLAWDBOT OS :: INTEGRATIONS MODULE ─────────────────────────────
// Jupiter Terminal, Helius DAS/WSS, Birdeye Token Metadata
// ──────────────────────────────────────────────────────────────────

const HELIUS_KEY = 'db05afdb-630a-420b-819f-2041776b67ce';
const HELIUS_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;
const HELIUS_WSS = `wss://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;
const HELIUS_API = `https://api.helius.xyz`;
const TRACKED_WALLET = 'FZZFTXvg6Xdy3moNZiNcgJzjqEmbfbiit1S2qZnBJt4v';
const BE_KEY2 = '85c9a78b768d4a83b3e84a041f229695';
const SOL_MINT_FULL = 'So11111111111111111111111111111111111111112';

// ── BIRDEYE TOKEN OVERVIEW ────────────────────────────────────────
async function getTokenOverview(address) {
  try {
    const r = await fetch(`https://public-api.birdeye.so/defi/token_overview?address=${address}`, {
      headers: { 'X-API-KEY': BE_KEY2, 'x-chain': 'solana', accept: 'application/json' }
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.data || null;
  } catch(e) { console.warn('Token overview error:', e); return null; }
}

// ── HELIUS DAS: GET WALLET BALANCES ───────────────────────────────
async function getWalletBalances(wallet) {
  try {
    const r = await fetch(HELIUS_RPC, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'balances', method: 'searchAssets', params: {
        ownerAddress: wallet || TRACKED_WALLET, tokenType: 'fungible',
        displayOptions: { showNativeBalance: true }
      }})
    });
    const d = await r.json();
    return d?.result || null;
  } catch(e) { console.warn('DAS error:', e); return null; }
}

// ── HELIUS DAS: GET SINGLE ASSET (price) ──────────────────────────
async function getAssetPrice(mintAddress) {
  try {
    const r = await fetch(HELIUS_RPC, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 'asset', method: 'getAsset', params: {
        id: mintAddress, displayOptions: { showFungibleTokens: true }
      }})
    });
    const d = await r.json();
    return d?.result || null;
  } catch(e) { return null; }
}

// ── HELIUS ENHANCED TX HISTORY ────────────────────────────────────
async function getTransactionHistory(address, limit=15) {
  try {
    const r = await fetch(`${HELIUS_API}/v0/addresses/${address || TRACKED_WALLET}/transactions?api-key=${HELIUS_KEY}&limit=${limit}`);
    if (!r.ok) return [];
    return await r.json();
  } catch(e) { console.warn('Tx history error:', e); return []; }
}

// ── HELIUS WSS: REAL-TIME TX SUBSCRIPTION ─────────────────────────
let heliusWs = null;
let txCallbacks = [];

function onLiveTx(callback) { txCallbacks.push(callback); }

function connectHeliusWss(wallet) {
  if (heliusWs) { try { heliusWs.close(); } catch(e){} }
  try {
    heliusWs = new WebSocket(HELIUS_WSS);
    heliusWs.onopen = () => {
      console.log('[HELIUS WSS] Connected');
      // Subscribe to account changes for the tracked wallet
      heliusWs.send(JSON.stringify({
        jsonrpc: '2.0', id: 1, method: 'accountSubscribe',
        params: [wallet || TRACKED_WALLET, { encoding: 'jsonParsed', commitment: 'confirmed' }]
      }));
      // Also subscribe to logs mentioning wallet
      heliusWs.send(JSON.stringify({
        jsonrpc: '2.0', id: 2, method: 'logsSubscribe',
        params: [{ mentions: [wallet || TRACKED_WALLET] }, { commitment: 'confirmed' }]
      }));
    };
    heliusWs.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.method === 'logsNotification' && msg.params?.result?.value) {
          const val = msg.params.result.value;
          txCallbacks.forEach(cb => cb({
            signature: val.signature,
            err: val.err,
            logs: val.logs,
            slot: msg.params.result.context?.slot,
            time: Date.now()
          }));
        }
      } catch(e) {}
    };
    heliusWs.onerror = (e) => console.warn('[HELIUS WSS] Error:', e);
    heliusWs.onclose = () => { console.log('[HELIUS WSS] Closed, reconnecting in 5s…'); setTimeout(() => connectHeliusWss(wallet), 5000); };
  } catch(e) { console.warn('[HELIUS WSS] Failed:', e); }
}

// ── JUPITER TERMINAL INTEGRATION ──────────────────────────────────
let jupiterLoaded = false;

function loadJupiterTerminal() {
  if (jupiterLoaded || document.getElementById('jup-script')) return;
  const s = document.createElement('script');
  s.id = 'jup-script';
  s.src = 'https://terminal.jup.ag/main-v2.js';
  s.setAttribute('data-preload','');
  s.onload = () => { jupiterLoaded = true; console.log('[JUPITER] Terminal loaded'); };
  document.head.appendChild(s);
}

function openJupiterSwap(outputMint, inputMint) {
  if (!window.Jupiter) { alert('Jupiter Terminal loading… try again in a moment.'); return; }
  window.Jupiter.init({
    displayMode: 'modal',
    integratedTargetId: undefined,
    endpoint: HELIUS_RPC,
    defaultExplorer: 'Solscan',
    formProps: {
      initialInputMint: inputMint || SOL_MINT_FULL,
      initialOutputMint: outputMint || SOL_MINT_FULL,
      fixedInputMint: false,
      initialAmount: '10000000',
    },
    enableWalletPassthrough: false,
  });
}

// ── TOKEN DETAIL PANEL RENDERER ───────────────────────────────────
function renderTokenDetail(container, data, mint) {
  if (!data) { container.innerHTML = '<div style="padding:20px;color:#556680;text-align:center">Loading token data…</div>'; return; }
  const fmt = (n,d=2) => n == null ? '—' : (n < 0.01 && n > 0 ? n.toFixed(8) : Number(n).toLocaleString(undefined,{maximumFractionDigits:d}));
  const fmtUsd = (n) => n == null ? '—' : '$'+fmt(n);
  const chg = data.priceChange24hPercent || data.price24hChangePercent || 0;
  const chgCol = chg >= 0 ? '#14F195' : '#ff4060';
  const logoUrl = data.logoURI || data.icon || '';
  const logoHtml = logoUrl ? `<img src="${logoUrl}" style="width:32px;height:32px;border-radius:50%;border:1px solid #1a1a2e" onerror="this.style.display='none'">` : `<div style="width:32px;height:32px;border-radius:50%;background:#10101c;display:flex;align-items:center;justify-content:center;color:#14F195;font-size:12px;font-weight:bold">${(data.symbol||'?').slice(0,2)}</div>`;

  container.innerHTML = `
    <div style="padding:10px;border-bottom:1px solid #1a1a2e;display:flex;align-items:center;gap:8px">
      ${logoHtml}
      <div style="flex:1">
        <div style="color:#14F195;font-weight:bold;font-size:13px;letter-spacing:1px">${data.symbol||'—'}</div>
        <div style="color:#556680;font-size:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px">${data.name||'—'}</div>
      </div>
      <div style="text-align:right">
        <div style="color:#c8d8e8;font-size:13px;font-weight:bold">${fmtUsd(data.price)}</div>
        <div style="color:${chgCol};font-size:10px">${chg>=0?'+':''}${chg.toFixed(2)}%</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#1a1a2e">
      <div style="background:#0a0a14;padding:8px;text-align:center"><div style="font-size:7px;color:#556680;text-transform:uppercase;letter-spacing:1px">Market Cap</div><div style="font-size:11px;color:#c8d8e8;margin-top:2px">${fmtUsd(data.mc||data.marketCap)}</div></div>
      <div style="background:#0a0a14;padding:8px;text-align:center"><div style="font-size:7px;color:#556680;text-transform:uppercase;letter-spacing:1px">24h Volume</div><div style="font-size:11px;color:#c8d8e8;margin-top:2px">${fmtUsd(data.v24hUSD||data.volume24h)}</div></div>
      <div style="background:#0a0a14;padding:8px;text-align:center"><div style="font-size:7px;color:#556680;text-transform:uppercase;letter-spacing:1px">Liquidity</div><div style="font-size:11px;color:#c8d8e8;margin-top:2px">${fmtUsd(data.liquidity)}</div></div>
      <div style="background:#0a0a14;padding:8px;text-align:center"><div style="font-size:7px;color:#556680;text-transform:uppercase;letter-spacing:1px">Holders</div><div style="font-size:11px;color:#c8d8e8;margin-top:2px">${fmt(data.holder,0)}</div></div>
    </div>
    <div style="padding:6px 10px;font-size:8px;color:#556680;border-top:1px solid #1a1a2e;word-break:break-all">
      <span style="color:#00E5FF">MINT:</span> ${mint||'—'}
    </div>
    <div style="padding:8px 10px;display:flex;gap:6px">
      <button onclick="openJupiterSwap('${mint}')" style="flex:1;font-family:'Share Tech Mono';font-size:10px;padding:8px;border:1px solid #14F195;background:rgba(20,241,149,0.1);color:#14F195;cursor:pointer;letter-spacing:2px;font-weight:bold;transition:all .15s" onmouseover="this.style.background='#14F195';this.style.color='#000'" onmouseout="this.style.background='rgba(20,241,149,0.1)';this.style.color='#14F195'">⚡ BUY</button>
      <button onclick="openJupiterSwap('${SOL_MINT_FULL}','${mint}')" style="flex:1;font-family:'Share Tech Mono';font-size:10px;padding:8px;border:1px solid #ff4060;background:rgba(255,64,96,0.1);color:#ff4060;cursor:pointer;letter-spacing:2px;font-weight:bold;transition:all .15s" onmouseover="this.style.background='#ff4060';this.style.color='#000'" onmouseout="this.style.background='rgba(255,64,96,0.1)';this.style.color='#ff4060'">SELL</button>
    </div>
    <div style="padding:4px 10px 8px;display:flex;gap:6px;font-size:8px">
      <a href="https://solscan.io/token/${mint}" target="_blank" style="color:#00E5FF;text-decoration:none">Solscan ↗</a>
      <a href="https://birdeye.so/token/${mint}?chain=solana" target="_blank" style="color:#14F195;text-decoration:none">Birdeye ↗</a>
      <a href="https://jup.ag/swap/SOL-${mint}" target="_blank" style="color:#9945FF;text-decoration:none">Jupiter ↗</a>
    </div>`;
}

// ── EXPLORER RENDERER ─────────────────────────────────────────────
function renderExplorer(container, txHistory, balances) {
  let balanceHtml = '';
  if (balances) {
    const nativeBal = balances.nativeBalance;
    const solBal = nativeBal ? (nativeBal.lamports / 1e9).toFixed(4) : '—';
    const solUsd = nativeBal?.price_per_sol ? (nativeBal.lamports / 1e9 * nativeBal.price_per_sol).toFixed(2) : '—';
    const tokens = (balances.items || []).filter(i => i.token_info?.price_info?.price_per_token > 0).sort((a,b) => (b.token_info?.price_info?.total_price||0) - (a.token_info?.price_info?.total_price||0)).slice(0,10);
    balanceHtml = `<div style="margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid #1a1a2e;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#14F195">◆ Wallet Balances</div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:#1a1a2e;margin-bottom:1px">
        <div style="background:#0a0a14;padding:10px;text-align:center"><div style="font-size:7px;color:#556680;text-transform:uppercase;letter-spacing:1px">SOL</div><div style="font-size:16px;color:#14F195;font-weight:bold;margin-top:2px">${solBal}</div></div>
        <div style="background:#0a0a14;padding:10px;text-align:center"><div style="font-size:7px;color:#556680;text-transform:uppercase;letter-spacing:1px">USD Value</div><div style="font-size:16px;color:#c8d8e8;font-weight:bold;margin-top:2px">$${solUsd}</div></div>
        <div style="background:#0a0a14;padding:10px;text-align:center"><div style="font-size:7px;color:#556680;text-transform:uppercase;letter-spacing:1px">Tokens</div><div style="font-size:16px;color:#00E5FF;font-weight:bold;margin-top:2px">${tokens.length}</div></div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:10px"><thead><tr><th style="text-align:left;color:#556680;border-bottom:1px solid #1a1a2e;padding:5px 6px;font-size:8px;text-transform:uppercase;letter-spacing:1px">Token</th><th style="text-align:right;color:#556680;border-bottom:1px solid #1a1a2e;padding:5px 6px;font-size:8px">Balance</th><th style="text-align:right;color:#556680;border-bottom:1px solid #1a1a2e;padding:5px 6px;font-size:8px">Value</th></tr></thead><tbody>
      ${tokens.map(t => {
        const sym = t.content?.metadata?.symbol || t.token_info?.symbol || '???';
        const bal = t.token_info?.balance && t.token_info?.decimals != null ? (t.token_info.balance / Math.pow(10, t.token_info.decimals)).toFixed(4) : '—';
        const val = t.token_info?.price_info?.total_price ? '$'+t.token_info.price_info.total_price.toFixed(2) : '—';
        return `<tr style="border-bottom:1px solid rgba(26,26,46,0.5)"><td style="padding:4px 6px;color:#14F195">${sym}</td><td style="padding:4px 6px;text-align:right">${bal}</td><td style="padding:4px 6px;text-align:right">${val}</td></tr>`;
      }).join('')}
      </tbody></table></div>`;
  }

  let txHtml = '<div style="padding:16px;color:#556680;text-align:center">Loading transactions…</div>';
  if (txHistory && txHistory.length) {
    txHtml = `<table style="width:100%;border-collapse:collapse;font-size:9px"><thead><tr>
      <th style="text-align:left;color:#556680;border-bottom:1px solid #1a1a2e;padding:5px 6px;font-size:8px;text-transform:uppercase;letter-spacing:1px">Type</th>
      <th style="text-align:left;color:#556680;border-bottom:1px solid #1a1a2e;padding:5px 6px;font-size:8px">Description</th>
      <th style="text-align:left;color:#556680;border-bottom:1px solid #1a1a2e;padding:5px 6px;font-size:8px">Time</th>
      <th style="text-align:left;color:#556680;border-bottom:1px solid #1a1a2e;padding:5px 6px;font-size:8px">Sig</th>
    </tr></thead><tbody>${txHistory.map(tx => {
      const type = tx.type || 'UNKNOWN';
      const desc = tx.description || '—';
      const time = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleTimeString() : '—';
      const sig = tx.signature ? tx.signature.slice(0,12)+'…' : '—';
      const sigUrl = tx.signature ? `https://solscan.io/tx/${tx.signature}` : '#';
      const tagClass = type === 'SWAP' ? 'tag-purple' : type === 'TRANSFER' ? 'tag-teal' : 'tag-green';
      return `<tr style="border-bottom:1px solid rgba(26,26,46,0.5)"><td style="padding:4px 6px"><span style="display:inline-block;padding:2px 5px;border-radius:2px;font-size:7px;font-weight:bold;${type==='SWAP'?'background:rgba(153,69,255,0.15);color:#9945FF':type==='TRANSFER'?'background:rgba(0,229,255,0.15);color:#00E5FF':'background:rgba(20,241,149,0.15);color:#14F195'}">${type}</span></td><td style="padding:4px 6px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#c8d8e8">${desc.slice(0,60)}</td><td style="padding:4px 6px;color:#556680">${time}</td><td style="padding:4px 6px"><a href="${sigUrl}" target="_blank" style="color:#00E5FF;text-decoration:none;font-size:8px">${sig}</a></td></tr>`;
    }).join('')}</tbody></table>`;
  }

  container.innerHTML = `
    <div style="font-size:8px;color:#556680;padding:6px 10px;border-bottom:1px solid #1a1a2e;word-break:break-all"><span style="color:#00E5FF">WALLET:</span> ${TRACKED_WALLET}</div>
    ${balanceHtml}
    <div><div style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid #1a1a2e;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#14F195">◆ Transaction History <span style="margin-left:auto;font-size:8px;color:#556680" id="wss-status">◉ connecting…</span></div>
    <div id="live-tx-feed"></div>
    ${txHtml}</div>`;
}

// ── INIT ───────────────────────────────────────────────────────────
function initIntegrations() {
  loadJupiterTerminal();
  connectHeliusWss(TRACKED_WALLET);
}

// Auto-init when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIntegrations);
} else {
  initIntegrations();
}
