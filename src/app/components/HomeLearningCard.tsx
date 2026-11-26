import { useId } from "react";
import { HomeCard } from "./HomeCard";
import { BookOpen } from "./icons";
import { Button } from "./ui/button";
import { learningT } from "../i18n/learning";
import type { AppLanguage } from "../types";
import type { LearningLanguage } from "../learning/types";

export function HomeLearningCard({
  language,
  onGlass,
  book,
  onContinue,
  onOpenBooks,
}: {
  language: AppLanguage;
  onGlass: boolean;
  book?: { title: string; language: LearningLanguage; sectionLabel: string };
  onContinue?: () => void;
  onOpenBooks: () => void;
}) {
  const titleId = useId();
  const bookId = useId();
  return (
    <HomeCard
      onGlass={onGlass}
      elevation="flat"
      padding="md"
      aria-labelledby={titleId}
      data-testid="home-learning"
      className="flex min-w-0 flex-wrap items-center gap-3"
    >
      <BookOpen size={22} aria-hidden="true" className="shrink-0 text-primary" />
      <div className="min-w-0 flex-1 basis-[12rem]">
        <h2 id={titleId} className="text-title font-bold">
          {learningT(language, "homeTitle")}
        </h2>
        {book ? (
          <p id={bookId} className="mt-1 text-sm leading-relaxed">
            <span
              lang={book.language}
              dir={book.language === "ar" ? "rtl" : "ltr"}
              className="block font-semibold [overflow-wrap:anywhere]"
            >
              {book.title}
            </span>{" "}
            <span className="block text-muted-foreground">{book.sectionLabel}</span>
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{learningT(language, "subtitle")}</p>
        )}
      </div>
      <div className="flex min-w-0 flex-wrap gap-2">
        {book && onContinue ? (
          <>
            <Button variant="outline" size="sm" onClick={onContinue} aria-describedby={bookId}>
              {learningT(language, "continue")}
            </Button>
            <Button variant="ghost" size="sm" onClick={onOpenBooks}>
              {learningT(language, "allBooks")}
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onOpenBooks}>
            {learningT(language, "exploreBooks")}
          </Button>
        )}
      </div>
    </HomeCard>
  );
}
