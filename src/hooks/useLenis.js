import { useEffect } from 'react';
import Lenis from 'lenis';

export default function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    window.lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    const handleClick = (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      if (href === '#' || href === '#home') {
        e.preventDefault();
        lenis.scrollTo(0, { offset: 0, duration: 1.2 });
        window.history.pushState(null, '', '#home');
      } else {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -90, duration: 1.2 });
          window.history.pushState(null, '', href);
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', handleClick);
      lenis.destroy();
      window.lenis = null;
    };
  }, []);
}

