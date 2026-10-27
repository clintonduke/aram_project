// Measures where labels and shapes sit inside each figure SVG (viewBox units) and writes measure.json.
// Usage: npm install playwright, then: node scripts/measure_figures.cjs   (then: python3 scripts/make_figure_links.py)
// Measure label/shape boxes inside each figure SVG, in the SVG's own viewBox units.
const { chromium } = require('playwright'); const fs = require('fs');
const D = 'src/content/figures/';
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1000, height: 1000 } });
  const out = {};
  for (const f of ['fig01', 'fig02', 'fig04', 'fig05', 'fig06']) {
    await p.setContent(`<div style="width:520px">${fs.readFileSync(D + f + '.svg', 'utf8')}</div>`);
    out[f] = await p.evaluate(() => {
      const svg = document.querySelector('svg'); const inv = svg.getScreenCTM().inverse();
      const box = el => { const r = el.getBoundingClientRect(); const a = new DOMPoint(r.left, r.top).matrixTransform(inv), c = new DOMPoint(r.right, r.bottom).matrixTransform(inv); return [+a.x.toFixed(1), +a.y.toFixed(1), +(c.x - a.x).toFixed(1), +(c.y - a.y).toFixed(1)]; };
      const texts = [...svg.querySelectorAll('text')].map(t => ({ t: t.textContent.trim(), b: box(t) }));
      const rects = [...svg.querySelectorAll('rect')].map(r => ({ fill: r.getAttribute('fill'), b: box(r) }));
      const circles = [...svg.querySelectorAll('circle')].map(c => ({ fill: c.getAttribute('fill'), b: box(c) }));
      return { viewBox: svg.getAttribute('viewBox'), texts, rects, circles };
    });
  }
  fs.writeFileSync('measure.json', JSON.stringify(out));
  for (const [k, v] of Object.entries(out)) console.log(k, v.viewBox, 'texts', v.texts.length, 'rects', v.rects.length, 'circles', v.circles.length);
  console.log(JSON.stringify(out.fig06.texts), JSON.stringify(out.fig06.circles.slice(0, 12)));
  console.log(JSON.stringify(out.fig05.texts));
  console.log(JSON.stringify(out.fig01.rects.slice(0, 8)));
  console.log(JSON.stringify(out.fig02.rects.filter(r => r.b[3] > 2).slice(0, 12)));
  await b.close();
})();
