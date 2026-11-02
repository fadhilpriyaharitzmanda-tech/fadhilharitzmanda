import React, { useState } from 'react';
import { certifications as defaultCertifications } from '../data/portfolioData';
import { useSiteData } from '../context/SiteContext';
import DetailModal from './DetailModal';

export default function CertificationsSection() {
  const [selectedCert, setSelectedCert] = useState(null);
  const { certifications: dynamicCertifications } = useSiteData();

  const certificationsList =
    dynamicCertifications && dynamicCertifications.length > 0
      ? dynamicCertifications
      : defaultCertifications;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 mt-12">
      <h3 className="font-button-text text-button-text text-on-surface bg-surface-container-high border-4 border-on-surface px-4 py-2 inline-block w-fit uppercase mb-6 brick-shadow reveal-left">
        LICENSES & CERTIFICATIONS
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificationsList.map((item, idx) => {
          const title = item.title || item.name || 'Sertifikat';
          const issuer = item.issuer || '';
          const date = item.date || '';
          const description = item.description || '';
          const credentialId = item.credential_id || item.credentialId || '';
          const imagesList = Array.isArray(item.images)
            ? item.images.map((img) => (typeof img === 'string' ? img : img.src)).filter(Boolean)
            : [];
          const coverImg = imagesList[0] || null;

          return (
            <div
              key={item.id || idx}
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
                {/* Certificate Main Cover Preview */}
                <div
                  onClick={() => setSelectedCert(item)}
                  className="w-full aspect-[16/9] bg-surface-container-low border-2 border-on-surface mb-3 flex items-center justify-center overflow-hidden relative cursor-pointer group-hover:opacity-95"
                  title="Klik untuk memperbesar sertifikat"
                >
                  {coverImg ? (
                    <img
                      src={coverImg}
                      alt={`Sertifikat ${title}`}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[48px] text-primary">workspace_premium</span>
                  )}
                </div>

                {/* Multiple Images Gallery Thumbnails (if any) */}
                {imagesList.length > 1 && (
                  <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                    {imagesList.map((src, iIdx) => (
                      <button
                        key={iIdx}
                        type="button"
                        onClick={() => setSelectedCert(item)}
                        className="w-12 h-9 rounded border border-on-surface overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80"
                        title={`Lihat gambar sertifikat ${iIdx + 1}`}
                      >
                        <img src={src} alt={`${title} ${iIdx + 1}`} loading="lazy" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <h4 className="font-button-text text-on-surface uppercase mb-1 text-[14px] md:text-[15px] leading-snug break-words">
                  {title}
                </h4>

                <div className="font-label-caps text-primary text-[11px] font-bold leading-snug break-words">
                  {issuer}
                  {issuer && date && ' • '}
                  {date}
                </div>

                {description && (
                  <p className="mt-2 font-body-md text-on-surface text-[12px] leading-relaxed line-clamp-2">
                    {description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-surface-container flex justify-between items-center">
                {credentialId ? (
                  <span className="text-[10px] font-label-caps text-on-surface-variant font-mono">
                    ID: {credentialId}
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
          );
        })}
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

