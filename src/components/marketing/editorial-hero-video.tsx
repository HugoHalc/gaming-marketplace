"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type EditorialHeroVideoProps = {
  className?: string;
  sizes?: string;
};

const VIDEO_SRC = "/videos/boostingpedia-home-hero-editorial.mp4";
const POSTER_SRC = "/videos/boostingpedia-home-hero-editorial-poster.jpg";

export function EditorialHeroVideo({
  className = "",
  sizes = "100vw",
}: EditorialHeroVideoProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  if (prefersReducedMotion) {
    return (
      <Image
        src={POSTER_SRC}
        alt=""
        fill
        sizes={sizes}
        className={className}
        priority
      />
    );
  }

  return (
    <video
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={POSTER_SRC}
      tabIndex={-1}
      aria-hidden="true"
    >
      <source src={VIDEO_SRC} type="video/mp4" />
    </video>
  );
}
