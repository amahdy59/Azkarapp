/** The six decorative stage drawings from the finished publication, with themed ink. */
export function UmrahStageArtwork({ stage }: { stage: number }) {
  const drawings = [
    <g key="1">
      <path d="M16 50V22l10-7 9 8 9-8 10 7v28M18 34h34M26 17v15m18-15v15" />
    </g>,
    <g key="2">
      <path d="m19 25 17-9 17 9v25H19Z" />
      <path d="m19 25 17 8 17-8M36 33v17M19 31l17 8 17-8" />
      <path d="M11 47c-6-16 4-33 21-35m28 10c13 17 2 38-15 39" />
    </g>,
    <g key="3">
      <path d="M12 51h48M23 51V33l13-15 13 15v18M28 51V37h16v14M18 33h36" />
      <circle cx="36" cy="27" r="2" />
    </g>,
    <g key="4">
      <path d="M22 25h28l-3 30H25Zm-2 0h32M30 13c-6 6 6 7 0 13m13-13c-6 6 6 7 0 13M25 41h22" />
    </g>,
    <g key="5">
      <path d="m10 51 12-22 13 22m2 0 13-22 12 22M20 19h32m-5-5 5 5-5 5M52 60H20m5-5-5 5 5 5" />
    </g>,
    <g key="6">
      <circle cx="22" cy="50" r="7" />
      <circle cx="49" cy="50" r="7" />
      <path d="m26 44 26-28M45 44 19 16M35 35l4 4" />
    </g>,
  ];
  return (
    <svg
      className="learn-stage-art"
      viewBox="0 0 72 72"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[stage - 1]}
    </svg>
  );
}
