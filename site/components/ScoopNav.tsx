"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onReveal } from "./ScoopLoader";
import { useContent } from "../contentContext";

export type CartItem = { id: string; name: string; price: number };
let globalCart: CartItem[] = [];
export const getCart = () => globalCart;

export const showToast = (message: string) => {
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

export const removeFromOrder = (index: number) => {
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
        className="flex items-center gap-2 rounded-full bg-accent py-2 pr-2 pl-4 text-[14px] font-extrabold text-accent-fg transition-transform hover:scale-[1.04] cursor-pointer"
      >
        {nav.cta.label}
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
        <div className="flex w-full max-w-[860px] items-center gap-2 rounded-full bg-white/95 p-1.5 pl-5 shadow-[0_14px_40px_-16px_rgba(120,20,60,.35)] md:w-auto md:gap-4">
          <a href="#" aria-label="Melt Theory, home" className="font-display flex items-center gap-1.5 text-[22px] whitespace-nowrap text-accent md:text-[24px]">
            <ScoopMark className="h-[1.05em] w-auto text-[#ff8fb1]" />
            {nav.logo}
          </a>
          <nav className="relative hidden items-center lg:flex">
            {blob && <span aria-hidden className="absolute top-0 h-full rounded-full bg-[var(--strawberry)] transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]" style={{ left: blob.x, width: blob.w }} />}
            {nav.links.map((l, i) => (
              <a
                key={l.label}
                ref={(el) => {
                  links.current[i] = el;
                }}
                href={l.href}
                className={`relative rounded-full px-4 py-2.5 text-[14px] font-bold whitespace-nowrap transition-colors ${i === active ? "text-accent" : "text-fg/75 hover:text-fg"}`}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button 
              onClick={toggleCake} 
              className="relative flex items-center h-8 w-14 rounded-full bg-accent/10 p-1 cursor-pointer transition-colors border border-accent/20"
              aria-label="Toggle between Ice Cream and Cakes"
            >
              <div className={`absolute left-1 h-6 w-6 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] ${isCake ? "translate-x-6" : "translate-x-0"}`}>
                <span className="text-[12px] leading-none select-none">{isCake ? "🍰" : "🍦"}</span>
              </div>
            </button>
            {order}
            <button onClick={() => setOpen(true)} className="rounded-full px-3.5 py-2.5 text-[14px] font-extrabold lg:hidden">
              Menu
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-[var(--strawberry)]">
          <div className="flex items-center justify-between px-6 pt-6">
            <span className="font-display flex items-center gap-1.5 text-[24px] text-accent">
              <ScoopMark className="h-[1.05em] w-auto text-white" />
              {nav.logo}
            </span>
            <button onClick={() => setOpen(false)} className="rounded-full bg-white px-4 py-2.5 text-[14px] font-extrabold">
              Close
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-6">
            {nav.links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="font-display text-[clamp(44px,12vw,72px)] leading-[1.05] text-fg">
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

