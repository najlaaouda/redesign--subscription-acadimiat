"use client";

import { useEffect, useRef } from "react";
import { Swiper } from "swiper";
import type { SwiperOptions } from "swiper/types";
import { Autoplay, FreeMode } from "swiper/modules";
import { ACADEMIES } from "@/lib/academies";

import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";

/**
 * Academy marquee — Swiper.js v11 continuous-scroll carousel.
 *
 * Config matches the legacy site exactly:
 *   • loop: true        → seamless wrap (Swiper clones slides internally)
 *   • slidesPerView: 'auto' + per-slide CSS width → varied row of 27 cards
 *   • autoplay delay:0 + speed:5000 + freeMode + linear easing → smooth
 *     constant-velocity marquee (not stepwise)
 *   • pauseOnMouseEnter → hover pauses; touch swipe still works on mobile
 *
 * Each card renders a browser-mockup chrome (3 dots + host URL) + an
 * academy screenshot (PNG from /public/assets/, Arabic-name safe).
 */
export function AcademyMarquee() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const opts: SwiperOptions = {
      modules: [Autoplay, FreeMode],
      loop: true,
      loopAdditionalSlides: 5,
      slidesPerView: "auto",
      spaceBetween: 24,
      freeMode: true,
      speed: 5000,
      allowTouchMove: true,
      grabCursor: true,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
    };
    const swiper = new Swiper(ref.current, opts);
    return () => {
      swiper.destroy(true, true);
    };
  }, []);

  return (
    <div className="academy-marquee-wrap" dir="ltr">
      <div ref={ref} className="swiper academy-swiper">
        <div className="swiper-wrapper">
          {ACADEMIES.map((a) => {
            const host = a.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
            const src = `/assets/${encodeURIComponent(a.image)}`;
            return (
              <a
                key={a.url}
                className="swiper-slide academy-card"
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={a.name}
              >
                <div className="academy-card__browser">
                  <div className="academy-card__chrome">
                    <div className="academy-card__dots">
                      <span className="dot dot--red" />
                      <span className="dot dot--yellow" />
                      <span className="dot dot--green" />
                    </div>
                    <div className="academy-card__url">{host}</div>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="academy-card__shot"
                    src={src}
                    alt={a.name}
                    loading="lazy"
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
