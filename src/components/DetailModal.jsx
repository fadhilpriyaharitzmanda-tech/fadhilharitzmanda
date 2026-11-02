import React, { useEffect, useState } from 'react';
import { personalInfo } from '../data/portfolioData';

function getVerifiedEntity(data) {
  return data?.institution || data?.company || data?.organization || data?.issuer || personalInfo.name;
}

export default function DetailModal({ isOpen, onClose, data, type }) {
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    setActiveImgIndex(0);
    setTouchStartX(null);
  }, [data]);

  let imageList = [];
  if (data?.images && data.images.length > 0) {
    imageList = data.images.filter((img) => (typeof img === 'string' ? img : img.src));
  } else if (data?.image) {
    imageList = [{ src: data.image, caption: data.title || data.name }];
  }

  const handlePrev = () => {
    setActiveImgIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImgIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && imageList.length > 1) {
        handlePrev();
      }
      if (e.key === 'ArrowRight' && imageList.length > 1) {
        handleNext();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
      if (window.lenis) window.lenis.stop();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      if (window.lenis) window.lenis.start();
    };
  }, [isOpen, onClose, imageList.length]);

  if (!isOpen || !data) return null;

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 40 && imageList.length > 1) {
      handleNext();
    } else if (diff < -40 && imageList.length > 1) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const currentImgObj = imageList[activeImgIndex];
  const currentImgSrc = typeof currentImgObj === 'string' ? currentImgObj : currentImgObj?.src;
  const currentImgCaption = typeof currentImgObj === 'object' ? currentImgObj?.caption : '';

  const title = data.title || data.degree || data.role || data.name || 'Details';
  const subtitle = data.institution || data.company || data.organization || data.issuer || data.category || '';
  const period = data.period || data.year || data.date || '';
  const location = data.location || '';

  const badgeType =
    type === 'education'
      ? 'EDUCATION'
      : type === 'experience'
      ? data.type || 'EXPERIENCE'
      : type === 'organization'
      ? 'ORGANIZATION'
      : type === 'certification'
      ? 'CERTIFICATION'
      : type === 'project'
      ? data.category?.toUpperCase() || 'PROJECT'
      : 'PORTFOLIO';

  const highlights = data.highlights || data.details || data.responsibilities || data.features || [];
  const techArsenal = Array.isArray(data.technologies) && data.technologies.length > 0
    ? data.technologies
    : (data.tech ? data.tech.split(',').map((t) => t.trim()).filter(Boolean) : []);

  const repoUrl = data.repo_url || data.links?.github;
  const demoUrl = data.demo_url || data.links?.demo;
  const problemContext = data.problem_context || data.problem;
  const solution = data.solution;

  return (
    <div
      data-lenis-prevent="true"
      className="fixed inset-0 z-[110] bg-on-background/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto animate-fadeIn"
    >
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] bg-surface border-4 border-on-surface brick-shadow rounded-2xl flex flex-col overflow-hidden my-auto animate-scaleUp">
        {/* Top 3 Lego Studs */}
        <div className="absolute -top-2.5 left-12 flex gap-4 pointer-events-none z-20">
          <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface shadow-sm" />
          <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface shadow-sm" />
          <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface shadow-sm" />
        </div>

        {/* Modal Header */}
        <div className="bg-surface-container-high border-b-4 border-on-surface px-4 md:px-6 py-3 flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onClose}
                className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-on-surface hover:opacity-80 transition-opacity cursor-pointer"
                title="Close"
              />
              <span className="w-3.5 h-3.5 rounded-full bg-brick-yellow border-2 border-on-surface" />
              <span className="w-3.5 h-3.5 rounded-full bg-brick-blue border-2 border-on-surface" />
            </div>
            <span className="font-label-caps text-[11px] md:text-xs font-bold text-on-surface tracking-wider truncate max-w-[200px] sm:max-w-[340px] md:max-w-none">
              PORTFOLIO_VIEWER // {title.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-on-surface text-white px-2.5 py-0.5 text-[10px] font-label-caps font-bold tracking-wider uppercase border border-white/30">
              {badgeType}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 border-2 border-on-surface bg-white hover:bg-primary hover:text-white flex items-center justify-center transition-colors font-bold text-sm brick-shadow cursor-pointer"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Content Body */}
        <div data-lenis-prevent="true" className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 bg-white">
          {/* Left Column: Image / Gallery */}
          <div className="lg:col-span-6 bg-[#1f2123] border-b-4 lg:border-b-0 lg:border-r-4 border-on-surface p-4 sm:p-6 flex flex-col justify-between items-center min-h-[300px] lg:min-h-[480px]">
            {imageList.length > 0 && currentImgSrc ? (
              <div className="w-full h-full flex flex-col justify-between items-center gap-3">
                <div className="w-full flex justify-between items-center">
                  <span className="bg-black/60 text-white border border-white/30 px-2.5 py-0.5 text-xs font-mono font-bold rounded">
                    {activeImgIndex + 1} / {imageList.length}
                  </span>
                  {currentImgCaption && (
                    <span className="text-white/80 text-xs font-label-caps truncate max-w-[200px]">
                      {currentImgCaption}
                    </span>
                  )}
                </div>

                <div
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  className="relative w-full flex-1 flex items-center justify-center min-h-[220px] max-h-[360px] lg:max-h-[420px] overflow-hidden rounded-lg border-2 border-white/20 bg-black/40 p-1 select-none group/img"
                >
                  <img
                    src={currentImgSrc}
                    alt={currentImgCaption || title}
                    loading="lazy"
                    className="w-full h-full object-contain max-h-[340px] rounded transition-all duration-300 pointer-events-none"
                    onError={(e) => {
                      e.currentTarget.src = '/images/profile-hero.jpg';
                    }}
                  />

                  {imageList.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/40 opacity-80 group-hover/img:opacity-100 transition-opacity cursor-pointer shadow-md"
                        aria-label="Previous photo"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center border border-white/40 opacity-80 group-hover/img:opacity-100 transition-opacity cursor-pointer shadow-md"
                        aria-label="Next photo"
                      >
                        ›
                      </button>
                    </>
                  )}
                </div>

                {imageList.length > 1 && (
                  <div className="w-full flex flex-col items-center gap-2 mt-2">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="px-3 py-1 bg-white border-2 border-on-surface text-on-surface text-xs font-bold uppercase brick-shadow hover:bg-brick-yellow cursor-pointer"
                      >
                        ← PREV
                      </button>
                      <div className="flex gap-1.5">
                        {imageList.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setActiveImgIndex(dotIdx)}
                            className={`w-2.5 h-2.5 rounded-full border border-white transition-all cursor-pointer ${
                              activeImgIndex === dotIdx ? 'bg-brick-yellow w-5' : 'bg-white/40'
                            }`}
                            aria-label={`Pindah ke gambar ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-3 py-1 bg-white border-2 border-on-surface text-on-surface text-xs font-bold uppercase brick-shadow hover:bg-brick-yellow cursor-pointer"
                      >
                        NEXT →
                      </button>
                    </div>

                    {/* Thumbnail previews */}
                    <div className="flex flex-wrap justify-center items-center gap-1.5 max-w-full overflow-x-auto py-1">
                      {imageList.map((item, thumbIdx) => {
                        const thumbSrc = typeof item === 'string' ? item : item?.src;
                        return (
                          <button
                            key={thumbIdx}
                            type="button"
                            onClick={() => setActiveImgIndex(thumbIdx)}
                            className={`w-11 h-8 rounded border-2 overflow-hidden transition-all cursor-pointer flex-shrink-0 ${
                              activeImgIndex === thumbIdx
                                ? 'border-brick-yellow scale-105 shadow-[2px_2px_0px_#141414]'
                                : 'border-white/40 opacity-60 hover:opacity-100'
                            }`}
                            title={`Lihat gambar ${thumbIdx + 1}`}
                          >
                            <img
                              src={thumbSrc}
                              alt={`Thumbnail ${thumbIdx + 1}`}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/60 p-8 text-center my-auto">
                <div className="w-20 h-20 rounded-2xl bg-surface-container border-2 border-white/20 flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[48px] text-primary">
                    {type === 'education'
                      ? 'school'
                      : type === 'certification'
                      ? 'workspace_premium'
                      : type === 'organization'
                      ? 'groups'
                      : 'work'}
                  </span>
                </div>
                <div className="font-label-caps text-sm text-white/80 uppercase font-bold">
                  {subtitle || title}
                </div>
                <p className="text-xs text-white/50 max-w-xs">
                  Official verified record from {getVerifiedEntity(data)}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Information & Details */}
          <div className="lg:col-span-6 p-6 md:p-8 flex flex-col gap-5 overflow-y-auto max-h-[70vh] lg:max-h-[560px]">
            {period && (
              <div className="inline-block bg-brick-yellow border-2 border-on-surface px-3 py-0.5 text-xs font-label-caps font-bold text-on-surface w-fit brick-shadow">
                {period}
              </div>
            )}

            <div>
              <h2 className="font-display-lg-mobile md:font-display-lg text-on-surface uppercase font-black text-xl md:text-2xl leading-tight">
                {title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm font-bold text-on-surface font-label-caps">
                {subtitle && <span className="text-primary">{subtitle}</span>}
                {location && (
                  <span className="text-on-surface-variant flex items-center gap-1 text-xs">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {location}
                  </span>
                )}
              </div>
            </div>

            {data.description && (
              <div className="p-4 bg-surface-container border-l-4 border-primary rounded-r-lg">
                <p className="font-body-md text-on-surface text-[13px] md:text-sm leading-relaxed">
                  {data.description}
                </p>
              </div>
            )}

            {problemContext && (
              <div className="flex flex-col gap-2">
                <h4 className="font-label-caps text-xs font-bold text-primary uppercase">Problem Context:</h4>
                <p className="font-body-md text-on-surface text-xs md:text-[13px] leading-relaxed">
                  {problemContext}
                </p>
              </div>
            )}

            {solution && (
              <div className="flex flex-col gap-2">
                <h4 className="font-label-caps text-xs font-bold text-brick-blue uppercase">Engineered Solution:</h4>
                <p className="font-body-md text-on-surface text-xs md:text-[13px] leading-relaxed">
                  {solution}
                </p>
              </div>
            )}

            {highlights.length > 0 && (
              <div className="flex flex-col gap-2.5 pt-2">
                <h4 className="font-label-caps text-xs font-black text-on-surface uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[16px]">check_circle</span>
                  KEY HIGHLIGHTS & DETAILS:
                </h4>
                <ul className="space-y-2 text-xs md:text-[13px] text-on-surface">
                  {highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">■</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {techArsenal.length > 0 && (
              <div className="flex flex-col gap-2 pt-2 border-t-2 border-surface-container">
                <h4 className="font-label-caps text-xs font-black text-on-surface uppercase flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-brick-blue text-[16px]">terminal</span>
                  TECHNOLOGIES & ARSENAL:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {techArsenal.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 bg-surface-container border-2 border-on-surface text-[11px] font-label-caps font-bold text-on-surface"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.credentialId && (
              <div className="pt-2 border-t border-surface-container flex items-center gap-2 text-xs font-label-caps text-on-surface-variant font-bold">
                <span>CREDENTIAL ID:</span>
                <span className="font-mono text-on-surface bg-surface-container px-2 py-0.5 border border-on-surface">
                  {data.credentialId}
                </span>
              </div>
            )}

            {(repoUrl || demoUrl) && (
              <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-on-surface mt-auto">
                {repoUrl && (
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-on-surface text-white font-button-text text-xs uppercase brick-shadow hover:bg-primary transition-colors cursor-pointer"
                  >
                    <span>GITHUB REPO</span>
                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  </a>
                )}
                {demoUrl && (
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brick-yellow text-on-surface border-2 border-on-surface font-button-text text-xs uppercase brick-shadow hover:bg-yellow-300 transition-colors cursor-pointer"
                  >
                    <span>{demoUrl.includes('figma.com') ? 'FIGMA PROTOTYPE' : 'LIVE DEMO'}</span>
                    <span className="material-symbols-outlined text-[14px]">launch</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-surface border-t-4 border-on-surface px-4 md:px-6 py-3 flex items-center justify-between select-none">
          <div className="font-label-caps text-[10px] md:text-xs text-on-surface-variant font-bold uppercase">
            PORTFOLIO SHOWCASE // {personalInfo.name.toUpperCase()}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-primary text-white border-2 border-on-surface font-button-text text-xs uppercase brick-btn cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

