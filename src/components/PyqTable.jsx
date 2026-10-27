import React from 'react';
import Rich from './Rich.jsx';

export default function PyqTable({ pyq }) {
  if (!pyq) return null;
  return (
    <section className="pyq" id="c01-pyq">
      <h2 className="pyq-title">{pyq.title}</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Year</th><th>Question</th><th>See</th></tr>
          </thead>
          <tbody>
            {pyq.rows.map((r, i) => (
              <tr key={i}>
                <td className="year">{r.year}</td>
                <td><Rich html={r.question} /></td>
                <td className="see">
                  {r.see.map((s, j) => (
                    <React.Fragment key={j}>{j > 0 && ', '}<a href={s.href}>{s.text}</a></React.Fragment>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
