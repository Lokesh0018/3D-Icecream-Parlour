"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onReveal } from "./ScoopLoader";
import { useContent } from "../contentContext";

export type CartItem = { id: string; name: string; price: number };
let globalCart: CartItem[] = [];
export const getCart = () => globalCart;

const showToast = (message: string) => {
  const existing = document.getElementById("order-toast");
  if (existing) existing.remove();
  
  const toast = document.createElement("div");
  toast.id = "order-toast";
  toast.className = "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-[#2b1233] text-white px-6 py-3 rounded-full font-bold text-[14px] shadow-lg pointer-events-none";
  toast.innerText = message;
  document.body.appendChild(toast);
  
  gsap.fromTo(toast, 
    { y: 50, opacity: 0 }, 
    { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.5)" }
  );
  
  gsap.to(toast, {
    y: 20, opacity: 0, duration: 0.4, delay: 2.5, ease: "power2.in",
    onComplete: () => toast.remove()
  });
};

export const addToOrder = (item: CartItem) => {
  if (globalCart.length >= 3) {
    showToast("At most 3 items can be added to your order");
    return false;
  }
  globalCart.push(item);
  window.dispatchEvent(new Event("melt:order"));
  return true;
};

const removeFromOrder = (index: number) => {
  globalCart.splice(index, 1);
  window.dispatchEvent(new Event("melt:order"));
};

export const clearOrder = () => {
  globalCart.splice(0, globalCart.length);
  window.dispatchEvent(new Event("melt:order"));
};

/** The brand mark: a tiny scoop on a cone. */
export const ScoopMark = ({ className = "h-[1em] w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 20 26" className={className} aria-hidden>
    <path d="M4.5 12.5 10 25l5.5-12.5Z" fill="#e9b170" />
    <path d="M3 13a7 7 0 1 1 14 0c0 1.2-1.3 1.5-2.2.8-.8.9-2 .9-2.8 0-.8.9-2 .9-2.8 0-.8.9-2 .9-2.8 0C4.3 14.5 3 14.2 3 13Z" fill="currentColor" />
  </svg>
);

/** The cake mark: a tiny cupcake. */
export const CakeMark = ({ className = "h-[1em] w-auto" }: { className?: string }) => (
  <svg viewBox="0 0 20 26" className={className} aria-hidden>
    <rect x="4" y="14" width="12" height="10" rx="1.5" fill="#e9b170" />
    <path d="M2 14 C2 8, 18 8, 18 14 C18 15.5, 15.33 15.5, 15.33 14 C15.33 15.5, 12.66 15.5, 12.66 14 C12.66 15.5, 10 15.5, 10 14 C10 15.5, 7.33 15.5, 7.33 14 C7.33 15.5, 4.66 15.5, 4.66 14 C4.66 15.5, 2 15.5, 2 14 Z" fill="currentColor" />
    <circle cx="10" cy="5.5" r="2.5" fill="#d61c5d" />
  </svg>
);

/** N2: one floating white pill (mark · links with a sliding pink blob · Order count). Phone: pill + full pink sheet. */
export default function ScoopNav() {
  const { nav, isCake, toggleCake } = useContent();
  const ref = useRef<HTMLElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [blob, setBlob] = useState<{ x: number; w: number } | null>(null);
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const offIntro = onReveal(() => {
      if (!prefersReducedMotion()) gsap.from(ref.current, { y: -90, opacity: 0, duration: 0.9, delay: 0.3, ease: "power3.out" });
    });
    const onOrder = () => {
      setCount(globalCart.length);
      setCart([...globalCart]);
      setBump((n) => n + 1);
    };
    window.addEventListener("melt:order", onOrder);

    // the section whose top has passed 45% of the screen is "active"
    const targets = nav.links.map((l) => document.querySelector<HTMLElement>(l.href));
    const onScroll = () => {
      const line = window.innerHeight * 0.45;
      let k = -1;
      targets.forEach((t, i) => {
        if (t && t.getBoundingClientRect().top < line) k = i;
      });
      setActive(k);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      offIntro();
      window.removeEventListener("melt:order", onOrder);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // the pink blob slides to the active link
  useEffect(() => {
    const a = links.current[active];
    setBlob(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
  }, [active]);

  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) window.__lenis?.stop();
    else if (wasOpen.current) window.__lenis?.start();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const order = (
    <div className="relative" ref={cartRef}>
      <button 
        id="cart-button" 
        onClick={() => setCartOpen(!cartOpen)} 
        aria-label={`${nav.cta.label}, ${count} items`} 
        className="flex items-center gap-1.5 rounded-full bg-accent py-1.5 px-1.5 md:py-2 md:pr-2 md:pl-4 text-[14px] font-extrabold text-accent-fg transition-transform hover:scale-[1.04] cursor-pointer"
      >
        <span className="hidden md:inline">{nav.cta.label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="md:hidden ml-1">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
          <path d="M3 6h18"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
        <span key={bump} className={`tnum grid h-7 min-w-7 place-items-center rounded-full bg-white px-1.5 text-[13px] text-accent ${bump ? "order-bump" : ""}`}>
          {count}
        </span>
      </button>

      <div 
        className={`absolute right-0 top-[120%] mt-2 w-72 rounded-2xl bg-white p-4 shadow-[0_14px_40px_-16px_rgba(120,20,60,.35)] z-50 origin-top-right transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${
          cartOpen ? "opacity-100 scale-100 pointer-events-auto translate-y-0" : "opacity-0 scale-95 pointer-events-none -translate-y-2"
        }`}
      >
        <h3 className="text-[16px] font-bold text-[#2b1233] mb-3">Your Order</h3>
        {cart.length === 0 ? (
          <p className="text-[14px] text-muted">Your cart is empty.</p>
        ) : (
          <ul className="space-y-3">
            {cart.map((item, idx) => (
              <li key={idx} className="flex justify-between items-center text-[14px]">
                <span className="font-semibold">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted tnum">₹{item.price}</span>
                  <button 
                    onClick={() => removeFromOrder(idx)}
                    className="text-[12px] text-accent font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {cart.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center font-bold">
            <span>Total</span>
            <span className="tnum text-accent">₹{cart.reduce((sum, item) => sum + item.price, 0)}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <header ref={ref} className="fixed inset-x-0 top-3 z-50 flex justify-center px-3 md:top-5">
        <div className="flex w-full max-w-[860px] items-center gap-2 rounded-full bg-white/95 p-1.5 pl-5 shadow-[0_14px_40px_-16px_rgba(120,20,60,.35)] md:w-full md:gap-4 transition-all duration-500">
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            aria-label="Scoop & Slice, home" 
            className="font-display flex items-center gap-1.5 text-[22px] whitespace-nowrap text-accent md:text-[24px] transition-transform hover:scale-[1.02]"
          >
            {isCake ? (
              <CakeMark className="h-[1.05em] w-auto text-[#ff8fb1]" />
            ) : (
              <ScoopMark className="h-[1.05em] w-auto text-[#ff8fb1]" />
            )}
            {nav.logo}
          </a>
          <nav className="relative hidden items-center lg:flex">
            {blob && <span aria-hidden className="absolute top-0 h-full rounded-full bg-[var(--strawberry)] transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]" style={{ left: blob.x, width: blob.w }} />}
            {nav.links.map((l, i) => (
              <a
                key={i}
                ref={(el) => {
                  links.current[i] = el;
                }}
                href={l.href}
                className={`relative rounded-full px-4 py-2.5 text-[14px] font-bold whitespace-nowrap transition-colors ${i === active ? "text-accent" : "text-fg/75 hover:text-fg"}`}
              >
                <span style={{ viewTransitionName: `nav-link-${i}` }} className="inline-block">{l.label}</span>
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 md:gap-3">
            <button 
              onClick={toggleCake} 
              className="relative flex items-center h-8 w-14 rounded-full bg-accent/10 p-1 cursor-pointer transition-colors border border-accent/20 shrink-0"
              aria-label="Toggle between Ice Cream and Cakes"
            >
              <div className={`absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${isCake ? "translate-x-6" : "translate-x-0"}`}>
                <span className="text-[12px] leading-none select-none">{isCake ? "🍰" : "🍦"}</span>
              </div>
            </button>
            {order}
            <button onClick={() => setOpen(true)} className="flex items-center justify-center rounded-full h-9 w-9 bg-black/5 text-fg transition-colors hover:bg-black/10 lg:hidden cursor-pointer shrink-0" aria-label="Open Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" x2="21" y1="12" y2="12"/>
                <line x1="3" x2="21" y1="6" y2="6"/>
                <line x1="3" x2="21" y1="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--strawberry)]">
          <div className="flex items-center justify-between px-6 pt-6">
            <button 
              onClick={() => { setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="font-display flex items-center gap-1.5 text-[24px] text-accent cursor-pointer transition-transform hover:scale-[1.02]"
            >
              {isCake ? (
                <CakeMark className="h-[1.05em] w-auto text-white" />
              ) : (
                <ScoopMark className="h-[1.05em] w-auto text-white" />
              )}
              {nav.logo}
            </button>
            <button onClick={() => setOpen(false)} className="flex items-center justify-center rounded-full h-10 w-10 bg-white text-accent transition-transform hover:scale-105 cursor-pointer shadow-sm" aria-label="Close Menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-4 px-6">
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} 
              className="font-display text-[clamp(40px,11vw,64px)] leading-[1.1] text-fg transition-all hover:translate-x-2 hover:text-white"
            >
              Home
            </a>
            {nav.links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="font-display text-[clamp(40px,11vw,64px)] leading-[1.1] text-fg transition-all hover:translate-x-2 hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
          <p className="px-6 pb-8 text-[14px] font-bold text-fg/70">Open till midnight on weekends · Jubilee Hills · Gachibowli · Banjara Hills</p>
        </div>
      )}
    </>
  );
}

