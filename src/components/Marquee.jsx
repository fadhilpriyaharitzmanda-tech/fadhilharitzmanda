import React from 'react';

export default function Marquee() {
  const words = ['CODE', 'DESIGN', 'BUILD', 'CODE', 'DESIGN', 'BUILD', 'CODE', 'DESIGN', 'BUILD', 'CODE', 'DESIGN', 'BUILD'];
  const repeated = [...words, ...words];

  return (
    <div className="w-full border-y-4 border-on-surface bg-brick-yellow py-4 overflow-hidden mb-32 flex select-none brick-shadow">
      <div className="flex w-max shrink-0 items-center gap-8 whitespace-nowrap font-label-caps text-label-caps text-on-surface font-bold animate-marquee">
        {repeated.map((word, idx) => (
          <span key={idx} className="flex items-center gap-8 shrink-0">
            <span>{word}</span>
            <span className="material-symbols-outlined text-[14px]">grid_view</span>
          </span>
        ))}
      </div>
    </div>
  );
}

