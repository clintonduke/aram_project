# India–Pakistan Relations: React version (GS-II International Relations, Chapter 1)

A React (Vite) site for the v3 sample notes. The content is data (`src/content/chapter.json`), and React components render it.

## Publish on GitHub (no npm needed on your computer)
1. On github.com, create a new repository (for example `aram-ir-notes`), set it to Public, and do not add a README.
2. On the empty repository page, click **uploading an existing file**. Open this folder on your computer, select **everything inside it** (including the `.github` folder) and drag it into the upload box. Click **Commit changes**.
3. Go to **Settings → Pages**. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open the **Actions** tab: the workflow "Build and publish the site" runs (about 1–2 minutes). If it has not started, click it and press **Run workflow**.
5. Your site is live at `https://<your-username>.github.io/aram-ir-notes/` (the link is also shown in Settings → Pages).

If the `.github` folder did not upload (some browsers skip folders whose names start with a dot), create the file by hand: **Add file → Create new file**, type the name `.github/workflows/deploy.yml`, paste the contents of that file from this folder, and commit.

Every later change you commit on GitHub (for example editing `src/content/chapter.json` in the browser) rebuilds and republishes the site automatically.

## Run and build on a computer (optional)
Requires Node.js 18 or newer.
```
npm install
npm run dev       # local preview at http://localhost:5173
npm run build     # production files in dist/
```
Upload the contents of `dist/` to any static host (cPanel `public_html`, Netlify, Vercel, GitHub Pages, S3). `base: './'` in `vite.config.js` means it also works from a sub-folder.

## Project layout
- `src/App.jsx`: page layout (header, contents sidebar, chapter, PYQ table, footer).
- `src/components/Blocks.jsx`: renders each content block type: `h3`, `p`, `list` (numbered points with bold label and keyword tag), `table`, `callout`, `case`, `figure`, `columns` (text beside a figure), `answer` (model answer), `sketch`, `revision`, `keywords`.
- `src/components/InteractiveFigure.jsx`: makes a figure interactive. A transparent layer over the drawing holds hover targets (boxes, circles, pins, lines), with a row of buttons and a short note below the figure.
- `src/components/Highlight.jsx`: shared highlight state that links map features and the numbered points both ways (hover on desktop, tap on phones, keyboard with Tab and Enter).
- `src/content/figureLinks.json`: for each linked figure, its hover targets, the notes shown under it and the key that connects each target to points in the text.
- `src/content/borderMap.json`: positions of the border map's targets (input to `figureLinks.json`); `scripts/make_border_map.mjs` regenerates it.
- `scripts/measure_figures.cjs` and `scripts/make_figure_links.py`: measure label positions inside the figures and rebuild `figureLinks.json` and the `hotspot` keys in `chapter.json`.
- `src/components/Contents.jsx`: sticky section list that highlights the section on screen; a collapsible "Contents" on phones.
- `src/components/PyqTable.jsx`: the previous-year questions table.
- `src/components/Rich.jsx`: renders the inline formatting inside text (bold, italic, links, keyword tags) as React elements.
- `src/content/chapter.json`: all the text of the chapter.
- `src/content/figures/*.svg` and `index.js`: the timeline, trade chart, map, escalation ladder, balance and power-triangle figures.
- `src/assets/`: logo and fonts (Spectral, Source Sans 3, IBM Plex Mono; SIL Open Font Licence texts included).
- `src/styles.css`: all styling; desktop, tablet, phone and print layouts.
- `scripts/convert_notes_to_json.py`: regenerates `chapter.json` and the SVGs from a rebuilt notes HTML (`python3 scripts/convert_notes_to_json.py <notes/build/body2.html> src/content`; needs `beautifulsoup4` and `lxml`).
- `.github/workflows/deploy.yml`: builds the site on GitHub and publishes it to GitHub Pages.

## Hover links between figures and points
Six figures are linked to the numbered points next to them:
| Section | Figure | Linked points |
|---|---|---|
| 1.2 | Timeline of milestones | the seven phases of the evolution of relations |
| 4 | Exports chart | Trade and Import ban |
| 5 | Border map | International Border, LoC, AGPL, Sir Creek, CPEC, rivers, crossings |
| 6.1–6.2 | Escalation ladder | Major attacks and Escalation risk |
| 7.4–7.5 | Abeyance balance | the debate and assessment points that match each argument |
| 9 | Power triangle | China, United States, Pakistan and India's outreach (Afghanistan, Iran) |

Hovering a point highlights its part of the figure; hovering the figure (or tapping a button under it on phones) highlights the point. A point is linked by a `hotspot` key in `chapter.json` that matches a `link` in `figureLinks.json`. Linked points show a small "FIG" badge.

## Editing content
Edit `src/content/chapter.json`. Each section has `id`, `num`, `title` and `blocks`. A point in a `list` block looks like:
```json
{ "label": "Proxy war since 1989", "colon": true, "html": "Pakistan’s army has used militant groups against India since the J&amp;K insurgency", "tag": "proxy war" }
```
`html` may contain `<b>`, `<i>` and `<a href="…">`; the keyword tag is shown in brackets after the point.

## Adding chapters
Copy the JSON structure for each new chapter (for example `chapter02.json`) and render it with the same components; add a route or a chapter switcher in `App.jsx`.
