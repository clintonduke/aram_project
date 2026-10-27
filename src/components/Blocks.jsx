import React from 'react';
import Rich from './Rich.jsx';
import figures from '../content/figures/index.js';
import InteractiveFigure from './InteractiveFigure.jsx';
import { useHighlight } from './Highlight.jsx';

function PointList({ block }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  return (
    <Tag className="points">
      {block.items.map((it, i) => (it.hotspot ? <LinkedPoint key={i} it={it} /> : (
        <li key={i}><PointText it={it} /></li>
      )))}
    </Tag>
  );
}

function PointText({ it }) {
  return (
    <>
      {it.label && <b>{it.label}{it.colon ? ':' : ''} </b>}
      <Rich html={it.html} />
      {it.tag && <span className="tg"> ({it.tag})</span>}
    </>
  );
}

// A point linked to a map feature: hover, focus or tap it to light up the feature.
function LinkedPoint({ it }) {
  const { active, hover, pin } = useHighlight();
  const on = active === it.hotspot;
  return (
    <li
      className={`linked${on ? ' on' : ''}`}
      tabIndex={0}
      onMouseEnter={() => hover(it.hotspot)}
      onMouseLeave={() => hover(null)}
      onFocus={() => hover(it.hotspot)}
      onBlur={() => hover(null)}
      onClick={() => pin(it.hotspot)}
    >
      <PointText it={it} />
      <span className="map-badge" aria-hidden="true">fig</span>
    </li>
  );
}

function DataTable({ block }) {
  return (
    <div className="table-wrap">
      <table className={block.variant}>
        {block.head.length > 0 && (
          <thead>
            <tr>{block.head.map((h, i) => <th key={i}><Rich html={h} /></th>)}</tr>
          </thead>
        )}
        <tbody>
          {block.rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j}><Rich html={c} /></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Figure({ block }) {
  if (block.interactive) {
    return <InteractiveFigure figId={block.interactive} svg={figures[block.id]} title={block.title} caption={block.caption} />;
  }
  return (
    <figure className={`fig${block.map ? ' fig-map' : ''}`}>
      {block.title && <figcaption className="fig-title"><Rich html={block.title} /></figcaption>}
      <div className="fig-svg" dangerouslySetInnerHTML={{ __html: figures[block.id] }} />
      {block.caption && <p className="fig-cap"><Rich html={block.caption} /></p>}
    </figure>
  );
}

function Answer({ block }) {
  return (
    <div className="answer">
      <div className="question">
        <span className="qtag">{block.tag}</span>
        <Rich as="p" html={block.question} />
      </div>
      <div className="answer-body">
        {block.parts.map((p, i) => (
          <div key={i} className="answer-part">
            <div className="answer-label">{p.label}</div>
            <Blocks blocks={p.blocks} />
          </div>
        ))}
        {block.words && <div className="words">{block.words}</div>}
      </div>
    </div>
  );
}

export default function Blocks({ blocks }) {
  return blocks.map((b, i) => {
    switch (b.type) {
      case 'h3':
        return <h3 key={i} id={b.id || undefined}>{b.text}</h3>;
      case 'p':
        return <Rich key={i} as="p" className={b.lead ? 'lead' : undefined} html={b.html} />;
      case 'list':
        return <PointList key={i} block={b} />;
      case 'table':
        return <DataTable key={i} block={b} />;
      case 'callout':
        return (
          <div key={i} className={`callout ${b.kind}`}>
            {b.label && <span className="callout-label">{b.label}</span>}
            <Blocks blocks={b.blocks} />
          </div>
        );
      case 'case':
        return (
          <div key={i} className="case">
            <span className="callout-label">{b.label}</span>
            <Rich as="p" html={b.html} />
          </div>
        );
      case 'figure':
        return <Figure key={i} block={b} />;
      case 'columns':
        return (
          <div key={i} className={`columns${b.cols.some((c) => c.some((x) => x.interactive)) ? ' has-map' : ''}`}>
            {b.cols.map((c, j) => <div key={j} className="col"><Blocks blocks={c} /></div>)}
          </div>
        );
      case 'answer':
        return <Answer key={i} block={b} />;
      case 'sketch':
        return <Rich key={i} as="p" className="sketch" html={b.html} />;
      case 'revision':
        return (
          <div key={i} className="revision">
            <div className="callout-label">REVISE IN TWO MINUTES</div>
            <ol>{b.items.map((t, j) => <Rich key={j} as="li" html={t} />)}</ol>
          </div>
        );
      case 'keywords':
        return <p key={i} className="keywords"><b>Keywords:</b> <Rich html={b.html} /></p>;
      default:
        return null;
    }
  });
}
