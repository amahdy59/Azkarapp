import { BarChart3, Check, Headphones, MoonStar, Smartphone } from "../components/icons";

import { ArrowNext } from "../components/icons";

export default function MarketingLanding() {
  return (
    <div className="marketing-landing theme-midnight h-dvh overflow-y-auto bg-background text-foreground">
      <header className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-6">
        <a href="./" className="flex items-center gap-2 text-[1.25rem] font-extrabold">
          <MoonStar className="text-primary" /> Azkar
        </a>
        <a href="./" className="min-h-11 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground">
          Open app
        </a>
      </header>
      <main>
        <section className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-primary">
              Daily remembrance, made peaceful
            </p>
            <h1 className="mt-4 text-5xl font-extrabold leading-tight tracking-[-0.01em] lg:text-6xl">
              Build a lasting azkar habit.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Morning, Evening, and Sleep remembrance with guided counting, audio, bilingual Arabic and English, and
              private progress tracking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="./"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
              >
                Start remembering <ArrowNext size={18} />
              </a>
              <a
                href="#features"
                className="inline-flex min-h-11 items-center rounded-xl border border-border-control px-6 py-3 font-semibold focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"
              >
                Explore features
              </a>
            </div>
            <ul className="mt-7 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {["Works offline", "Full RTL support", "Accessible themes", "Progress stays private"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check size={16} className="text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-[430px] rounded-[40px] border border-border bg-card p-5 shadow-2xl">
            <div className="rounded-[28px] bg-background p-6">
              <p className="text-sm text-muted-foreground">Good morning</p>
              <h2 className="mt-1 text-2xl font-bold">Begin with remembrance</h2>
              {["Morning Azkar", "Evening Azkar", "Before Sleep"].map((label, index) => (
                <div key={label} className="mt-4 rounded-2xl border border-border bg-card p-4">
                  <p className="font-semibold">{label}</p>
                  <div className="mt-3 h-2 rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${index * 35}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="features" className="border-y border-border bg-card py-16">
          <div className="mx-auto grid max-w-[1200px] gap-5 px-6 md:grid-cols-3">
            {[
              {
                Icon: Smartphone,
                title: "Guided counting",
                body: "Tap, swipe, and continue with clear session progress.",
              },
              {
                Icon: Headphones,
                title: "Listen and read",
                body: "Audio support alongside Arabic, transliteration, and translation.",
              },
              {
                Icon: BarChart3,
                title: "Gentle progress",
                body: "Weekly activity and streaks without pressure or competition.",
              },
            ].map(({ Icon, title, body }) => (
              <article key={title} className="rounded-2xl border border-border bg-background p-6">
                <Icon className="text-primary" />
                <h2 className="mt-4 text-xl font-bold">{title}</h2>
                <p className="mt-2 leading-7 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="mx-auto max-w-[1200px] px-6 py-10 text-sm text-muted-foreground">
        Azkar — a calm space for daily remembrance.
      </footer>
    </div>
  );
}
