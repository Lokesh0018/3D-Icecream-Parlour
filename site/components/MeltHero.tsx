"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onReveal } from "./ScoopLoader";
import { Scripted } from "./Heading";
import { useContent } from "../contentContext";
import Magnetic from "./Magnetic";

/**
 * H5: a giant "MELT" behind a big three-scoop cone on a soft pink blob, toppings drifting around it.
 * Opens with the loader; on scroll the cone lifts and the word slides apart.
 */
export default function MeltHero() {
  const { hero } = useContent();
  const root = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const icecreamRef = useRef<HTMLImageElement>(null);
  const left = useRef<HTMLSpanElement>(null);
  const right = useRef<HTMLSpanElement>(null);
  const cone = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const side = useRef<HTMLDivElement>(null);
  const toppings = useRef<HTMLDivElement>(null);
  const half = Math.ceil(hero.word.length / 2);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let ctx: gsap.Context | undefined;
    const off = onReveal(() => {
      ctx = gsap.context(() => {
        // intro, as the loader's circle opens
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from([left.current, right.current], { yPercent: 40, opacity: 0, duration: 1.1, stagger: 0.08 }, 0)
          .from(cone.current, { yPercent: 12, scale: 0.9, opacity: 0, duration: 1.2 }, 0.1)
          .from(toppings.current!.children, { scale: 0.4, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.4)
          .from([copy.current, side.current], { y: 30, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.5);

        // scroll: the word slides apart, the cone lifts
        const st = { trigger: root.current, start: "top top", end: "bottom top", scrub: true };
        gsap.to(bgRef.current, { yPercent: 15, ease: "none", scrollTrigger: st });
        gsap.to(left.current, { xPercent: -18, ease: "none", scrollTrigger: st });
        gsap.to(right.current, { xPercent: 18, ease: "none", scrollTrigger: st });
        gsap.to(cone.current, { yPercent: -10, ease: "none", scrollTrigger: st });
        gsap.to(icecreamRef.current, { yPercent: -20, ease: "none", scrollTrigger: st });
        (Array.from(toppings.current!.children) as HTMLElement[]).forEach((t) =>
          gsap.to(t, { yPercent: -120 * Number(t.dataset.depth), ease: "none", scrollTrigger: st }),
        );
      }, root);
    });

    // Mouse movement parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!root.current) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = (e.clientY / innerHeight) * 2 - 1;

      // Move elements based on cursor position
      gsap.to(bgRef.current, { x: x * 15, y: y * 15, duration: 1, ease: "power2.out", overwrite: "auto" });
      gsap.to(cone.current, { x: x * -25, y: y * -25, duration: 1, ease: "power2.out", overwrite: "auto" });
      gsap.to([left.current, right.current], { x: x * -10, y: y * -10, duration: 1.2, ease: "power2.out", overwrite: "auto" });
      
      if (toppings.current) {
        (Array.from(toppings.current.children) as HTMLElement[]).forEach((t) => {
          const depth = Number(t.dataset.depth) || 0.5;
          gsap.to(t, { x: x * depth * -60, y: y * depth * -60, duration: 1.5, ease: "power2.out", overwrite: "auto" });
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      off();
      ctx?.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section ref={root} id="top" className="relative h-[100svh] min-h-[640px] overflow-hidden">
      {/* Background Image with Parallax */}
      <img ref={bgRef} src={hero.bg || "/images/melt/hero-bg.jpg"} alt="Background" className="absolute top-[-10%] left-0 w-full h-[120%] object-cover opacity-80" />

      <div aria-hidden data-record-label="Hero" data-record-time="0" data-record-hold="3" className="pointer-events-none absolute inset-x-0 top-0 h-px" />

      {/* soft blob (removed as replaced by background) */}

      {/* giant word */}
      <p aria-hidden className="font-display absolute inset-x-0 top-[17%] flex -translate-y-1/2 justify-center gap-[3vw] text-[clamp(96px,27vw,440px)] md:gap-[12vw] md:text-[clamp(150px,27vw,470px)] leading-none font-bold tracking-[-0.03em] text-accent select-none md:top-[45%]">
        <span ref={left} className="inline-block" style={{ viewTransitionName: 'hero-word-left' }}>
          {hero.word.slice(0, half)}
        </span>
        <span ref={right} className="inline-block" style={{ viewTransitionName: 'hero-word-right' }}>
          {hero.word.slice(half)}
        </span>
      </p>

      {/* toppings */}
      <div ref={toppings} aria-hidden>
        {hero.toppings.map((t) => (
          <div key={t.src} data-depth={t.depth} className={`absolute ${t.className}`}>
            <img src={t.src} alt={t.alt} className="drift w-full drop-shadow-[0_18px_18px_rgba(120,20,60,.18)]" style={{ animationDelay: `${-t.depth * 9}s` }} />
          </div>
        ))}
      </div>

      {/* the central image (16:9 image covering hero) */}
      <div className="absolute inset-0 flex justify-center items-center z-10 pointer-events-none pt-[12vh] md:pt-0">
        <div ref={cone} style={{ viewTransitionName: 'hero-cone' }} className="w-[90%] h-[70%] md:w-full md:h-full relative flex items-center justify-center">
          <img ref={icecreamRef} src={hero.cone} alt="3D center image" className={`float-soft object-contain object-center drop-shadow-[0_30px_30px_rgba(120,20,60,.22)] ${hero.imageClassName || "w-full h-full md:scale-105"}`} />
        </div>
      </div>

      {/* copy, bottom left */}
      <div className="container-x pointer-events-none absolute inset-x-0 bottom-[6%] flex flex-col gap-4 md:bottom-[7%] md:flex-row md:items-end md:justify-between z-20">
        <div ref={copy} className="pointer-events-auto max-w-[440px] drop-shadow-md md:drop-shadow-none">
          <h1 className="font-display text-[clamp(46px,4.3vw,70px)]">
            {hero.heading.map((l, i) => (
              <span key={i} className="block" style={{ viewTransitionName: `hero-heading-${i}` }}>
                <Scripted text={l} />
              </span>
            ))}
          </h1>
          <p className="mt-3 hidden max-w-[360px] text-[16px] leading-relaxed text-muted md:block">{hero.text}</p>
        </div>

        <div ref={side} className="pointer-events-auto flex flex-col items-start gap-4 md:items-end">
          <div className="flex gap-2.5 md:gap-3">
            <Magnetic>
              <a href={hero.ctas[0].href} className="btn btn-solid">
                {hero.ctas[0].label}
              </a>
            </Magnetic>
            <Magnetic>
              <a href={hero.ctas[1].href} className="btn btn-outline">
                {hero.ctas[1].label}
              </a>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}

