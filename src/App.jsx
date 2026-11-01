import React from 'react';
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
import ScrollToTop from './components/ScrollToTop';
import LegoMinifiguresStage from './components/LegoMinifiguresStage';

export default function App() {
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
      <ScrollToTop />
      <LegoMinifiguresStage />
    </>
  );
}

