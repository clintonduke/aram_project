"""Build src/content/figureLinks.json (hover targets for every linked figure) and tag the matching points in chapter.json."""
import json, re
M = json.load(open('measure.json'))
C = 'src/content/'
pad = lambda b, p=3: [round(b[0]-p,1), round(b[1]-p,1), round(b[2]+2*p,1), round(b[3]+2*p,1)]
def union(bs):
    x0=min(b[0] for b in bs); y0=min(b[1] for b in bs); x1=max(b[0]+b[2] for b in bs); y1=max(b[1]+b[3] for b in bs)
    return [x0,y0,round(x1-x0,1),round(y1-y0,1)]
def find(fig, t):
    for x in M[fig]['texts']:
        if x['t'] == t: return x['b']
    raise SystemExit(f'{fig}: text not found: {t}')
figs = {}

# --- Timeline (fig01): events grouped by phase ---
T = M['fig01']['texts']; ev = {}
for i, x in enumerate(T):
    if re.fullmatch(r'(19|20)\d\d', x['t']):
        grp = [x['b']]
        for y in T[i+1:]:
            if re.fullmatch(r'(19|20)\d\d', y['t']) or y['t'].startswith('Latest'): break
            if abs(y['b'][0] + y['b'][2]/2 - (x['b'][0] + x['b'][2]/2)) < 40: grp.append(y['b'])
        ev[x['t']] = pad(union(grp), 2)
bands = [r['b'] for r in M['fig01']['rects']]
tl = [('tl1', '1947–1971: wars and treaties', 'J&K war (1947–48), IWT (1960), Tashkent (1966), the 1971 war and Bangladesh.', ['1947','1960','1965','1971'], 0),
      ('tl2', '1972: Shimla Agreement', 'Ceasefire line converted into the LoC; bilateralism written in.', ['1972'], None),
      ('tl3', '1972–1998: proxy war', 'Siachen (1984), insurgency from 1989, nuclear tests (1998).', ['1984','1998'], 1),
      ('tl4', '1999–2008: peace process with shocks', 'Lahore and Kargil (1999), LoC ceasefire (2003), Composite Dialogue.', ['1999','2003'], 2),
      ('tl5', '2008–2019: stop–start', '26/11 (2008), Uri and surgical strikes (2016), Pulwama, Balakot and Article 370 (2019).', ['2008','2016','2019'], 3),
      ('tl6', '2019–2025: cold peace', 'DGMO ceasefire recommitment (February 2021); Kartarpur; no political dialogue.', ['2021'], 4),
      ('tl7', '2025 onwards: new normal', 'Pahalgam, IWT abeyance, Operation Sindoor and the 10 May ceasefire.', ['2025'], None)]
figs['fig01'] = {'viewBox': M['fig01']['viewBox'], 'hint': 'Hover over or tap a phase or an event to highlight the matching point below.',
    'links': {k: {'title': t, 'note': n} for k, t, n, _, _ in tl},
    'spots': [{'link': k, 'rects': [ev[y] for y in ys] + ([pad(bands[bi], 1)] if bi is not None else [])} for k, _, _, ys, bi in tl]}

# --- Trade chart (fig02) ---
bars = [r['b'] for r in M['fig02']['rects'] if r['b'][3] > 2]
figs['fig02'] = {'viewBox': M['fig02']['viewBox'], 'hint': 'Hover over or tap the bars to highlight the matching point.',
    'links': {'trade': {'title': 'Exports to Pakistan', 'note': 'US$ 2.07 bn in 2018-19, falling after MFN withdrawal (2019); about US$ 0.12 bn in May–October 2025, mostly medicines.'},
              'importban': {'title': 'Import ban, 2 May 2025', 'note': 'All direct and indirect imports from Pakistan banned after Pahalgam; the 2025-26 bar covers May–October only.'}},
    'spots': [{'link': 'trade', 'rects': [pad(b, 2) for b in bars[:-1]]}, {'link': 'importban', 'rects': [pad(bars[-1], 2)]}]}

# --- Escalation ladder (fig04): the three crisis columns ---
cols = [find('fig04', y) for y in ('2016', '2019', '2025')]
colr = [[round(b[0] + b[2]/2 - 31, 1), 8, 62, 375] for b in cols]
figs['fig04'] = {'viewBox': M['fig04']['viewBox'], 'hint': 'Hover over or tap a crisis column to highlight the matching points.',
    'links': {'ladder': {'title': 'Escalation after major attacks', 'note': 'Uri 2016: surgical strikes (rung 3). Pulwama 2019: Balakot (rung 4). Pahalgam 2025: terror camps, then 11 air bases (rung 5); each crisis climbed higher.'}},
    'spots': [{'link': 'ladder', 'rects': colr}]}

# --- Abeyance balance (fig05) ---
B = lambda *ts: pad(union([find('fig05', t) for t in ts]), 2)
bal = [('goodwill', 'Terror destroys treaty goodwill', 'A state sponsoring terror cannot claim the benefits of a treaty built on good faith.', B('Terror destroys treaty goodwill')),
       ('changed', 'Changed circumstances', 'Article XII(3) notices (2023, 2024); suspension for a fundamental change (VCLT Art. 62).', B('Changed circumstances (Art. XII', 'notices)')),
       ('projects', 'Faster projects for J&K', 'Pakal Dul, Kiru, Kwar, Ratle and Sawalkot fast-tracked: power and irrigation gains.', B('Faster projects for J&K')),
       ('leverage', 'Leverage against a terror sponsor', 'Abeyance as lasting leverage vs an "IWT 2.0" with climate data and one dispute track.', B('Leverage against a terror sponsor')),
       ('noexit', 'No exit clause', 'The treaty has no exit clause; obligations bind (pacta sunt servanda, VCLT Art. 26).', B('No exit clause in the treaty')),
       ('coa', 'Court of Arbitration award', '31 August 2026: no unilateral suspension; India rejects the court, but risks legal isolation.', B('Court of Arbitration award (Aug 2026)')),
       ('storage', 'Little storage', 'India has little storage on the Western rivers, so short-term leverage is small.', B('Little storage: small short-term', 'effect')),
       ('precedent', 'Brahmaputra precedent', 'India is a lower riparian on the Brahmaputra, where China began a large dam in July 2025.', B('Precedent for China on the Brahmaputra'))]
figs['fig05'] = {'viewBox': M['fig05']['viewBox'], 'hint': 'Hover over or tap an argument to highlight the matching point.',
    'links': {k: {'title': t, 'note': n} for k, t, n, _ in bal}, 'spots': [{'link': k, 'rects': [r]} for k, _, _, r in bal]}

# --- Power triangle (fig06): actor nodes ---
node = [c['b'] for c in M['fig06']['circles'] if c['b'][2] > 40]
nb = sorted(node, key=lambda b: (b[1], b[0]))  # India(top-left), China(top-right), US(bottom-left), Pakistan(bottom-right)
tri = [('india', 'India', 'Builds a route around Pakistan through Afghanistan (Kabul embassy, October 2025) and Iran (Chabahar).', nb[0]),
       ('china', 'China', 'Arms, CPEC, UN "technical holds" and live inputs in May 2025, yet signed the SCO condemnation of Pahalgam.', nb[1]),
       ('us', 'United States', 'Claimed credit for the 10 May ceasefire (India denies), courted Pakistan’s army chief, cut tariffs on Pakistan.', nb[2]),
       ('pak', 'Pakistan', '27th Amendment (November 2025): the army chief is also Chief of Defence Forces.', nb[3])]
figs['fig06'] = {'viewBox': M['fig06']['viewBox'], 'hint': 'Hover over or tap a country to highlight the matching points.',
    'links': {k: {'title': t, 'note': n} for k, t, n, _ in tri},
    'spots': [{'link': k, 'circle': [round(b[0] + b[2]/2, 1), round(b[1] + b[3]/2, 1), round(b[2]/2 + 4, 1)]} for k, _, _, b in tri]}

# --- Border map (fig03): from borderMap.json ---
bm = json.load(open(C + 'borderMap.json'))
figs['fig03'] = {'viewBox': bm['viewBox'], 'hint': 'Hover over or tap a marker, line or river to highlight the matching point.', 'map': True,
    'links': {h['id']: {'title': h['title'], 'note': h['note']} for h in bm['hotspots']},
    'spots': [{k: v for k, v in dict(link=h['id'], pins=h.get('pins'), paths=h.get('paths') or ([h['path']] if h.get('path') else None), labelAt=h.get('labelAt')).items() if v} for h in bm['hotspots']]}
json.dump(figs, open(C + 'figureLinks.json', 'w'), ensure_ascii=False, indent=1)

# --- Tag points in chapter.json ---
TAGS = {('c01-s1', '1.2'): ['tl1', 'tl2', 'tl3', 'tl4', 'tl5', 'tl6', 'tl7'],
        ('c01-s4', None): ['trade', 'importban'],
        ('c01-s5', None): ['ib', 'loc', 'agpl', 'sircreek', 'cpec', 'rivers', 'crossings'],
        ('c01-s6', '6.1'): [None, 'ladder'], ('c01-s6', '6.2'): [None, 'ladder'],
        ('c01-s7', '7.4'): ['noexit', 'changed', 'goodwill', None, 'leverage', None],
        ('c01-s7', '7.5'): ['storage', 'coa', 'projects', None, 'precedent'],
        ('c01-s9', None): ['china', 'china', 'us', None, None, 'india', 'india', 'pak']}
ch = json.load(open(C + 'chapter.json')); used = set()
def walk(sec, blocks, state):
    for b in blocks:
        if b['type'] == 'h3': state['h3'] = b['text'].split(' ')[0]
        if b['type'] == 'columns':
            for c in b['cols']: walk(sec, c, state)
        if b['type'] == 'figure' and b['id'] in figs: b['interactive'] = b['id']
        if b['type'] == 'list':
            key = (sec, state['h3']) if (sec, state['h3']) in TAGS else (sec, None)
            if key in TAGS and key not in used:
                used.add(key)
                for it, tag in zip(b['items'], TAGS[key]):
                    it.pop('hotspot', None)
                    if tag: it['hotspot'] = tag
for s in ch['sections']: walk(s['id'], s['blocks'], {'h3': None})
missing = set(TAGS) - used
json.dump(ch, open(C + 'chapter.json', 'w'), ensure_ascii=False, indent=1)
print('figures', list(figs), 'tagged lists', len(used), 'missing', missing)
