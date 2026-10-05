"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onSiteReady } from "@/lib/loading";
import Heading from "./Heading";
import { addToOrder, getCart, clearOrder } from "./ScoopNav";
import { useContent } from "../contentContext";
import type { Flavour } from "../cakesContent";

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
  const { builder, flavours, isCake } = useContent() as any;
  const root = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const drops = useRef<(HTMLDivElement | null)[]>([]);
  const squish = useRef<(HTMLImageElement | null)[]>([]);
  const [n, setN] = useState(0); // scoops landed
  const [done, setDone] = useState(false);
  const [buying, setBuying] = useState(false);
  const [delivered, setDelivered] = useState(false);
  const [still, setStill] = useState(false);
  const ordered = useRef(false);

  const [scoops, setScoops] = useState<Flavour[]>(builder.scoops);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [isCake]);

  useEffect(() => {
    const onOrder = () => {
      const cart = getCart();
      const scoopsInCart = cart
        .map((item: any) => flavours.find((f: any) => f.id === item.id))
        .filter(Boolean) as Flavour[];
      setScoops(scoopsInCart);
      ordered.current = false; // Reset ordered state so it can be ordered again if needed
    };
    window.addEventListener("melt:order", onOrder);
    onOrder();
    return () => window.removeEventListener("melt:order", onOrder);
  }, [flavours]);

  useEffect(() => {
    clearOrder();
  }, [isCake]);

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
              const d = scoops.length > 0 && p >= DONE;
              setDone(d);
              if (d && !ordered.current) {
                // Not adding to order here anymore since these scoops are already in the order!
                // ordered.current = true;
                // const total = scoops.reduce((s, f) => s + f.price, 0);
                // addToOrder({ id: "custom-cone", name: "Custom Built Cone", price: total });
              }
            },
          },
        });
        tl.set({}, {}, 1); // the timeline spans the whole pin (0..1)
        scoops.forEach((_, k) => {
          tl.fromTo(drops.current[k], { y: () => -window.innerHeight * 1.1, rotate: k % 2 ? 5 : -5 }, { y: 0, rotate: 0, duration: FALL, ease: "power2.in" }, dropAt(k));
          tl.fromTo(squish.current[k], { scaleY: 0.84, scaleX: 1.1 }, { scaleY: 1, scaleX: 1, duration: SQUISH, ease: "power3.out", immediateRender: false }, dropAt(k) + FALL);
        });

        // Breathing animation for the whole stack
        if (isCake) {
          gsap.to(stackRef.current, {
            y: "-=7",
            rotation: 0.5,
            duration: 3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        } else {
          gsap.to(stackRef.current, {
            y: "-=10",
            duration: 2.5,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
          });
        }
      }, root);
    });
    return () => {
      off();
      ctx?.revert();
    };
  }, [scoops, isCake]);

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!done || buying || delivered) return;

    setBuying(true);

    // Delivery animation
    if (stackRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setDelivered(true);
          clearOrder();

          // Reset animation state after a short delay
          setTimeout(() => {
            setBuying(false);
            setDelivered(false);
            gsap.set(stackRef.current, { y: 0, x: 0, scale: 1, rotation: 0, opacity: 1 });
          }, 3000);
        }
      });

      tl.to(stackRef.current, {
        scale: 0.9,
        y: 20,
        duration: 0.25,
        ease: "power2.out"
      }).to(stackRef.current, {
        y: -window.innerHeight * 0.8,
        x: window.innerWidth * 0.1,
        scale: 0.4,
        rotation: 15,
        opacity: 0,
        duration: 0.7,
        ease: "back.in(1.5)"
      });
    } else {
      clearOrder();
      setDelivered(true);
    }
  };

  const total = scoops.slice(0, n).reduce((s, f) => s + f.price, 0);

  return (
    <section ref={root} id="build" aria-label="Build your cone" className={`relative z-[1] ${still ? "" : "h-[330vh]"}`}>
      {/* ?record=1: arrive at the start of the pin, then scroll through all three drops */}
      <div aria-hidden data-record-label="Build your cone: start" data-record-time="1" className="pointer-events-none absolute inset-x-0 top-0 h-px" />
      <div aria-hidden data-record-label="Build your cone: all 3 scoops" data-record-time="6" data-record-align="bottom" className="pointer-events-none absolute inset-x-0 bottom-0 h-px" />

      <div
        className={`stack-tint ${still ? "relative py-28" : "sticky top-0 h-[100svh]"} flex flex-col overflow-hidden pt-[var(--nav-h)] transition-colors duration-700`}
        style={{ backgroundColor: builder.tints[n] }}
      >
        <div ref={contentRef} className="container-x grid flex-1 grid-rows-[auto_1fr_auto] items-center gap-3 py-3 lg:grid-cols-[1fr_auto_1fr] lg:grid-rows-1 lg:gap-12 lg:py-8">
          {/* left: heading + steps */}
          <div>
            <p className="eyebrow hidden lg:inline-flex">{builder.eyebrow}</p>
            {/* phone: one line, so the cone gets the room */}
            <Heading lines={builder.heading} className="text-[clamp(40px,5.4vw,96px)] max-lg:text-center max-lg:[&>span]:inline max-lg:[&>span+span]:ml-[0.22em] lg:mt-5" />
            <p className="mt-5 hidden max-w-[340px] text-[17px] leading-relaxed text-muted lg:block">{builder.text}</p>
            <ol className="mt-8 hidden flex-col gap-2.5 lg:flex">
              {scoops.map((f, k) => (
                <li key={`${f.id}-${k}`} className={`flex items-center gap-3 text-[16px] font-bold transition-opacity duration-500 ${k < n ? "opacity-100" : "opacity-45"}`}>
                  <span className="grid h-8 w-8 place-items-center rounded-full text-[14px] font-extrabold" style={{ background: f.fill, color: f.ink }}>
                    {k < n ? "✓" : k + 1}
                  </span>
                  {f.name}
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mx-auto flex justify-center items-center">
            <div ref={stackRef} className={`relative w-[calc(var(--u)*1.35)] ${isCake ? 'h-[calc(var(--u)*2.5)] [--u:min(21svh,190px)] lg:[--u:min(27vh,295px)]' : 'h-[calc(var(--u)*4.3)] [--u:min(11.5svh,104px)] lg:[--u:min(14.5vh,150px)]'}`}>
              <div aria-hidden className={`absolute left-1/2 -translate-x-1/2 rounded-[50%] ${isCake ? 'bottom-[-6%] h-[12%] w-[150%] bg-black/15 blur-[12px]' : 'bottom-[-4%] h-[6%] w-[90%] bg-[#2b1233]/20 blur-lg'}`} />
              <img src={builder.cone} alt="Waffle cone" className={`absolute bottom-0 left-1/2 z-[1] -translate-x-1/2 ${isCake ? "w-[calc(var(--u)*1.8)]" : "w-[calc(var(--u))]"}`} />
              {scoops.map((f, k) => (
                <div
                  key={`${f.id}-${k}`}
                  ref={(el) => {
                    drops.current[k] = el;
                  }}
                  className="absolute"
                  style={{
                    bottom: isCake ? `calc(var(--u) * ${[0.30, 0.90, 1.41][k]})` : `calc(var(--u) * ${1.55 + k * 0.72})`,
                    zIndex: 10 + k,
                    width: isCake ? `${100 - k * 15}%` : '100%',
                    left: isCake ? `${k * 7.5}%` : '0',
                  }}
                >
                  <div
                    ref={(el) => {
                      squish.current[k] = el;
                    }}
                    className="w-full origin-bottom"
                  >
                    <img
                      src={f.image}
                      alt={`${f.name} scoop`}
                      className={`w-full origin-bottom ${!isCake ? 'transition-transform duration-300 hover:-translate-y-3 cursor-pointer drop-shadow-[0_10px_10px_rgba(60,10,30,.18)]' : ''}`}
                    />
                  </div>
                </div>
              ))}
            </div>
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
            {scoops.length === 0 && !delivered ? (
              <a href="#flavours" className="btn mt-3 w-full justify-center lg:mt-5 btn-outline">
                Add scoops to see them here
              </a>
            ) : (
              <button
                onClick={handleBuy}
                className={`btn mt-3 w-full justify-center flex items-center gap-2 lg:mt-5 transition-all duration-300 ease-out ${done && !buying && !delivered
                    ? "btn-solid hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    : "btn-outline opacity-80 cursor-not-allowed"
                  }`}
                disabled={!done || buying || delivered}
              >
                {delivered ? (
                  <>
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    <span>Delivered!</span>
                  </>
                ) : buying ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Preparing...</span>
                  </>
                ) : done ? (
                  <>
                    <span>Buy now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </>
                ) : (
                  `Building cone · ₹${total}`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

