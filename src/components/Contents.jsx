import React, { useEffect, useState } from 'react';

// Section list that highlights the section currently on screen.
export default function Contents({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const obs = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: '0px 0px -70% 0px' }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [sections]);

  const list = (
    <ol className="toc-list">
      {sections.map((s) => (
        <li key={s.id} className={active === s.id ? 'active' : undefined}>
          <a href={`#${s.id}`}><span className="n">{s.num}</span>{s.title}</a>
        </li>
      ))}
      <li><a href="#c01-pyq"><span className="n">Q</span>Previous year questions</a></li>
    </ol>
  );

  return (
    <>
      <nav className="toc" aria-label="Contents">
        <div className="toc-head">IN THIS CHAPTER</div>
        {list}
      </nav>
      <details className="toc-mobile">
        <summary>Contents</summary>
        {list}
      </details>
    </>
  );
}
