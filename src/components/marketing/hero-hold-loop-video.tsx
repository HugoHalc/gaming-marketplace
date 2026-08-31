"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HeroPingPongVideoProps = {
  introSrc: string;
  loopSrc: string;
  poster: string;
  className?: string;
  sizes?: string;
};

export function HeroHoldLoopVideo({
  introSrc,
  loopSrc,
  poster,
  className = "",
  sizes = "100vw",
}: HeroPingPongVideoProps) {
  const introRef = useRef<HTMLVideoElement | null>(null);
  const loopRef = useRef<HTMLVideoElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [showLoop, setShowLoop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const intro = introRef.current;
    const loop = loopRef.current;
    if (!intro || !loop) return;

    // Preload the hold loop while the cinematic intro is playing.
    loop.load();

    const beginHoldLoop = async () => {
      loop.currentTime = 0;

      try {
        await loop.play();
      } catch {}

      // Reveal only after playback starts to avoid a blank transition frame.
      requestAnimationFrame(() => setShowLoop(true));
    };

    intro.addEventListener("ended", beginHoldLoop);
    intro.currentTime = 0;
    void intro.play().catch(() => {});

    return () => {
      intro.removeEventListener("ended", beginHoldLoop);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <Image
        src={poster}
        alt=""
        fill
        sizes={sizes}
        className={className}
        priority
      />
    );
  }

  return (
    <>
      <video
        ref={introRef}
        className={`${className} absolute inset-0 transition-opacity duration-200 ${
          showLoop ? "opacity-0" : "opacity-100"
        }`}
        autoPlay
        muted
        playsInline
        preload="metadata"
        poster={poster}
        tabIndex={-1}
      >
        <source src={introSrc} type="video/webm" />
      </video>

      <video
        ref={loopRef}
        className={`${className} absolute inset-0 transition-opacity duration-200 ${
          showLoop ? "opacity-100" : "opacity-0"
        }`}
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
        tabIndex={-1}
      >
        <source src={loopSrc} type="video/webm" />
      </video>
    </>
  );
}
