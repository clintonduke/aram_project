import React, { useEffect, useState } from 'react';

// Section list that highlights the section currently being read.
export default function Contents({ sections }) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    // The active section is the last one whose top has passed 120px from the top of the window.
    const onScroll = () => {
      let cur = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) cur = s.id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
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
