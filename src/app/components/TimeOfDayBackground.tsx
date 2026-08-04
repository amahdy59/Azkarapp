import React from "react";

export function TimeOfDayBackground({ categoryId }: { categoryId: string }) {
  const base = import.meta.env.BASE_URL;

  let name = "morning";
  if (categoryId === "evening") name = "evening";
  else if (categoryId === "before_sleep") name = "before-sleep";

  const positions: Record<string, string> = {
    morning: "36% 50%",
    evening: "38% 50%",
    "before-sleep": "64% 50%",
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
      {/* Sky photo — visible in both modes */}
      <img
        src={`${base}webp/860w/${name}-860w.webp`}
        srcSet={`
          ${base}webp/430w/${name}-430w.webp 430w,
          ${base}webp/860w/${name}-860w.webp 860w
        `}
        sizes="(max-width: 430px) 100vw, 390px"
        width={860}
        height={1529}
        alt=""
        aria-hidden="true"
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover pointer-events-none transition-opacity duration-[360ms] ease-out"
        style={{ objectPosition: positions[name] }}
      />
      {/* Dark mode: fade to near-black */}
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(to bottom, rgba(8,12,20,0) 0%, rgba(8,12,20,0.15) 30%, rgba(8,12,20,0.72) 65%, rgba(8,12,20,0.93) 82%, #080c14 100%)",
        }}
      />
      {/* Light mode: fade to white (per Figma node 839:1645) */}
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
