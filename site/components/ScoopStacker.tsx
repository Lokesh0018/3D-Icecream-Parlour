"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";
import Heading from "./Heading";
import { addToOrder } from "./ScoopNav";
import { builder } from "../content";

// Scroll progress (0..1 of the pinned stretch) where scoop k starts to drop, and how long the drop + squish take.
const dropAt = (k: number) => 0.1 + k * 0.26;
const FALL = 0.13;
const SQUISH = 0.07;
const DONE = 0.9;

/**
 * The signature moment: pinned while you scroll, three scoops drop one by one onto an empty waffle cone
 * and squish into place, the background takes each flavour's colour, and the receipt adds up.
 * Scroll-driven, so it plays by itself in ?record=1 and matches on laptop and phone.
 */
export default function ScoopStacker() {
  const root = useRef<HTMLElement>(null);
  const drops = useRef<(HTMLDivElement | null)[]>([]);
  const squish = useRef<(HTMLImageElement | null)[]>([]);
  const [n, setN] = useState(0); // scoops landed
  const [done, setDone] = useState(false);
  const [still, setStill] = useState(false);
  const ordered = useRef(false);
  const { scoops } = builder;

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStill(true);
      setN(scoops.length);
      setDone(true);
      return;
    }
    let ctx: gsap.Context | undefined;
    const off = onSiteReady(() => {
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            onUpdate: (self) => {
              const p = self.progress;
              setN(scoops.filter((_, k) => p >= dropAt(k) + FALL).length);
              const d = p >= DONE;
              setDone(d);
              if (d && !ordered.current) {
                ordered.current = true;
                addToOrder();
              }
            },
          },
        });
        tl.set({}, {}, 1); // the timeline spans the whole pin (0..1)
        scoops.forEach((_, k) => {
          tl.fromTo(drops.current[k], { y: () => -window.innerHeight * 1.1, rotate: k % 2 ? 5 : -5 }, { y: 0, rotate: 0, duration: FALL, ease: "power2.in" }, dropAt(k));
          // one soft squish on landing, no wobble
          tl.fromTo(squish.current[k], { scaleY: 0.84, scaleX: 1.1 }, { scaleY: 1, scaleX: 1, duration: SQUISH, ease: "power3.out", immediateRender: false }, dropAt(k) + FALL);
        });
      }, root);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [scoops]);

  const total = scoops.slice(0, n).reduce((s, f) => s + f.price, 0);

  return (
    <section ref={root} id="build" aria-label="Build your cone" className={`relative z-[1] ${still ? "" : "h-[330vh]"}`}>
      {/* ?record=1: arrive at the start of the pin, then scroll through all three drops */}
      <div aria-hidden data-record-label="Build your cone: start" data-record-time="1" className="pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div aria-hidden data-record-label="Build your cone: all 3 scoops" data-record-time="6" data-record-align="bottom" className="pointer-events-none absolute inset-x-0 bottom-0 h-px" />

      <div
        className={`stack-tint ${still ? "relative py-28" : "sticky top-0 h-[100svh]"} flex flex-col overflow-hidden pt-[var(--nav-h)]`}
        style={{ backgroundColor: builder.tints[n] }}
      >
        <div className="container-x grid flex-1 grid-rows-[auto_1fr_auto] items-center gap-3 py-3 lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-1 lg:gap-12 lg:py-8">
          {/* left: heading + steps */}
          <div>
            <p className="eyebrow hidden lg:inline-flex">{builder.eyebrow}</p>
            {/* phone: one line, so the cone gets the room */}
            <Heading lines={builder.heading} className="text-[clamp(40px,5.4vw,96px)] max-lg:text-center max-lg:[&>span]:inline max-lg:[&>span+span]:ml-[0.22em] lg:mt-5" />
            <p className="mt-5 hidden max-w-[340px] text-[17px] leading-relaxed text-muted lg:block">{builder.text}</p>
            <ol className="mt-8 hidden flex-col gap-2.5 lg:flex">
              {scoops.map((f, k) => (
                <li key={f.id} className={`flex items-center gap-3 text-[16px] font-bold transition-opacity duration-500 ${k < n ? "opacity-100" : "opacity-45"}`}>
                  <span className="grid h-8 w-8 place-items-center rounded-full text-[14px] font-extrabold" style={{ background: f.fill, color: f.ink }}>
                    {k < n ? "✓" : k + 1}
                  </span>
                  {f.name}
                </li>
              ))}
            </ol>
          </div>

          {/* centre: the stack */}
          <div className="relative mx-auto h-[calc(var(--u)*4.3)] w-[calc(var(--u)*1.35)] [--u:min(11.5svh,104px)] lg:[--u:min(14.5vh,150px)]">
            <div aria-hidden className="absolute bottom-[-4%] left-1/2 h-[6%] w-[90%] -translate-x-1/2 rounded-[50%] bg-[#2b1233]/10 blur-md" />
            <img src={builder.cone} alt="Waffle cone" className="absolute bottom-0 left-1/2 z-[1] w-[calc(var(--u))] -translate-x-1/2" />
            {scoops.map((f, k) => (
              <div
                key={f.id}
                ref={(el) => {
                  drops.current[k] = el;
                }}
                className="absolute left-0 w-full"
                style={{ bottom: `calc(var(--u) * ${1.55 + k * 0.72})`, zIndex: 10 + k }}
              >
                <img
                  ref={(el) => {
                    squish.current[k] = el;
                  }}
                  src={f.image}
                  alt={`${f.name} scoop`}
                  className="w-full origin-bottom drop-shadow-[0_10px_10px_rgba(60,10,30,.18)]"
                />
              </div>
            ))}
          </div>

          {/* right: the receipt */}
          <div className="w-full max-w-[380px] justify-self-center rounded-[28px] bg-white p-5 shadow-[var(--soft-shadow)] max-lg:px-5 max-lg:py-4 lg:justify-self-end lg:p-7">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-[24px] lg:text-[28px]">Your cone</p>
              <p className="label">Order #MT-0426</p>
            </div>
            <ul className="mt-3 space-y-1.5 text-[14px] lg:mt-5 lg:space-y-2.5 lg:text-[16px]">
              <li className="hidden justify-between font-semibold lg:flex">
                <span>{builder.coneLine.name}</span>
                <span className="text-muted">{builder.coneLine.price}</span>
              </li>
              {scoops.map((f, k) => (
                <li key={f.id} className={`receipt-line flex items-center justify-between font-semibold ${k < n ? "" : "is-off"}`}>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: f.fill }} />
                    {f.name}
                  </span>
                  <span className="tnum">₹{f.price}</span>
                </li>
              ))}
            </ul>
            <div className="dash mt-3 flex items-baseline justify-between pt-3 lg:mt-5 lg:pt-4">
              <span className="label">Total</span>
              <span key={total} className="font-display tnum text-[30px] text-accent lg:text-[40px]">
                ₹{total}
              </span>
            </div>
            <a href="#build" className={`btn mt-3 w-full justify-center lg:mt-5 ${done ? "btn-solid" : "btn-outline"}`}>
              {done ? `Added to order ✓` : `${builder.cta} · ₹${total}`}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
