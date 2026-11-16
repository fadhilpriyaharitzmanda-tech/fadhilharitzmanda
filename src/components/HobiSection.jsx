import React from 'react';
import { useSiteData } from '../context/SiteContext';
import { defaultHobbies } from '../data/portfolioData';
import './HobiSection.css';

export const renderHobbySvg = (iconName) => {
  switch (iconName) {
    case 'video':
      return (
        <>
          <rect x="3" y="6" width="13" height="12" rx="2" />
          <path d="M16 10l5-3v10l-5-3" />
        </>
      );
    case 'music':
      return (
        <>
          <path d="M9 18V6l11-2v12" />
          <circle cx="6.5" cy="18" r="2.5" />
          <circle cx="17.5" cy="16" r="2.5" />
        </>
      );
    case 'game':
      return (
        <>
          <rect x="2" y="7" width="20" height="11" rx="5" />
          <path d="M7 10v5M4.5 12.5h5M16 11h.01M18.5 14h.01" />
        </>
      );
    case 'mountain':
      return <path d="M2 20l7-12 4 7 3-4 6 9z" />;
    case 'book':
      return (
        <>
          <path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19h15" />
        </>
      );
    case 'code':
    default:
      return <path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14" />;
  }
};

export default function HobiSection() {
  const { hobbies, hobbiesError } = useSiteData();

  // Rule 3: Hide entire section if query succeeded and returned no data.
  // If query failed (hobbiesError = true), fallback to defaultHobbies and render.
  if (!hobbiesError && (!hobbies || hobbies.length === 0)) {
    return null;
  }

  const items = hobbies && hobbies.length > 0 ? hobbies : defaultHobbies;

  return (
    <section id="hobi" className="hobi-section" aria-labelledby="hobi-judul">
      <p className="hobi-tag">WHAT I ENJOY</p>
      <h2 id="hobi-judul" className="hobi-title">
        HOBI <span>&amp; MINAT</span>
      </h2>
      <p className="hobi-lead">
        Hal-hal yang saya nikmati di sela belajar dan ngoding. Disusun satu per satu seperti balok LEGO.
      </p>

      <div className="hobi-grid" id="hobi-grid">
        {items.map((item) => {
          const colorClass = item.color ? ` ${item.color}` : ' red';
          const levelNum = item.level ? parseInt(item.level, 10) : null;

          return (
            <article className={`hobi-card${colorClass}`} key={item.id || item.title}>
              <div className="hobi-ic" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {renderHobbySvg(item.icon)}
                </svg>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {levelNum ? (
                <div
                  className="hobi-lv"
                  role="img"
                  aria-label={`Level ${levelNum} dari 5`}
                >
                  <b>LEVEL</b>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <i
                      key={lvl}
                      className={lvl <= levelNum ? 'on' : ''}
                    />
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="hobi-base" aria-hidden="true" />
    </section>
  );
}
