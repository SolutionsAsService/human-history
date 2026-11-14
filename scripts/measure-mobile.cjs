// Mobile Floor probe (DADA references/mobile-standard.md, rows M1-M11) for the live SPA.
//   node scripts/measure-mobile.cjs [baseUrl] [--shots dir] [--widths 360,390,430,768]
// Needs a running server (npm run preview) and Playwright. Prints one line per view and width; exit 1 if any row fails.
const { chromium } = require('playwright');
const args = process.argv.slice(2);
const base = args.find(a => a.startsWith('http')) || 'http://127.0.0.1:4173';
const shots = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : null;
const widths = (args.includes('--widths') ? args[args.indexOf('--widths') + 1] : '360,390,430,768').split(',').map(Number);
const VIEWS = [
  ['map', '#/map?t=-9000'], ['map+drawer', '#/map?e=gobekli-tepe&t=-9000'], ['graph', '#/graph'], ['lab', '#/lab?q=q-americas'],
  ['ledger', '#/ledger'], ['audit', '#/audit'], ['about', '#/about'],
];
const probe = () => {
  const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && r.bottom > 0 && r.right > 0 && r.left < innerWidth + 1; };
  const inView = el => { let p = el; while (p && p !== document.body) { const s = getComputedStyle(p); if (s.overflowX === 'auto' || s.overflowX === 'scroll' || s.overflow === 'auto' || s.overflow === 'scroll') { /* scrollable ancestor: element may legitimately sit offscreen inside it */ } p = p.parentElement; } return true; };
  const out = { ovf: 0, under44: [], under24: 0, tiny: [], body: 0, inputZoom: [], hoverUngated: 0, vh100: 0, bars: 0, h1: false, viewport: {} };
  out.ovf = Math.max(0, document.documentElement.scrollWidth - innerWidth);
  // elements that extend beyond the right edge without being inside a scroller
  const clipped = [];
  document.querySelectorAll('body *').forEach(el => {
    if (!vis(el)) return; const r = el.getBoundingClientRect();
    if (r.right > innerWidth + 2 && r.width < innerWidth * 3) { let p = el.parentElement, ok = false; while (p) { const s = getComputedStyle(p); if (/(auto|scroll|hidden)/.test(s.overflowX)) { ok = true; break; } p = p.parentElement; } if (!ok) clipped.push((el.className || el.tagName).toString().slice(0, 30)); }
  });
  out.clipped = [...new Set(clipped)].slice(0, 6);
  // touch targets
  document.querySelectorAll('button, a[href], input, select, textarea, summary, [role=tab], [tabindex="0"]').forEach(el => {
    if (!vis(el)) return; if (el.closest('.map-canvas, canvas')) return;
    const r = el.getBoundingClientRect();
    const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.parentElement && /^(P|LI|DD|DIV|SPAN)$/.test(el.parentElement.tagName) && el.parentElement.textContent.trim().length > el.textContent.trim().length + 12;
    if (inline) return;
    if (el.type === 'checkbox') { const lab = el.closest('label'); if (lab) { const lr = lab.getBoundingClientRect(); if (lr.height >= 44) return; } }
    if (r.width < 44 || r.height < 44) out.under44.push(`${(el.className || el.tagName).toString().slice(0, 22)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    if (r.width < 24 || r.height < 24) out.under24++;
  });
  // text sizes
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set();
  while (w.nextNode()) {
    const n = w.currentNode; if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || !vis(el) || el.closest('[aria-hidden=true], script, style, canvas')) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 12) { const k = (el.className || el.tagName) + fs; if (!seen.has(k)) { seen.add(k); out.tiny.push(`${(el.className || el.tagName).toString().slice(0, 22)} ${fs}px "${n.textContent.trim().slice(0, 18)}"`); } }
    if (el.tagName === 'P' && fs < 15) out.body++;
  }
  document.querySelectorAll('input:not([type=checkbox]):not([type=range]), select, textarea').forEach(el => { if (vis(el) && parseFloat(getComputedStyle(el).fontSize) < 16) out.inputZoom.push((el.className || el.tagName) + ' ' + getComputedStyle(el).fontSize); });
  // hover gating + vh
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
    const walk = (list, gated) => { for (const r of list) { if (r.type === 4) { const g = /hover:\s*hover/.test(r.conditionText || r.media?.mediaText || ''); walk(r.cssRules, gated || g); } else if (r.selectorText && /:hover/.test(r.selectorText) && !gated) out.hoverUngated++; if (r.cssText && /\b100vh\b/.test(r.cssText) && r.type === 1) out.vh100++; } };
    walk(rules, false); }
  let bars = 0; document.querySelectorAll('body *').forEach(el => { const s = getComputedStyle(el); if ((s.position === 'fixed' || s.position === 'sticky') && vis(el)) { const r = el.getBoundingClientRect(); if (r.width > innerWidth * 0.6 && !el.classList.contains('palette') && !el.classList.contains('drawer') && !el.classList.contains('loading')) bars += Math.min(r.height, innerHeight); } });
  out.bars = Math.round((bars / innerHeight) * 100);
  // M10 contrast: effective foreground vs effective background of every visible text node (alpha composited over ancestors)
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(s => parseFloat(s)); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const bgOf = el => { const stack = []; let p = el; while (p) { const c = parse(getComputedStyle(p).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break; } p = p.parentElement; } let base = { r: 5, g: 11, b: 22, a: 1 }; for (const c of stack.reverse()) base = over(c, base); return base; };
  out.contrast = []; const w2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); const seenC = new Set();
  while (w2.nextNode()) { const n = w2.currentNode; if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el || !vis(el) || el.closest('[aria-hidden=true], script, style, canvas, svg')) continue;
    const cs = getComputedStyle(el); const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(el); const f = over({ ...fg, a: fg.a * (+cs.opacity || 1) }, bg);
    const L1 = lum(f), L2 = lum(bg); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
    const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
    if (ratio < (big ? 3 : 4.5)) { const k = (el.className || el.tagName) + Math.round(ratio * 10); if (!seenC.has(k)) { seenC.add(k); out.contrast.push(`${(el.className || el.tagName).toString().slice(0, 20)} ${ratio.toFixed(2)} "${n.textContent.trim().slice(0, 14)}"`); } } }
  const h = document.querySelector('h1'); out.h1 = !!h && h.getBoundingClientRect().top < 800;
  const vp = document.querySelector('meta[name=viewport]')?.content || ''; out.viewport = { ok: /width=device-width/.test(vp) && !/user-scalable=no|maximum-scale=1\b/.test(vp), cover: /viewport-fit=cover/.test(vp) };
  // map specifics: is the canvas usable height at least 40% of the screen
  const mc = document.querySelector('.map-stage'); out.mapH = mc ? Math.round(mc.getBoundingClientRect().height) : null; out.vh = innerHeight;
  return out;
};
(async () => {
  const b = await chromium.launch(); let fail = 0; const rows = [];
  for (const W of widths) {
    const ctx = await b.newContext({ viewport: { width: W, height: W >= 700 ? 1024 : 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    for (const [name, hash] of VIEWS) {
      await p.goto(base + '/' + hash); await p.waitForTimeout(name === 'graph' ? 4500 : 1800);
      const r = await p.evaluate(probe);
      const bad = r.contrast.length || r.ovf > 0 || r.under44.length || r.tiny.length || r.inputZoom.length || r.hoverUngated || r.vh100 || r.bars > 15 || !r.viewport.ok || errs.length;
      if (bad) fail++;
      rows.push({ W, name, ...r, errs: errs.length });
      console.log(`${String(W).padStart(3)} ${name.padEnd(11)} ovf ${r.ovf} · <44px ${r.under44.length} · <12px ${r.tiny.length} · input<16 ${r.inputZoom.length} · contrast ${r.contrast.length} · hover ${r.hoverUngated} · 100vh ${r.vh100} · bars ${r.bars}% · mapH ${r.mapH ?? '-'}/${r.vh}${r.clipped.length ? ' · clipped ' + r.clipped.join(',') : ''}${errs.length ? ' · ERRORS ' + errs[0] : ''}`);
      if (shots && (W === 390 || W === 768)) await p.screenshot({ path: `${shots}/${W}-${name.replace('+', '-')}.png`, fullPage: false });
    }
    await ctx.close();
  }
  if (process.env.DETAIL) { const w = rows.find(r => r.W === 390 && r.name === 'map'); console.log(JSON.stringify({ under44: w.under44.slice(0, 30), tiny: w.tiny, contrast: w.contrast.slice(0, 40) }, null, 1)); }
  console.log(fail ? `\n${fail} view/width combinations fail the floor` : '\nMobile Floor holds'); await b.close(); process.exit(fail ? 1 : 0);
})();
