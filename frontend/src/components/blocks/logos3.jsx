"use client";

import { useEffect, useState } from "react";

const Logos3 = ({
  heading = "POWERED BY SARVAM AI · NO LANGUAGE BARRIER",
  logos = [
    { id: "lang-hindi", text: "हिंदी", sub: "Hindi" },
    { id: "lang-marathi", text: "मराठी", sub: "Marathi" },
    { id: "lang-english", text: "English", sub: "English" },
    { id: "lang-bengali", text: "বাংলা", sub: "Bengali" },
    { id: "lang-tamil", text: "தமிழ்", sub: "Tamil" },
    { id: "lang-telugu", text: "తెలుగు", sub: "Telugu" },
    { id: "lang-punjabi", text: "ਪੰਜਾਬੀ", sub: "Punjabi" },
    { id: "lang-kannada", text: "ಕನ್ನಡ", sub: "Kannada" },
  ],
}) => {
  // Duplicate the array to create a seamless infinite scroll
  const scrollItems = [...logos, ...logos, ...logos];

  return (
    <div className="w-full relative py-8 overflow-hidden">
      <style>{`
        @keyframes infinite-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1rem)); } /* -50% for duplicated list */
        }
        .marquee-track {
          display: flex;
          width: max-content;
          gap: 2rem;
          animation: infinite-scroll 24s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Heading */}
      <div className="text-center mb-10 px-6">
        <span className="text-[11px] font-bold tracking-[0.2em] text-[#6b8f71] uppercase lp-sora">
          {heading}
        </span>
      </div>

      <div className="relative flex w-full overflow-hidden mask-edges">
        {/* Edge masks to fade out scrolling items */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#fdfaf4] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#fdfaf4] to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="marquee-track px-4">
          {scrollItems.map((logo, idx) => (
            <div
              key={`${logo.id}-${idx}`}
              className="group flex flex-col items-center justify-center gap-1"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(61, 84, 66, 0.08)',
                boxShadow: '0 4px 16px rgba(46, 61, 50, 0.03)',
                padding: '12px 28px',
                borderRadius: '999px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'default',
              }}
            >
              <span className="lp-sora text-3xl font-medium text-[#2e3d32] group-hover:text-[#3d5442] transition-colors leading-none">
                {logo.text}
              </span>
              <span className="lp-sora text-[10px] font-semibold tracking-wider text-[#8a9e8f] uppercase">
                {logo.sub}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { Logos3 };
