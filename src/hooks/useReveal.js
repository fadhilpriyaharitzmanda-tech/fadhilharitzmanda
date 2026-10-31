import { useEffect } from 'react';

export default function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document
        .querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-pop, .reveal-scale')
        .forEach((el) => el.classList.add('reveal-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.05,
      }
    );

    const observeElements = () => {
      document
        .querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-pop, .reveal-scale')
        .forEach((el) => {
          if (!el.classList.contains('reveal-visible')) {
            observer.observe(el);
          }
        });
    };

    observeElements();

    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}

