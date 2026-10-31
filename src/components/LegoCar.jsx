import React, { useCallback, useEffect, useRef, useState } from 'react';

const cars = [
  {
    id: 'racer',
    name: 'Red Racer',
    primary: '#e52521',
    secondary: '#ffd700',
    accent: '#ffffff',
    spoiler: '#1a1c1c',
    number: '7',
    roofText: '',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    flair: '🏎️',
    hornFreq: [440, 554, 659],
  },
  {
    id: 'taxi',
    name: 'City Taxi',
    primary: '#ffcc00',
    secondary: '#1a1c1c',
    accent: '#ffffff',
    spoiler: '#ffcc00',
    number: 'TAXI',
    roofText: 'TAXI',
    glowColor: 'rgba(255, 204, 0, 0.45)',
    flair: '🚕',
    hornFreq: [392, 523],
  },
  {
    id: 'police',
    name: 'Police Cruiser',
    primary: '#0055a4',
    secondary: '#ffffff',
    accent: '#1a1c1c',
    spoiler: '#0055a4',
    number: 'POLICE',
    roofText: 'POLICE',
    glowColor: 'rgba(0, 140, 255, 0.5)',
    flair: '🚓',
    hornFreq: [600, 800, 600, 800],
  },
  {
    id: 'turbo-green',
    name: 'Speed Green',
    primary: '#00a651',
    secondary: '#10b981',
    accent: '#ffd700',
    spoiler: '#1a1c1c',
    number: '99',
    roofText: '',
    glowColor: 'rgba(0, 255, 128, 0.45)',
    flair: '🏎️💨',
    hornFreq: [523, 659, 784],
  },
];

function playSound(freqs = [440, 554], type = 'horn') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'horn') {
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16 + i * 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.04);
        osc.stop(ctx.currentTime + 0.18 + i * 0.04);
      });
    } else if (type === 'turbo') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {}
}

export default function LegoCar({ targetRef }) {
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTurbo, setIsTurbo] = useState(false);
  const [carToast, setCarToast] = useState(null);
  const [particles, setParticles] = useState([]);

  const posRef = useRef({ x: 0, y: 0, angle: 0, progress: 0 });
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const particleIdRef = useRef(0);
  const toastTimeoutRef = useRef(null);
  const turboTimeoutRef = useRef(null);
  const carElRef = useRef(null);

  const [boxRect, setBoxRect] = useState({
    width: 380,
    height: 380,
    left: 0,
    top: 0,
  });

  const car = cars[currentCarIndex];

  useEffect(() => {
    const updateRect = () => {
      const el = targetRef?.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const left = el.offsetLeft || 0;
      const top = el.offsetTop || 0;
      const width = el.offsetWidth || r.width || 380;
      const height = el.offsetHeight || r.height || 380;
      setBoxRect({ left, top, width, height });
    };

    updateRect();
    const el = targetRef?.current;
    let ro;
    if (el && 'ResizeObserver' in window) {
      ro = new ResizeObserver(updateRect);
      ro.observe(el);
    }
    window.addEventListener('resize', updateRect);
    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', updateRect);
    };
  }, [targetRef]);

  const handleCarClick = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      const nextIndex = (currentCarIndex + 1) % cars.length;
      setCurrentCarIndex(nextIndex);
      const nextCar = cars[nextIndex];

      setIsTurbo(true);
      if (turboTimeoutRef.current) clearTimeout(turboTimeoutRef.current);
      turboTimeoutRef.current = setTimeout(() => {
        setIsTurbo(false);
      }, 2200);

      playSound(nextCar.hornFreq, 'turbo');

      const toast = `${nextCar.flair} ${nextCar.name}!`;
      setCarToast(toast);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setCarToast(null);
      }, 2000);
    },
    [currentCarIndex]
  );

  useEffect(() => {
    let lastParticleTime = 0;

    const tick = (now) => {
      const dt = Math.min(64, now - lastTimeRef.current);
      lastTimeRef.current = now;

      const { left: bl, top: bt, width: bw, height: bh } = boxRect;
      const cornerR = 8;
      const tl = { x: bl - 4 + cornerR, y: bt - 4 + cornerR };
      const tr = { x: bl + bw + 4 - cornerR, y: bt - 4 + cornerR };
      const br = { x: bl + bw + 4 - cornerR, y: bt + bh + 4 - cornerR };
      const bl_corner = { x: bl - 4 + cornerR, y: bt + bh + 4 - cornerR };

      const topLen = Math.max(10, tr.x - tl.x);
      const rightLen = Math.max(10, br.y - tr.y);
      const botLen = Math.max(10, br.x - bl_corner.x);
      const leftLen = Math.max(10, bl_corner.y - tl.y);
      const arcLen = (Math.PI / 2) * cornerR;
      const totalPerimeter = topLen + arcLen + rightLen + arcLen + botLen + arcLen + leftLen + arcLen;

      let speed = 110;
      if (isTurbo) speed = 300;
      else if (isHovered) speed = 165;

      const deltaProg = (speed * dt) / 1000 / totalPerimeter;
      const newProg = (posRef.current.progress + deltaProg) % 1;
      posRef.current.progress = newProg;

      const dist = newProg * totalPerimeter;
      let carX = 0;
      let carY = 0;
      let carAngle = 0;

      const s1 = topLen;
      const s2 = s1 + arcLen;
      const s3 = s2 + rightLen;
      const s4 = s3 + arcLen;
      const s5 = s4 + botLen;
      const s6 = s5 + arcLen;
      const s7 = s6 + leftLen;

      if (dist < s1) {
        const t = dist / topLen;
        carX = tl.x + t * (tr.x - tl.x);
        carY = bt - 4;
        carAngle = 0;
      } else if (dist < s2) {
        const rad = ((dist - s1) / arcLen) * (Math.PI / 2);
        carX = tr.x + cornerR * Math.sin(rad);
        carY = tr.y - cornerR * Math.cos(rad);
        carAngle = (rad * 180) / Math.PI;
      } else if (dist < s3) {
        const t = (dist - s2) / rightLen;
        carX = bl + bw + 4;
        carY = tr.y + t * (br.y - tr.y);
        carAngle = 90;
      } else if (dist < s4) {
        const rad = ((dist - s3) / arcLen) * (Math.PI / 2);
        carX = br.x + cornerR * Math.cos(rad);
        carY = br.y + cornerR * Math.sin(rad);
        carAngle = 90 + (rad * 180) / Math.PI;
      } else if (dist < s5) {
        const t = (dist - s4) / botLen;
        carX = br.x - t * (br.x - bl_corner.x);
        carY = bt + bh + 4;
        carAngle = 180;
      } else if (dist < s6) {
        const rad = ((dist - s5) / arcLen) * (Math.PI / 2);
        carX = bl_corner.x - cornerR * Math.sin(rad);
        carY = bl_corner.y + cornerR * Math.cos(rad);
        carAngle = 180 + (rad * 180) / Math.PI;
      } else if (dist < s7) {
        const t = (dist - s6) / leftLen;
        carX = bl - 4;
        carY = bl_corner.y - t * (bl_corner.y - tl.y);
        carAngle = 270;
      } else {
        const rad = ((dist - s7) / arcLen) * (Math.PI / 2);
        carX = tl.x - cornerR * Math.cos(rad);
        carY = tl.y - cornerR * Math.sin(rad);
        carAngle = 270 + (rad * 180) / Math.PI;
      }

      posRef.current = { x: carX, y: carY, angle: carAngle, progress: newProg };

      if (carElRef.current) {
        carElRef.current.style.transform = `translate3d(${carX}px, ${carY}px, 0px) translate(-50%, -50%) rotate(${carAngle}deg)`;
      }

      // Particles
      const particleInterval = isTurbo ? 45 : isHovered ? 90 : 150;
      if (now - lastParticleTime > particleInterval) {
        lastParticleTime = now;
        const rad = (carAngle * Math.PI) / 180;
        const px = carX - Math.cos(rad) * 30 + (Math.random() * 4 - 2);
        const py = carY - Math.sin(rad) * 30 + (Math.random() * 4 - 2);
        const pId = ++particleIdRef.current;
        const isFlame = isTurbo && Math.random() > 0.3;

        setParticles((prev) => [
          ...prev
            .filter((p) => now - p.createdAt < (p.isFlame ? 400 : 600))
            .map((p) => {
              const progress = (now - p.createdAt) / (p.isFlame ? 400 : 600);
              return {
                ...p,
                size: p.initialSize + progress * (p.isFlame ? 8 : 14),
                opacity: (1 - progress) * 0.8,
              };
            })
            .slice(-12),
          {
            id: pId,
            x: px,
            y: py,
            createdAt: now,
            initialSize: isFlame ? 5 : 4,
            size: isFlame ? 5 : 4,
            opacity: 0.8,
            isFlame,
          },
        ]);
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [boxRect, isHovered, isTurbo]);

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20 select-none overflow-visible"
      style={{ width: '100%', height: '100%' }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.isFlame ? (p.size < 8 ? '#ffd700' : '#ff4500') : '#cbd5e1',
            opacity: p.opacity,
            border: p.isFlame ? '1px solid #e11d48' : '1px solid #64748b',
            boxShadow: p.isFlame ? '0 0 6px #ff4500' : '0 0 2px rgba(0,0,0,0.15)',
            zIndex: 18,
          }}
        />
      ))}

      {/* Interactive Car Container */}
      <div
        ref={carElRef}
        onClick={handleCarClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute top-0 left-0 pointer-events-auto cursor-pointer group will-change-transform z-30"
        style={{ width: '72px', height: '42px', touchAction: 'manipulation' }}
        title="🏎️ Tap/Click to Honk & Turbo!"
      >
        {/* Car Name Toast */}
        {carToast && (
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-white text-on-surface border-2 border-on-surface px-2.5 py-0.5 font-label-caps font-bold text-[10px] shadow-[2px_2px_0px_0px_#1a1c1c] whitespace-nowrap animate-bounce z-50 rounded">
            <span className="text-primary">{carToast}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-on-surface" />
          </div>
        )}

        {/* SVG Lego Car */}
        <svg
          viewBox="0 0 78 46"
          className="w-full h-full overflow-visible transition-transform duration-150 group-hover:scale-110 active:scale-95"
          style={{ filter: 'drop-shadow(2px 3px 0px rgba(26,28,28,0.9))' }}
        >
          <defs>
            <linearGradient id="headlightBeam" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fff59d" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#ffee58" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#fff9c4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="windshieldGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
            <linearGradient id="studBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
            </linearGradient>
          </defs>

          {/* Headlights Light Beam */}
          <g className="headlights-beam opacity-85">
            <polygon points="70,11 125,-4 125,20 70,17" fill="url(#headlightBeam)" className="animate-pulse" />
            <polygon points="70,29 125,26 125,50 70,35" fill="url(#headlightBeam)" className="animate-pulse" />
          </g>

          {/* Wheels */}
          {/* Front Left */}
          <rect x="48" y="1" width="17" height="8" rx="2.5" fill="#111827" stroke="#1a1c1c" strokeWidth="2" />
          <circle cx="56.5" cy="5" r="2.2" fill={car.secondary} stroke="#1a1c1c" strokeWidth="1" />
          {/* Front Right */}
          <rect x="48" y="37" width="17" height="8" rx="2.5" fill="#111827" stroke="#1a1c1c" strokeWidth="2" />
          <circle cx="56.5" cy="41" r="2.2" fill={car.secondary} stroke="#1a1c1c" strokeWidth="1" />
          {/* Rear Left */}
          <rect x="11" y="1" width="17" height="8" rx="2.5" fill="#111827" stroke="#1a1c1c" strokeWidth="2" />
          <circle cx="19.5" cy="5" r="2.2" fill={car.secondary} stroke="#1a1c1c" strokeWidth="1" />
          {/* Rear Right */}
          <rect x="11" y="37" width="17" height="8" rx="2.5" fill="#111827" stroke="#1a1c1c" strokeWidth="2" />
          <circle cx="19.5" cy="41" r="2.2" fill={car.secondary} stroke="#1a1c1c" strokeWidth="1" />

          {/* Car Main Chassis */}
          <rect x="6" y="6" width="64" height="34" rx="5" fill={car.primary} stroke="#1a1c1c" strokeWidth="3.5" />
          {/* Stripe */}
          <rect x="8" y="18" width="58" height="10" fill={car.secondary} stroke="#1a1c1c" strokeWidth="1.5" />
          {/* Hood */}
          <rect x="48" y="9" width="18" height="28" rx="3" fill={car.primary} stroke="#1a1c1c" strokeWidth="2" />
          {/* Grill Lines */}
          <line x1="68" y1="18" x2="68" y2="28" stroke="#1a1c1c" strokeWidth="3" strokeLinecap="round" />
          <line x1="66" y1="16" x2="66" y2="30" stroke="#ffd700" strokeWidth="1.5" />

          {/* Headlight Lamps */}
          <circle cx="67" cy="12" r="3.5" fill="#fef08a" stroke="#1a1c1c" strokeWidth="1.8" />
          <circle cx="67" cy="12" r="1.5" fill="#ffffff" />
          <circle cx="67" cy="34" r="3.5" fill="#fef08a" stroke="#1a1c1c" strokeWidth="1.8" />
          <circle cx="67" cy="34" r="1.5" fill="#ffffff" />

          {/* Hood Studs */}
          <g>
            <circle cx="56" cy="15" r="3.2" fill={car.primary} stroke="#1a1c1c" strokeWidth="1.6" />
            <circle cx="56" cy="15" r="3.2" fill="url(#studBevel)" />
            <circle cx="56" cy="31" r="3.2" fill={car.primary} stroke="#1a1c1c" strokeWidth="1.6" />
            <circle cx="56" cy="31" r="3.2" fill="url(#studBevel)" />
          </g>

          {/* Windshield */}
          <path d="M 28 9 L 45 9 L 42 37 L 28 37 Z" fill="url(#windshieldGlass)" stroke="#1a1c1c" strokeWidth="2.5" />
          <line x1="33" y1="12" x2="41" y2="34" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />

          {/* Minifigure Driver */}
          <circle cx="34" cy="23" r="5.5" fill="#facc15" stroke="#1a1c1c" strokeWidth="2" />
          <path d="M 30 18 Q 34 16 38 18 L 38 23 L 30 23 Z" fill={car.secondary} stroke="#1a1c1c" strokeWidth="1.5" />
          <circle cx="36" cy="22" r="0.9" fill="#1a1c1c" />

          {/* Roof Elements by Car Type */}
          {car.id === 'police' ? (
            <g>
              <rect x="22" y="14" width="6" height="18" rx="2" fill="#ffffff" stroke="#1a1c1c" strokeWidth="1.5" />
              <rect x="22" y="14" width="6" height="8" rx="1" fill="#ef4444" className="animate-pulse" />
              <rect x="22" y="24" width="6" height="8" rx="1" fill="#3b82f6" className="animate-pulse" />
            </g>
          ) : car.id === 'taxi' ? (
            <g>
              <rect x="20" y="15" width="8" height="16" rx="2" fill="#ffffff" stroke="#1a1c1c" strokeWidth="2" />
              <text x="24" y="26" fontSize="5" fontWeight="bold" fontFamily="sans-serif" fill="#1a1c1c" textAnchor="middle" transform="rotate(90 24 24)">
                TAXI
              </text>
            </g>
          ) : (
            <g>
              <circle cx="20" cy="14" r="3" fill={car.primary} stroke="#1a1c1c" strokeWidth="1.5" />
              <circle cx="20" cy="14" r="3" fill="url(#studBevel)" />
              <circle cx="20" cy="32" r="3" fill={car.primary} stroke="#1a1c1c" strokeWidth="1.5" />
              <circle cx="20" cy="32" r="3" fill="url(#studBevel)" />
              <text x="20" y="25" fontSize="7" fontWeight="900" fontFamily="sans-serif" fill="#ffffff" textAnchor="middle">
                {car.number}
              </text>
            </g>
          )}

          {/* Rear Spoiler */}
          <rect x="4" y="7" width="6" height="32" rx="2" fill={car.spoiler} stroke="#1a1c1c" strokeWidth="2.5" />
          <rect x="5" y="10" width="3" height="5" rx="1" fill="#ef4444" stroke="#1a1c1c" strokeWidth="1" />
          <rect x="5" y="31" width="3" height="5" rx="1" fill="#ef4444" stroke="#1a1c1c" strokeWidth="1" />

          {/* Exhaust Pipes */}
          <circle cx="4" cy="16" r="2.2" fill="#374151" stroke="#1a1c1c" strokeWidth="1.5" />
          <circle cx="4" cy="30" r="2.2" fill="#374151" stroke="#1a1c1c" strokeWidth="1.5" />
        </svg>

        {/* Turbo Glow / Ping */}
        {isTurbo && (
          <div className="absolute -inset-2 rounded-lg bg-yellow-400/20 blur-sm pointer-events-none animate-ping" />
        )}
      </div>
    </div>
  );
}

