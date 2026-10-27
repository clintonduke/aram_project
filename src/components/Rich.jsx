import React from 'react';

// Renders the small set of inline tags used in the notes (bold, italic, links,
// keyword tags, line breaks) as real React elements. Anything else is shown as text.
const ALLOWED = new Set(['B', 'STRONG', 'I', 'EM', 'A', 'SPAN', 'BR', 'SUB', 'SUP', 'Q']);

function toReact(node, key) {
  if (node.nodeType === 3) return node.nodeValue;
  if (node.nodeType !== 1) return null;
  const kids = Array.from(node.childNodes).map((c, i) => toReact(c, i));
  const tag = node.tagName;
  if (!ALLOWED.has(tag)) return <React.Fragment key={key}>{kids}</React.Fragment>;
  if (tag === 'BR') return <br key={key} />;
  if (tag === 'A') {
    const href = node.getAttribute('href') || '';
    const external = /^https?:\/\//.test(href);
    return (
      <a key={key} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {kids}
      </a>
    );
  }
  if (tag === 'SPAN') return <span key={key} className={node.getAttribute('class') || undefined}>{kids}</span>;
  return React.createElement(tag.toLowerCase(), { key }, kids);
}

export default function Rich({ html, as: As = React.Fragment, className }) {
  if (!html) return null;
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const content = Array.from(doc.body.firstChild.childNodes).map((c, i) => toReact(c, i));
  return As === React.Fragment ? <>{content}</> : <As className={className}>{content}</As>;
}
