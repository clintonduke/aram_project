import React from 'react';
import chapter from './content/chapter.json';
import Blocks from './components/Blocks.jsx';
import Contents from './components/Contents.jsx';
import PyqTable from './components/PyqTable.jsx';
import Rich from './components/Rich.jsx';
import logo from './assets/aram.png';

export default function App() {
  return (
    <div className="site">
      <header className="topbar">
        <img src={logo} alt="ARAM IAS Academy" />
        <div className="topbar-text">GS PAPER II · INTERNATIONAL RELATIONS<br />UPSC CIVIL SERVICES MAINS 2027</div>
      </header>

      <div className="layout">
        <Contents sections={chapter.sections} />

        <main className="page">
          <div className="kicker">{chapter.kicker}</div>
          <h1 className="chapter-title">{chapter.title}</h1>
          <div className="syllabus"><b>Syllabus line:</b> <Rich html={chapter.syllabus} /></div>

          {chapter.sections.map((s) => (
            <section key={s.id} id={s.id} className="section">
              <h2>{s.num}. {s.title}</h2>
              <Blocks blocks={s.blocks} />
            </section>
          ))}

          <PyqTable pyq={chapter.pyq} />
        </main>
      </div>

      <footer className="footer">
        ARAM IAS Academy · GS-II International Relations Notes · Chapter 1
        <a className="to-top" href="#root">Back to top</a>
      </footer>
    </div>
  );
}
