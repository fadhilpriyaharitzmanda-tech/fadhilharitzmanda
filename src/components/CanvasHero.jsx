import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Lanyard = lazy(() => import('./Lanyard'));
const TOTAL_FRAMES = 214;
const getFrameUrl = (idx) => `/frames/frame_${idx.toString().padStart(5, '0')}.webp`;

export default function CanvasHero() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const scrollIndicatorRef = useRef(null);
  const framesRef = useRef([]);
  const loadedFlagsRef = useRef(Array(215).fill(false));
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const drawnFrameRef = useRef(-1);
  const animFrameIdRef = useRef(null);
  const isLoopRunningRef = useRef(false);

  const [showLanyard, setShowLanyard] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const lockedOnceRef = useRef(false);

  // Scroll lock effect when hitting the end of animation for 1 second
  useEffect(() => {
    if (!isLocked) return;

    const onWheel = (e) => {
      if (e.deltaY > 0) e.preventDefault();
    };
    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartY = e.touches[0]?.clientY || 0;
    };
    const onTouchMove = (e) => {
      const currentY = e.touches[0]?.clientY || 0;
      if (touchStartY - currentY > 0) e.preventDefault();
    };
    const onKeyDown = (e) => {
      if (['ArrowDown', 'PageDown', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown, { passive: false });
    if (window.lenis) window.lenis.stop();

    const timer = setTimeout(() => {
      setIsLocked(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (window.lenis) window.lenis.start();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isLocked]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const container = containerRef.current;
    const indicator = scrollIndicatorRef.current;

    canvas.width = 1280;
    canvas.height = 720;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.fillStyle = '#fbf9f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const frameCache = Array(215);
    framesRef.current = frameCache;

    const drawFrame = (frameNum) => {
      const clamped = Math.max(1, Math.min(TOTAL_FRAMES, frameNum));
      if (drawnFrameRef.current === clamped && frameCache[clamped]?.complete) return;

      const img = frameCache[clamped];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawnFrameRef.current = clamped;
      } else {
        // Fallback to nearest available frame
        for (let offset = 1; offset <= 20; offset++) {
          const prev = clamped - offset;
          const next = clamped + offset;
          if (prev >= 1 && frameCache[prev]?.complete && frameCache[prev]?.naturalWidth > 0) {
            ctx.drawImage(frameCache[prev], 0, 0, canvas.width, canvas.height);
            drawnFrameRef.current = prev;
            break;
          }
          if (next <= TOTAL_FRAMES && frameCache[next]?.complete && frameCache[next]?.naturalWidth > 0) {
            ctx.drawImage(frameCache[next], 0, 0, canvas.width, canvas.height);
            drawnFrameRef.current = next;
            break;
          }
        }
      }
    };

    const loadSingleFrame = (frameIdx, priority = false) => {
      if (frameIdx < 1 || frameIdx > TOTAL_FRAMES || frameCache[frameIdx]) return;
      const img = new Image();
      if (priority && 'fetchPriority' in img) {
        img.fetchPriority = 'high';
      }
      img.src = getFrameUrl(frameIdx);
      img.onload = () => {
        frameCache[frameIdx] = img;
        loadedFlagsRef.current[frameIdx] = true;
        if (frameIdx === 1 && drawnFrameRef.current === -1) {
          drawFrame(1);
        }
        if (Math.round(currentFrameRef.current) === frameIdx) {
          drawFrame(frameIdx);
        }
      };
      frameCache[frameIdx] = img;
    };

    // Preload critical initial and ending frames
    [1, 2, 3, 4, 5, 205, 208, 210, 211, 212, 213, 214].forEach((f) => loadSingleFrame(f, true));
    for (let f = 10; f < TOTAL_FRAMES; f += 5) {
      loadSingleFrame(f, false);
    }

    // Progressively load all remaining frames in chunks
    let currentBatch = 1;
    const loadNextBatch = () => {
      const endBatch = Math.min(TOTAL_FRAMES, currentBatch + 10);
      for (let f = currentBatch; f <= endBatch; f++) {
        loadSingleFrame(f, false);
      }
      currentBatch = endBatch + 1;
      if (currentBatch <= TOTAL_FRAMES) {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadNextBatch);
        } else {
          setTimeout(loadNextBatch, 30);
        }
      }
    };
    loadNextBatch();

    // Lerp render loop
    const renderLoop = () => {
      const diff = targetFrameRef.current - currentFrameRef.current;
      if (Math.abs(diff) > 0.01) {
        currentFrameRef.current += diff * 0.45;
        const target = Math.round(currentFrameRef.current);
        drawFrame(target);

        // Preload around target
        for (let o = -3; o <= 3; o++) {
          const pf = target + o;
          if (pf >= 1 && pf <= TOTAL_FRAMES) loadSingleFrame(pf, true);
        }
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      } else {
        if (currentFrameRef.current !== targetFrameRef.current) {
          currentFrameRef.current = targetFrameRef.current;
          drawFrame(Math.round(currentFrameRef.current));
        }
        isLoopRunningRef.current = false;
      }
    };

    const triggerRender = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    };
    triggerRender();

    const handleScroll = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const scrollableDist = rect.height - window.innerHeight;
      let progress = 0;
      if (scrollableDist > 0) {
        progress = Math.max(0, Math.min(1, -rect.top / scrollableDist));
      }

      let frameIdx = 1;
      if (progress <= 0.88) {
        frameIdx = 1 + Math.floor((progress / 0.88) * (TOTAL_FRAMES - 1));
      } else {
        frameIdx = TOTAL_FRAMES;
      }

      if (targetFrameRef.current !== frameIdx) {
        targetFrameRef.current = frameIdx;
        triggerRender();
      }

      if (frameIdx >= 140 || progress >= 0.55) {
        setShowLanyard(true);
      } else {
        setShowLanyard(false);
        if (progress < 0.35) {
          lockedOnceRef.current = false;
        }
      }

      if (frameIdx === TOTAL_FRAMES && !lockedOnceRef.current) {
        lockedOnceRef.current = true;
        currentFrameRef.current = TOTAL_FRAMES;
        drawFrame(TOTAL_FRAMES);
        setIsLocked(true);
      }

      if (indicator) {
        if (progress > 0.03) {
          indicator.style.opacity = Math.max(0, 1 - progress * 8).toString();
          indicator.style.pointerEvents = 'none';
        } else {
          indicator.style.opacity = '1';
          indicator.style.pointerEvents = 'auto';
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      isLoopRunningRef.current = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <section id="home">
      <section className="h-[300vh] w-full relative z-40 lego-dot-bg" ref={containerRef}>
        <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center lego-dot-bg">
          {/* Canvas frame animation */}
          <canvas
            className="w-full h-full object-cover object-center pointer-events-none translate-y-8 md:translate-y-12"
            ref={canvasRef}
          />

          {/* Lanyard 3D overlay */}
          <div
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center transition-all duration-350 ease-out ${
              showLanyard
                ? 'opacity-100 translate-y-8 md:translate-y-12 scale-100 pointer-events-auto'
                : 'opacity-0 -translate-y-36 scale-95 pointer-events-none'
            }`}
          >
            {showLanyard && (
              <Suspense fallback={null}>
                <Lanyard position={[0, 0, 20]} gravity={[0, -60, 0]} imageFit="fill" lanyardWidth={1} />
              </Suspense>
            )}
          </div>

          {/* Scroll to build indicator */}
          <div
            className="absolute bottom-10 md:bottom-12 flex flex-col items-center gap-4 transition-opacity duration-300 pointer-events-none"
            ref={scrollIndicatorRef}
          >
            <span className="font-label-caps text-label-caps font-bold bg-white px-6 py-3 border-4 border-on-surface brick-shadow uppercase text-on-surface">
              Scroll to Build
            </span>
            <div className="w-8 h-8 border-4 border-on-surface bg-white brick-shadow flex items-center justify-center animate-bounce">
              <span className="material-symbols-outlined text-primary text-[18px]">arrow_downward</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Divider */}
      <div className="relative w-full z-40 pointer-events-none select-none -mt-[14vw] md:-mt-[18vw] lg:-mt-[21vw] mb-[-3vw] leading-none overflow-hidden">
        <img src="/images/awan-section.png" alt="Cloud Divider" className="w-full h-auto block select-none" />
      </div>
    </section>
  );
}

