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
        className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        style={{ objectPosition: positions[name] }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#080c14]/40 via-[#080c14]/80 to-[#080c14]" />
    </div>
  );
}
