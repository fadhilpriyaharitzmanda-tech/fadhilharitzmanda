import React, { useState, useEffect } from 'react';
import useLenis from './hooks/useLenis';
import useReveal from './hooks/useReveal';
import Navbar from './components/Navbar';
import CanvasHero from './components/CanvasHero';
import HeroBio from './components/HeroBio';
import Marquee from './components/Marquee';
import AboutSection from './components/AboutSection';
import ExperienceSection from './components/ExperienceSection';
import CertificationsSection from './components/CertificationsSection';
import SkillsSection from './components/SkillsSection';
import ProjectsSection from './components/ProjectsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import GuestbookDrawer from './components/GuestbookDrawer';
import LegoMinifiguresStage from './components/LegoMinifiguresStage';
import AdminGate from './components/admin/AdminGate';
import { SiteProvider } from './context/SiteContext';

function PublicPortfolio() {
  useLenis();
  useReveal();

  return (
    <>
      <Navbar />
      <CanvasHero />
      <main className="pb-32 pt-0 relative z-40 lego-dot-bg overflow-x-clip">
        <div id="about" className="scroll-mt-28">
          <HeroBio />
          <Marquee />
          <AboutSection />
          <ExperienceSection />
          <CertificationsSection />
          <SkillsSection />
        </div>
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
      <GuestbookDrawer />
      <LegoMinifiguresStage />
    </>
  );
}

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    // If user previously clicked admin login, or returned from OAuth for admin, restore route to /admin
    const isPendingAdmin =
      localStorage.getItem('admin_login_pending') === 'true' ||
      sessionStorage.getItem('admin_login_pending') === 'true';

    const hasAuthCallback =
      window.location.hash.includes('access_token') ||
      window.location.search.includes('code=');

    if (isPendingAdmin && (hasAuthCallback || window.location.pathname === '/')) {
      if (window.location.pathname !== '/admin') {
        window.history.replaceState({}, '', '/admin');
        setCurrentPath('/admin');
      }
    }

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  const cleanPath = currentPath.toLowerCase().replace(/\/+$/, '');
  const isAdminRoute =
    cleanPath === '/admin' ||
    cleanPath.startsWith('/admin/') ||
    window.location.hash === '#/admin' ||
    window.location.hash.startsWith('#/admin');

  return (
    <SiteProvider>
      {isAdminRoute ? (
        <AdminGate onNavigateHome={() => navigateTo('/')} />
      ) : (
        <PublicPortfolio />
      )}
    </SiteProvider>
  );
}
