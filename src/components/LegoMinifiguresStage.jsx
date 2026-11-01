import React, { useEffect, useRef } from 'react';
import './LegoMinifiguresStage.css';

/**
 * LegoMinifiguresStage
 * Fixed Global Viewport Overlay with 3 LEGO Minifigures:
 * - Positioned fixed at the bottom edge of the viewport (feet cut off by screen bottom)
 * - Peeker (.p1), Walker (.p2), Swayer (.p3 with magnifying glass)
 * - Eyes follow the cursor dynamically
 * - Fear state (< 120px proximity from viewport cursor): eyes widen, pupils shrink, brows raise,
 *   mouth changes, shiver, lean away, peeker hides
 * - Responsive: < 768px scales down to 70% and shows 2 characters (p1 & p2)
 * - Accessible: respects prefers-reduced-motion, stops tracking when document.hidden
 * - Dark mode compatible via CSS variable --mf-outline
 */
export default function LegoMinifiguresStage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chars = Array.from(container.querySelectorAll('.mf')).map((el) => {
      const faceEl = el.querySelector('.face');
      return {
        el,
        lean: el.querySelector('.lean'),
        pu: Array.from(el.querySelectorAll('.pu')),
        max: faceEl ? parseFloat(faceEl.getAttribute('data-max') || '2') : 2,
      };
    });

    let px = null;
    let py = null;
    const R = 120;
    let intervalId = null;

    const update = () => {
      for (const c of chars) {
        const e = c.el;
        // Skip elements hidden via media query (e.g., p3 on mobile)
        if (e.offsetParent === null && window.getComputedStyle(e).display === 'none') {
          continue;
        }

        // Viewport coordinate tracking using getBoundingClientRect
        const rect = e.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.28;

        let fl = 1;
        try {
          const tr = window.getComputedStyle(e).transform;
          if (tr && tr !== 'none') {
            fl = new DOMMatrix(tr).a < 0 ? -1 : 1;
          }
        } catch (_) {}

        let dx = 0;
        let dy = 0;
        let d = 1e9;
        if (px !== null && py !== null) {
          dx = px - cx;
          dy = py - cy;
          d = Math.hypot(dx, dy);
        }

        const scared = d < R;
        e.classList.toggle('scared', scared);

        const k = Math.min(1, d / 60);
        const n = d || 1;
        const ox = px === null ? 0 : (dx / n) * c.max * k * fl;
        const oy = px === null ? 0 : (dy / n) * c.max * k;

        c.pu.forEach((p) => {
          p.style.transform = `translate(${ox}px, ${oy}px)`;
        });

        if (c.lean) {
          c.lean.style.transform = scared ? `rotate(${-Math.sign(dx) * fl * 9}deg)` : '';
        }
      }
    };

    const handlePointerMove = (e) => {
      px = e.clientX;
      py = e.clientY;
    };

    const handlePointerUp = (e) => {
      if (e.pointerType === 'touch') {
        px = null;
        py = null;
      }
    };

    const handlePointerLeave = () => {
      px = null;
      py = null;
    };

    const startInterval = () => {
      if (!intervalId) {
        intervalId = setInterval(update, 70);
      }
    };

    const stopInterval = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopInterval();
        px = null;
        py = null;
        chars.forEach((c) => {
          c.el.classList.remove('scared');
          if (c.lean) c.lean.style.transform = '';
          c.pu.forEach((p) => {
            p.style.transform = '';
          });
        });
      } else {
        startInterval();
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    startInterval();

    return () => {
      stopInterval();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.documentElement.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="lego-minifigures-overlay"
      role="img"
      aria-label="Tiga minifigure LEGO di tepi bawah layar: satu mengintip, satu berjalan, satu bergoyang"
    >
      {/* Global SVG Symbol Definition */}
      <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
        <symbol id="lego-mf-symbol" viewBox="0 0 60 92">
          <g stroke="#141414" strokeWidth="3" strokeLinejoin="round">
            <rect x="22" y="2" width="16" height="6" rx="2" fill="var(--head)" />
            <rect x="12" y="7" width="36" height="26" rx="7" fill="var(--head)" />
            <rect x="2" y="37" width="10" height="26" rx="4" fill="var(--torso)" />
            <rect x="48" y="37" width="10" height="26" rx="4" fill="var(--torso)" />
            <path d="M10 35h40l2 28H8z" fill="var(--torso)" />
            <rect x="9" y="63" width="21" height="26" rx="2" fill="var(--legs)" />
            <rect x="30" y="63" width="21" height="26" rx="2" fill="var(--legs)" />
          </g>
        </symbol>
      </svg>

      {/* Character 1: Peeker */}
      <div
        className="mf p1"
        style={{
          '--head': '#ffd500',
          '--torso': '#b3121a',
          '--legs': '#1f4fb4',
        }}
      >
        <svg viewBox="0 0 60 92">
          <g className="bob">
            <g className="lean">
              <g className="shake">
                <use href="#lego-mf-symbol" />
                <g className="face" data-max="2">
                  <ellipse className="eye" cx="24" cy="19" rx="4.6" ry="4.6" />
                  <ellipse className="eye" cx="36" cy="19" rx="4.6" ry="4.6" />
                  <circle className="pu" cx="24" cy="19" r="2.3" />
                  <circle className="pu" cx="36" cy="19" r="2.3" />
                  <path className="brow bl" d="M19.5 12h9" />
                  <path className="brow br" d="M31.5 12h9" />
                  <path className="mo calm" d="M24 26.5q6 4.5 12 0" />
                  <ellipse className="mo fill fear" cx="30" cy="27.8" rx="3.2" ry="3.9" />
                  <path
                    className="fear"
                    d="M50 9q-3.5 5.5 0 8q3.5-2.5 0-8z"
                    fill="#6fd0ff"
                    stroke="#141414"
                    strokeWidth="1.3"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Character 2: Walker */}
      <div
        className="mf p2"
        style={{
          '--head': '#ffd500',
          '--torso': '#1a9e4a',
          '--legs': '#141414',
        }}
      >
        <svg viewBox="0 0 60 92">
          <g className="bob">
            <g className="lean">
              <g className="shake">
                <use href="#lego-mf-symbol" />
                <g className="face" data-max="2.6">
                  <circle className="eye" cx="23.5" cy="19" r="5.8" />
                  <circle className="eye" cx="36.5" cy="19" r="5.8" />
                  <path className="mo" d="M29.3 18.5h1.4" />
                  <circle className="pu" cx="23.5" cy="19" r="2.2" />
                  <circle className="pu" cx="36.5" cy="19" r="2.2" />
                  <path className="brow bl" d="M17.5 10q5.5-2.5 11 0" />
                  <path className="brow br" d="M31.5 10q5.5-2.5 11 0" />
                  <path className="mo calm" d="M25 27q6 2.5 12-1.5" />
                  <path className="mo fear" d="M23 28l2.5-2.2 2.5 2.2 2.5-2.2 2.5 2.2 2.5-2.2 2.5 2.2" />
                  <path
                    className="fear"
                    d="M10 9q-3.5 5.5 0 8q3.5-2.5 0-8z"
                    fill="#6fd0ff"
                    stroke="#141414"
                    strokeWidth="1.3"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* Character 3: Swayer with Magnifying Glass */}
      <div
        className="mf p3"
        style={{
          '--head': '#ffd500',
          '--torso': '#ffd500',
          '--legs': '#b3121a',
        }}
      >
        <svg viewBox="0 0 60 92">
          <g className="bob">
            <g className="lean">
              <g className="shake">
                <use href="#lego-mf-symbol" />
                <g className="face" data-max="1.8">
                  <ellipse className="eye" cx="24" cy="19" rx="3.8" ry="5.2" />
                  <ellipse className="eye" cx="36" cy="19" rx="3.8" ry="5.2" />
                  <circle className="pu" cx="24" cy="19.5" r="2.1" />
                  <circle className="pu" cx="36" cy="19.5" r="2.1" />
                  <path className="brow bl" style={{ strokeWidth: 3 }} d="M19 12.5l9 1.5" />
                  <path className="brow br" style={{ strokeWidth: 3 }} d="M32 14l9-1.5" />
                  <path className="mo calm" d="M25 27.5h10" />
                  <rect className="mo fear" x="24" y="25.5" width="12" height="5.5" rx="1.5" fill="#fff" />
                  <path className="mo fear" style={{ strokeWidth: 1.4 }} d="M28 25.5v5.5M32 25.5v5.5" />
                  <path
                    className="fear"
                    d="M50 9q-3.5 5.5 0 8q3.5-2.5 0-8z"
                    fill="#6fd0ff"
                    stroke="#141414"
                    strokeWidth="1.3"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      <span className="mag" aria-hidden="true">
        🔍
      </span>
    </div>
  );
}
