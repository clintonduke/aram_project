// Regenerates src/content/borderMap.json (hover targets for the Section 5 map).
// Usage: npm install d3-geo, then: node scripts/make_border_map.mjs <path to geo_rivers_india.json>
// Coordinates use the same Mercator fit as the printed map (bbox 60–82 E, 22–37.5 N, 520 px wide).
import fs from 'fs'; import { createRequire } from 'module';
const require = createRequire(import.meta.url); const d3 = require('d3-geo');
const [w0, s0, e0, n0] = [60, 22, 82, 37.5]; const W = 520;
const proj = d3.geoMercator(); const box = { type: 'MultiPoint', coordinates: [] };
for (let k = 0; k <= 10; k++) { const lo = w0 + (e0 - w0) * k / 10, la = s0 + (n0 - s0) * k / 10; box.coordinates.push([lo, s0], [lo, n0], [w0, la], [e0, la]); }
proj.fitWidth(W - 8, box); const bb = d3.geoPath(proj).bounds(box); const H = Math.round(bb[1][1] - bb[0][1] + 8);
proj.fitExtent([[4, 4], [W - 4, H - 4]], box);
const P = (lo, la) => proj([lo, la]).map(v => +v.toFixed(1));
const line = cs => 'M' + cs.map(c => P(...c).join(',')).join('L');
const rivers = JSON.parse(fs.readFileSync('process.argv[2] || "geo_rivers_india.json"')).rivers
  .filter(r => ['Indus', 'Jhelum', 'Chenab', 'Ravi', 'Beas', 'Sutlej'].includes(r.name));
const H_ = [
  { id: 'ib', title: 'International Border', note: 'About 2,400 km from Gujarat through Rajasthan and Punjab to Jammu; fenced, guarded by the BSF.', pins: [P(70.3, 24.4), P(70.6, 27.2), P(74.4, 30.95)], labelAt: P(70.6, 27.2) },
  { id: 'loc', title: 'Line of Control', note: 'About 740 km military line from the Shimla Agreement; guarded by the Army.', pins: [P(74.0, 34.45), P(74.1, 33.75)], labelAt: P(74.0, 34.45) },
  { id: 'agpl', title: 'AGPL, Siachen', note: 'About 110 km on the Saltoro Ridge north of NJ9842; held by India since Op Meghdoot (1984).', pins: [P(77.1, 35.4)], labelAt: P(77.1, 35.4) },
  { id: 'sircreek', title: 'Sir Creek', note: '96 km tidal estuary in the Rann of Kutch; the boundary decides the maritime boundary and EEZs.', pins: [P(68.6, 23.75)], labelAt: P(68.6, 23.75) },
  { id: 'cpec', title: 'CPEC', note: 'Khunjerab Pass through Gilgit-Baltistan to Gwadar near Hormuz; India opposes it as a violation of sovereignty.', path: line([[75.5, 36.6], [74.0, 35.8], [73.1, 33.7], [71.5, 30.2], [66.0, 26.2], [62.32, 25.13]]), pins: [P(75.5, 36.6), P(62.32, 25.13)], labelAt: P(71.5, 30.2) },
  { id: 'rivers', title: 'Indus rivers', note: 'Indus, Jhelum and Chenab (Western) and Ravi, Beas and Sutlej (Eastern); the Western rivers cross Indian territory first.', paths: rivers.map(r => line(r.coords)), labelAt: P(72.6, 31.2) },
  { id: 'crossings', title: 'Attari–Wagah and Kartarpur', note: 'The only crossings for people and goods; both closed since 2025.', pins: [P(74.57, 31.6), P(75.03, 32.09)], labelAt: P(74.57, 31.6) },
];
fs.writeFileSync('src/content/borderMap.json', JSON.stringify({ viewBox: `0 0 ${W} ${H}`, hotspots: H_ }, null, 1));
console.log('H', H, H_.map(h => h.id + ' ' + JSON.stringify(h.labelAt)).join(' | '));
