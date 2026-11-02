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
import AdminDashboard from './components/admin/AdminDashboard';
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

  const isAdminRoute = currentPath === '/admin' || currentPath.startsWith('/admin/');

  return (
    <SiteProvider>
      {isAdminRoute ? (
        <AdminDashboard onNavigateHome={() => navigateTo('/')} />
      ) : (
        <PublicPortfolio />
      )}
    </SiteProvider>
  );
}
