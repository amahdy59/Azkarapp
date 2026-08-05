import React from "react";

export function TimeOfDayBackground({ categoryId }: { categoryId: string }) {
  const base = import.meta.env.BASE_URL;

  let name = "morning";
  let fallbackPng = "Morning.png";

  if (categoryId === "evening") {
    name = "evening";
    fallbackPng = "Evening.png";
  } else if (categoryId === "before_sleep") {
    name = "before-sleep";
    fallbackPng = "Before Sleep.png";
  } else if (categoryId.includes("friday")) {
    name = "morning";
    fallbackPng = "Morning.png";
  }

  const positions: Record<string, string> = {
    morning: "36% 50%",
    evening: "38% 50%",
    "before-sleep": "64% 50%",
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Responsive Sky Background Picture Element */}
      <picture>
        <source
          type="image/webp"
          srcSet={`
            ${base}webp/430w/${name}-430w.webp 430w,
            ${base}webp/860w/${name}-860w.webp 860w,
            ${base}webp/master/${name}-master.webp 1200w
          `}
          sizes="(max-width: 430px) 430px, (max-width: 860px) 860px, 100vw"
        />
        <img
          src={`${base}${fallbackPng}`}
          alt=""
          aria-hidden="true"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-[360ms] ease-out"
          style={{ objectPosition: positions[name] || "50% 50%" }}
        />
      </picture>

      {/* Dark mode: fade to near-black */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,12,20,0) 0%, rgba(8,12,20,0.15) 30%, rgba(8,12,20,0.72) 65%, rgba(8,12,20,0.93) 82%, #080c14 100%)",
        }}
      />
      {/* Light mode: fade to white */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(to bottom, rgba(102,102,102,0) 0%, rgba(102,102,102,0) 65.8%, rgba(255,255,255,0.7) 79.9%, rgba(255,255,255,0.9) 90.6%, rgb(255,255,255) 100%)",
        }}
      />
    </div>
  );
}
