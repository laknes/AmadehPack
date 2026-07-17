"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { heroSlides } from "@/lib/hero-slides";

export function HeroSlider() {
  const [active, setActive] = useState(0);
  const slide = heroSlides[active];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 5600);
    return () => window.clearInterval(timer);
  }, []);

  function go(delta: number) {
    setActive((current) => (current + delta + heroSlides.length) % heroSlides.length);
  }

  return (
    <div className="grid gap-3">
      <div className="relative min-h-[380px] overflow-hidden lg:min-h-[520px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: -24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.98 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority={active === 0}
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="hero-product object-contain object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button className="btn" aria-label="اسلاید بعدی" onClick={() => go(1)}>
          <ChevronRight size={18} />
        </button>
        <div className="flex gap-2 rounded-full border border-[#B8874B] bg-white px-3 py-2">
          {heroSlides.map((item, index) => (
            <button
              key={item.id}
              aria-label={`اسلاید ${index + 1}`}
              onClick={() => setActive(index)}
              className={`h-2 rounded-full transition-all ${index === active ? "w-8 bg-[#FF8A1F]" : "w-2 bg-[#B8874B]/35 hover:bg-[#B8874B]"}`}
            />
          ))}
        </div>
        <button className="btn" aria-label="اسلاید قبلی" onClick={() => go(-1)}>
          <ChevronLeft size={18} />
        </button>
      </div>
    </div>
  );
}


