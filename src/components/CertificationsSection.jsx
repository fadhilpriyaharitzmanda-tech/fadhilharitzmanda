import React, { useState } from 'react';
import { certifications } from '../data/portfolioData';
import DetailModal from './DetailModal';

export default function CertificationsSection() {
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 mt-12">
      <h3 className="font-button-text text-button-text text-on-surface bg-surface-container-high border-4 border-on-surface px-4 py-2 inline-block w-fit uppercase mb-6 brick-shadow reveal-left">
        LICENSES & CERTIFICATIONS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certifications.map((item, idx) => (
          <div
            key={item.id || item.name}
            className={`brick-card p-6 bg-white relative flex flex-col justify-between group reveal-pop delay-${
              ((idx % 3) + 1) * 100
            }`}
          >
            {/* Top 2 Studs */}
            <div className="absolute -top-3 left-4 flex gap-4 px-2 pointer-events-none">
              <span className="w-4 h-4 rounded-full bg-white border-2 border-on-surface z-10" />
              <span className="w-4 h-4 rounded-full bg-white border-2 border-on-surface z-10" />
            </div>

            <div>
              <div
                onClick={() => setSelectedCert(item)}
                className="w-full aspect-[16/9] bg-surface-container-low border-2 border-on-surface mb-4 flex items-center justify-center overflow-hidden relative cursor-pointer group-hover:opacity-95"
              >
                {item.images && item.images.length > 0 && item.images[0].src ? (
                  <img
                    src={item.images[0].src}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[48px] text-primary">workspace_premium</span>
                )}
              </div>

              <h4 className="font-button-text text-on-surface uppercase mb-1 text-[14px] md:text-[15px] leading-snug break-words">
                {item.name}
              </h4>
              <div className="font-label-caps text-primary text-[11px] font-bold leading-snug break-words">
                {item.issuer} • {item.date}
              </div>
              <p className="mt-2 font-body-md text-on-surface text-[12px] leading-relaxed line-clamp-2">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-surface-container flex justify-between items-center">
              {item.credentialId ? (
                <span className="text-[10px] font-label-caps text-on-surface-variant font-mono">
                  ID: {item.credentialId}
                </span>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setSelectedCert(item)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-surface text-on-surface border-2 border-on-surface font-label-caps text-[10px] font-bold uppercase brick-btn cursor-pointer"
              >
                <span>DETAILS</span>
                <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <DetailModal
        isOpen={!!selectedCert}
        onClose={() => setSelectedCert(null)}
        data={selectedCert}
        type="certification"
      />
    </div>
  );
}

