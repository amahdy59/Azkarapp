export function CrescentMark({ size = 80 }: { size?: number }) {
  return (
    <img src={`${import.meta.env.BASE_URL}azkar-icon.svg`} alt="" width={size} height={size} className="shrink-0" />
  );
}
