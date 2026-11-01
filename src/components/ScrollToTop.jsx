import React, { useEffect, useState } from 'react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setVisible(window.scrollY > 400);
          ticking = false;
        });
      }
    };

    const checkModalState = () => {
      const hasModal =
        document.body.classList.contains('modal-open') ||
        document.body.style.overflow === 'hidden' ||
        document.querySelector('[data-lenis-prevent="true"]') !== null;
      setIsModalOpen(hasModal);
    };

    const handleModalChange = (e) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setIsModalOpen(e.detail.isOpen);
      } else {
        checkModalState();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('modal-state-change', handleModalChange);
    handleScroll();
    checkModalState();

    const observer = new MutationObserver(checkModalState);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('modal-state-change', handleModalChange);
      observer.disconnect();
    };
  }, []);

  const scrollToTop = () => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { offset: 0, duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isShown = visible && !isModalOpen;

  return (
    <div
      className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 transition-all duration-500 ease-in-out ${
        isShown
          ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
          : 'opacity-0 translate-y-20 pointer-events-none scale-90'
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="Scroll to top"
        className="group relative flex flex-col items-center justify-center w-12 h-14 md:w-14 md:h-16 bg-brick-yellow border-4 border-on-surface brick-shadow transition-all duration-200 ease-out hover:-translate-y-1.5 hover:-rotate-3 hover:shadow-[7px_7px_0px_0px_#1a1c1c] active:translate-y-0.5 active:rotate-0 cursor-pointer select-none"
      >
        {/* Top 2 Stud Tabs */}
        <div className="absolute -top-3 left-0 w-full flex justify-around px-2 pointer-events-none">
          <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-t-md bg-brick-yellow border-t-2 border-x-2 border-b-0 border-on-surface" />
          <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-t-md bg-brick-yellow border-t-2 border-x-2 border-b-0 border-on-surface" />
        </div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center z-10 pt-0.5">
          <span className="material-symbols-outlined text-on-surface text-[24px] md:text-[26px] font-black transition-transform duration-200 group-hover:-translate-y-0.5">
            arrow_upward
          </span>
          <span className="font-label-caps text-[9px] md:text-[10px] font-black text-on-surface tracking-wider leading-none mt-0.5">
            TOP
          </span>
        </div>
      </button>
    </div>
  );
}
