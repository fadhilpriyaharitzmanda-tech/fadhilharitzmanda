import React, { useState } from 'react';
import { experiences, organizations } from '../data/portfolioData';
import DetailModal from './DetailModal';

const INITIAL_EXP_COUNT = 6;
const INITIAL_ORG_COUNT = 4;

export default function ExperienceSection() {
  const [showAllExp, setShowAllExp] = useState(false);
  const [showAllOrg, setShowAllOrg] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('experience');

  const visibleExp = showAllExp ? experiences : experiences.slice(0, INITIAL_EXP_COUNT);
  const remainingExp = experiences.length - INITIAL_EXP_COUNT;

  const visibleOrg = showAllOrg ? organizations : organizations.slice(0, INITIAL_ORG_COUNT);
  const remainingOrg = organizations.length - INITIAL_ORG_COUNT;

  const handleOpenDetail = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16">
      {/* Experience Sub-Section */}
      <div className="mt-12">
        <h3 className="font-button-text text-button-text text-on-surface bg-surface-container-high border-4 border-on-surface px-4 py-2 inline-block w-fit uppercase mb-6 brick-shadow reveal-left">
          EXPERIENCE
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {visibleExp.map((item, idx) => (
            <div
              key={item.id}
              className={`brick-card p-8 relative bg-white flex flex-col gap-5 justify-between group reveal-pop delay-${
                ((idx % 4) + 1) * 100
              }`}
            >
              <div>
                <div className="flex gap-6 items-start">
                  <div className="w-16 h-16 border-3 border-on-surface bg-white rounded-xl flex-shrink-0 flex items-center justify-center p-2 brick-shadow overflow-hidden">
                    {item.logo ? (
                      <img src={item.logo} alt={item.company} className="w-full h-full object-contain" />
                    ) : (
                      <span className="material-symbols-outlined text-primary text-[28px]">work</span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-wrap md:flex-row md:justify-between md:items-start gap-1.5 mb-2">
                      <div className="inline-block px-3 py-1 bg-surface-container-high border-2 border-on-surface text-on-surface font-label-caps font-bold text-[10px] uppercase w-fit">
                        {item.type}
                      </div>
                      <div className="bg-brick-yellow border-2 border-on-surface px-2 py-1 font-label-caps font-bold text-[10px] text-on-surface w-fit flex-shrink-0">
                        {item.period}
                      </div>
                    </div>
                    <h3 className="font-headline-md text-on-surface uppercase text-[16px] md:text-[18px] leading-snug break-words">
                      {item.company}
                    </h3>
                    <div className="font-button-text text-primary uppercase mt-1 text-[13px] md:text-[14px] leading-snug break-words">
                      {item.role}
                    </div>
                  </div>
                </div>

                <p className="font-body-md text-on-surface text-[14px] leading-relaxed mt-4 line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenDetail(item, 'experience')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-surface text-on-surface border-2 border-on-surface font-label-caps text-[11px] font-bold uppercase brick-btn cursor-pointer"
                >
                  <span>VIEW DETAILS</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {remainingExp > 0 && (
          <div className="flex justify-center mb-12 reveal-pop">
            <button
              type="button"
              onClick={() => setShowAllExp(!showAllExp)}
              className="px-6 py-3.5 bg-white text-on-surface border-4 border-on-surface font-button-text text-sm font-bold uppercase brick-btn relative cursor-pointer"
            >
              <div className="absolute -top-2 left-0 w-full flex justify-around px-2 pointer-events-none">
                <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
                <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
                <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
              </div>
              {showAllExp ? '↑ SHOW LESS' : `↓ VIEW ALL EXPERIENCES (${remainingExp} MORE)`}
            </button>
          </div>
        )}

        {/* Education Journey Sub-Section */}
        <div className="mt-12">
          <h3 className="font-button-text text-button-text text-on-surface bg-surface-container-high border-4 border-on-surface px-4 py-2 inline-block w-fit uppercase mb-6 brick-shadow reveal-left">
            Education
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleOrg.map((item, idx) => (
              <div
                key={item.id}
                className={`brick-card p-6 bg-white flex flex-col gap-4 justify-between relative group reveal-pop delay-${
                  ((idx % 4) + 1) * 100
                }`}
              >
                <div>
                  <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 border-3 border-on-surface bg-white rounded-xl flex-shrink-0 flex items-center justify-center p-1.5 brick-shadow overflow-hidden">
                      {item.logo ? (
                        <img src={item.logo} alt={item.organization} className="w-full h-full object-contain" />
                      ) : (
                        <span className="material-symbols-outlined text-primary text-[24px]">school</span>
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap justify-between items-start gap-1">
                        <h4 className="font-button-text text-on-surface uppercase text-[14px] md:text-[15px] leading-snug break-words">
                          {item.organization}
                        </h4>
                        <span className="bg-surface-container px-2 py-0.5 border border-on-surface font-label-caps text-[9px] font-bold flex-shrink-0">
                          {item.period}
                        </span>
                      </div>
                      <div className="font-label-caps text-primary text-[11px] uppercase font-bold mt-1 leading-snug break-words">
                        {item.role}
                      </div>
                    </div>
                  </div>

                  <p className="font-body-md text-on-surface text-[13px] leading-relaxed mt-3 line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(item, 'education')}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface text-on-surface border-2 border-on-surface font-label-caps text-[11px] font-bold uppercase brick-btn cursor-pointer"
                  >
                    <span>VIEW DETAILS</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {remainingOrg > 0 && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={() => setShowAllOrg(!showAllOrg)}
                className="px-6 py-3.5 bg-white text-on-surface border-4 border-on-surface font-button-text text-sm font-bold uppercase brick-btn relative cursor-pointer"
              >
                <div className="absolute -top-2 left-0 w-full flex justify-around px-2 pointer-events-none">
                  <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
                  <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
                  <span className="w-3 h-3 rounded-full bg-white border-2 border-on-surface" />
                </div>
                {showAllOrg ? '↑ SHOW LESS' : `↓ VIEW ALL EDUCATION (${remainingOrg} MORE)`}
              </button>
            </div>
          )}
        </div>
      </div>

      <DetailModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        data={selectedItem}
        type={modalType}
      />
    </div>
  );
}

