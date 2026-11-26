// Live quotes for ARC. Fetches daily price history from Yahoo Finance's public
// chart endpoint on the server (browsers can't call it directly because of CORS)
// and returns the latest price plus 1-day, 1-month, YTD and 1-year changes.
// Nothing is estimated: if a symbol fails, it is returned with an error.
const SYM = /^[A-Za-z0-9.^=\-]{1,20}$/;
const UA = 'Mozilla/5.0 (compatible; ARC-learning-app/1.0)';

async function one(sym) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=1y&interval=1d&includePrePost=false`;
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!r.ok) throw new Error('upstream ' + r.status);
  const j = await r.json();
  const res = j?.chart?.result?.[0];
  if (!res) throw new Error('no data');
  const m = res.meta || {};
  const ts = res.timestamp || [];
  const cl = res.indicators?.quote?.[0]?.close || [];
  const pts = ts.map((t, i) => [t, cl[i]]).filter(p => typeof p[1] === 'number');
  if (!pts.length || typeof m.regularMarketPrice !== 'number') throw new Error('no price');
  const price = m.regularMarketPrice;
  const day = t => new Date(t * 1000).toISOString().slice(0, 10);
  const mt = m.regularMarketTime || pts.at(-1)[0];
  // previous close = last daily close dated before the latest trading day
  const before = pts.filter(p => day(p[0]) < day(mt));
  const prev = before.length ? before.at(-1)[1] : (m.chartPreviousClose ?? null);
  const pct = b => (typeof b === 'number' && b) ? +(((price - b) / b) * 100).toFixed(2) : null;
  const back = days => { const cut = mt - days * 864e2; const p = pts.filter(x => x[0] <= cut); return p.length ? p.at(-1)[1] : null; };
  const yr = new Date(mt * 1000).getUTCFullYear();
  const lastYear = pts.filter(p => new Date(p[0] * 1000).getUTCFullYear() < yr);
  const step = Math.max(1, Math.floor(pts.length / 60));
  const spark = pts.filter((_, i) => i % step === 0).map(p => +p[1].toFixed(4));
  spark.push(+price.toFixed(4));
  return {
    price, currency: m.currency || null, time: mt * 1000, prev,
    d1: pct(prev), m1: pct(back(30)), ytd: lastYear.length ? pct(lastYear.at(-1)[1]) : null, y1: pct(pts[0][1]),
    spark, exchange: m.exchangeName || null, state: m.marketState || null
  };
}

module.exports = async function handler(req, res) {
  const raw = String((req.query && req.query.s) || '').split(',').map(s => s.trim()).filter(Boolean);
  const syms = [...new Set(raw)].filter(s => SYM.test(s)).slice(0, 40);
  if (!syms.length) { res.status(400).json({ error: 'pass ?s=SYM1,SYM2' }); return; }
  const out = {};
  await Promise.all(syms.map(async s => {
    try { out[s] = await one(s); } catch (e) { out[s] = { error: String(e.message || e) }; }
  }));
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ source: 'Yahoo Finance', fetched: Date.now(), quotes: out });
}
;
