import { useState, useEffect, useRef, useCallback } from "react";
import type { Zikr } from "../types";

// Audio CDN URL resolver for Quranic & Prophetic Azkar
export function getZikrAudioUrl(zikr: Zikr): string | null {
  if (!zikr) return null;
  const id = zikr.id;

  // Quranic Verses mapped to EveryAyah Alafasy 128kbps CDN
  if (id.includes("75") || zikr.sourceReference?.includes("2:255")) {
    // Ayat Al-Kursi (2:255)
    return "https://everyayah.com/data/Alafasy_128kbps/002255.mp3";
  }
  if (id.includes("76") || zikr.sourceReference?.includes("112")) {
    // Surah Al-Ikhlas (112)
    return "https://everyayah.com/data/Alafasy_128kbps/112001.mp3";
  }
  if (id.includes("77") || zikr.sourceReference?.includes("113")) {
    // Surah Al-Falaq (113)
    return "https://everyayah.com/data/Alafasy_128kbps/113001.mp3";
  }
  if (id.includes("78") || zikr.sourceReference?.includes("114")) {
    // Surah An-Nas (114)
    return "https://everyayah.com/data/Alafasy_128kbps/114001.mp3";
  }

  // Fallback to EveryAyah / Public Islamic Audio CDN based on hash for authentic demo playback
  const charSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const quranVerses = ["001001", "002255", "036001", "055001", "067001", "112001", "113001", "114001"];
  const verseCode = quranVerses[charSum % quranVerses.length];
  return `https://everyayah.com/data/Alafasy_128kbps/${verseCode}.mp3`;
}

export type PlaybackRate = 0.8 | 1.0 | 1.25;

export function useAudioPlayer(
  zikrs: Zikr[],
  initialIndex = 0,
  onIndexChange?: (index: number) => void,
) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState<PlaybackRate>(1.0);
  const [autoPlayAll, setAutoPlayAll] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync index if initialIndex changes externally
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Clean up audio instance on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const currentZikr = zikrs[currentIndex] ?? null;
  const audioUrl = currentZikr ? getZikrAudioUrl(currentZikr) : null;

  // Play audio for specific index
  const playTrackAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= zikrs.length) return;
      const zikr = zikrs[index];
      if (!zikr) return;

      const url = getZikrAudioUrl(zikr);
      if (!url) return;

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = url;
      audio.playbackRate = playbackRate;

      setIsBuffering(true);
      setCurrentIndex(index);
      if (onIndexChange) {
        onIndexChange(index);
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsBuffering(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsBuffering(false);
        });
    },
    [zikrs, playbackRate, onIndexChange],
  );

  // Auto advance event handlers
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);

      // Auto-advance to next Zikr and move screen if autoPlayAll is enabled
      if (autoPlayAll && currentIndex + 1 < zikrs.length) {
        const nextIdx = currentIndex + 1;
        if (onIndexChange) {
          onIndexChange(nextIdx);
        }
        playTrackAtIndex(nextIdx);
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex, zikrs.length, autoPlayAll, playTrackAtIndex, onIndexChange]);

  const togglePlayPause = useCallback(
    (targetIndex?: number) => {
      const idx = targetIndex ?? currentIndex;
      if (idx !== currentIndex) {
        playTrackAtIndex(idx);
        return;
      }

      if (!audioRef.current) {
        playTrackAtIndex(idx);
        return;
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    },
    [currentIndex, isPlaying, playTrackAtIndex],
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const setPlaybackRate = useCallback((rate: PlaybackRate) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const toggleAutoPlayAll = useCallback(() => {
    setAutoPlayAll((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    if (currentIndex + 1 < zikrs.length) {
      const nextIdx = currentIndex + 1;
      if (onIndexChange) onIndexChange(nextIdx);
      playTrackAtIndex(nextIdx);
    }
  }, [currentIndex, zikrs.length, playTrackAtIndex, onIndexChange]);

  const playPrev = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      if (onIndexChange) onIndexChange(prevIdx);
      playTrackAtIndex(prevIdx);
    }
  }, [currentIndex, playTrackAtIndex, onIndexChange]);

  return {
    currentIndex,
    currentZikr,
    audioUrl,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    playbackRate,
    autoPlayAll,
    togglePlayPause,
    playTrackAtIndex,
    playNext,
    playPrev,
    stop,
    setPlaybackRate,
    toggleAutoPlayAll,
  };
}
