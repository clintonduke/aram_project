import React, { useState } from 'react';
import { useHighlight } from './Highlight.jsx';
import Rich from './Rich.jsx';
import figureLinks from '../content/figureLinks.json';

// A figure with hover targets. The original drawing is shown as it is; a transparent SVG
// layer with the same viewBox sits on top and holds the targets (boxes, circles, pins, lines).
// Each target belongs to a "link" key; numbered points in the text carry the same key
// (as "hotspot" in chapter.json), so hovering either side highlights both.
export default function InteractiveFigure({ figId, svg, title, caption }) {
  const cfg = figureLinks[figId];
  const { active, hover, pin } = useHighlight();
  const [focus, setFocus] = useState(null);
  const mine = active && cfg.links[active] ? active : null;
  const info = mine ? cfg.links[mine] : null;

  const on = (link) => ({
    onMouseEnter: () => { hover(link); setFocus(link); },
    onMouseLeave: () => { hover(null); setFocus(null); },
    onFocus: () => hover(link),
    onBlur: () => hover(null),
    onClick: () => pin(link),
    onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pin(link); } },
  });

  return (
    <figure className={`fig ifig${cfg.map ? ' fig-map' : ''}`}>
      {title && <figcaption className="fig-title"><Rich html={title} /></figcaption>}
      <p className="ifig-hint">{cfg.hint}</p>

      <div className={`ifig-stage${mine ? ' has-active' : ''}`}>
        <div className="ifig-base" dangerouslySetInnerHTML={{ __html: svg }} />
        <svg className="ifig-layer" viewBox={cfg.viewBox} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          {cfg.spots.map((s, i) => {
            const lit = mine === s.link;
            return (
              <g key={i} className={`spot${lit ? ' on' : ''}`} tabIndex={0} role="button" aria-label={cfg.links[s.link].title} {...on(s.link)}>
                {(s.paths || []).map((d, j) => (
                  <g key={j}><path d={d} className="hit-line" /><path d={d} className={`glow-line glow-${s.link}`} /></g>
                ))}
                {(s.rects || []).map(([x, y, w, h], j) => (
                  <rect key={j} x={x} y={y} width={w} height={h} rx="4" className="box" />
                ))}
                {s.circle && <circle cx={s.circle[0]} cy={s.circle[1]} r={s.circle[2]} className="box" />}
                {(s.pins || []).map(([x, y], j) => (
                  <g key={j} transform={`translate(${x} ${y})`}>
                    <circle r="11" className="hit-pin" />
                    <circle r="9" className="ring" />
                    <circle r="3.4" className="dot" />
                  </g>
                ))}
                {lit && s.labelAt && <Label at={s.labelAt} text={cfg.links[s.link].title} />}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="ifig-chips" role="group" aria-label="Figure features">
        {Object.entries(cfg.links).map(([k, l]) => (
          <button key={k} type="button" className={mine === k ? 'on' : undefined}
            onMouseEnter={() => hover(k)} onMouseLeave={() => hover(null)} onClick={() => pin(k)}>
            {l.title}
          </button>
        ))}
      </div>
      <div className="ifig-info" aria-live="polite">
        {info ? (<><b>{info.title}:</b> {info.note}</>) : 'Select a part of the figure to see a short note.'}
      </div>
      {caption && <p className="fig-cap"><Rich html={caption} /></p>}
    </figure>
  );
}

function Label({ at, text }) {
  const [x, y] = at;
  const w = Math.max(60, text.length * 5.6 + 16);
  const left = x + w + 14 > 520 ? x - w - 14 : x + 14;
  return (
    <g className="label" pointerEvents="none">
      <rect x={left} y={y - 24} width={w} height={20} rx="4" />
      <text x={left + w / 2} y={y - 10.5} textAnchor="middle">{text}</text>
    </g>
  );
}
