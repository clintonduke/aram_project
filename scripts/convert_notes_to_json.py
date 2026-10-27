"""Convert the rendered chapter (notes/build/body2.html) into structured JSON + SVG files for the React app."""
import re, json, os, sys
from bs4 import BeautifulSoup, NavigableString, Tag
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(f'{OUT}/figures', exist_ok=True)
s = open(SRC).read()
chap = BeautifulSoup(re.search(r'<section class="chap" id="c01">.*?</section>', s, re.S).group(0), 'lxml').find('section')
OK = {'b', 'strong', 'i', 'em', 'a', 'span', 'br', 'sub', 'sup', 'q'}
def inline(node):
    out = ''
    for c in node.children:
        if isinstance(c, NavigableString): out += str(c).replace('&', '&amp;').replace('<', '&lt;')
        elif isinstance(c, Tag):
            if c.name not in OK: out += inline(c); continue
            if c.name == 'br': out += '<br>'; continue
            attrs = ''
            if c.name == 'a': attrs = f' href="{c.get("href","")}"'
            if c.name == 'span':
                if 'tg' in (c.get('class') or []): attrs = ' class="tg"'
                else: out += inline(c); continue
            out += f'<{c.name}{attrs}>{inline(c)}</{c.name}>'
    return re.sub(r'\s+', ' ', out).strip()
figs = 0
def figure(d):
    global figs
    figs += 1
    ft = d.find('div', class_='ft'); cap = d.find('div', class_='cap'); svg = d.find('svg')
    fid = f'fig{figs:02d}'
    open(f'{OUT}/figures/{fid}.svg', 'w').write(str(svg))
    return {'type': 'figure', 'id': fid, 'title': inline(ft) if ft else '', 'caption': inline(cap) if cap else '', 'map': 'fig-map' in (d.get('class') or [])}
def li_item(li):
    tag = li.find('span', class_='tg', recursive=False)
    t = tag.get_text(strip=True).strip('()') if tag else ''
    if tag: tag.extract()
    label = ''; colon = False
    first = next((c for c in li.children if not (isinstance(c, NavigableString) and not c.strip())), None)
    if isinstance(first, Tag) and first.name == 'b':
        raw = first.get_text().strip(); label = raw.rstrip(':'); first.extract()
        rest = inline(li)
        colon = raw.endswith(':') or rest.startswith(':')
    html = inline(li).lstrip(':').strip().rstrip('.').strip()
    if html.endswith(' '): html = html.strip()
    return {'label': label, 'colon': colon, 'html': html, 'tag': t}
def table(t):
    head = [inline(th) for th in t.select('thead th')]
    rows = [[inline(td) for td in tr.find_all('td')] for tr in t.select('tbody tr')]
    return {'type': 'table', 'variant': ' '.join(t.get('class') or []), 'head': head, 'rows': rows}
def blocks(parent):
    out = []
    kids = [c for c in parent.children if isinstance(c, Tag)]
    i = 0
    while i < len(kids):
        e = kids[i]; cl = e.get('class') or []
        if e.name in ('style', 'span') : i += 1; continue
        if e.name == 'h3': out.append({'type': 'h3', 'id': e.get('id'), 'text': e.get_text(strip=True)})
        elif e.name == 'p' and 'kw' in cl: out.append({'type': 'keywords', 'html': inline(e).replace('<b>Keywords:</b>', '').strip()})
        elif e.name == 'p' and 'skc' in cl: out.append({'type': 'sketch', 'html': inline(e)})
        elif e.name == 'p': out.append({'type': 'p', 'lead': 'lead' in cl, 'html': inline(e)})
        elif e.name in ('ol', 'ul'): out.append({'type': 'list', 'ordered': e.name == 'ol', 'items': [li_item(li) for li in e.find_all('li', recursive=False)]})
        elif e.name == 'table': out.append(table(e))
        elif e.name == 'div' and 'cx' in cl:
            lb = e.find('span', class_='lb'); label = lb.get_text(strip=True) if lb else ''
            if lb: lb.extract()
            kind = [c for c in cl if c != 'cx'][0]
            out.append({'type': 'callout', 'kind': kind, 'label': label, 'blocks': blocks(e)})
        elif e.name == 'div' and 'case' in cl:
            lb = e.find('span', class_='lb'); label = lb.get_text(strip=True) if lb else 'CASE STUDY'
            out.append({'type': 'case', 'label': label, 'html': inline(e.find('p'))})
        elif e.name == 'div' and ('dg' in cl or 'fig' in cl): out.append(figure(e))
        elif e.name == 'div' and ('figrow' in cl or 'trirow' in cl):
            out.append({'type': 'columns', 'cols': [blocks(c) for c in e.find_all('div', recursive=False)]})
        elif e.name == 'div' and 'q' in cl:
            ans = kids[i + 1]
            parts = []; cur = None; wc = ''
            for a in [c for c in ans.children if isinstance(c, Tag)]:
                ac = a.get('class') or []
                if 'lab' in ac: cur = {'label': a.get_text(strip=True), 'blocks': []}; parts.append(cur)
                elif 'wc' in ac: wc = a.get_text(strip=True)
                elif cur is not None:
                    tmp = BeautifulSoup('<div></div>', 'lxml').div; tmp.append(a.__copy__()); cur['blocks'] += blocks(tmp)
            out.append({'type': 'answer', 'tag': e.find('span', class_='tag').get_text(strip=True), 'question': inline(e.find('p')), 'parts': parts, 'words': wc})
            i += 1
        elif e.name == 'div' and 'rev' in cl: out.append({'type': 'revision', 'items': [inline(li) for li in e.find_all('li')]})
        elif e.name == 'div' and 'pyq' in cl:
            rows = []
            for tr in e.select('tbody tr'):
                td = tr.find_all('td')
                rows.append({'year': td[0].get_text(' ', strip=True), 'question': inline(td[1]), 'see': [{'href': a['href'], 'text': a.get_text(strip=True)} for a in td[2].find_all('a')]})
            out.append({'type': 'pyq', 'title': e.find('div', class_='h').get_text(strip=True), 'rows': rows})
        elif e.name == 'div':
            out += blocks(e)
        i += 1
    return out
data = {'kicker': chap.find('div', class_='part').get_text(strip=True), 'title': chap.find('h1').get_text(strip=True),
        'syllabus': inline(chap.find('div', class_='sylb')).replace('<b>Syllabus line:</b>', '').strip(), 'sections': []}
for e in [c for c in chap.find_all('div', class_=['part', 'sylb', 'inch'], recursive=False)] + chap.find_all('h1', recursive=False) + chap.find_all('span', class_='mk', recursive=False): e.extract()
cur = None; pre = BeautifulSoup('<div></div>', 'lxml').div
for e in [c for c in chap.children if isinstance(c, Tag)]:
    if e.name == 'h2':
        m = re.match(r'(\d+)\.\s*(.*)', e.get_text(strip=True))
        cur = {'id': e.get('id'), 'num': int(m.group(1)), 'title': m.group(2), 'box': BeautifulSoup('<div></div>', 'lxml').div}
        data['sections'].append(cur)
    elif cur is not None: cur['box'].append(e.__copy__())
    else: pre.append(e.__copy__())
for sec in data['sections']: sec['blocks'] = blocks(sec.pop('box'))
# the PYQ block sits inside the last section's box; lift it out
last = data['sections'][-1]['blocks']; data['pyq'] = next((b for b in last if b['type'] == 'pyq'), None)
data['sections'][-1]['blocks'] = [b for b in last if b['type'] != 'pyq']
json.dump(data, open(f'{OUT}/chapter.json', 'w'), ensure_ascii=False, indent=1)
print('sections', len(data['sections']), 'figures', figs, 'pyq rows', len(data['pyq']['rows']) if data['pyq'] else 0)
