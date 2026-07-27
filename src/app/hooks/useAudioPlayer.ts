import { useState, useEffect, useRef, useCallback } from "react";
import type { Zikr } from "../types";

// Audio CDN URL resolver for Quranic & Prophetic Azkar
export function getZikrAudioUrl(
  zikr: Zikr | null,
  reciter: "alafasy" | "ghamdi" | "abdulbasit" = "alafasy",
): string | null {
  if (!zikr || !zikr.id) return null;
  const id = zikr.id.toLowerCase();
  const ref = (zikr.sourceReference ?? "").toLowerCase();

  const reciterPath =
    reciter === "ghamdi"
      ? "Ghamadi_40kbps"
      : reciter === "abdulbasit"
        ? "Abdul_Basit_Murattal_192kbps"
        : "Alafasy_128kbps";

  // 1. Ayat Al-Kursi (Qur'an 2:255)
  if (id.includes("75") || ref.includes("2:255") || ref.includes("البقرة: 255")) {
    return `https://everyayah.com/data/${reciterPath}/002255.mp3`;
  }
  // 2. Surah Al-Ikhlas (Qur'an 112)
  if (id.includes("76a") || ref.includes("112") || ref.includes("الإخلاص")) {
    return `https://everyayah.com/data/${reciterPath}/112001.mp3`;
  }
  // 3. Surah Al-Falaq (Qur'an 113)
  if (id.includes("76b") || ref.includes("113") || ref.includes("الفلق")) {
    return `https://everyayah.com/data/${reciterPath}/113001.mp3`;
  }
  // 4. Surah An-Nas (Qur'an 114)
  if (id.includes("76c") || ref.includes("114") || ref.includes("الناس")) {
    return `https://everyayah.com/data/${reciterPath}/114001.mp3`;
  }
  // 5. Amanar-Rasul (Qur'an 2:285-286)
  if (id.includes("285") || ref.includes("2:285") || ref.includes("البقرة: 285")) {
    return `https://everyayah.com/data/${reciterPath}/002285.mp3`;
  }
  // 6. Surah Al-Kahf (Qur'an 18)
  if (id.includes("kahf") || ref.includes("18:") || ref.includes("الكهف")) {
    return `https://everyayah.com/data/${reciterPath}/018001.mp3`;
  }
  // 7. Surah Al-Mulk (Qur'an 67)
  if (id.includes("mulk") || ref.includes("67:") || ref.includes("الملك")) {
    return `https://everyayah.com/data/${reciterPath}/067001.mp3`;
  }
  // 8. Surah Al-Sajdah (Qur'an 32)
  if (id.includes("sajdah") || ref.includes("32:") || ref.includes("السجدة")) {
    return `https://everyayah.com/data/${reciterPath}/032001.mp3`;
  }
  // 9. Surah Yasin (Qur'an 36)
  if (id.includes("yasin") || ref.includes("36:") || ref.includes("يس")) {
    return `https://everyayah.com/data/${reciterPath}/036001.mp3`;
  }
  // 10. Surah Ar-Rahman (Qur'an 55)
  if (id.includes("rahman") || ref.includes("55:") || ref.includes("الرحمن")) {
    return `https://everyayah.com/data/${reciterPath}/055001.mp3`;
  }

  // Strictly return null for items without authentic recitation audio to prevent misconfiguration
  return null;
}

export type PlaybackRate = 0.8 | 1.0 | 1.25;
export type ReciterOption = "alafasy" | "ghamdi" | "abdulbasit";

export function useAudioPlayer(zikrs: Zikr[], initialIndex = 0, onIndexChange?: (index: number) => void) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState<PlaybackRate>(1.0);
  const [autoPlayAll, setAutoPlayAll] = useState(false);
  const [reciter, setReciter] = useState<ReciterOption>("alafasy");

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
  const audioUrl = currentZikr ? getZikrAudioUrl(currentZikr, reciter) : null;

  // Play audio for specific index
  const playTrackAtIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= zikrs.length) return;
      const zikr = zikrs[index];
      if (!zikr) return;

      const url = getZikrAudioUrl(zikr, reciter);
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
    [zikrs, playbackRate, reciter, onIndexChange],
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
    reciter,
    setReciter,
    togglePlayPause,
    playTrackAtIndex,
    playNext,
    playPrev,
    stop,
    setPlaybackRate,
    toggleAutoPlayAll,
  };
}
