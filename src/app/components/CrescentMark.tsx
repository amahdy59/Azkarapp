import React from "react";

export function CrescentMark({ size = 80 }: { size?: number }) {
  return (
    <div className="flex items-center justify-center rounded-3xl" 
         style={{ width: size, height: size, background: "linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 40 40" fill="none">
        <path d="M20 2C9 2 2 11 2 20s9 18 18 18c7 0 13-4 16-10-8 0-14-6-14-14 0-2 .5-4 1.5-6C21.5 3 21 2 20 2z" fill="var(--primary)" />
        <circle cx="26" cy="14" r="3" fill="var(--primary)" />
      </svg>
    </div>
  );
}
