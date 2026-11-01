import React, { useState, useEffect } from 'react';
import ResumeModal from './ResumeModal';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About Me', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#home');
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      const sections = ['home', 'about', 'projects', 'contact'];
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (windowHeight + scrollY >= docHeight - 100) {
        setActiveSection('#contact');
        ticking = false;
        return;
      }

      for (let i = sections.length - 1; i >= 0; i--) {
        const secId = sections[i];
        const el = document.getElementById(secId);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY;
          if (scrollY + 300 >= top) {
            setActiveSection(`#${secId}`);
            ticking = false;
            return;
          }
        }
      }
      setActiveSection('#home');
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(handleScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setActiveSection(href);
    setMobileMenuOpen(false);

    if (href === '#home' || href === '#') {
      if (window.lenis) {
        window.lenis.scrollTo(0, { offset: 0, duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.history.pushState(null, '', '#home');
    } else {
      const targetEl = document.querySelector(href);
      if (targetEl) {
        if (window.lenis) {
          window.lenis.scrollTo(targetEl, { offset: -90, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface border-b-4 border-on-surface">
        <div className="flex justify-between items-center w-full max-w-[1600px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4">
          {/* Logo */}
          <a
            className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2 text-primary group select-none cursor-pointer"
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
          >
            <span className="font-headline-md font-black text-xl sm:text-headline-md tracking-tighter leading-none">
              FADHIL
            </span>
            <div className="flex items-center gap-1.5 leading-none mt-0.5 sm:mt-0">
              <span className="font-headline-md font-black text-xl sm:text-headline-md tracking-tighter">
                HARITZMANDA
              </span>
              <span className="inline-block px-1.5 py-0.5 text-[10px] sm:text-[11px] font-label-caps font-bold bg-brick-yellow text-on-surface border-2 border-on-surface shadow-[2px_2px_0px_0px_#1a1c1c] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-200 uppercase leading-none">
                .DEV
              </span>
            </div>
          </a>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className={`font-label-caps text-label-caps px-4 py-2 transition-all cursor-pointer ${
                  activeSection === link.href
                    ? 'bg-brick-yellow border-4 border-on-surface brick-shadow text-on-surface font-bold'
                    : 'text-on-surface-variant hover:text-primary border-4 border-transparent'
                }`}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Download CV Button */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={() => setResumeModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 font-button-text text-button-text text-on-primary bg-primary brick-btn relative uppercase cursor-pointer"
            >
              <div className="absolute -top-2 left-0 w-full flex justify-around px-2 pointer-events-none">
                <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
              </div>
              <span className="material-symbols-outlined text-[18px]">download</span>
              DOWNLOAD CV
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden text-on-surface cursor-pointer p-1.5 -mr-1.5 flex items-center justify-center hover:bg-surface-container rounded transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-outlined text-2xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-surface border-t-4 border-on-surface px-6 py-6 flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className={`font-label-caps px-4 py-2 transition-all cursor-pointer ${
                  activeSection === link.href
                    ? 'bg-brick-yellow border-4 border-on-surface brick-shadow text-on-surface font-bold w-fit'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-button-text text-button-text text-on-primary bg-primary brick-btn relative uppercase cursor-pointer"
                onClick={() => {
                  setResumeModalOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="absolute -top-2 left-0 w-full flex justify-around px-2 pointer-events-none">
                  <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                  <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                  <span className="w-3 h-3 rounded-full bg-primary border-2 border-on-surface" />
                </div>
                <span className="material-symbols-outlined text-[18px]">download</span>
                DOWNLOAD CV
              </button>
            </div>
          </div>
        )}
      </header>

      <ResumeModal isOpen={resumeModalOpen} onClose={() => setResumeModalOpen(false)} />
    </>
  );
}

