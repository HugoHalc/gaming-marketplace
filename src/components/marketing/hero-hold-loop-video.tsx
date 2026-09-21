"use client";

import { useEffect, useRef, useState } from "react";

type HeroHoldLoopVideoProps = {
  src: string;
  className?: string;
  holdSeconds?: number;
  sourceMedia?: string;
};

export function HeroHoldLoopVideo({
  src,
  className = "",
  holdSeconds = 2,
  sourceMedia,
}: HeroHoldLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const holdLoopStartedRef = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    const loopStart = () =>
      Math.max(0, (Number.isFinite(video.duration) ? video.duration : 0) - holdSeconds);

    const playSafely = () => {
      void video.play().catch(() => {
        // The poster remains visible if the browser blocks autoplay.
      });
    };

    const restartHoldLoop = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      holdLoopStartedRef.current = true;
      video.currentTime = loopStart();
      playSafely();
    };

    const handleEnded = () => {
      restartHoldLoop();
    };

    const handleTimeUpdate = () => {
      if (
        !holdLoopStartedRef.current ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        return;
      }

      if (video.currentTime >= video.duration - 0.08) {
        video.currentTime = loopStart();
        playSafely();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      if (
        video.ended ||
        (holdLoopStartedRef.current &&
          Number.isFinite(video.duration) &&
          video.currentTime >= video.duration - 0.1)
      ) {
        restartHoldLoop();
        return;
      }

      playSafely();
    };

    const handleLoadedMetadata = () => {
      if (video.currentTime <= 0.1) {
        holdLoopStartedRef.current = false;
        video.currentTime = 0;
      }
      playSafely();
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      handleLoadedMetadata();
    }

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [holdSeconds, prefersReducedMotion]);

  return (
    <video
      ref={videoRef}
      className={className}
      autoPlay
      muted
      playsInline
      preload="metadata"
      tabIndex={-1}
      disablePictureInPicture
      aria-hidden="true"
    >
      <source src={src} type="video/webm" media={sourceMedia} />
    </video>
  );
}
