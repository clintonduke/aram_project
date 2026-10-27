# India–Pakistan Relations: React version (GS-II International Relations, Chapter 1)

A React (Vite) site for the v3 sample notes. The content is data (`src/content/chapter.json`), and React components render it.

## Run and build
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
- `src/components/Contents.jsx`: sticky section list that highlights the section on screen; a collapsible "Contents" on phones.
- `src/components/PyqTable.jsx`: the previous-year questions table.
- `src/components/Rich.jsx`: renders the inline formatting inside text (bold, italic, links, keyword tags) as React elements.
- `src/content/chapter.json`: all the text of the chapter.
- `src/content/figures/*.svg` and `index.js`: the timeline, trade chart, map, escalation ladder, balance and power-triangle figures.
- `src/assets/`: logo and fonts (Spectral, Source Sans 3, IBM Plex Mono; SIL Open Font Licence texts included).
- `src/styles.css`: all styling; desktop, tablet, phone and print layouts.
- `scripts/convert_notes_to_json.py`: regenerates `chapter.json` and the SVGs from a rebuilt notes HTML (`python3 scripts/convert_notes_to_json.py <notes/build/body2.html> src/content`; needs `beautifulsoup4` and `lxml`).
- `prebuilt/`: an already-built copy of the site; upload this folder as it is if you want to host without running `npm`.

## Editing content
Edit `src/content/chapter.json`. Each section has `id`, `num`, `title` and `blocks`. A point in a `list` block looks like:
```json
{ "label": "Proxy war since 1989", "colon": true, "html": "Pakistan’s army has used militant groups against India since the J&amp;K insurgency", "tag": "proxy war" }
```
`html` may contain `<b>`, `<i>` and `<a href="…">`; the keyword tag is shown in brackets after the point.

## Adding chapters
Copy the JSON structure for each new chapter (for example `chapter02.json`) and render it with the same components; add a route or a chapter switcher in `App.jsx`.
