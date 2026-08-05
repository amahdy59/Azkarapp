import { AzkarHeroBackground } from "../src/AzkarHeroBackground";

export function HomeHeroExample() {
  return (
    <section className="azkar-hero" dir="rtl" aria-labelledby="evening-title">
      <AzkarHeroBackground kind="evening" priority />
      <div className="azkar-hero__overlay" aria-hidden="true" />
      <div className="azkar-hero__content">
        <p>حان وقت</p>
        <h2 id="evening-title">أذكار المساء</h2>
        <p>أفضل وقت لأذكار المساء من بعد صلاة العصر حتى المغرب.</p>
        <button type="button">تابع أذكار المساء</button>
      </div>
    </section>
  );
}
