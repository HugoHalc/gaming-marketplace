"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HeroHoldLoopVideoProps = {
  src: string;
  poster: string;
  className?: string;
  sizes?: string;
  holdSeconds?: number;
};

export function HeroHoldLoopVideo({
  src,
  poster,
  className = "",
  sizes = "100vw",
  holdSeconds = 2,
}: HeroHoldLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const holdLoopStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const startHoldLoop = async () => {
      if (!video.duration || Number.isNaN(video.duration)) return;

      holdLoopStartedRef.current = true;
      video.currentTime = Math.max(0, video.duration - holdSeconds);

      try {
        await video.play();
      } catch {}
    };

    const handleEnded = () => {
      void startHoldLoop();
    };

    const handleTimeUpdate = () => {
      if (!holdLoopStartedRef.current || !video.duration) return;

      const loopStart = Math.max(0, video.duration - holdSeconds);
      if (video.currentTime >= video.duration - 0.045) {
        video.currentTime = loopStart;
        void video.play().catch(() => {});
      }
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);

    video.currentTime = 0;
    void video.play().catch(() => {});

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [holdSeconds, prefersReducedMotion]);

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
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      playsInline
      preload="metadata"
      poster={poster}
      tabIndex={-1}
    >
      <source src={src} type="video/webm" />
    </video>
  );
}
