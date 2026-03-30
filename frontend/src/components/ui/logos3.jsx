// This template requires the Embla Auto Scroll plugin to be installed:
// npm install embla-carousel-auto-scroll

"use client";

import React from "react";
import AutoScroll from "embla-carousel-auto-scroll";

import { Carousel, CarouselContent, CarouselItem } from "./carousel";

const Logos3 = ({
  heading = "POWERED BY SARVAM AI · NO LANGUAGE BARRIER",
  logos = [
    {
      id: "lang-hindi",
      text: "हिंदी",
      sub: "Hindi",
    },
    {
      id: "lang-marathi",
      text: "मराठी",
      sub: "Marathi",
    },
    {
      id: "lang-english",
      text: "English",
      sub: "English",
    },
    {
      id: "lang-bengali",
      text: "বাংলা",
      sub: "Bengali",
    },
    {
      id: "lang-tamil",
      text: "தமிழ்",
      sub: "Tamil",
    },
    {
      id: "lang-telugu",
      text: "తెలుగు",
      sub: "Telugu",
    },
    {
      id: "lang-punjabi",
      text: "ਪੰਜਾਬੀ",
      sub: "Punjabi",
    },
    {
      id: "lang-kannada",
      text: "ಕನ್ನಡ",
      sub: "Kannada",
    },
    {
      id: "lang-gujarati",
      text: "ગુજરાતી",
      sub: "Gujarati",
    },
    {
      id: "lang-malayalam",
      text: "മലയാളം",
      sub: "Malayalam",
    },
  ],
  className = "",
}) => {
  const plugin = React.useRef(
    AutoScroll({
      playOnInit: true,
      speed: 1.1,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    })
  );

  const marqueeItems = [...logos, ...logos];

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto mb-8 flex flex-col items-center px-6 text-center">
        <p className="lp-sora text-[11px] font-bold uppercase tracking-[0.2em] text-[#6b8f71]">
          {heading}
        </p>
      </div>

      <div>
        <div className="relative mx-auto flex w-full items-center justify-center">
          <Carousel
            opts={{ loop: true, dragFree: true, align: "start" }}
            plugins={[plugin.current]}
            className="w-full"
          >
            <CarouselContent className="ml-0 gap-4">
              {marqueeItems.map((logo, idx) => (
                <CarouselItem
                  key={`${logo.id}-${idx}`}
                  className="basis-auto pl-0"
                >
                  <div
                    className="flex min-w-[164px] flex-col items-center justify-center rounded-full px-6 py-3"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.46) 0%, rgba(255,255,255,0.24) 100%)",
                      border: "1px solid rgba(255,255,255,0.42)",
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,0.5), 0 10px 26px rgba(46,61,50,0.08)",
                      backdropFilter: "blur(16px) saturate(140%)",
                      WebkitBackdropFilter: "blur(16px) saturate(140%)",
                    }}
                  >
                    <span className="lp-sora text-xl font-semibold leading-none text-[#2e3d32] sm:text-2xl">
                      {logo.text}
                    </span>
                    <span className="lp-sora mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b8f71]">
                      {logo.sub}
                    </span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#fdfaf4] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#fdfaf4] to-transparent" />
        </div>
      </div>
    </section>
  );
};

export { Logos3 };
