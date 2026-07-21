import type { CategoryId, Zikr } from "../types";

const MORNING_AZKAR: Zikr[] = [
  {
    id: "m-hm-75a",
    category: "morning",
    orderIndex: 0,
    arabicText:
      "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f\u060c \u0648\u064e\u0627\u0644\u0635\u0651\u064e\u0644\u0627\u064e\u0629\u064f \u0648\u064e\u0627\u0644\u0633\u0651\u064e\u0644\u0627\u064e\u0645\u064f \u0639\u064e\u0644\u064e\u0649 \u0645\u064e\u0646\u0652 \u0644\u0627\u064e \u0646\u064e\u0628\u0650\u064a\u0651\u064e \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f",
    transliteration:
      "Al\u1e25amdulill\u0101hi wa\u1e25dah, wa\u1e63-\u1e63al\u0101tu was-sal\u0101mu \u02bfal\u0101 man l\u0101 nabiyya ba\u02bfdah.",
    translation:
      "All praise is due to Allah alone, and prayers and peace be upon the one after whom there is no Prophet.",
    benefit: "Included as the opening item of the morning/evening chapter.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud no. 3667; Hisn al-Muslim 75a.",
    preferredTiming:
      "Morning: after Fajr until sunrise. Evening: after \u2018Asr until sunset as a strong recommended dhikr sitting.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0644\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u0639\u064f\u062f\u064e \u0645\u064e\u0639\u064e \u0642\u064e\u0648\u0652\u0645\u064d \u064a\u064e\u0630\u0652\u0643\u064f\u0631\u064f\u0648\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0645\u0650\u0646\u0652 \u0635\u064e\u0644\u0627\u064e\u0629\u0650 \u0627\u0644\u0652\u063a\u064e\u062f\u064e\u0627\u0629\u0650 \u062d\u064e\u062a\u0651\u064e\u0649 \u062a\u064e\u0637\u0652\u0644\u064f\u0639\u064e \u0627\u0644\u0634\u0651\u064e\u0645\u0652\u0633\u064f \u0623\u064e\u062d\u064e\u0628\u0651\u064f \u0625\u0650\u0644\u064e\u064a\u0651\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0646\u0652 \u0623\u064f\u0639\u0652\u062a\u0650\u0642\u064e \u0623\u064e\u0631\u0652\u0628\u064e\u0639\u064e\u0629\u064b \u0645\u0650\u0646\u0652 \u0648\u064e\u0644\u064e\u062f\u0650 \u0625\u0650\u0633\u0652\u0645\u064e\u0627\u0639\u0650\u064a\u0644\u064e... \u0648\u0645\u0646 \u0635\u0644\u0627\u0629 \u0627\u0644\u0639\u0635\u0631 \u0625\u0644\u0649 \u0623\u0646 \u062a\u063a\u0631\u0628 \u0627\u0644\u0634\u0645\u0633\u00bb \u0628\u0645\u0639\u0646\u0627\u0647.",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Included as the opening item of the morning/evening chapter.",
    sourceUrl: "https://sunnah.com/hisn%3A75a",
  },
  {
    id: "m-hm-75",
    category: "morning",
    orderIndex: 1,
    arabicText:
      "\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0645\u0650\u0646\u064e \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062c\u0650\u064a\u0645\u0650. \ufd3f\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e \u0627\u0644\u0652\u062d\u064e\u064a\u0651\u064f \u0627\u0644\u0652\u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f \u0644\u0627\u064e \u062a\u064e\u0623\u0652\u062e\u064f\u0630\u064f\u0647\u064f \u0633\u0650\u0646\u064e\u0629\u064c \u0648\u064e\u0644\u0627\u064e \u0646\u064e\u0648\u0652\u0645\u064c \u0644\u0651\u064e\u0647\u064f \u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0645\u064e\u0646 \u0630\u064e\u0627 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064e\u0634\u0652\u0641\u064e\u0639\u064f \u0639\u0650\u0646\u0652\u062f\u064e\u0647\u064f \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0625\u0650\u0630\u0652\u0646\u0650\u0647\u0650 \u064a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0645\u064e\u0627 \u0628\u064e\u064a\u0652\u0646\u064e \u0623\u064e\u064a\u0652\u062f\u0650\u064a\u0647\u0650\u0645\u0652 \u0648\u064e\u0645\u064e\u0627 \u062e\u064e\u0644\u0652\u0641\u064e\u0647\u064f\u0645\u0652 \u0648\u064e\u0644\u0627\u064e \u064a\u064f\u062d\u0650\u064a\u0637\u064f\u0648\u0646\u064e \u0628\u0650\u0634\u064e\u064a\u0652\u0621\u064d \u0645\u0651\u0650\u0646\u0652 \u0639\u0650\u0644\u0652\u0645\u0650\u0647\u0650 \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0645\u064e\u0627 \u0634\u064e\u0627\u0621 \u0648\u064e\u0633\u0650\u0639\u064e \u0643\u064f\u0631\u0652\u0633\u0650\u064a\u0651\u064f\u0647\u064f \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u064e \u0648\u064e\u0644\u0627\u064e \u064a\u064e\u0624\u064f\u0648\u062f\u064f\u0647\u064f \u062d\u0650\u0641\u0652\u0638\u064f\u0647\u064f\u0645\u064e\u0627 \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u064f\ufd3e",
    transliteration:
      "A\u02bf\u016bdhu bill\u0101hi min ash-shay\u1e6d\u0101ni \u2019r-raj\u012bm. All\u0101hu l\u0101 il\u0101ha ill\u0101 huwa \u2019l-\u1e24ayyul-Qayy\u016bm, l\u0101 ta\u2019khudhuhu sinatun wa l\u0101 nawm, lahu m\u0101 fis-sam\u0101w\u0101ti wa m\u0101 fil-ar\u1e0d, man dhal-ladh\u012b yashfa\u02bfu \u02bfindahu ill\u0101 bi\u2019idhnih, ya\u02bflamu m\u0101 bayna ayd\u012bhim wa m\u0101 khalfahum, wa l\u0101 yu\u1e25\u012b\u1e6d\u016bna bi shay\u2019in min \u02bfilmihi ill\u0101 bim\u0101 sh\u0101\u2019, wasi\u02bfa kursiyyuhus-sam\u0101w\u0101ti wal-ar\u1e0d, wa l\u0101 ya\u2019\u016bduhu \u1e25if\u1e93uhum\u0101, wa huwal-\u02bfAliyyul-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah\u2014there is none worthy of worship except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and earth. None can intercede except by His permission. He knows what is before and behind them; they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and earth, and preserving them does not tire Him. He is the Most High, the Magnificent.",
    benefit: "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Qur\u2019an 2:255; Al-Hakim 1/562; Hisn al-Muslim 75.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0623\u064f\u062c\u064a\u0631 \u0645\u0646 \u0627\u0644\u062c\u0646 \u062d\u062a\u0649 \u064a\u0645\u0633\u064a\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0623\u064f\u062c\u064a\u0631 \u0645\u0646\u0647\u0645 \u062d\u062a\u0649 \u064a\u0635\u0628\u062d.",
    authenticityNote:
      "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A75",
  },
  {
    id: "m-hm-76a",
    category: "morning",
    orderIndex: 2,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650. \ufd3f\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c \u06dd \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0627\u0644\u0635\u0651\u064e\u0645\u064e\u062f\u064f \u06dd \u0644\u064e\u0645\u0652 \u064a\u064e\u0644\u0650\u062f\u0652 \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064f\u0648\u0644\u064e\u062f\u0652 \u06dd \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064e\u0643\u064f\u0646 \u0644\u0651\u064e\u0647\u064f \u0643\u064f\u0641\u064f\u0648\u0627\u064b \u0623\u064e\u062d\u064e\u062f\u064c\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul huwall\u0101hu a\u1e25ad. All\u0101hu\u1e63-\u1e63amad. Lam yalid wa lam y\u016blad. Wa lam yakun lahu kufuwan a\u1e25ad.",
    translation:
      "Say: He is Allah, One. Allah, the Self-Sufficient. He neither begets nor is begotten, and none is comparable to Him.",
    benefit: "Recited together with al-Falaq and an-Nas three times each.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0645\u0646 \u0633\u0623\u0644\u0647 \u0645\u0627 \u064a\u0642\u0648\u0644 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d \u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u0649: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Falaq and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "m-hm-76b",
    category: "morning",
    orderIndex: 3,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650. \ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0641\u064e\u0644\u064e\u0642\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u062e\u064e\u0644\u064e\u0642\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u063a\u064e\u0627\u0633\u0650\u0642\u064d \u0625\u0650\u0630\u064e\u0627 \u0648\u064e\u0642\u064e\u0628\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0641\u0651\u064e\u0627\u062b\u064e\u0627\u062a\u0650 \u0641\u0650\u064a \u0627\u0644\u0652\u0639\u064f\u0642\u064e\u062f\u0650 \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u062d\u064e\u0627\u0633\u0650\u062f\u064d \u0625\u0650\u0630\u064e\u0627 \u062d\u064e\u0633\u064e\u062f\u064e\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbil-falaq. Min sharri m\u0101 khalaq. Wa min sharri gh\u0101siqin idh\u0101 waqab. Wa min sharrin-naff\u0101th\u0101ti fil-\u02bfuqad. Wa min sharri \u1e25\u0101sidin idh\u0101 \u1e25asad.",
    translation:
      "Say: I seek refuge in the Lord of daybreak, from the evil of what He created, from the evil of darkness when it settles, from the evil of those who blow on knots, and from the evil of the envier when he envies.",
    benefit: "Recited together with al-Ikhlas and an-Nas three times each.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "m-hm-76c",
    category: "morning",
    orderIndex: 4,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650. \ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u064e\u0644\u0650\u0643\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0625\u0650\u0644\u064e\u0647\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0652\u0648\u064e\u0633\u0652\u0648\u064e\u0627\u0633\u0650 \u0627\u0644\u0652\u062e\u064e\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064f\u0648\u064e\u0633\u0652\u0648\u0650\u0633\u064f \u0641\u0650\u064a \u0635\u064f\u062f\u064f\u0648\u0631\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u062c\u0650\u0646\u0651\u064e\u0629\u0650 \u0648\u064e\u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbin-n\u0101s. Malikin-n\u0101s. Il\u0101hin-n\u0101s. Min sharril-wasw\u0101sil-khann\u0101s. Alladh\u012b yuwaswisu f\u012b \u1e63ud\u016brin-n\u0101s. Minal-jinnati wan-n\u0101s.",
    translation:
      "Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the retreating whisperer who whispers in people\u2019s hearts, from jinn and mankind.",
    benefit: "Recited together with al-Ikhlas and al-Falaq three times each.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and al-Falaq three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "m-hm-77m",
    category: "morning",
    orderIndex: 5,
    arabicText:
      "\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u064e \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u0650 \u0648\u064e\u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u0650 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064e\u0633\u064e\u0644\u0650 \u0648\u064e\u0633\u064f\u0648\u0621\u0650 \u0627\u0644\u0652\u0643\u0650\u0628\u064e\u0631\u0650. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0646\u0651\u064e\u0627\u0631\u0650 \u0648\u064e\u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650.",
    transliteration:
      "A\u1e63ba\u1e25n\u0101 wa a\u1e63ba\u1e25al-mulku lill\u0101h, wal\u1e25amdu lill\u0101h, l\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br. Rabbi as\u2019aluka khayra m\u0101 f\u012b h\u0101dh\u0101 \u2019l-yawmi wa khayra m\u0101 ba\u02bfdah, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012b h\u0101dh\u0101 \u2019l-yawmi wa sharri m\u0101 ba\u02bfdah. Rabbi a\u02bf\u016bdhu bika minal-kasali wa s\u016b\u2019il-kibar. Rabbi a\u02bf\u016bdhu bika min \u02bfadh\u0101bin fin-n\u0101ri wa \u02bfadh\u0101bin fil-qabr.",
    translation:
      "We have entered the morning and dominion belongs to Allah. Praise is for Allah. None is worthy of worship but Allah alone, without partner; His is the dominion and praise, and He is able to do all things. My Lord, I ask You for the good of this day and what follows it, and I seek refuge in You from the evil of this day and what follows it. My Lord, I seek refuge in You from laziness and the hardships of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.",
    benefit: "Use the evening wording in the evening row.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 4/2088; Hisn al-Muslim 77.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0625\u0630\u0627 \u0623\u0635\u0628\u062d \u0642\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u0630\u0643\u0631\u060c \u0648\u0641\u064a \u0631\u0648\u0627\u064a\u0629 \u0645\u0633\u0644\u0645: \u00ab\u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u0649 \u0642\u0627\u0644: \u0623\u0645\u0633\u064a\u0646\u0627 \u0648\u0623\u0645\u0633\u0649 \u0627\u0644\u0645\u0644\u0643 \u0644\u0644\u0647...\u00bb \u0645\u0639 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u064a\u0648\u0645 \u0625\u0644\u0649 \u0627\u0644\u0644\u064a\u0644\u0629.",
    authenticityNote: "Sahih Muslim.",
    notes: "Use the evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A77",
  },
  {
    id: "m-hm-78m",
    category: "morning",
    orderIndex: 8,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0628\u0650\u0643\u064e \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u062d\u0652\u064a\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u0645\u064f\u0648\u062a\u064f\u060c \u0648\u064e\u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e \u0627\u0644\u0646\u0651\u064f\u0634\u064f\u0648\u0631\u064f.",
    transliteration:
      "All\u0101humma bika a\u1e63ba\u1e25n\u0101, wa bika amsayn\u0101, wa bika na\u1e25y\u0101, wa bika nam\u016bt, wa ilaykan-nush\u016br.",
    translation:
      "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
    benefit: "Use the evening wording in the evening row.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi 5/466; Abu Dawud 4/317; Ibn Majah; Hisn al-Muslim 78.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0639\u0644\u0651\u0645 \u0623\u0635\u062d\u0627\u0628\u0647 \u0623\u0646 \u064a\u0642\u0648\u0644\u0648\u0627 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d\u0648\u0627: \u00ab\u0627\u0644\u0644\u0647\u0645 \u0628\u0643 \u0623\u0635\u0628\u062d\u0646\u0627 \u0648\u0628\u0643 \u0623\u0645\u0633\u064a\u0646\u0627 \u0648\u0628\u0643 \u0646\u062d\u064a\u0627 \u0648\u0628\u0643 \u0646\u0645\u0648\u062a \u0648\u0625\u0644\u064a\u0643 \u0627\u0644\u0646\u0634\u0648\u0631\u00bb.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "Use the evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A78",
  },
  {
    id: "m-hm-79",
    category: "morning",
    orderIndex: 9,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0631\u064e\u0628\u0651\u0650\u064a \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u062e\u064e\u0644\u064e\u0642\u0652\u062a\u064e\u0646\u0650\u064a \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0639\u064e\u0647\u0652\u062f\u0650\u0643\u064e \u0648\u064e\u0648\u064e\u0639\u0652\u062f\u0650\u0643\u064e \u0645\u064e\u0627 \u0627\u0633\u0652\u062a\u064e\u0637\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0635\u064e\u0646\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0644\u064e\u0643\u064e \u0628\u0650\u0646\u0650\u0639\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0639\u064e\u0644\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0628\u0650\u0630\u064e\u0646\u0652\u0628\u0650\u064a\u060c \u0641\u064e\u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a\u060c \u0641\u064e\u0625\u0650\u0646\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u064a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0630\u0651\u064f\u0646\u064f\u0648\u0628\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma anta Rabb\u012b l\u0101 il\u0101ha ill\u0101 ant, khalaqtan\u012b wa ana \u02bfabduk, wa ana \u02bfal\u0101 \u02bfahdika wa wa\u02bfdika m\u0101 ista\u1e6da\u02bft, a\u02bf\u016bdhu bika min sharri m\u0101 \u1e63ana\u02bft, ab\u016b\u2019u laka bini\u02bfmatika \u02bfalayy, wa ab\u016b\u2019u bidhanb\u012b, faghfir l\u012b, fa innahu l\u0101 yaghfirudh-dhun\u016bba ill\u0101 ant.",
    translation:
      "O Allah, You are my Lord; none is worthy of worship but You. You created me and I am Your servant. I keep Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 7/150; Hisn al-Muslim 79.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0633\u064e\u064a\u0651\u0650\u062f\u064f \u0627\u0644\u0650\u0627\u0633\u0652\u062a\u0650\u063a\u0652\u0641\u064e\u0627\u0631\u0650...\u00bb \u062b\u0645 \u0630\u0643\u0631\u0647\u060c \u0648\u0642\u0627\u0644: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u0651\u064e\u0647\u064e\u0627\u0631\u0650 \u0645\u064f\u0648\u0642\u0650\u0646\u064b\u0627 \u0628\u0650\u0647\u064e\u0627 \u0641\u064e\u0645\u064e\u0627\u062a\u064e \u0645\u0650\u0646\u0652 \u064a\u064e\u0648\u0652\u0645\u0650\u0647\u0650... \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u060c \u0648\u064e\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u0650... \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u00bb.",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A79",
  },
  {
    id: "m-hm-80m",
    category: "morning",
    orderIndex: 10,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u062a\u064f \u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f \u062d\u064e\u0645\u064e\u0644\u064e\u0629\u064e \u0639\u064e\u0631\u0652\u0634\u0650\u0643\u064e\u060c \u0648\u064e\u0645\u064e\u0644\u0627\u064e\u0626\u0650\u0643\u064e\u062a\u064e\u0643\u064e\u060c \u0648\u064e\u062c\u064e\u0645\u0650\u064a\u0639\u064e \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0623\u064e\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u0651\u064e \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064b\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e \u0648\u064e\u0631\u064e\u0633\u064f\u0648\u0644\u064f\u0643\u064e.",
    transliteration:
      "All\u0101humma inn\u012b a\u1e63ba\u1e25tu ush-hiduka, wa ush-hidu \u1e25amalata \u02bfarshik, wa mal\u0101\u2019ikataka, wa jam\u012b\u02bfa khalqik, annaka antall\u0101hu l\u0101 il\u0101ha ill\u0101 ant, wa\u1e25daka l\u0101 shar\u012bka lak, wa anna Mu\u1e25ammadan \u02bfabduka wa ras\u016bluk.",
    translation:
      "O Allah, this morning I call You, the bearers of Your Throne, Your angels, and all Your creation to witness that You are Allah; none is worthy of worship but You alone, without partner, and that Muhammad is Your servant and Messenger.",
    benefit: "Use evening wording in the evening row.",
    repetitionCount: 4,
    countLabel: "4",
    sourceReference:
      "Abu Dawud 4/317; Al-Bukhari in Al-Adab al-Mufrad; An-Nasa\u2019i; Ibn as-Sunni; Hisn al-Muslim 80.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0623\u0648 \u064a\u0645\u0633\u064a \u0645\u0631\u0629 \u0623\u0639\u062a\u0642 \u0627\u0644\u0644\u0647 \u0631\u0628\u0639\u064e\u0647 \u0645\u0646 \u0627\u0644\u0646\u0627\u0631\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0645\u0631\u062a\u064a\u0646 \u0623\u0639\u062a\u0642 \u0646\u0635\u0641\u0647\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0623\u0639\u062a\u0642 \u062b\u0644\u0627\u062b\u0629 \u0623\u0631\u0628\u0627\u0639\u0647\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0623\u0631\u0628\u0639\u064b\u0627 \u0623\u0639\u062a\u0642\u0647 \u0627\u0644\u0644\u0647 \u0645\u0646 \u0627\u0644\u0646\u0627\u0631.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A80",
  },
  {
    id: "m-hm-81m",
    category: "morning",
    orderIndex: 11,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0645\u064e\u0627 \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u064e \u0628\u0650\u064a \u0645\u0650\u0646\u0652 \u0646\u0650\u0639\u0652\u0645\u064e\u0629\u064d\u060c \u0623\u064e\u0648\u0652 \u0628\u0650\u0623\u064e\u062d\u064e\u062f\u064d \u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0641\u064e\u0645\u0650\u0646\u0652\u0643\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0641\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0634\u0651\u064f\u0643\u0652\u0631\u064f.",
    transliteration:
      "All\u0101humma m\u0101 a\u1e63ba\u1e25a b\u012b min ni\u02bfmatin, aw bi-a\u1e25adin min khalqik, fa minka wa\u1e25daka l\u0101 shar\u012bka lak, falakal-\u1e25amdu wa lakash-shukr.",
    translation:
      "O Allah, whatever blessing has reached me or any of Your creation this morning is from You alone, without partner; all praise and thanks belong to You.",
    benefit: "Use evening wording in the evening row.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Abu Dawud 4/318; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 7; Ibn as-Sunni no. 41; Ibn Hibban no. 2361; Hisn al-Muslim 81.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0641\u0642\u062f \u0623\u062f\u0651\u0649 \u0634\u0643\u0631 \u064a\u0648\u0645\u0647\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0641\u0642\u062f \u0623\u062f\u0651\u0649 \u0634\u0643\u0631 \u0644\u064a\u0644\u062a\u0647.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A81",
  },
  {
    id: "m-hm-82",
    category: "morning",
    orderIndex: 12,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u062f\u064e\u0646\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0633\u064e\u0645\u0652\u0639\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u0635\u064e\u0631\u0650\u064a\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064f\u0641\u0652\u0631\u0650 \u0648\u064e\u0627\u0644\u0652\u0641\u064e\u0642\u0652\u0631\u0650\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u0650 \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma \u02bf\u0101fin\u012b f\u012b badan\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b sam\u02bf\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b ba\u1e63ar\u012b, l\u0101 il\u0101ha ill\u0101 ant. All\u0101humma inn\u012b a\u02bf\u016bdhu bika mina \u2019l-kufri wal-faqr, wa a\u02bf\u016bdhu bika min \u02bfadh\u0101bil-qabr, l\u0101 il\u0101ha ill\u0101 ant.",
    translation:
      "O Allah, grant me wellbeing in my body. O Allah, preserve my hearing. O Allah, preserve my sight. None is worthy of worship but You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None is worthy of worship but You.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/324; Ahmad 5/42; An-Nasa\u2019i; Ibn as-Sunni; Al-Adab al-Mufrad; Hisn al-Muslim 82.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0639\u0644\u0651\u0645 \u0623\u0646 \u064a\u0642\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u062f\u0639\u0627\u0621 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062d\u064a\u0646 \u064a\u0645\u0633\u064a.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A82",
  },
  {
    id: "m-hm-83",
    category: "morning",
    orderIndex: 13,
    arabicText:
      "\u062d\u064e\u0633\u0652\u0628\u0650\u064a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e\u060c \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650 \u062a\u064e\u0648\u064e\u0643\u0651\u064e\u0644\u0652\u062a\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0631\u064e\u0628\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0631\u0652\u0634\u0650 \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650.",
    transliteration:
      "\u1e24asbiyall\u0101hu l\u0101 il\u0101ha ill\u0101 huwa, \u02bfalayhi tawakkalt, wa huwa Rabbul-\u02bfArshil-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah is sufficient for me. None is worthy of worship but Him. Upon Him I rely, and He is the Lord of the Mighty Throne.",
    benefit: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Ibn as-Sunni no. 71; Abu Dawud 4/321; Hisn al-Muslim 83.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0633\u0628\u0639 \u0645\u0631\u0627\u062a \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0643\u0641\u0627\u0647 \u0627\u0644\u0644\u0647 \u0645\u0627 \u0623\u0647\u0645\u0651\u0647 \u0645\u0646 \u0623\u0645\u0631 \u0627\u0644\u062f\u0646\u064a\u0627 \u0648\u0627\u0644\u0622\u062e\u0631\u0629.",
    authenticityNote: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A83",
  },
  {
    id: "m-hm-84",
    category: "morning",
    orderIndex: 14,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u0627\u0644\u062f\u0651\u064f\u0646\u0652\u064a\u064e\u0627 \u0648\u064e\u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u062f\u0650\u064a\u0646\u0650\u064a \u0648\u064e\u062f\u064f\u0646\u0652\u064a\u064e\u0627\u064a\u064e \u0648\u064e\u0623\u064e\u0647\u0652\u0644\u0650\u064a \u0648\u064e\u0645\u064e\u0627\u0644\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u0633\u0652\u062a\u064f\u0631\u0652 \u0639\u064e\u0648\u0652\u0631\u064e\u0627\u062a\u0650\u064a\u060c \u0648\u064e\u0622\u0645\u0650\u0646\u0652 \u0631\u064e\u0648\u0652\u0639\u064e\u0627\u062a\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0646\u0650\u064a \u0645\u0650\u0646\u0652 \u0628\u064e\u064a\u0652\u0646\u0650 \u064a\u064e\u062f\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0641\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u064a\u064e\u0645\u0650\u064a\u0646\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u0634\u0650\u0645\u064e\u0627\u0644\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0641\u064e\u0648\u0652\u0642\u0650\u064a\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0639\u064e\u0638\u064e\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0646\u0652 \u0623\u064f\u063a\u0652\u062a\u064e\u0627\u0644\u064e \u0645\u0650\u0646\u0652 \u062a\u064e\u062d\u0652\u062a\u0650\u064a.",
    transliteration:
      "All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata fid-duny\u0101 wal-\u0101khirah. All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata f\u012b d\u012bn\u012b wa duny\u0101ya wa ahl\u012b wa m\u0101l\u012b. All\u0101hummastur \u02bfawr\u0101t\u012b, wa \u0101min raw\u02bf\u0101t\u012b. All\u0101humma\u1e25fa\u1e93n\u012b min bayni yadayya, wa min khalf\u012b, wa \u02bfan yam\u012bn\u012b, wa \u02bfan shim\u0101l\u012b, wa min fawq\u012b, wa a\u02bf\u016bdhu bi\u02bfa\u1e93amatika an ught\u0101la min ta\u1e25t\u012b.",
    translation:
      "O Allah, I ask You for pardon and wellbeing in this world and the Hereafter. O Allah, I ask You for pardon and wellbeing in my religion, worldly life, family, and wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from in front, behind, my right, my left, and above; and I seek refuge in Your greatness from being taken from beneath me.",
    benefit: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud; Ibn Majah; Ahmad; An-Nasa\u2019i; Hisn al-Muslim 84.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0644\u0627 \u064a\u062f\u0639 \u0647\u0624\u0644\u0627\u0621 \u0627\u0644\u062f\u0639\u0648\u0627\u062a \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0648\u062d\u064a\u0646 \u064a\u0635\u0628\u062d.",
    authenticityNote: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A84",
  },
  {
    id: "m-hm-85",
    category: "morning",
    orderIndex: 15,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0644\u0650\u0645\u064e \u0627\u0644\u0652\u063a\u064e\u064a\u0652\u0628\u0650 \u0648\u064e\u0627\u0644\u0634\u0651\u064e\u0647\u064e\u0627\u062f\u064e\u0629\u0650\u060c \u0641\u064e\u0627\u0637\u0650\u0631\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650\u060c \u0631\u064e\u0628\u0651\u064e \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0648\u064e\u0645\u064e\u0644\u0650\u064a\u0643\u064e\u0647\u064f\u060c \u0623\u064e\u0634\u0652\u0647\u064e\u062f\u064f \u0623\u064e\u0646\u0652 \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0646\u064e\u0641\u0652\u0633\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u0634\u0650\u0631\u0652\u0643\u0650\u0647\u0650\u060c \u0648\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u062a\u064e\u0631\u0650\u0641\u064e \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0633\u064f\u0648\u0621\u064b\u0627\u060c \u0623\u064e\u0648\u0652 \u0623\u064e\u062c\u064f\u0631\u0651\u064e\u0647\u064f \u0625\u0650\u0644\u064e\u0649 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064d.",
    transliteration:
      "All\u0101humma \u02bf\u0101limal-ghaybi wash-shah\u0101dah, f\u0101\u1e6diras-sam\u0101w\u0101ti wal-ar\u1e0d, Rabba kulli shay\u2019in wa mal\u012bkah, ash-hadu an l\u0101 il\u0101ha ill\u0101 ant, a\u02bf\u016bdhu bika min sharri nafs\u012b, wa min sharrish-shay\u1e6d\u0101ni wa shirkih, wa an aqtarifa \u02bfal\u0101 nafs\u012b s\u016b\u2019an, aw ajurrahu il\u0101 Muslim.",
    translation:
      "O Allah, Knower of the unseen and the witnessed, Creator of the heavens and the earth, Lord and Sovereign of everything. I bear witness that none is worthy of worship but You. I seek refuge in You from the evil of myself, from the evil of Satan and his shirk, and from committing evil against myself or bringing it upon a Muslim.",
    benefit: "Also appears in before-sleep adhkar.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi; Abu Dawud 4/317; Hisn al-Muslim 85/109.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0623\u0628\u064a \u0628\u0643\u0631 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647: \u00ab\u0642\u064f\u0644\u0652\u0647\u064f \u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u062e\u064e\u0630\u0652\u062a\u064e \u0645\u064e\u0636\u0652\u062c\u064e\u0639\u064e\u0643\u064e\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Also appears in before-sleep adhkar.",
    sourceUrl: "https://sunnah.com/hisn%3A85",
  },
  {
    id: "m-hm-86",
    category: "morning",
    orderIndex: 16,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0644\u0627\u064e \u064a\u064e\u0636\u064f\u0631\u0651\u064f \u0645\u064e\u0639\u064e \u0627\u0633\u0652\u0645\u0650\u0647\u0650 \u0634\u064e\u064a\u0652\u0621\u064c \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0648\u064e\u0644\u0627\u064e \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0621\u0650\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f.",
    transliteration:
      "Bismill\u0101hilladh\u012b l\u0101 ya\u1e0durru ma\u02bfa ismihi shay\u2019un fil-ar\u1e0di wa l\u0101 fis-sam\u0101\u2019, wa huwas-Sam\u012b\u02bful-\u02bfAl\u012bm.",
    translation:
      "In the Name of Allah, with whose Name nothing in the earth or the heaven can harm, and He is the All-Hearing, All-Knowing.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/323; At-Tirmidhi 5/465; Ibn Majah; Ahmad; Hisn al-Muslim 86.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0645\u064e\u0627 \u0645\u0650\u0646\u0652 \u0639\u064e\u0628\u0652\u062f\u064d \u064a\u064e\u0642\u064f\u0648\u0644\u064f \u0641\u0650\u064a \u0635\u064e\u0628\u064e\u0627\u062d\u0650 \u0643\u064f\u0644\u0651\u0650 \u064a\u064e\u0648\u0652\u0645\u064d \u0648\u064e\u0645\u064e\u0633\u064e\u0627\u0621\u0650 \u0643\u064f\u0644\u0651\u0650 \u0644\u064e\u064a\u0652\u0644\u064e\u0629\u064d: \u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0644\u0627\u064e \u064a\u064e\u0636\u064f\u0631\u0651\u064f... \u062b\u064e\u0644\u0627\u064e\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d \u0641\u064e\u064a\u064e\u0636\u064f\u0631\u0651\u064e\u0647\u064f \u0634\u064e\u064a\u0652\u0621\u064c\u00bb.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A86",
  },
  {
    id: "m-hm-87",
    category: "morning",
    orderIndex: 17,
    arabicText:
      "\u0631\u064e\u0636\u0650\u064a\u062a\u064f \u0628\u0650\u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650 \u062f\u0650\u064a\u0646\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa \u0646\u064e\u0628\u0650\u064a\u0651\u064b\u0627.",
    transliteration:
      "Ra\u1e0d\u012btu bill\u0101hi Rabba, wa bil-Isl\u0101mi d\u012bna, wa bi-Mu\u1e25ammadin \ufdfa nabiyya.",
    translation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad \ufdfa as my Prophet.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Ahmad 4/337; An-Nasa\u2019i; Ibn as-Sunni; At-Tirmidhi 5/465; Hisn al-Muslim 87.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0643\u0627\u0646 \u062d\u0642\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0644\u0647 \u0623\u0646 \u064a\u0631\u0636\u064a\u0647 \u064a\u0648\u0645 \u0627\u0644\u0642\u064a\u0627\u0645\u0629.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A87",
  },
  {
    id: "m-hm-88",
    category: "morning",
    orderIndex: 18,
    arabicText:
      "\u064a\u064e\u0627 \u062d\u064e\u064a\u0651\u064f \u064a\u064e\u0627 \u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f\u060c \u0628\u0650\u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0650\u064a\u062b\u064f\u060c \u0623\u064e\u0635\u0652\u0644\u0650\u062d\u0652 \u0644\u0650\u064a \u0634\u064e\u0623\u0652\u0646\u0650\u064a \u0643\u064f\u0644\u0651\u064e\u0647\u064f\u060c \u0648\u064e\u0644\u0627\u064e \u062a\u064e\u0643\u0650\u0644\u0652\u0646\u0650\u064a \u0625\u0650\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0637\u064e\u0631\u0652\u0641\u064e\u0629\u064e \u0639\u064e\u064a\u0652\u0646\u064d.",
    transliteration:
      "Y\u0101 \u1e24ayyu y\u0101 Qayy\u016bm, bira\u1e25matika astagh\u012bth, a\u1e63li\u1e25 l\u012b sha\u2019n\u012b kullah, wa l\u0101 takiln\u012b il\u0101 nafs\u012b \u1e6darfata \u02bfayn.",
    translation:
      "O Ever-Living, O Sustainer, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself even for the blink of an eye.",
    benefit: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Hakim; Al-Albani, Sahih al-Jami\u02bf; Hisn al-Muslim 88.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f \u0623\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0623\u0648\u0635\u0649 \u0641\u0627\u0637\u0645\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647\u0627 \u0623\u0646 \u062a\u0642\u0648\u0644 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d\u062a \u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u064a\u062a: \u00ab\u064a\u0627 \u062d\u064a \u064a\u0627 \u0642\u064a\u0648\u0645 \u0628\u0631\u062d\u0645\u062a\u0643 \u0623\u0633\u062a\u063a\u064a\u062b...\u00bb",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A88",
  },
  {
    id: "m-hm-89m",
    category: "morning",
    orderIndex: 6,
    arabicText:
      "\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u064e \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0647\u064e\u0630\u064e\u0627 \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u0650: \u0641\u064e\u062a\u0652\u062d\u064e\u0647\u064f\u060c \u0648\u064e\u0646\u064e\u0635\u0652\u0631\u064e\u0647\u064f\u060c \u0648\u064e\u0646\u064f\u0648\u0631\u064e\u0647\u064f\u060c \u0648\u064e\u0628\u064e\u0631\u064e\u0643\u064e\u062a\u064e\u0647\u064f\u060c \u0648\u064e\u0647\u064f\u062f\u064e\u0627\u0647\u064f\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a\u0647\u0650 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f.",
    transliteration:
      "A\u1e63ba\u1e25n\u0101 wa a\u1e63ba\u1e25al-mulku lill\u0101hi Rabbil-\u02bf\u0101lam\u012bn. All\u0101humma inn\u012b as\u2019aluka khayra h\u0101dh\u0101 \u2019l-yawm: fat\u1e25ahu, wa na\u1e63rahu, wa n\u016brahu, wa barakatahu, wa hud\u0101h, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012bhi wa sharri m\u0101 ba\u02bfdah.",
    translation:
      "We have entered the morning, and dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this day: its opening, victory, light, blessing, and guidance; and I seek refuge in You from the evil within it and the evil after it.",
    benefit: "Use evening wording in the evening row.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/322; Hisn al-Muslim 89.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0648\u0631\u062f \u0641\u064a \u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062d \u0648\u0627\u0644\u0645\u0633\u0627\u0621 \u0633\u0624\u0627\u0644 \u062e\u064a\u0631 \u0627\u0644\u064a\u0648\u0645/\u0627\u0644\u0644\u064a\u0644\u0629 \u0648\u0627\u0644\u0627\u0633\u062a\u0639\u0627\u0630\u0629 \u0645\u0646 \u0634\u0631\u0647\u0627.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A89",
  },
  {
    id: "m-hm-90m",
    category: "morning",
    orderIndex: 7,
    arabicText:
      "\u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0641\u0650\u0637\u0652\u0631\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0643\u064e\u0644\u0650\u0645\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u062e\u0652\u0644\u0627\u064e\u0635\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u062f\u0650\u064a\u0646\u0650 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0645\u0650\u0644\u0651\u064e\u0629\u0650 \u0623\u064e\u0628\u0650\u064a\u0646\u064e\u0627 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e\u060c \u062d\u064e\u0646\u0650\u064a\u0641\u064b\u0627 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064b\u0627\u060c \u0648\u064e\u0645\u064e\u0627 \u0643\u064e\u0627\u0646\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0645\u064f\u0634\u0652\u0631\u0650\u0643\u0650\u064a\u0646\u064e.",
    transliteration:
      "A\u1e63ba\u1e25n\u0101 \u02bfal\u0101 fi\u1e6dratil-Isl\u0101m, wa \u02bfal\u0101 kalimatil-ikhl\u0101\u1e63, wa \u02bfal\u0101 d\u012bni nabiyyin\u0101 Mu\u1e25ammadin \ufdfa, wa \u02bfal\u0101 millati ab\u012bn\u0101 Ibr\u0101h\u012bm, \u1e25an\u012bfan Musliman, wa m\u0101 k\u0101na minal-mushrik\u012bn.",
    translation:
      "We have entered the morning upon the natural religion of Islam, the word of sincerity, the religion of our Prophet Muhammad \ufdfa, and the way of our father Ibrahim, upright and Muslim, and he was not of the polytheists.",
    benefit: "Use evening wording in the evening row.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Ahmad 3/406-407 and 5/123; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 34; At-Tirmidhi 4/209; Hisn al-Muslim 90.",
    preferredTiming: "Morning after Fajr.",
    hadithText:
      "\u0648\u0631\u062f \u0641\u064a \u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0635\u0628\u0627\u062d \u0648\u0627\u0644\u0645\u0633\u0627\u0621 \u062a\u062c\u062f\u064a\u062f \u0627\u0644\u062f\u062e\u0648\u0644 \u0639\u0644\u0649 \u0641\u0637\u0631\u0629 \u0627\u0644\u0625\u0633\u0644\u0627\u0645 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0625\u062e\u0644\u0627\u0635 \u0648\u062f\u064a\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0648\u0645\u0644\u0629 \u0625\u0628\u0631\u0627\u0647\u064a\u0645.",
    authenticityNote: "Included in Hisn al-Muslim; grading not displayed on the Sunnah.com page.",
    notes: "Use evening wording in the evening row.",
    sourceUrl: "https://sunnah.com/hisn%3A90",
  },
  {
    id: "m-hm-91",
    category: "morning",
    orderIndex: 19,
    arabicText:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650.",
    transliteration: "Sub\u1e25\u0101nall\u0101hi wa bi\u1e25amdih.",
    translation: "Glory and praise be to Allah.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari 4/2071; Hisn al-Muslim 91.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e \u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650 \u0641\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064d \u0645\u0650\u0627\u0626\u064e\u0629\u064e \u0645\u064e\u0631\u0651\u064e\u0629\u064d \u062d\u064f\u0637\u0651\u064e\u062a\u0652 \u062e\u064e\u0637\u064e\u0627\u064a\u064e\u0627\u0647\u064f \u0648\u064e\u0625\u0650\u0646\u0652 \u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0645\u0650\u062b\u0652\u0644\u064e \u0632\u064e\u0628\u064e\u062f\u0650 \u0627\u0644\u0652\u0628\u064e\u062d\u0652\u0631\u0650\u00bb\u060c \u0648\u0648\u0631\u062f \u0641\u0636\u0644\u0647\u0627 \u0635\u0628\u0627\u062d\u064b\u0627 \u0648\u0645\u0633\u0627\u0621\u064b.",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A91",
  },
  {
    id: "m-hm-92",
    category: "morning",
    orderIndex: 20,
    arabicText:
      "\u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c.",
    transliteration:
      "L\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br.",
    translation:
      "None is worthy of worship but Allah alone, without partner. His is the dominion and praise, and He is able to do all things.",
    benefit: "Same wording as HM-93 but different count and virtue.",
    repetitionCount: 10,
    countLabel: "10; or 1 when unable",
    sourceReference: "An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 24; Ahmad; Abu Dawud; Ibn Majah; Hisn al-Muslim 92.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0639\u0634\u0631 \u0645\u0631\u0627\u062a \u0635\u0628\u0627\u062d\u064b\u0627 \u0643\u064f\u062a\u0628 \u0644\u0647 \u0639\u0634\u0631 \u062d\u0633\u0646\u0627\u062a \u0648\u0645\u064f\u062d\u064a\u062a \u0639\u0646\u0647 \u0639\u0634\u0631 \u0633\u064a\u0626\u0627\u062a\u060c \u0648\u0643\u0627\u0646 \u0644\u0647 \u0639\u062f\u0644 \u0639\u0634\u0631 \u0631\u0642\u0627\u0628\u060c \u0648\u062d\u064f\u0641\u0638 \u0645\u0646 \u0627\u0644\u0634\u064a\u0637\u0627\u0646 \u062d\u062a\u0649 \u064a\u0645\u0633\u064a\u060c \u0648\u0644\u0647 \u0645\u062b\u0644 \u0630\u0644\u0643 \u0641\u064a \u0627\u0644\u0645\u0633\u0627\u0621.",
    authenticityNote: "Sahih/Hasan reports as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Same wording as HM-93 but different count and virtue.",
    sourceUrl: "https://sunnah.com/hisn%3A92",
  },
  {
    id: "m-hm-93",
    category: "morning",
    orderIndex: 21,
    arabicText:
      "\u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c.",
    transliteration:
      "L\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br.",
    translation:
      "None is worthy of worship but Allah alone, without partner. His is the dominion and praise, and He is able to do all things.",
    benefit: "Same wording as HM-92 but with 100 count.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari 4/95; Muslim 4/2071; Hisn al-Muslim 93.",
    preferredTiming: "Upon rising in the morning; can be recited any time during the day.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f... \u0641\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064d \u0645\u0650\u0627\u0626\u064e\u0629\u064e \u0645\u064e\u0631\u0651\u064e\u0629\u064d \u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0644\u064e\u0647\u064f \u0639\u064e\u062f\u0652\u0644\u064e \u0639\u064e\u0634\u0652\u0631\u0650 \u0631\u0650\u0642\u064e\u0627\u0628\u064d... \u0648\u064e\u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0644\u064e\u0647\u064f \u062d\u0650\u0631\u0652\u0632\u064b\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u064a\u064e\u0648\u0652\u0645\u064e\u0647\u064f \u0630\u064e\u0644\u0650\u0643\u064e \u062d\u064e\u062a\u0651\u064e\u0649 \u064a\u064f\u0645\u0652\u0633\u0650\u064a\u064e\u00bb.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Same wording as HM-92 but with 100 count.",
    sourceUrl: "https://sunnah.com/hisn%3A93",
  },
  {
    id: "m-hm-94",
    category: "morning",
    orderIndex: 22,
    arabicText:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650\u060c \u0639\u064e\u062f\u064e\u062f\u064e \u062e\u064e\u0644\u0652\u0642\u0650\u0647\u0650\u060c \u0648\u064e\u0631\u0650\u0636\u064e\u0627 \u0646\u064e\u0641\u0652\u0633\u0650\u0647\u0650\u060c \u0648\u064e\u0632\u0650\u0646\u064e\u0629\u064e \u0639\u064e\u0631\u0652\u0634\u0650\u0647\u0650\u060c \u0648\u064e\u0645\u0650\u062f\u064e\u0627\u062f\u064e \u0643\u064e\u0644\u0650\u0645\u064e\u0627\u062a\u0650\u0647\u0650.",
    transliteration:
      "Sub\u1e25\u0101nall\u0101hi wa bi\u1e25amdih, \u02bfadada khalqih, wa ri\u1e0d\u0101 nafsih, wa zinata \u02bfarshih, wa mid\u0101da kalim\u0101tih.",
    translation:
      "Glory and praise be to Allah, by the number of His creation, by His pleasure, by the weight of His Throne, and by the extent of His words.",
    benefit: "Sahih Muslim.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Muslim 4/2090; Hisn al-Muslim 94.",
    preferredTiming: "Upon rising in the morning.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u062c\u0648\u064a\u0631\u064a\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647\u0627: \u00ab\u0644\u064e\u0642\u064e\u062f\u0652 \u0642\u064f\u0644\u0652\u062a\u064f \u0628\u064e\u0639\u0652\u062f\u064e\u0643\u0650 \u0623\u064e\u0631\u0652\u0628\u064e\u0639\u064e \u0643\u064e\u0644\u0650\u0645\u064e\u0627\u062a\u064d \u062b\u064e\u0644\u0627\u064e\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d \u0644\u064e\u0648\u0652 \u0648\u064f\u0632\u0650\u0646\u064e\u062a\u0652 \u0628\u0650\u0645\u064e\u0627 \u0642\u064f\u0644\u0652\u062a\u0650 \u0645\u064f\u0646\u0652\u0630\u064f \u0627\u0644\u0652\u064a\u064e\u0648\u0652\u0645\u0650 \u0644\u064e\u0648\u064e\u0632\u064e\u0646\u064e\u062a\u0652\u0647\u064f\u0646\u0651\u064e...\u00bb \u062b\u0645 \u0630\u0643\u0631 \u0647\u0630\u0627 \u0627\u0644\u0630\u0643\u0631.",
    authenticityNote: "Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A94",
  },
  {
    id: "m-hm-95",
    category: "morning",
    orderIndex: 23,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0639\u0650\u0644\u0652\u0645\u064b\u0627 \u0646\u064e\u0627\u0641\u0650\u0639\u064b\u0627\u060c \u0648\u064e\u0631\u0650\u0632\u0652\u0642\u064b\u0627 \u0637\u064e\u064a\u0651\u0650\u0628\u064b\u0627\u060c \u0648\u064e\u0639\u064e\u0645\u064e\u0644\u064b\u0627 \u0645\u064f\u062a\u064e\u0642\u064e\u0628\u0651\u064e\u0644\u064b\u0627.",
    transliteration:
      "All\u0101humma inn\u012b as\u2019aluka \u02bfilman n\u0101fi\u02bfa, wa rizqan \u1e6dayyiba, wa \u02bfamalan mutaqabbala.",
    translation: "O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds.",
    benefit: "Hasan chain according to Ibn al-Qayyim as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Ibn as-Sunni no. 54; Ibn Majah no. 925; Hisn al-Muslim 95.",
    preferredTiming: "After Fajr / upon rising in the morning.",
    hadithText:
      "\u0648\u0631\u062f \u0623\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0643\u0627\u0646 \u064a\u0642\u0648\u0644 \u0628\u0639\u062f \u0635\u0644\u0627\u0629 \u0627\u0644\u0635\u0628\u062d: \u00ab\u0627\u0644\u0644\u0647\u0645 \u0625\u0646\u064a \u0623\u0633\u0623\u0644\u0643 \u0639\u0644\u0645\u064b\u0627 \u0646\u0627\u0641\u0639\u064b\u0627 \u0648\u0631\u0632\u0642\u064b\u0627 \u0637\u064a\u0628\u064b\u0627 \u0648\u0639\u0645\u0644\u0627\u064b \u0645\u062a\u0642\u0628\u0644\u0627\u064b\u00bb.",
    authenticityNote: "Hasan chain according to Ibn al-Qayyim as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A95",
  },
  {
    id: "m-hm-96",
    category: "morning",
    orderIndex: 24,
    arabicText:
      "\u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0648\u064e\u0623\u064e\u062a\u064f\u0648\u0628\u064f \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650.",
    transliteration: "Astaghfirull\u0101ha wa at\u016bbu ilayh.",
    translation: "I seek Allah\u2019s forgiveness and repent to Him.",
    benefit: "Hisn notes: recite 100 times during the day.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari; Muslim 4/2075; Hisn al-Muslim 96.",
    preferredTiming: "During the day; suitable to include in morning/evening routine.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0642\u0648\u0644 \u0641\u064a \u0627\u0644\u0645\u062c\u0644\u0633 \u0627\u0644\u0648\u0627\u062d\u062f: \u00ab\u0631\u064e\u0628\u0651\u0650 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0648\u064e\u062a\u064f\u0628\u0652 \u0639\u064e\u0644\u064e\u064a\u0651\u064e \u0625\u0650\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u062a\u0651\u064e\u0648\u0651\u064e\u0627\u0628\u064f \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u064f\u00bb \u0645\u0631\u0627\u062a \u0643\u062b\u064a\u0631\u0629\u060c \u0648\u0648\u0631\u062f \u0639\u0646\u0647 \u0627\u0644\u0627\u0633\u062a\u063a\u0641\u0627\u0631 \u0645\u0627\u0626\u0629 \u0645\u0631\u0629 \u0641\u064a \u0627\u0644\u064a\u0648\u0645.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Hisn notes: recite 100 times during the day.",
    sourceUrl: "https://sunnah.com/hisn%3A96",
  },
  {
    id: "m-hm-98",
    category: "morning",
    orderIndex: 25,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0635\u064e\u0644\u0651\u0650 \u0648\u064e\u0633\u064e\u0644\u0651\u0650\u0645\u0652 \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d.",
    transliteration: "All\u0101humma \u1e63alli wa sallim \u02bfal\u0101 nabiyyin\u0101 Mu\u1e25ammad.",
    translation: "O Allah, send prayers and peace upon our Prophet Muhammad.",
    benefit: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 10,
    countLabel: "10",
    sourceReference: "At-Tabarani; Haythami Majma\u02bf az-Zawa\u2019id 10/120; Hisn al-Muslim 98.",
    preferredTiming: "Morning and evening.",
    hadithText:
      "\u0648\u0631\u062f: \u00ab\u0645\u064e\u0646\u0652 \u0635\u064e\u0644\u0651\u064e\u0649 \u0639\u064e\u0644\u064e\u064a\u0651\u064e \u062d\u0650\u064a\u0646\u064e \u064a\u064f\u0635\u0652\u0628\u0650\u062d\u064f \u0639\u064e\u0634\u0652\u0631\u064b\u0627\u060c \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u064a\u064f\u0645\u0652\u0633\u0650\u064a \u0639\u064e\u0634\u0652\u0631\u064b\u0627\u060c \u0623\u064e\u062f\u0652\u0631\u064e\u0643\u064e\u062a\u0652\u0647\u064f \u0634\u064e\u0641\u064e\u0627\u0639\u064e\u062a\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064e \u0627\u0644\u0652\u0642\u0650\u064a\u064e\u0627\u0645\u064e\u0629\u0650\u00bb.",
    authenticityNote: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A98",
  },
];

const EVENING_AZKAR: Zikr[] = [
  {
    id: "e-hm-75a",
    category: "evening",
    orderIndex: 0,
    arabicText:
      "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f\u060c \u0648\u064e\u0627\u0644\u0635\u0651\u064e\u0644\u0627\u064e\u0629\u064f \u0648\u064e\u0627\u0644\u0633\u0651\u064e\u0644\u0627\u064e\u0645\u064f \u0639\u064e\u0644\u064e\u0649 \u0645\u064e\u0646\u0652 \u0644\u0627\u064e \u0646\u064e\u0628\u0650\u064a\u0651\u064e \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064f",
    transliteration:
      "Al\u1e25amdulill\u0101hi wa\u1e25dah, wa\u1e63-\u1e63al\u0101tu was-sal\u0101mu \u02bfal\u0101 man l\u0101 nabiyya ba\u02bfdah.",
    translation:
      "All praise is due to Allah alone, and prayers and peace be upon the one after whom there is no Prophet.",
    benefit: "Included as the opening item of the morning/evening chapter.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud no. 3667; Hisn al-Muslim 75a.",
    preferredTiming:
      "Morning: after Fajr until sunrise. Evening: after \u2018Asr until sunset as a strong recommended dhikr sitting.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0644\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u0639\u064f\u062f\u064e \u0645\u064e\u0639\u064e \u0642\u064e\u0648\u0652\u0645\u064d \u064a\u064e\u0630\u0652\u0643\u064f\u0631\u064f\u0648\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0645\u0650\u0646\u0652 \u0635\u064e\u0644\u0627\u064e\u0629\u0650 \u0627\u0644\u0652\u063a\u064e\u062f\u064e\u0627\u0629\u0650 \u062d\u064e\u062a\u0651\u064e\u0649 \u062a\u064e\u0637\u0652\u0644\u064f\u0639\u064e \u0627\u0644\u0634\u0651\u064e\u0645\u0652\u0633\u064f \u0623\u064e\u062d\u064e\u0628\u0651\u064f \u0625\u0650\u0644\u064e\u064a\u0651\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0646\u0652 \u0623\u064f\u0639\u0652\u062a\u0650\u0642\u064e \u0623\u064e\u0631\u0652\u0628\u064e\u0639\u064e\u0629\u064b \u0645\u0650\u0646\u0652 \u0648\u064e\u0644\u064e\u062f\u0650 \u0625\u0650\u0633\u0652\u0645\u064e\u0627\u0639\u0650\u064a\u0644\u064e... \u0648\u0645\u0646 \u0635\u0644\u0627\u0629 \u0627\u0644\u0639\u0635\u0631 \u0625\u0644\u0649 \u0623\u0646 \u062a\u063a\u0631\u0628 \u0627\u0644\u0634\u0645\u0633\u00bb \u0628\u0645\u0639\u0646\u0627\u0647.",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Included as the opening item of the morning/evening chapter.",
    sourceUrl: "https://sunnah.com/hisn%3A75a",
  },
  {
    id: "e-hm-75",
    category: "evening",
    orderIndex: 1,
    arabicText:
      "\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0645\u0650\u0646\u064e \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062c\u0650\u064a\u0645\u0650. \ufd3f\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e \u0627\u0644\u0652\u062d\u064e\u064a\u0651\u064f \u0627\u0644\u0652\u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f \u0644\u0627\u064e \u062a\u064e\u0623\u0652\u062e\u064f\u0630\u064f\u0647\u064f \u0633\u0650\u0646\u064e\u0629\u064c \u0648\u064e\u0644\u0627\u064e \u0646\u064e\u0648\u0652\u0645\u064c \u0644\u0651\u064e\u0647\u064f \u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0645\u064e\u0627 \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0645\u064e\u0646 \u0630\u064e\u0627 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064e\u0634\u0652\u0641\u064e\u0639\u064f \u0639\u0650\u0646\u0652\u062f\u064e\u0647\u064f \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0625\u0650\u0630\u0652\u0646\u0650\u0647\u0650 \u064a\u064e\u0639\u0652\u0644\u064e\u0645\u064f \u0645\u064e\u0627 \u0628\u064e\u064a\u0652\u0646\u064e \u0623\u064e\u064a\u0652\u062f\u0650\u064a\u0647\u0650\u0645\u0652 \u0648\u064e\u0645\u064e\u0627 \u062e\u064e\u0644\u0652\u0641\u064e\u0647\u064f\u0645\u0652 \u0648\u064e\u0644\u0627\u064e \u064a\u064f\u062d\u0650\u064a\u0637\u064f\u0648\u0646\u064e \u0628\u0650\u0634\u064e\u064a\u0652\u0621\u064d \u0645\u0651\u0650\u0646\u0652 \u0639\u0650\u0644\u0652\u0645\u0650\u0647\u0650 \u0625\u0650\u0644\u0627\u0651\u064e \u0628\u0650\u0645\u064e\u0627 \u0634\u064e\u0627\u0621 \u0648\u064e\u0633\u0650\u0639\u064e \u0643\u064f\u0631\u0652\u0633\u0650\u064a\u0651\u064f\u0647\u064f \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u064e \u0648\u064e\u0644\u0627\u064e \u064a\u064e\u0624\u064f\u0648\u062f\u064f\u0647\u064f \u062d\u0650\u0641\u0652\u0638\u064f\u0647\u064f\u0645\u064e\u0627 \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u064f\ufd3e",
    transliteration:
      "A\u02bf\u016bdhu bill\u0101hi min ash-shay\u1e6d\u0101ni \u2019r-raj\u012bm. All\u0101hu l\u0101 il\u0101ha ill\u0101 huwa \u2019l-\u1e24ayyul-Qayy\u016bm, l\u0101 ta\u2019khudhuhu sinatun wa l\u0101 nawm, lahu m\u0101 fis-sam\u0101w\u0101ti wa m\u0101 fil-ar\u1e0d, man dhal-ladh\u012b yashfa\u02bfu \u02bfindahu ill\u0101 bi\u2019idhnih, ya\u02bflamu m\u0101 bayna ayd\u012bhim wa m\u0101 khalfahum, wa l\u0101 yu\u1e25\u012b\u1e6d\u016bna bi shay\u2019in min \u02bfilmihi ill\u0101 bim\u0101 sh\u0101\u2019, wasi\u02bfa kursiyyuhus-sam\u0101w\u0101ti wal-ar\u1e0d, wa l\u0101 ya\u2019\u016bduhu \u1e25if\u1e93uhum\u0101, wa huwal-\u02bfAliyyul-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah\u2014there is none worthy of worship except Him, the Ever-Living, the Sustainer. Neither drowsiness nor sleep overtakes Him. To Him belongs whatever is in the heavens and earth. None can intercede except by His permission. He knows what is before and behind them; they encompass nothing of His knowledge except what He wills. His Kursi extends over the heavens and earth, and preserving them does not tire Him. He is the Most High, the Magnificent.",
    benefit: "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Qur\u2019an 2:255; Al-Hakim 1/562; Hisn al-Muslim 75.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0623\u064f\u062c\u064a\u0631 \u0645\u0646 \u0627\u0644\u062c\u0646 \u062d\u062a\u0649 \u064a\u0645\u0633\u064a\u060c \u0648\u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0623\u064f\u062c\u064a\u0631 \u0645\u0646\u0647\u0645 \u062d\u062a\u0649 \u064a\u0635\u0628\u062d.",
    authenticityNote:
      "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A75",
  },
  {
    id: "e-hm-76a",
    category: "evening",
    orderIndex: 2,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650. \ufd3f\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c \u06dd \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0627\u0644\u0635\u0651\u064e\u0645\u064e\u062f\u064f \u06dd \u0644\u064e\u0645\u0652 \u064a\u064e\u0644\u0650\u062f\u0652 \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064f\u0648\u0644\u064e\u062f\u0652 \u06dd \u0648\u064e\u0644\u064e\u0645\u0652 \u064a\u064e\u0643\u064f\u0646 \u0644\u0651\u064e\u0647\u064f \u0643\u064f\u0641\u064f\u0648\u0627\u064b \u0623\u064e\u062d\u064e\u062f\u064c\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul huwall\u0101hu a\u1e25ad. All\u0101hu\u1e63-\u1e63amad. Lam yalid wa lam y\u016blad. Wa lam yakun lahu kufuwan a\u1e25ad.",
    translation:
      "Say: He is Allah, One. Allah, the Self-Sufficient. He neither begets nor is begotten, and none is comparable to Him.",
    benefit: "Recited together with al-Falaq and an-Nas three times each.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0645\u0646 \u0633\u0623\u0644\u0647 \u0645\u0627 \u064a\u0642\u0648\u0644 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d \u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u0649: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Falaq and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "e-hm-76b",
    category: "evening",
    orderIndex: 3,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650. \ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0641\u064e\u0644\u064e\u0642\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u062e\u064e\u0644\u064e\u0642\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u063a\u064e\u0627\u0633\u0650\u0642\u064d \u0625\u0650\u0630\u064e\u0627 \u0648\u064e\u0642\u064e\u0628\u064e \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0641\u0651\u064e\u0627\u062b\u064e\u0627\u062a\u0650 \u0641\u0650\u064a \u0627\u0644\u0652\u0639\u064f\u0642\u064e\u062f\u0650 \u06dd \u0648\u064e\u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u062d\u064e\u0627\u0633\u0650\u062f\u064d \u0625\u0650\u0630\u064e\u0627 \u062d\u064e\u0633\u064e\u062f\u064e\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbil-falaq. Min sharri m\u0101 khalaq. Wa min sharri gh\u0101siqin idh\u0101 waqab. Wa min sharrin-naff\u0101th\u0101ti fil-\u02bfuqad. Wa min sharri \u1e25\u0101sidin idh\u0101 \u1e25asad.",
    translation:
      "Say: I seek refuge in the Lord of daybreak, from the evil of what He created, from the evil of darkness when it settles, from the evil of those who blow on knots, and from the evil of the envier when he envies.",
    benefit: "Recited together with al-Ikhlas and an-Nas three times each.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and an-Nas three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "e-hm-76c",
    category: "evening",
    orderIndex: 4,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650. \ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u064e\u0644\u0650\u0643\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0625\u0650\u0644\u064e\u0647\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0652\u0648\u064e\u0633\u0652\u0648\u064e\u0627\u0633\u0650 \u0627\u0644\u0652\u062e\u064e\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u064a\u064f\u0648\u064e\u0633\u0652\u0648\u0650\u0633\u064f \u0641\u0650\u064a \u0635\u064f\u062f\u064f\u0648\u0631\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650 \u06dd \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u062c\u0650\u0646\u0651\u064e\u0629\u0650 \u0648\u064e\u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650\ufd3e",
    transliteration:
      "Bismill\u0101hir-Ra\u1e25m\u0101nir-Ra\u1e25\u012bm. Qul a\u02bf\u016bdhu birabbin-n\u0101s. Malikin-n\u0101s. Il\u0101hin-n\u0101s. Min sharril-wasw\u0101sil-khann\u0101s. Alladh\u012b yuwaswisu f\u012b \u1e63ud\u016brin-n\u0101s. Minal-jinnati wan-n\u0101s.",
    translation:
      "Say: I seek refuge in the Lord of mankind, the King of mankind, the God of mankind, from the evil of the retreating whisperer who whispers in people\u2019s hearts, from jinn and mankind.",
    benefit: "Recited together with al-Ikhlas and al-Falaq three times each.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/322; At-Tirmidhi 5/567; Hisn al-Muslim 76.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\u060c \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0639\u064e\u0648\u0651\u0650\u0630\u064e\u062a\u064e\u064a\u0652\u0646\u0650\u060c \u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0645\u0652\u0633\u0650\u064a \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u062a\u064f\u0635\u0652\u0628\u0650\u062d\u064f\u060c \u062b\u064e\u0644\u064e\u0627\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d\u061b \u062a\u064e\u0643\u0652\u0641\u0650\u064a\u0643\u064e \u0645\u0650\u0646\u0652 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Recited together with al-Ikhlas and al-Falaq three times each.",
    sourceUrl: "https://sunnah.com/hisn%3A76",
  },
  {
    id: "e-hm-77e",
    category: "evening",
    orderIndex: 5,
    arabicText:
      "\u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0645\u0652\u0633\u064e\u0649 \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0648\u064e\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u0650\u0647\u0650 \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u064e\u0629\u0650 \u0648\u064e\u062e\u064e\u064a\u0652\u0631\u064e \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a \u0647\u064e\u0630\u0650\u0647\u0650 \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u064e\u0629\u0650 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064e\u0627. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064e\u0633\u064e\u0644\u0650 \u0648\u064e\u0633\u064f\u0648\u0621\u0650 \u0627\u0644\u0652\u0643\u0650\u0628\u064e\u0631\u0650. \u0631\u064e\u0628\u0651\u0650 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0646\u0651\u064e\u0627\u0631\u0650 \u0648\u064e\u0639\u064e\u0630\u064e\u0627\u0628\u064d \u0641\u0650\u064a \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650.",
    transliteration:
      "Amsayn\u0101 wa amsal-mulku lill\u0101h, wal\u1e25amdu lill\u0101h, l\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br. Rabbi as\u2019aluka khayra m\u0101 f\u012b h\u0101dhihi \u2019l-laylati wa khayra m\u0101 ba\u02bfdah\u0101, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012b h\u0101dhihi \u2019l-laylati wa sharri m\u0101 ba\u02bfdah\u0101. Rabbi a\u02bf\u016bdhu bika minal-kasali wa s\u016b\u2019il-kibar. Rabbi a\u02bf\u016bdhu bika min \u02bfadh\u0101bin fin-n\u0101ri wa \u02bfadh\u0101bin fil-qabr.",
    translation:
      "We have entered the evening and dominion belongs to Allah. Praise is for Allah. None is worthy of worship but Allah alone, without partner; His is the dominion and praise, and He is able to do all things. My Lord, I ask You for the good of this night and what follows it, and I seek refuge in You from the evil of this night and what follows it. My Lord, I seek refuge in You from laziness and the hardships of old age. My Lord, I seek refuge in You from punishment in the Fire and punishment in the grave.",
    benefit: "Sahih Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 4/2088; Hisn al-Muslim 77.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0625\u0630\u0627 \u0623\u0645\u0633\u0649 \u0642\u0627\u0644 \u0635\u064a\u063a\u0629 \u0627\u0644\u0645\u0633\u0627\u0621: \u00ab\u0623\u0645\u0633\u064a\u0646\u0627 \u0648\u0623\u0645\u0633\u0649 \u0627\u0644\u0645\u0644\u0643 \u0644\u0644\u0647...\u00bb \u0643\u0645\u0627 \u0641\u064a \u0635\u062d\u064a\u062d \u0645\u0633\u0644\u0645.",
    authenticityNote: "Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A77",
  },
  {
    id: "e-hm-78e",
    category: "evening",
    orderIndex: 8,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0628\u0650\u0643\u064e \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u0646\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u062d\u0652\u064a\u064e\u0627\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0646\u064e\u0645\u064f\u0648\u062a\u064f\u060c \u0648\u064e\u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e \u0627\u0644\u0652\u0645\u064e\u0635\u0650\u064a\u0631\u064f.",
    transliteration:
      "All\u0101humma bika amsayn\u0101, wa bika a\u1e63ba\u1e25n\u0101, wa bika na\u1e25y\u0101, wa bika nam\u016bt, wa ilaykal-ma\u1e63\u012br.",
    translation:
      "O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the final return.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi 5/466; Abu Dawud 4/317; Ibn Majah; Hisn al-Muslim 78.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0641\u064a \u0627\u0644\u0645\u0633\u0627\u0621 \u064a\u0642\u0648\u0644: \u00ab\u0627\u0644\u0644\u0647\u0645 \u0628\u0643 \u0623\u0645\u0633\u064a\u0646\u0627 \u0648\u0628\u0643 \u0623\u0635\u0628\u062d\u0646\u0627 \u0648\u0628\u0643 \u0646\u062d\u064a\u0627 \u0648\u0628\u0643 \u0646\u0645\u0648\u062a \u0648\u0625\u0644\u064a\u0643 \u0627\u0644\u0645\u0635\u064a\u0631\u00bb.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A78",
  },
  {
    id: "e-hm-79",
    category: "evening",
    orderIndex: 9,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0631\u064e\u0628\u0651\u0650\u064a \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u062e\u064e\u0644\u064e\u0642\u0652\u062a\u064e\u0646\u0650\u064a \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0639\u064e\u0647\u0652\u062f\u0650\u0643\u064e \u0648\u064e\u0648\u064e\u0639\u0652\u062f\u0650\u0643\u064e \u0645\u064e\u0627 \u0627\u0633\u0652\u062a\u064e\u0637\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0635\u064e\u0646\u064e\u0639\u0652\u062a\u064f\u060c \u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0644\u064e\u0643\u064e \u0628\u0650\u0646\u0650\u0639\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0639\u064e\u0644\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0623\u064e\u0628\u064f\u0648\u0621\u064f \u0628\u0650\u0630\u064e\u0646\u0652\u0628\u0650\u064a\u060c \u0641\u064e\u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a\u060c \u0641\u064e\u0625\u0650\u0646\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u064a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0630\u0651\u064f\u0646\u064f\u0648\u0628\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma anta Rabb\u012b l\u0101 il\u0101ha ill\u0101 ant, khalaqtan\u012b wa ana \u02bfabduk, wa ana \u02bfal\u0101 \u02bfahdika wa wa\u02bfdika m\u0101 ista\u1e6da\u02bft, a\u02bf\u016bdhu bika min sharri m\u0101 \u1e63ana\u02bft, ab\u016b\u2019u laka bini\u02bfmatika \u02bfalayy, wa ab\u016b\u2019u bidhanb\u012b, faghfir l\u012b, fa innahu l\u0101 yaghfirudh-dhun\u016bba ill\u0101 ant.",
    translation:
      "O Allah, You are my Lord; none is worthy of worship but You. You created me and I am Your servant. I keep Your covenant and promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge Your blessing upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 7/150; Hisn al-Muslim 79.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0633\u064e\u064a\u0651\u0650\u062f\u064f \u0627\u0644\u0650\u0627\u0633\u0652\u062a\u0650\u063a\u0652\u0641\u064e\u0627\u0631\u0650...\u00bb \u062b\u0645 \u0630\u0643\u0631\u0647\u060c \u0648\u0642\u0627\u0644: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0646\u0651\u064e\u0647\u064e\u0627\u0631\u0650 \u0645\u064f\u0648\u0642\u0650\u0646\u064b\u0627 \u0628\u0650\u0647\u064e\u0627 \u0641\u064e\u0645\u064e\u0627\u062a\u064e \u0645\u0650\u0646\u0652 \u064a\u064e\u0648\u0652\u0645\u0650\u0647\u0650... \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u060c \u0648\u064e\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e\u0647\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u0650... \u0641\u064e\u0647\u064f\u0648\u064e \u0645\u0650\u0646\u0652 \u0623\u064e\u0647\u0652\u0644\u0650 \u0627\u0644\u0652\u062c\u064e\u0646\u0651\u064e\u0629\u0650\u00bb.",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A79",
  },
  {
    id: "e-hm-80e",
    category: "evening",
    orderIndex: 10,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u062a\u064f \u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f\u0643\u064e\u060c \u0648\u064e\u0623\u064f\u0634\u0652\u0647\u0650\u062f\u064f \u062d\u064e\u0645\u064e\u0644\u064e\u0629\u064e \u0639\u064e\u0631\u0652\u0634\u0650\u0643\u064e\u060c \u0648\u064e\u0645\u064e\u0644\u0627\u064e\u0626\u0650\u0643\u064e\u062a\u064e\u0643\u064e\u060c \u0648\u064e\u062c\u064e\u0645\u0650\u064a\u0639\u064e \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0623\u064e\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0646\u0651\u064e \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064b\u0627 \u0639\u064e\u0628\u0652\u062f\u064f\u0643\u064e \u0648\u064e\u0631\u064e\u0633\u064f\u0648\u0644\u064f\u0643\u064e.",
    transliteration:
      "All\u0101humma inn\u012b amsaytu ush-hiduka, wa ush-hidu \u1e25amalata \u02bfarshik, wa mal\u0101\u2019ikataka, wa jam\u012b\u02bfa khalqik, annaka antall\u0101hu l\u0101 il\u0101ha ill\u0101 ant, wa\u1e25daka l\u0101 shar\u012bka lak, wa anna Mu\u1e25ammadan \u02bfabduka wa ras\u016bluk.",
    translation:
      "O Allah, this evening I call You, the bearers of Your Throne, Your angels, and all Your creation to witness that You are Allah; none is worthy of worship but You alone, without partner, and that Muhammad is Your servant and Messenger.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 4,
    countLabel: "4",
    sourceReference:
      "Abu Dawud 4/317; Al-Bukhari in Al-Adab al-Mufrad; An-Nasa\u2019i; Ibn as-Sunni; Hisn al-Muslim 80.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f \u0641\u064a \u0641\u0636\u0644\u0647\u0627 \u0641\u064a \u0627\u0644\u0635\u0628\u0627\u062d \u0648\u0627\u0644\u0645\u0633\u0627\u0621: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0623\u0631\u0628\u0639 \u0645\u0631\u0627\u062a \u0623\u0639\u062a\u0642\u0647 \u0627\u0644\u0644\u0647 \u0645\u0646 \u0627\u0644\u0646\u0627\u0631.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A80",
  },
  {
    id: "e-hm-81e",
    category: "evening",
    orderIndex: 11,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0645\u064e\u0627 \u0623\u064e\u0645\u0652\u0633\u064e\u0649 \u0628\u0650\u064a \u0645\u0650\u0646\u0652 \u0646\u0650\u0639\u0652\u0645\u064e\u0629\u064d\u060c \u0623\u064e\u0648\u0652 \u0628\u0650\u0623\u064e\u062d\u064e\u062f\u064d \u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0642\u0650\u0643\u064e\u060c \u0641\u064e\u0645\u0650\u0646\u0652\u0643\u064e \u0648\u064e\u062d\u0652\u062f\u064e\u0643\u064e \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0643\u064e\u060c \u0641\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0648\u064e\u0644\u064e\u0643\u064e \u0627\u0644\u0634\u0651\u064f\u0643\u0652\u0631\u064f.",
    transliteration:
      "All\u0101humma m\u0101 ams\u0101 b\u012b min ni\u02bfmatin, aw bi-a\u1e25adin min khalqik, fa minka wa\u1e25daka l\u0101 shar\u012bka lak, falakal-\u1e25amdu wa lakash-shukr.",
    translation:
      "O Allah, whatever blessing has reached me or any of Your creation this evening is from You alone, without partner; all praise and thanks belong to You.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Abu Dawud 4/318; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 7; Ibn as-Sunni no. 41; Ibn Hibban no. 2361; Hisn al-Muslim 81.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0641\u0642\u062f \u0623\u062f\u0651\u0649 \u0634\u0643\u0631 \u0644\u064a\u0644\u062a\u0647.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A81",
  },
  {
    id: "e-hm-82",
    category: "evening",
    orderIndex: 12,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u062f\u064e\u0646\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0633\u064e\u0645\u0652\u0639\u0650\u064a\u060c \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0641\u0650\u0646\u0650\u064a \u0641\u0650\u064a \u0628\u064e\u0635\u064e\u0631\u0650\u064a\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0643\u064f\u0641\u0652\u0631\u0650 \u0648\u064e\u0627\u0644\u0652\u0641\u064e\u0642\u0652\u0631\u0650\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0639\u064e\u0630\u064e\u0627\u0628\u0650 \u0627\u0644\u0652\u0642\u064e\u0628\u0652\u0631\u0650\u060c \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma \u02bf\u0101fin\u012b f\u012b badan\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b sam\u02bf\u012b, All\u0101humma \u02bf\u0101fin\u012b f\u012b ba\u1e63ar\u012b, l\u0101 il\u0101ha ill\u0101 ant. All\u0101humma inn\u012b a\u02bf\u016bdhu bika mina \u2019l-kufri wal-faqr, wa a\u02bf\u016bdhu bika min \u02bfadh\u0101bil-qabr, l\u0101 il\u0101ha ill\u0101 ant.",
    translation:
      "O Allah, grant me wellbeing in my body. O Allah, preserve my hearing. O Allah, preserve my sight. None is worthy of worship but You. O Allah, I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None is worthy of worship but You.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/324; Ahmad 5/42; An-Nasa\u2019i; Ibn as-Sunni; Al-Adab al-Mufrad; Hisn al-Muslim 82.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0639\u0644\u0651\u0645 \u0623\u0646 \u064a\u0642\u0627\u0644 \u0647\u0630\u0627 \u0627\u0644\u062f\u0639\u0627\u0621 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062d\u064a\u0646 \u064a\u0645\u0633\u064a.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A82",
  },
  {
    id: "e-hm-83",
    category: "evening",
    orderIndex: 13,
    arabicText:
      "\u062d\u064e\u0633\u0652\u0628\u0650\u064a\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e\u060c \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650 \u062a\u064e\u0648\u064e\u0643\u0651\u064e\u0644\u0652\u062a\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0631\u064e\u0628\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0631\u0652\u0634\u0650 \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650.",
    transliteration:
      "\u1e24asbiyall\u0101hu l\u0101 il\u0101ha ill\u0101 huwa, \u02bfalayhi tawakkalt, wa huwa Rabbul-\u02bfArshil-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah is sufficient for me. None is worthy of worship but Him. Upon Him I rely, and He is the Lord of the Mighty Throne.",
    benefit: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 7,
    countLabel: "7",
    sourceReference: "Ibn as-Sunni no. 71; Abu Dawud 4/321; Hisn al-Muslim 83.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0633\u0628\u0639 \u0645\u0631\u0627\u062a \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0643\u0641\u0627\u0647 \u0627\u0644\u0644\u0647 \u0645\u0627 \u0623\u0647\u0645\u0651\u0647 \u0645\u0646 \u0623\u0645\u0631 \u0627\u0644\u062f\u0646\u064a\u0627 \u0648\u0627\u0644\u0622\u062e\u0631\u0629.",
    authenticityNote: "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A83",
  },
  {
    id: "e-hm-84",
    category: "evening",
    orderIndex: 14,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u0627\u0644\u062f\u0651\u064f\u0646\u0652\u064a\u064e\u0627 \u0648\u064e\u0627\u0644\u0622\u062e\u0650\u0631\u064e\u0629\u0650. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0641\u0652\u0648\u064e \u0648\u064e\u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e \u0641\u0650\u064a \u062f\u0650\u064a\u0646\u0650\u064a \u0648\u064e\u062f\u064f\u0646\u0652\u064a\u064e\u0627\u064a\u064e \u0648\u064e\u0623\u064e\u0647\u0652\u0644\u0650\u064a \u0648\u064e\u0645\u064e\u0627\u0644\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u0633\u0652\u062a\u064f\u0631\u0652 \u0639\u064e\u0648\u0652\u0631\u064e\u0627\u062a\u0650\u064a\u060c \u0648\u064e\u0622\u0645\u0650\u0646\u0652 \u0631\u064e\u0648\u0652\u0639\u064e\u0627\u062a\u0650\u064a. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0646\u0650\u064a \u0645\u0650\u0646\u0652 \u0628\u064e\u064a\u0652\u0646\u0650 \u064a\u064e\u062f\u064e\u064a\u0651\u064e\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u062e\u064e\u0644\u0652\u0641\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u064a\u064e\u0645\u0650\u064a\u0646\u0650\u064a\u060c \u0648\u064e\u0639\u064e\u0646\u0652 \u0634\u0650\u0645\u064e\u0627\u0644\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0641\u064e\u0648\u0652\u0642\u0650\u064a\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0639\u064e\u0638\u064e\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0646\u0652 \u0623\u064f\u063a\u0652\u062a\u064e\u0627\u0644\u064e \u0645\u0650\u0646\u0652 \u062a\u064e\u062d\u0652\u062a\u0650\u064a.",
    transliteration:
      "All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata fid-duny\u0101 wal-\u0101khirah. All\u0101humma inn\u012b as\u2019alukal-\u02bfafwa wal-\u02bf\u0101fiyata f\u012b d\u012bn\u012b wa duny\u0101ya wa ahl\u012b wa m\u0101l\u012b. All\u0101hummastur \u02bfawr\u0101t\u012b, wa \u0101min raw\u02bf\u0101t\u012b. All\u0101humma\u1e25fa\u1e93n\u012b min bayni yadayya, wa min khalf\u012b, wa \u02bfan yam\u012bn\u012b, wa \u02bfan shim\u0101l\u012b, wa min fawq\u012b, wa a\u02bf\u016bdhu bi\u02bfa\u1e93amatika an ught\u0101la min ta\u1e25t\u012b.",
    translation:
      "O Allah, I ask You for pardon and wellbeing in this world and the Hereafter. O Allah, I ask You for pardon and wellbeing in my religion, worldly life, family, and wealth. O Allah, conceal my faults and calm my fears. O Allah, protect me from in front, behind, my right, my left, and above; and I seek refuge in Your greatness from being taken from beneath me.",
    benefit: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud; Ibn Majah; Ahmad; An-Nasa\u2019i; Hisn al-Muslim 84.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0644\u0627 \u064a\u062f\u0639 \u0647\u0624\u0644\u0627\u0621 \u0627\u0644\u062f\u0639\u0648\u0627\u062a \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0648\u062d\u064a\u0646 \u064a\u0635\u0628\u062d.",
    authenticityNote: "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A84",
  },
  {
    id: "e-hm-85",
    category: "evening",
    orderIndex: 15,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0644\u0650\u0645\u064e \u0627\u0644\u0652\u063a\u064e\u064a\u0652\u0628\u0650 \u0648\u064e\u0627\u0644\u0634\u0651\u064e\u0647\u064e\u0627\u062f\u064e\u0629\u0650\u060c \u0641\u064e\u0627\u0637\u0650\u0631\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650\u060c \u0631\u064e\u0628\u0651\u064e \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0648\u064e\u0645\u064e\u0644\u0650\u064a\u0643\u064e\u0647\u064f\u060c \u0623\u064e\u0634\u0652\u0647\u064e\u062f\u064f \u0623\u064e\u0646\u0652 \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0646\u064e\u0641\u0652\u0633\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u0634\u0650\u0631\u0652\u0643\u0650\u0647\u0650\u060c \u0648\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u062a\u064e\u0631\u0650\u0641\u064e \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0633\u064f\u0648\u0621\u064b\u0627\u060c \u0623\u064e\u0648\u0652 \u0623\u064e\u062c\u064f\u0631\u0651\u064e\u0647\u064f \u0625\u0650\u0644\u064e\u0649 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064d.",
    transliteration:
      "All\u0101humma \u02bf\u0101limal-ghaybi wash-shah\u0101dah, f\u0101\u1e6diras-sam\u0101w\u0101ti wal-ar\u1e0d, Rabba kulli shay\u2019in wa mal\u012bkah, ash-hadu an l\u0101 il\u0101ha ill\u0101 ant, a\u02bf\u016bdhu bika min sharri nafs\u012b, wa min sharrish-shay\u1e6d\u0101ni wa shirkih, wa an aqtarifa \u02bfal\u0101 nafs\u012b s\u016b\u2019an, aw ajurrahu il\u0101 Muslim.",
    translation:
      "O Allah, Knower of the unseen and the witnessed, Creator of the heavens and the earth, Lord and Sovereign of everything. I bear witness that none is worthy of worship but You. I seek refuge in You from the evil of myself, from the evil of Satan and his shirk, and from committing evil against myself or bringing it upon a Muslim.",
    benefit: "Also appears in before-sleep adhkar.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "At-Tirmidhi; Abu Dawud 4/317; Hisn al-Muslim 85/109.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0623\u0628\u064a \u0628\u0643\u0631 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647: \u00ab\u0642\u064f\u0644\u0652\u0647\u064f \u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u062e\u064e\u0630\u0652\u062a\u064e \u0645\u064e\u0636\u0652\u062c\u064e\u0639\u064e\u0643\u064e\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Also appears in before-sleep adhkar.",
    sourceUrl: "https://sunnah.com/hisn%3A85",
  },
  {
    id: "e-hm-86",
    category: "evening",
    orderIndex: 16,
    arabicText:
      "\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0644\u0627\u064e \u064a\u064e\u0636\u064f\u0631\u0651\u064f \u0645\u064e\u0639\u064e \u0627\u0633\u0652\u0645\u0650\u0647\u0650 \u0634\u064e\u064a\u0652\u0621\u064c \u0641\u0650\u064a \u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650 \u0648\u064e\u0644\u0627\u064e \u0641\u0650\u064a \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0621\u0650\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u0650\u064a\u0639\u064f \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0645\u064f.",
    transliteration:
      "Bismill\u0101hilladh\u012b l\u0101 ya\u1e0durru ma\u02bfa ismihi shay\u2019un fil-ar\u1e0di wa l\u0101 fis-sam\u0101\u2019, wa huwas-Sam\u012b\u02bful-\u02bfAl\u012bm.",
    translation:
      "In the Name of Allah, with whose Name nothing in the earth or the heaven can harm, and He is the All-Hearing, All-Knowing.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/323; At-Tirmidhi 5/465; Ibn Majah; Ahmad; Hisn al-Muslim 86.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0645\u064e\u0627 \u0645\u0650\u0646\u0652 \u0639\u064e\u0628\u0652\u062f\u064d \u064a\u064e\u0642\u064f\u0648\u0644\u064f \u0641\u0650\u064a \u0635\u064e\u0628\u064e\u0627\u062d\u0650 \u0643\u064f\u0644\u0651\u0650 \u064a\u064e\u0648\u0652\u0645\u064d \u0648\u064e\u0645\u064e\u0633\u064e\u0627\u0621\u0650 \u0643\u064f\u0644\u0651\u0650 \u0644\u064e\u064a\u0652\u0644\u064e\u0629\u064d: \u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0644\u0627\u064e \u064a\u064e\u0636\u064f\u0631\u0651\u064f... \u062b\u064e\u0644\u0627\u064e\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d \u0641\u064e\u064a\u064e\u0636\u064f\u0631\u0651\u064e\u0647\u064f \u0634\u064e\u064a\u0652\u0621\u064c\u00bb.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A86",
  },
  {
    id: "e-hm-87",
    category: "evening",
    orderIndex: 17,
    arabicText:
      "\u0631\u064e\u0636\u0650\u064a\u062a\u064f \u0628\u0650\u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650 \u062f\u0650\u064a\u0646\u064b\u0627\u060c \u0648\u064e\u0628\u0650\u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa \u0646\u064e\u0628\u0650\u064a\u0651\u064b\u0627.",
    transliteration:
      "Ra\u1e0d\u012btu bill\u0101hi Rabba, wa bil-Isl\u0101mi d\u012bna, wa bi-Mu\u1e25ammadin \ufdfa nabiyya.",
    translation:
      "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad \ufdfa as my Prophet.",
    benefit: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Ahmad 4/337; An-Nasa\u2019i; Ibn as-Sunni; At-Tirmidhi 5/465; Hisn al-Muslim 87.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0635\u0628\u062d \u0648\u062b\u0644\u0627\u062b\u064b\u0627 \u062d\u064a\u0646 \u064a\u0645\u0633\u064a \u0643\u0627\u0646 \u062d\u0642\u064b\u0627 \u0639\u0644\u0649 \u0627\u0644\u0644\u0647 \u0623\u0646 \u064a\u0631\u0636\u064a\u0647 \u064a\u0648\u0645 \u0627\u0644\u0642\u064a\u0627\u0645\u0629.",
    authenticityNote: "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A87",
  },
  {
    id: "e-hm-88",
    category: "evening",
    orderIndex: 18,
    arabicText:
      "\u064a\u064e\u0627 \u062d\u064e\u064a\u0651\u064f \u064a\u064e\u0627 \u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f\u060c \u0628\u0650\u0631\u064e\u062d\u0652\u0645\u064e\u062a\u0650\u0643\u064e \u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0650\u064a\u062b\u064f\u060c \u0623\u064e\u0635\u0652\u0644\u0650\u062d\u0652 \u0644\u0650\u064a \u0634\u064e\u0623\u0652\u0646\u0650\u064a \u0643\u064f\u0644\u0651\u064e\u0647\u064f\u060c \u0648\u064e\u0644\u0627\u064e \u062a\u064e\u0643\u0650\u0644\u0652\u0646\u0650\u064a \u0625\u0650\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0637\u064e\u0631\u0652\u0641\u064e\u0629\u064e \u0639\u064e\u064a\u0652\u0646\u064d.",
    transliteration:
      "Y\u0101 \u1e24ayyu y\u0101 Qayy\u016bm, bira\u1e25matika astagh\u012bth, a\u1e63li\u1e25 l\u012b sha\u2019n\u012b kullah, wa l\u0101 takiln\u012b il\u0101 nafs\u012b \u1e6darfata \u02bfayn.",
    translation:
      "O Ever-Living, O Sustainer, by Your mercy I seek help. Rectify all my affairs and do not leave me to myself even for the blink of an eye.",
    benefit: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Hakim; Al-Albani, Sahih al-Jami\u02bf; Hisn al-Muslim 88.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f \u0623\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0623\u0648\u0635\u0649 \u0641\u0627\u0637\u0645\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647\u0627 \u0623\u0646 \u062a\u0642\u0648\u0644 \u0625\u0630\u0627 \u0623\u0635\u0628\u062d\u062a \u0648\u0625\u0630\u0627 \u0623\u0645\u0633\u064a\u062a: \u00ab\u064a\u0627 \u062d\u064a \u064a\u0627 \u0642\u064a\u0648\u0645 \u0628\u0631\u062d\u0645\u062a\u0643 \u0623\u0633\u062a\u063a\u064a\u062b...\u00bb",
    authenticityNote: "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A88",
  },
  {
    id: "e-hm-89e",
    category: "evening",
    orderIndex: 6,
    arabicText:
      "\u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627 \u0648\u064e\u0623\u064e\u0645\u0652\u0633\u064e\u0649 \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u062e\u064e\u064a\u0652\u0631\u064e \u0647\u064e\u0630\u0650\u0647\u0650 \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u064e\u0629\u0650: \u0641\u064e\u062a\u0652\u062d\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0646\u064e\u0635\u0652\u0631\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0646\u064f\u0648\u0631\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0628\u064e\u0631\u064e\u0643\u064e\u062a\u064e\u0647\u064e\u0627\u060c \u0648\u064e\u0647\u064f\u062f\u064e\u0627\u0647\u064e\u0627\u060c \u0648\u064e\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0641\u0650\u064a\u0647\u064e\u0627 \u0648\u064e\u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u0628\u064e\u0639\u0652\u062f\u064e\u0647\u064e\u0627.",
    transliteration:
      "Amsayn\u0101 wa amsal-mulku lill\u0101hi Rabbil-\u02bf\u0101lam\u012bn. All\u0101humma inn\u012b as\u2019aluka khayra h\u0101dhihi \u2019l-laylah: fat\u1e25ah\u0101, wa na\u1e63rah\u0101, wa n\u016brah\u0101, wa barakatah\u0101, wa hud\u0101h\u0101, wa a\u02bf\u016bdhu bika min sharri m\u0101 f\u012bh\u0101 wa sharri m\u0101 ba\u02bfdah\u0101.",
    translation:
      "We have entered the evening, and dominion belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this night: its opening, victory, light, blessing, and guidance; and I seek refuge in You from the evil within it and the evil after it.",
    benefit: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/322; Hisn al-Muslim 89.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f\u062a \u0635\u064a\u063a\u0629 \u0627\u0644\u0645\u0633\u0627\u0621 \u0628\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u064a\u0648\u0645 \u0625\u0644\u0649 \u0627\u0644\u0644\u064a\u0644\u0629 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0630\u0643\u0631.",
    authenticityNote: "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A89",
  },
  {
    id: "e-hm-90e",
    category: "evening",
    orderIndex: 7,
    arabicText:
      "\u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0641\u0650\u0637\u0652\u0631\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u0633\u0652\u0644\u0627\u064e\u0645\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0643\u064e\u0644\u0650\u0645\u064e\u0629\u0650 \u0627\u0644\u0625\u0650\u062e\u0652\u0644\u0627\u064e\u0635\u0650\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u062f\u0650\u064a\u0646\u0650 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d \ufdfa\u060c \u0648\u064e\u0639\u064e\u0644\u064e\u0649 \u0645\u0650\u0644\u0651\u064e\u0629\u0650 \u0623\u064e\u0628\u0650\u064a\u0646\u064e\u0627 \u0625\u0650\u0628\u0652\u0631\u064e\u0627\u0647\u0650\u064a\u0645\u064e\u060c \u062d\u064e\u0646\u0650\u064a\u0641\u064b\u0627 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064b\u0627\u060c \u0648\u064e\u0645\u064e\u0627 \u0643\u064e\u0627\u0646\u064e \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0645\u064f\u0634\u0652\u0631\u0650\u0643\u0650\u064a\u0646\u064e.",
    transliteration:
      "Amsayn\u0101 \u02bfal\u0101 fi\u1e6dratil-Isl\u0101m, wa \u02bfal\u0101 kalimatil-ikhl\u0101\u1e63, wa \u02bfal\u0101 d\u012bni nabiyyin\u0101 Mu\u1e25ammadin \ufdfa, wa \u02bfal\u0101 millati ab\u012bn\u0101 Ibr\u0101h\u012bm, \u1e25an\u012bfan Musliman, wa m\u0101 k\u0101na minal-mushrik\u012bn.",
    translation:
      "We have entered the evening upon the natural religion of Islam, the word of sincerity, the religion of our Prophet Muhammad \ufdfa, and the way of our father Ibrahim, upright and Muslim, and he was not of the polytheists.",
    benefit: "Included in Hisn al-Muslim; grading not displayed on the Sunnah.com page.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference:
      "Ahmad 3/406-407 and 5/123; An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 34; At-Tirmidhi 4/209; Hisn al-Muslim 90.",
    preferredTiming: "After \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f\u062a \u0635\u064a\u063a\u0629 \u0627\u0644\u0645\u0633\u0627\u0621 \u0628\u062a\u063a\u064a\u064a\u0631 \u00ab\u0623\u0635\u0628\u062d\u0646\u0627\u00bb \u0625\u0644\u0649 \u00ab\u0623\u0645\u0633\u064a\u0646\u0627\u00bb.",
    authenticityNote: "Included in Hisn al-Muslim; grading not displayed on the Sunnah.com page.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A90",
  },
  {
    id: "e-hm-91",
    category: "evening",
    orderIndex: 19,
    arabicText:
      "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650.",
    transliteration: "Sub\u1e25\u0101nall\u0101hi wa bi\u1e25amdih.",
    translation: "Glory and praise be to Allah.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari 4/2071; Hisn al-Muslim 91.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e \u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0648\u064e\u0628\u0650\u062d\u064e\u0645\u0652\u062f\u0650\u0647\u0650 \u0641\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064d \u0645\u0650\u0627\u0626\u064e\u0629\u064e \u0645\u064e\u0631\u0651\u064e\u0629\u064d \u062d\u064f\u0637\u0651\u064e\u062a\u0652 \u062e\u064e\u0637\u064e\u0627\u064a\u064e\u0627\u0647\u064f \u0648\u064e\u0625\u0650\u0646\u0652 \u0643\u064e\u0627\u0646\u064e\u062a\u0652 \u0645\u0650\u062b\u0652\u0644\u064e \u0632\u064e\u0628\u064e\u062f\u0650 \u0627\u0644\u0652\u0628\u064e\u062d\u0652\u0631\u0650\u00bb\u060c \u0648\u0648\u0631\u062f \u0641\u0636\u0644\u0647\u0627 \u0635\u0628\u0627\u062d\u064b\u0627 \u0648\u0645\u0633\u0627\u0621\u064b.",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A91",
  },
  {
    id: "e-hm-92",
    category: "evening",
    orderIndex: 20,
    arabicText:
      "\u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0648\u064e\u062d\u0652\u062f\u064e\u0647\u064f \u0644\u0627\u064e \u0634\u064e\u0631\u0650\u064a\u0643\u064e \u0644\u064e\u0647\u064f\u060c \u0644\u064e\u0647\u064f \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u064f \u0648\u064e\u0644\u064e\u0647\u064f \u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f\u060c \u0648\u064e\u0647\u064f\u0648\u064e \u0639\u064e\u0644\u064e\u0649 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0642\u064e\u062f\u0650\u064a\u0631\u064c.",
    transliteration:
      "L\u0101 il\u0101ha illall\u0101hu wa\u1e25dahu l\u0101 shar\u012bka lah, lahul-mulku wa lahul-\u1e25amd, wa huwa \u02bfal\u0101 kulli shay\u2019in qad\u012br.",
    translation:
      "None is worthy of worship but Allah alone, without partner. His is the dominion and praise, and He is able to do all things.",
    benefit: "Same wording as HM-93 but different count and virtue.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "An-Nasa\u2019i Amal al-Yawm wa al-Laylah no. 24; Ahmad; Abu Dawud; Ibn Majah; Hisn al-Muslim 92.",
    preferredTiming: "Morning after Fajr; evening after \u2018Asr/sunset window.",
    hadithText:
      "\u0648\u0631\u062f: \u0645\u0646 \u0642\u0627\u0644\u0647\u0627 \u0639\u0634\u0631 \u0645\u0631\u0627\u062a \u0635\u0628\u0627\u062d\u064b\u0627 \u0643\u064f\u062a\u0628 \u0644\u0647 \u0639\u0634\u0631 \u062d\u0633\u0646\u0627\u062a \u0648\u0645\u064f\u062d\u064a\u062a \u0639\u0646\u0647 \u0639\u0634\u0631 \u0633\u064a\u0626\u0627\u062a\u060c \u0648\u0643\u0627\u0646 \u0644\u0647 \u0639\u062f\u0644 \u0639\u0634\u0631 \u0631\u0642\u0627\u0628\u060c \u0648\u062d\u064f\u0641\u0638 \u0645\u0646 \u0627\u0644\u0634\u064a\u0637\u0627\u0646 \u062d\u062a\u0649 \u064a\u0645\u0633\u064a\u060c \u0648\u0644\u0647 \u0645\u062b\u0644 \u0630\u0644\u0643 \u0641\u064a \u0627\u0644\u0645\u0633\u0627\u0621.",
    authenticityNote: "Sahih/Hasan reports as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Same wording as HM-93 but different count and virtue.",
    sourceUrl: "https://sunnah.com/hisn%3A92",
  },
  {
    id: "e-hm-96",
    category: "evening",
    orderIndex: 21,
    arabicText:
      "\u0623\u064e\u0633\u0652\u062a\u064e\u063a\u0652\u0641\u0650\u0631\u064f \u0627\u0644\u0644\u0651\u064e\u0647\u064e \u0648\u064e\u0623\u064e\u062a\u064f\u0648\u0628\u064f \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650.",
    transliteration: "Astaghfirull\u0101ha wa at\u016bbu ilayh.",
    translation: "I seek Allah\u2019s forgiveness and repent to Him.",
    benefit: "Hisn notes: recite 100 times during the day.",
    repetitionCount: 100,
    countLabel: "100",
    sourceReference: "Al-Bukhari; Muslim 4/2075; Hisn al-Muslim 96.",
    preferredTiming: "During the day; suitable to include in morning/evening routine.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u064a\u0642\u0648\u0644 \u0641\u064a \u0627\u0644\u0645\u062c\u0644\u0633 \u0627\u0644\u0648\u0627\u062d\u062f: \u00ab\u0631\u064e\u0628\u0651\u0650 \u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u0650\u064a \u0648\u064e\u062a\u064f\u0628\u0652 \u0639\u064e\u0644\u064e\u064a\u0651\u064e \u0625\u0650\u0646\u0651\u064e\u0643\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u062a\u0651\u064e\u0648\u0651\u064e\u0627\u0628\u064f \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u064f\u00bb \u0645\u0631\u0627\u062a \u0643\u062b\u064a\u0631\u0629\u060c \u0648\u0648\u0631\u062f \u0639\u0646\u0647 \u0627\u0644\u0627\u0633\u062a\u063a\u0641\u0627\u0631 \u0645\u0627\u0626\u0629 \u0645\u0631\u0629 \u0641\u064a \u0627\u0644\u064a\u0648\u0645.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Hisn notes: recite 100 times during the day.",
    sourceUrl: "https://sunnah.com/hisn%3A96",
  },
  {
    id: "e-hm-97",
    category: "evening",
    orderIndex: 22,
    arabicText:
      "\u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e\u0644\u0650\u0645\u064e\u0627\u062a\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u062a\u0651\u064e\u0627\u0645\u0651\u064e\u0627\u062a\u0650 \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u062e\u064e\u0644\u064e\u0642\u064e.",
    transliteration: "A\u02bf\u016bdhu bikalim\u0101ti-ll\u0101hit-t\u0101mm\u0101ti min sharri m\u0101 khalaq.",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He created.",
    benefit: "Sahih/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Ahmad 2/290; An-Nasa\u2019i; At-Tirmidhi 3/187; Ibn as-Sunni; Hisn al-Muslim 97.",
    preferredTiming: "In the evening.",
    hadithText:
      "\u0648\u0631\u062f: \u00ab\u0645\u064e\u0646\u0652 \u0642\u064e\u0627\u0644\u064e \u062d\u0650\u064a\u0646\u064e \u064a\u064f\u0645\u0652\u0633\u0650\u064a \u062b\u064e\u0644\u0627\u064e\u062b\u064e \u0645\u064e\u0631\u0651\u064e\u0627\u062a\u064d: \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e\u0644\u0650\u0645\u064e\u0627\u062a\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u062a\u0651\u064e\u0627\u0645\u0651\u064e\u0627\u062a\u0650 \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0645\u064e\u0627 \u062e\u064e\u0644\u064e\u0642\u064e\u060c \u0644\u064e\u0645\u0652 \u062a\u064e\u0636\u064f\u0631\u0651\u064e\u0647\u064f \u062d\u064f\u0645\u064e\u0629\u064c \u062a\u0650\u0644\u0652\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u064a\u0652\u0644\u064e\u0629\u064e\u00bb.",
    authenticityNote: "Sahih/Hasan as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A97",
  },
  {
    id: "e-hm-98",
    category: "evening",
    orderIndex: 23,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0635\u064e\u0644\u0651\u0650 \u0648\u064e\u0633\u064e\u0644\u0651\u0650\u0645\u0652 \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0646\u064e\u0627 \u0645\u064f\u062d\u064e\u0645\u0651\u064e\u062f\u064d.",
    transliteration: "All\u0101humma \u1e63alli wa sallim \u02bfal\u0101 nabiyyin\u0101 Mu\u1e25ammad.",
    translation: "O Allah, send prayers and peace upon our Prophet Muhammad.",
    benefit: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 10,
    countLabel: "10",
    sourceReference: "At-Tabarani; Haythami Majma\u02bf az-Zawa\u2019id 10/120; Hisn al-Muslim 98.",
    preferredTiming: "Morning and evening.",
    hadithText:
      "\u0648\u0631\u062f: \u00ab\u0645\u064e\u0646\u0652 \u0635\u064e\u0644\u0651\u064e\u0649 \u0639\u064e\u0644\u064e\u064a\u0651\u064e \u062d\u0650\u064a\u0646\u064e \u064a\u064f\u0635\u0652\u0628\u0650\u062d\u064f \u0639\u064e\u0634\u0652\u0631\u064b\u0627\u060c \u0648\u064e\u062d\u0650\u064a\u0646\u064e \u064a\u064f\u0645\u0652\u0633\u0650\u064a \u0639\u064e\u0634\u0652\u0631\u064b\u0627\u060c \u0623\u064e\u062f\u0652\u0631\u064e\u0643\u064e\u062a\u0652\u0647\u064f \u0634\u064e\u0641\u064e\u0627\u0639\u064e\u062a\u0650\u064a \u064a\u064e\u0648\u0652\u0645\u064e \u0627\u0644\u0652\u0642\u0650\u064a\u064e\u0627\u0645\u064e\u0629\u0650\u00bb.",
    authenticityNote: "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A98",
  },
];

const SLEEP_AZKAR: Zikr[] = [
  {
    id: "s-hm-99",
    category: "before_sleep",
    orderIndex: 0,
    arabicText:
      "\u064a\u064e\u062c\u0652\u0645\u064e\u0639\u064f \u0643\u064e\u0641\u0651\u064e\u064a\u0652\u0647\u0650 \u062b\u064f\u0645\u0651\u064e \u064a\u064e\u0646\u0652\u0641\u064f\u062b\u064f \u0641\u0650\u064a\u0647\u0650\u0645\u064e\u0627 \u0641\u064e\u064a\u064e\u0642\u0652\u0631\u064e\u0623\u064f \u0641\u0650\u064a\u0647\u0650\u0645\u064e\u0627: \ufd3f\u0642\u064f\u0644\u0652 \u0647\u064f\u0648\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u062d\u064e\u062f\u064c\ufd3e\u060c \u0648\ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0641\u064e\u0644\u064e\u0642\u0650\ufd3e\u060c \u0648\ufd3f\u0642\u064f\u0644\u0652 \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0646\u0651\u064e\u0627\u0633\u0650\ufd3e\u060c \u062b\u064f\u0645\u0651\u064e \u064a\u064e\u0645\u0652\u0633\u064e\u062d\u064f \u0628\u0650\u0647\u0650\u0645\u064e\u0627 \u0645\u064e\u0627 \u0627\u0633\u0652\u062a\u064e\u0637\u064e\u0627\u0639\u064e \u0645\u0650\u0646\u0652 \u062c\u064e\u0633\u064e\u062f\u0650\u0647\u0650.",
    transliteration:
      "Yajma\u02bfu kaffayhi thumma yanfuthu f\u012bhim\u0101 fa yaqra\u2019u f\u012bhim\u0101: Qul huwall\u0101hu a\u1e25ad, Qul a\u02bf\u016bdhu birabbil-falaq, Qul a\u02bf\u016bdhu birabbin-n\u0101s; thumma yamsa\u1e25u bihim\u0101 m\u0101 ista\u1e6d\u0101\u02bfa min jasadih.",
    translation:
      "He gathers his palms, blows lightly into them, recites al-Ikhlas, al-Falaq, and an-Nas, then wipes over as much of his body as he can.",
    benefit: "Full surah texts are already listed in morning/evening rows HM-76a/b/c.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Al-Bukhari; Muslim 4/1723; Hisn al-Muslim 99.",
    preferredTiming: "Before sleeping, after lying down; gather palms, blow lightly, recite, then wipe body.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0625\u0630\u0627 \u0623\u0648\u0649 \u0625\u0644\u0649 \u0641\u0631\u0627\u0634\u0647 \u0643\u0644 \u0644\u064a\u0644\u0629 \u062c\u0645\u0639 \u0643\u0641\u064a\u0647 \u062b\u0645 \u0646\u0641\u062b \u0641\u064a\u0647\u0645\u0627 \u0641\u0642\u0631\u0623 \u0641\u064a\u0647\u0645\u0627 \u0627\u0644\u0633\u0648\u0631 \u0627\u0644\u062b\u0644\u0627\u062b\u060c \u062b\u0645 \u0645\u0633\u062d \u0628\u0647\u0645\u0627 \u0645\u0627 \u0627\u0633\u062a\u0637\u0627\u0639 \u0645\u0646 \u062c\u0633\u062f\u0647\u060c \u064a\u0641\u0639\u0644 \u0630\u0644\u0643 \u062b\u0644\u0627\u062b \u0645\u0631\u0627\u062a.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Full surah texts are already listed in morning/evening rows HM-76a/b/c.",
    sourceUrl: "https://sunnah.com/hisn%3A99",
  },
  {
    id: "s-hm-100",
    category: "before_sleep",
    orderIndex: 1,
    arabicText:
      "\ufd3f\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0647\u064f\u0648\u064e \u0627\u0644\u0652\u062d\u064e\u064a\u0651\u064f \u0627\u0644\u0652\u0642\u064e\u064a\u0651\u064f\u0648\u0645\u064f \u0644\u0627\u064e \u062a\u064e\u0623\u0652\u062e\u064f\u0630\u064f\u0647\u064f \u0633\u0650\u0646\u064e\u0629\u064c \u0648\u064e\u0644\u0627\u064e \u0646\u064e\u0648\u0652\u0645\u064c... \u0648\u064e\u0647\u064f\u0648\u064e \u0627\u0644\u0652\u0639\u064e\u0644\u0650\u064a\u0651\u064f \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u064f\ufd3e",
    transliteration:
      "All\u0101hu l\u0101 il\u0101ha ill\u0101 huwa \u2019l-\u1e24ayyul-Qayy\u016bm, l\u0101 ta\u2019khudhuhu sinatun wa l\u0101 nawm... wa huwal-\u02bfAliyyul-\u02bfA\u1e93\u012bm.",
    translation:
      "Allah\u2014there is none worthy of worship except Him, the Ever-Living, the Sustainer... and He is the Most High, the Magnificent.",
    benefit: "Full Arabic text appears in HM-75.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari; Hisn al-Muslim 100.",
    preferredTiming: "When lying down to sleep.",
    hadithText:
      "\u0648\u0631\u062f \u0641\u064a \u062d\u062f\u064a\u062b \u0623\u0628\u064a \u0647\u0631\u064a\u0631\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647: \u0645\u0646 \u0642\u0631\u0623 \u0622\u064a\u0629 \u0627\u0644\u0643\u0631\u0633\u064a \u0639\u0646\u062f \u0627\u0644\u0646\u0648\u0645 \u0644\u0627 \u064a\u0632\u0627\u0644 \u0639\u0644\u064a\u0647 \u0645\u0646 \u0627\u0644\u0644\u0647 \u062d\u0627\u0641\u0638\u060c \u0648\u0644\u0627 \u064a\u0642\u0631\u0628\u0647 \u0634\u064a\u0637\u0627\u0646 \u062d\u062a\u0649 \u064a\u0635\u0628\u062d.",
    authenticityNote: "Sahih al-Bukhari.",
    notes: "Full Arabic text appears in HM-75.",
    sourceUrl: "https://sunnah.com/hisn%3A100",
  },
  {
    id: "s-hm-101",
    category: "before_sleep",
    orderIndex: 2,
    arabicText:
      "\ufd3f\u0622\u0645\u064e\u0646\u064e \u0627\u0644\u0631\u0651\u064e\u0633\u064f\u0648\u0644\u064f \u0628\u0650\u0645\u064e\u0627 \u0623\u064f\u0646\u0632\u0650\u0644\u064e \u0625\u0650\u0644\u064e\u064a\u0652\u0647\u0650 \u0645\u0650\u0646 \u0631\u0651\u064e\u0628\u0651\u0650\u0647\u0650 \u0648\u064e\u0627\u0644\u0652\u0645\u064f\u0624\u0652\u0645\u0650\u0646\u064f\u0648\u0646\u064e... \u0641\u064e\u0627\u0646\u0635\u064f\u0631\u0652\u0646\u064e\u0627 \u0639\u064e\u0644\u064e\u0649 \u0627\u0644\u0652\u0642\u064e\u0648\u0652\u0645\u0650 \u0627\u0644\u0652\u0643\u064e\u0627\u0641\u0650\u0631\u0650\u064a\u0646\u064e\ufd3e",
    transliteration:
      "\u0100manar-Ras\u016blu bim\u0101 unzila ilayhi mir-Rabbihi wal-mu\u2019min\u016bn... fan\u1e63urn\u0101 \u02bfalal-qawmil-k\u0101fir\u012bn.",
    translation:
      "The Messenger believes in what was sent down to him from his Lord, and so do the believers... so grant us victory over the disbelieving people.",
    benefit: "Full verses are al-Baqarah 2:285-286.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari; Muslim 1/554; Hisn al-Muslim 101.",
    preferredTiming: "At night before sleeping.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0627\u0644\u0622\u064a\u064e\u062a\u064e\u0627\u0646\u0650 \u0645\u0650\u0646\u0652 \u0622\u062e\u0650\u0631\u0650 \u0633\u064f\u0648\u0631\u064e\u0629\u0650 \u0627\u0644\u0652\u0628\u064e\u0642\u064e\u0631\u064e\u0629\u0650\u060c \u0645\u064e\u0646\u0652 \u0642\u064e\u0631\u064e\u0623\u064e\u0647\u064f\u0645\u064e\u0627 \u0641\u0650\u064a \u0644\u064e\u064a\u0652\u0644\u064e\u0629\u064d \u0643\u064e\u0641\u064e\u062a\u064e\u0627\u0647\u064f\u00bb.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Full verses are al-Baqarah 2:285-286.",
    sourceUrl: "https://sunnah.com/hisn%3A101",
  },
  {
    id: "s-hm-102",
    category: "before_sleep",
    orderIndex: 3,
    arabicText:
      "\u0628\u0650\u0627\u0633\u0652\u0645\u0650\u0643\u064e \u0631\u064e\u0628\u0651\u0650\u064a \u0648\u064e\u0636\u064e\u0639\u0652\u062a\u064f \u062c\u064e\u0646\u0652\u0628\u0650\u064a\u060c \u0648\u064e\u0628\u0650\u0643\u064e \u0623\u064e\u0631\u0652\u0641\u064e\u0639\u064f\u0647\u064f\u060c \u0641\u064e\u0625\u0650\u0646\u0652 \u0623\u064e\u0645\u0652\u0633\u064e\u0643\u0652\u062a\u064e \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0641\u064e\u0627\u0631\u0652\u062d\u064e\u0645\u0652\u0647\u064e\u0627\u060c \u0648\u064e\u0625\u0650\u0646\u0652 \u0623\u064e\u0631\u0652\u0633\u064e\u0644\u0652\u062a\u064e\u0647\u064e\u0627 \u0641\u064e\u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0647\u064e\u0627 \u0628\u0650\u0645\u064e\u0627 \u062a\u064e\u062d\u0652\u0641\u064e\u0638\u064f \u0628\u0650\u0647\u0650 \u0639\u0650\u0628\u064e\u0627\u062f\u064e\u0643\u064e \u0627\u0644\u0635\u0651\u064e\u0627\u0644\u0650\u062d\u0650\u064a\u0646\u064e.",
    transliteration:
      "Bismika Rabb\u012b wa\u1e0da\u02bftu janb\u012b, wa bika arfa\u02bfuh, fa in amsakta nafs\u012b far\u1e25amh\u0101, wa in arsaltah\u0101 fa\u1e25fa\u1e93h\u0101 bim\u0101 ta\u1e25fa\u1e93u bihi \u02bfib\u0101daka\u1e63-\u1e63\u0101li\u1e25\u012bn.",
    translation:
      "With Your Name, my Lord, I lay down my side, and by You I raise it. If You take my soul, have mercy on it; and if You release it, protect it as You protect Your righteous servants.",
    benefit: "Sahih al-Bukhari and Sahih Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 11/126; Muslim 4/2084; Hisn al-Muslim 102.",
    preferredTiming: "When lying down after dusting off the bed.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0648\u064e\u0649 \u0623\u064e\u062d\u064e\u062f\u064f\u0643\u064f\u0645\u0652 \u0625\u0650\u0644\u064e\u0649 \u0641\u0650\u0631\u064e\u0627\u0634\u0650\u0647\u0650 \u0641\u064e\u0644\u0652\u064a\u064e\u0646\u0652\u0641\u064f\u0636\u0652 \u0641\u0650\u0631\u064e\u0627\u0634\u064e\u0647\u064f \u0628\u0650\u062f\u064e\u0627\u062e\u0650\u0644\u064e\u0629\u0650 \u0625\u0650\u0632\u064e\u0627\u0631\u0650\u0647\u0650... \u062b\u064f\u0645\u0651\u064e \u0644\u0650\u064a\u064e\u0642\u064f\u0644\u0652: \u0628\u0650\u0627\u0633\u0652\u0645\u0650\u0643\u064e \u0631\u064e\u0628\u0651\u0650\u064a \u0648\u064e\u0636\u064e\u0639\u0652\u062a\u064f \u062c\u064e\u0646\u0652\u0628\u0650\u064a...\u00bb",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A102",
  },
  {
    id: "s-hm-103",
    category: "before_sleep",
    orderIndex: 4,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u064e\u0643\u064e \u062e\u064e\u0644\u064e\u0642\u0652\u062a\u064e \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0648\u064e\u0623\u064e\u0646\u0652\u062a\u064e \u062a\u064e\u0648\u064e\u0641\u0651\u064e\u0627\u0647\u064e\u0627\u060c \u0644\u064e\u0643\u064e \u0645\u064e\u0645\u064e\u0627\u062a\u064f\u0647\u064e\u0627 \u0648\u064e\u0645\u064e\u062d\u0652\u064a\u064e\u0627\u0647\u064e\u0627\u060c \u0625\u0650\u0646\u0652 \u0623\u064e\u062d\u0652\u064a\u064e\u064a\u0652\u062a\u064e\u0647\u064e\u0627 \u0641\u064e\u0627\u062d\u0652\u0641\u064e\u0638\u0652\u0647\u064e\u0627\u060c \u0648\u064e\u0625\u0650\u0646\u0652 \u0623\u064e\u0645\u064e\u062a\u0651\u064e\u0647\u064e\u0627 \u0641\u064e\u0627\u063a\u0652\u0641\u0650\u0631\u0652 \u0644\u064e\u0647\u064e\u0627. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0625\u0650\u0646\u0651\u0650\u064a \u0623\u064e\u0633\u0652\u0623\u064e\u0644\u064f\u0643\u064e \u0627\u0644\u0652\u0639\u064e\u0627\u0641\u0650\u064a\u064e\u0629\u064e.",
    transliteration:
      "All\u0101humma innaka khalaqta nafs\u012b wa anta tawaff\u0101h\u0101, laka mam\u0101tuh\u0101 wa ma\u1e25y\u0101h\u0101, in a\u1e25yaytah\u0101 fa\u1e25fa\u1e93h\u0101, wa in amattah\u0101 faghfir lah\u0101. All\u0101humma inn\u012b as\u2019alukal-\u02bf\u0101fiyah.",
    translation:
      "O Allah, You created my soul and You take it. To You belongs its death and life. If You keep it alive, protect it; and if You cause it to die, forgive it. O Allah, I ask You for wellbeing.",
    benefit: "Sahih Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 4/2083; Ahmad 2/79; Hisn al-Muslim 103.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0648\u0631\u062f \u0639\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0647\u0630\u0627 \u0627\u0644\u062f\u0639\u0627\u0621 \u0639\u0646\u062f \u0627\u0644\u0646\u0648\u0645 \u0641\u064a \u0635\u062d\u064a\u062d \u0645\u0633\u0644\u0645.",
    authenticityNote: "Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A103",
  },
  {
    id: "s-hm-104",
    category: "before_sleep",
    orderIndex: 5,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0642\u0650\u0646\u0650\u064a \u0639\u064e\u0630\u064e\u0627\u0628\u064e\u0643\u064e \u064a\u064e\u0648\u0652\u0645\u064e \u062a\u064e\u0628\u0652\u0639\u064e\u062b\u064f \u0639\u0650\u0628\u064e\u0627\u062f\u064e\u0643\u064e.",
    transliteration: "All\u0101humma qin\u012b \u02bfadh\u0101baka yawma tab\u02bfathu \u02bfib\u0101dak.",
    translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants.",
    benefit: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    repetitionCount: 3,
    countLabel: "3",
    sourceReference: "Abu Dawud 4/311; At-Tirmidhi; Hisn al-Muslim 104.",
    preferredTiming: "When lying down, placing the right hand under the cheek.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0625\u0630\u0627 \u0623\u0631\u0627\u062f \u0623\u0646 \u064a\u0631\u0642\u062f \u0648\u0636\u0639 \u064a\u062f\u0647 \u0627\u0644\u064a\u0645\u0646\u0649 \u062a\u062d\u062a \u062e\u062f\u0647 \u062b\u0645 \u0642\u0627\u0644: \u00ab\u0627\u0644\u0644\u0647\u0645 \u0642\u0646\u064a \u0639\u0630\u0627\u0628\u0643 \u064a\u0648\u0645 \u062a\u0628\u0639\u062b \u0639\u0628\u0627\u062f\u0643\u00bb \u062b\u0644\u0627\u062b \u0645\u0631\u0627\u062a.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A104",
  },
  {
    id: "s-hm-105",
    category: "before_sleep",
    orderIndex: 6,
    arabicText:
      "\u0628\u0650\u0627\u0633\u0652\u0645\u0650\u0643\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0645\u064f\u0648\u062a\u064f \u0648\u064e\u0623\u064e\u062d\u0652\u064a\u064e\u0627.",
    transliteration: "Bismika All\u0101humma am\u016btu wa a\u1e25y\u0101.",
    translation: "In Your Name, O Allah, I die and I live.",
    benefit: "Sahih al-Bukhari and Sahih Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari; Muslim 4/2083; Hisn al-Muslim 105.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0643\u0627\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0625\u0630\u0627 \u0623\u0648\u0649 \u0625\u0644\u0649 \u0641\u0631\u0627\u0634\u0647 \u0642\u0627\u0644: \u00ab\u0628\u0627\u0633\u0645\u0643 \u0627\u0644\u0644\u0647\u0645 \u0623\u0645\u0648\u062a \u0648\u0623\u062d\u064a\u0627\u00bb\u060c \u0648\u0625\u0630\u0627 \u0627\u0633\u062a\u064a\u0642\u0638 \u0642\u0627\u0644: \u00ab\u0627\u0644\u062d\u0645\u062f \u0644\u0644\u0647 \u0627\u0644\u0630\u064a \u0623\u062d\u064a\u0627\u0646\u0627 \u0628\u0639\u062f \u0645\u0627 \u0623\u0645\u0627\u062a\u0646\u0627 \u0648\u0625\u0644\u064a\u0647 \u0627\u0644\u0646\u0634\u0648\u0631\u00bb.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A105",
  },
  {
    id: "s-hm-106-subhanallah",
    category: "before_sleep",
    orderIndex: 7,
    arabicText: "\u0633\u064f\u0628\u0652\u062d\u064e\u0627\u0646\u064e \u0627\u0644\u0644\u0651\u064e\u0647\u0650",
    transliteration: "Sub\u1e25\u0101nall\u0101h.",
    translation: "Glory be to Allah.",
    benefit: "Sahih al-Bukhari and Sahih Muslim.",
    repetitionCount: 33,
    countLabel: "33 + 33 + 34",
    sourceReference: "Al-Bukhari; Muslim 4/2091; Hisn al-Muslim 106.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0639\u0644\u0651\u0645 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0639\u0644\u064a\u0651\u064b\u0627 \u0648\u0641\u0627\u0637\u0645\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647\u0645\u0627 \u0623\u0646 \u064a\u0633\u0628\u0651\u062d\u0627 \u0639\u0646\u062f \u0645\u0646\u0627\u0645\u0647\u0645\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u064a\u062d\u0645\u062f\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u064a\u0643\u0628\u0651\u0631\u0627 \u0623\u0631\u0628\u0639\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u0642\u0627\u0644: \u00ab\u0641\u064e\u0647\u064f\u0648\u064e \u062e\u064e\u064a\u0652\u0631\u064c \u0644\u064e\u0643\u064f\u0645\u064e\u0627 \u0645\u0650\u0646\u0652 \u062e\u064e\u0627\u062f\u0650\u0645\u064d\u00bb.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A106",
  },
  {
    id: "s-hm-106-alhamdulillah",
    category: "before_sleep",
    orderIndex: 8,
    arabicText: "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650",
    transliteration: "Al\u1e25amdulill\u0101h.",
    translation: "All praise is due to Allah.",
    benefit: "Sahih al-Bukhari and Sahih Muslim.",
    repetitionCount: 33,
    countLabel: "33 + 33 + 34",
    sourceReference: "Al-Bukhari; Muslim 4/2091; Hisn al-Muslim 106.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0639\u0644\u0651\u0645 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0639\u0644\u064a\u0651\u064b\u0627 \u0648\u0641\u0627\u0637\u0645\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647\u0645\u0627 \u0623\u0646 \u064a\u0633\u0628\u0651\u062d\u0627 \u0639\u0646\u062f \u0645\u0646\u0627\u0645\u0647\u0645\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u064a\u062d\u0645\u062f\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u064a\u0643\u0628\u0651\u0631\u0627 \u0623\u0631\u0628\u0639\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u0642\u0627\u0644: \u00ab\u0641\u064e\u0647\u064f\u0648\u064e \u062e\u064e\u064a\u0652\u0631\u064c \u0644\u064e\u0643\u064f\u0645\u064e\u0627 \u0645\u0650\u0646\u0652 \u062e\u064e\u0627\u062f\u0650\u0645\u064d\u00bb.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A106",
  },
  {
    id: "s-hm-106-allahu-akbar",
    category: "before_sleep",
    orderIndex: 9,
    arabicText: "\u0627\u0644\u0644\u0651\u064e\u0647\u064f \u0623\u064e\u0643\u0652\u0628\u064e\u0631\u064f",
    transliteration: "All\u0101hu akbar.",
    translation: "Allah is the Greatest.",
    benefit: "Sahih al-Bukhari and Sahih Muslim.",
    repetitionCount: 34,
    countLabel: "33 + 33 + 34",
    sourceReference: "Al-Bukhari; Muslim 4/2091; Hisn al-Muslim 106.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0639\u0644\u0651\u0645 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0639\u0644\u064a\u0651\u064b\u0627 \u0648\u0641\u0627\u0637\u0645\u0629 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647\u0645\u0627 \u0623\u0646 \u064a\u0633\u0628\u0651\u062d\u0627 \u0639\u0646\u062f \u0645\u0646\u0627\u0645\u0647\u0645\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u064a\u062d\u0645\u062f\u0627 \u062b\u0644\u0627\u062b\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u064a\u0643\u0628\u0651\u0631\u0627 \u0623\u0631\u0628\u0639\u064b\u0627 \u0648\u062b\u0644\u0627\u062b\u064a\u0646\u060c \u0648\u0642\u0627\u0644: \u00ab\u0641\u064e\u0647\u064f\u0648\u064e \u062e\u064e\u064a\u0652\u0631\u064c \u0644\u064e\u0643\u064f\u0645\u064e\u0627 \u0645\u0650\u0646\u0652 \u062e\u064e\u0627\u062f\u0650\u0645\u064d\u00bb.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A106",
  },
  {
    id: "s-hm-107",
    category: "before_sleep",
    orderIndex: 10,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0631\u064e\u0628\u0651\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0627\u0644\u0633\u0651\u064e\u0628\u0652\u0639\u0650 \u0648\u064e\u0631\u064e\u0628\u0651\u064e \u0627\u0644\u0652\u0639\u064e\u0631\u0652\u0634\u0650 \u0627\u0644\u0652\u0639\u064e\u0638\u0650\u064a\u0645\u0650\u060c \u0631\u064e\u0628\u0651\u064e\u0646\u064e\u0627 \u0648\u064e\u0631\u064e\u0628\u0651\u064e \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d\u060c \u0641\u064e\u0627\u0644\u0650\u0642\u064e \u0627\u0644\u0652\u062d\u064e\u0628\u0651\u0650 \u0648\u064e\u0627\u0644\u0646\u0651\u064e\u0648\u064e\u0649\u060c \u0648\u064e\u0645\u064f\u0646\u0652\u0632\u0650\u0644\u064e \u0627\u0644\u062a\u0651\u064e\u0648\u0652\u0631\u064e\u0627\u0629\u0650 \u0648\u064e\u0627\u0644\u0625\u0650\u0646\u0652\u062c\u0650\u064a\u0644\u0650 \u0648\u064e\u0627\u0644\u0652\u0641\u064f\u0631\u0652\u0642\u064e\u0627\u0646\u0650\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0623\u064e\u0646\u0652\u062a\u064e \u0622\u062e\u0650\u0630\u064c \u0628\u0650\u0646\u064e\u0627\u0635\u0650\u064a\u064e\u062a\u0650\u0647\u0650. \u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0623\u064e\u0648\u0651\u064e\u0644\u064f \u0641\u064e\u0644\u064e\u064a\u0652\u0633\u064e \u0642\u064e\u0628\u0652\u0644\u064e\u0643\u064e \u0634\u064e\u064a\u0652\u0621\u064c\u060c \u0648\u064e\u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0622\u062e\u0650\u0631\u064f \u0641\u064e\u0644\u064e\u064a\u0652\u0633\u064e \u0628\u064e\u0639\u0652\u062f\u064e\u0643\u064e \u0634\u064e\u064a\u0652\u0621\u064c\u060c \u0648\u064e\u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0638\u0651\u064e\u0627\u0647\u0650\u0631\u064f \u0641\u064e\u0644\u064e\u064a\u0652\u0633\u064e \u0641\u064e\u0648\u0652\u0642\u064e\u0643\u064e \u0634\u064e\u064a\u0652\u0621\u064c\u060c \u0648\u064e\u0623\u064e\u0646\u0652\u062a\u064e \u0627\u0644\u0652\u0628\u064e\u0627\u0637\u0650\u0646\u064f \u0641\u064e\u0644\u064e\u064a\u0652\u0633\u064e \u062f\u064f\u0648\u0646\u064e\u0643\u064e \u0634\u064e\u064a\u0652\u0621\u064c\u060c \u0627\u0642\u0652\u0636\u0650 \u0639\u064e\u0646\u0651\u064e\u0627 \u0627\u0644\u062f\u0651\u064e\u064a\u0652\u0646\u064e\u060c \u0648\u064e\u0623\u064e\u063a\u0652\u0646\u0650\u0646\u064e\u0627 \u0645\u0650\u0646\u064e \u0627\u0644\u0652\u0641\u064e\u0642\u0652\u0631\u0650.",
    transliteration:
      "All\u0101humma Rabbas-sam\u0101w\u0101tis-sab\u02bfi wa Rabbal-\u02bfArshil-\u02bfA\u1e93\u012bm, Rabban\u0101 wa Rabba kulli shay\u2019, f\u0101liqal-\u1e25abbi wan-naw\u0101, wa munzilat-Tawr\u0101ti wal-Inj\u012bli wal-Furq\u0101n, a\u02bf\u016bdhu bika min sharri kulli shay\u2019in anta \u0101khidhun bin\u0101\u1e63iyatih. All\u0101humma antal-Awwalu falaysa qablaka shay\u2019, wa antal-\u0100khiru falaysa ba\u02bfdaka shay\u2019, wa anta\u1e93-\u1e92\u0101hiru falaysa fawqaka shay\u2019, wa antal-B\u0101\u1e6dinu falaysa d\u016bnaka shay\u2019, iq\u1e0di \u02bfannad-dayn, wa aghnin\u0101 minal-faqr.",
    translation:
      "O Allah, Lord of the seven heavens and Lord of the Magnificent Throne, our Lord and Lord of everything, Splitter of the seed and date-stone, Revealer of the Torah, Injil, and Qur\u2019an, I seek refuge in You from the evil of everything You hold by the forelock. O Allah, You are the First and nothing is before You; You are the Last and nothing is after You; You are the Manifest and nothing is above You; You are the Near/Hidden and nothing is beneath You. Settle our debts and enrich us from poverty.",
    benefit: "Sahih Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 4/2084; Hisn al-Muslim 107.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0648\u0631\u062f \u0647\u0630\u0627 \u0627\u0644\u062f\u0639\u0627\u0621 \u0641\u064a \u0635\u062d\u064a\u062d \u0645\u0633\u0644\u0645 \u0645\u0646 \u0623\u0630\u0643\u0627\u0631 \u0627\u0644\u0646\u0648\u0645.",
    authenticityNote: "Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A107",
  },
  {
    id: "s-hm-108",
    category: "before_sleep",
    orderIndex: 11,
    arabicText:
      "\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0623\u064e\u0637\u0652\u0639\u064e\u0645\u064e\u0646\u064e\u0627 \u0648\u064e\u0633\u064e\u0642\u064e\u0627\u0646\u064e\u0627\u060c \u0648\u064e\u0643\u064e\u0641\u064e\u0627\u0646\u064e\u0627\u060c \u0648\u064e\u0622\u0648\u064e\u0627\u0646\u064e\u0627\u060c \u0641\u064e\u0643\u064e\u0645\u0652 \u0645\u0650\u0645\u0651\u064e\u0646\u0652 \u0644\u0627\u064e \u0643\u064e\u0627\u0641\u0650\u064a\u064e \u0644\u064e\u0647\u064f \u0648\u064e\u0644\u0627\u064e \u0645\u064f\u0624\u0652\u0648\u0650\u064a\u064e.",
    transliteration:
      "Al\u1e25amdu lill\u0101hil-ladh\u012b a\u1e6d\u02bfaman\u0101 wa saq\u0101n\u0101, wa kaf\u0101n\u0101, wa \u0101w\u0101n\u0101, fakam mimman l\u0101 k\u0101fiya lahu wa l\u0101 mu\u2019w\u012b.",
    translation:
      "Praise be to Allah who fed us, gave us drink, sufficed us, and sheltered us; how many have no one to suffice or shelter them.",
    benefit: "Sahih Muslim.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 4/2085; Hisn al-Muslim 108.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0648\u0631\u062f \u0647\u0630\u0627 \u0627\u0644\u062d\u0645\u062f \u0639\u0646\u062f \u0627\u0644\u0646\u0648\u0645 \u0641\u064a \u0635\u062d\u064a\u062d \u0645\u0633\u0644\u0645.",
    authenticityNote: "Sahih Muslim.",
    notes: "",
    sourceUrl: "https://sunnah.com/hisn%3A108",
  },
  {
    id: "s-hm-109",
    category: "before_sleep",
    orderIndex: 12,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0639\u064e\u0627\u0644\u0650\u0645\u064e \u0627\u0644\u0652\u063a\u064e\u064a\u0652\u0628\u0650 \u0648\u064e\u0627\u0644\u0634\u0651\u064e\u0647\u064e\u0627\u062f\u064e\u0629\u0650\u060c \u0641\u064e\u0627\u0637\u0650\u0631\u064e \u0627\u0644\u0633\u0651\u064e\u0645\u064e\u0627\u0648\u064e\u0627\u062a\u0650 \u0648\u064e\u0627\u0644\u0623\u064e\u0631\u0652\u0636\u0650\u060c \u0631\u064e\u0628\u0651\u064e \u0643\u064f\u0644\u0651\u0650 \u0634\u064e\u064a\u0652\u0621\u064d \u0648\u064e\u0645\u064e\u0644\u0650\u064a\u0643\u064e\u0647\u064f\u060c \u0623\u064e\u0634\u0652\u0647\u064e\u062f\u064f \u0623\u064e\u0646\u0652 \u0644\u0627\u064e \u0625\u0650\u0644\u064e\u0647\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0623\u064e\u0646\u0652\u062a\u064e\u060c \u0623\u064e\u0639\u064f\u0648\u0630\u064f \u0628\u0650\u0643\u064e \u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0646\u064e\u0641\u0652\u0633\u0650\u064a\u060c \u0648\u064e\u0645\u0650\u0646\u0652 \u0634\u064e\u0631\u0651\u0650 \u0627\u0644\u0634\u0651\u064e\u064a\u0652\u0637\u064e\u0627\u0646\u0650 \u0648\u064e\u0634\u0650\u0631\u0652\u0643\u0650\u0647\u0650\u060c \u0648\u064e\u0623\u064e\u0646\u0652 \u0623\u064e\u0642\u0652\u062a\u064e\u0631\u0650\u0641\u064e \u0639\u064e\u0644\u064e\u0649 \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0633\u064f\u0648\u0621\u064b\u0627\u060c \u0623\u064e\u0648\u0652 \u0623\u064e\u062c\u064f\u0631\u0651\u064e\u0647\u064f \u0625\u0650\u0644\u064e\u0649 \u0645\u064f\u0633\u0652\u0644\u0650\u0645\u064d.",
    transliteration:
      "All\u0101humma \u02bf\u0101limal-ghaybi wash-shah\u0101dah, f\u0101\u1e6diras-sam\u0101w\u0101ti wal-ar\u1e0d, Rabba kulli shay\u2019in wa mal\u012bkah, ash-hadu an l\u0101 il\u0101ha ill\u0101 ant, a\u02bf\u016bdhu bika min sharri nafs\u012b, wa min sharrish-shay\u1e6d\u0101ni wa shirkih, wa an aqtarifa \u02bfal\u0101 nafs\u012b s\u016b\u2019an, aw ajurrahu il\u0101 Muslim.",
    translation:
      "O Allah, Knower of the unseen and witnessed, Creator of the heavens and earth, Lord and Sovereign of everything. I bear witness that none is worthy of worship but You. I seek refuge in You from the evil of myself and from the evil of Satan and his shirk, and from committing evil against myself or bringing it upon a Muslim.",
    benefit: "Duplicate wording with HM-85; retained here because Hisn lists it in before-sleep chapter too.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/317; At-Tirmidhi; Hisn al-Muslim 109.",
    preferredTiming: "Before sleeping; also said morning/evening.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa \u0644\u0623\u0628\u064a \u0628\u0643\u0631 \u0631\u0636\u064a \u0627\u0644\u0644\u0647 \u0639\u0646\u0647: \u00ab\u0642\u064f\u0644\u0652\u0647\u064f \u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0635\u0652\u0628\u064e\u062d\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u0645\u0652\u0633\u064e\u064a\u0652\u062a\u064e\u060c \u0648\u064e\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u062e\u064e\u0630\u0652\u062a\u064e \u0645\u064e\u0636\u0652\u062c\u064e\u0639\u064e\u0643\u064e\u00bb.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Duplicate wording with HM-85; retained here because Hisn lists it in before-sleep chapter too.",
    sourceUrl: "https://sunnah.com/hisn%3A109",
  },
  {
    id: "s-hm-110",
    category: "before_sleep",
    orderIndex: 13,
    arabicText:
      "\u064a\u064e\u0642\u0652\u0631\u064e\u0623\u064f \u0633\u064f\u0648\u0631\u064e\u0629\u064e \u0627\u0644\u0633\u0651\u064e\u062c\u0652\u062f\u064e\u0629\u0650 \u0648\u064e\u0633\u064f\u0648\u0631\u064e\u0629\u064e \u0627\u0644\u0652\u0645\u064f\u0644\u0652\u0643\u0650.",
    transliteration: "Yaqra\u2019u S\u016brat as-Sajdah wa S\u016brat al-Mulk.",
    translation: "Recite Surah as-Sajdah and Surah al-Mulk.",
    benefit: "Full surah text not expanded to keep the workbook usable; recite from Qur\u2019an.",
    repetitionCount: 1,
    countLabel: "1 each",
    sourceReference: "At-Tirmidhi; An-Nasa\u2019i; Hisn al-Muslim 110.",
    preferredTiming: "Before sleeping.",
    hadithText:
      "\u0648\u0631\u062f \u0623\u0646 \u0627\u0644\u0646\u0628\u064a \ufdfa \u0643\u0627\u0646 \u0644\u0627 \u064a\u0646\u0627\u0645 \u062d\u062a\u0649 \u064a\u0642\u0631\u0623: \ufd3f\u0627\u0644\u0645 * \u062a\u0646\u0632\u064a\u0644\ufd3e \u0627\u0644\u0633\u062c\u062f\u0629\u060c \u0648\ufd3f\u062a\u0628\u0627\u0631\u0643 \u0627\u0644\u0630\u064a \u0628\u064a\u062f\u0647 \u0627\u0644\u0645\u0644\u0643\ufd3e.",
    authenticityNote: "Authenticated by al-Albani in Sahih al-Jami\u02bf as cited in Hisn al-Muslim/Sunnah.com.",
    notes: "Full surah text not expanded to keep the workbook usable; recite from Qur\u2019an.",
    sourceUrl: "https://sunnah.com/hisn%3A110",
  },
  {
    id: "s-hm-111",
    category: "before_sleep",
    orderIndex: 14,
    arabicText:
      "\u0627\u0644\u0644\u0651\u064e\u0647\u064f\u0645\u0651\u064e \u0623\u064e\u0633\u0652\u0644\u064e\u0645\u0652\u062a\u064f \u0646\u064e\u0641\u0652\u0633\u0650\u064a \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e\u060c \u0648\u064e\u0641\u064e\u0648\u0651\u064e\u0636\u0652\u062a\u064f \u0623\u064e\u0645\u0652\u0631\u0650\u064a \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e\u060c \u0648\u064e\u0648\u064e\u062c\u0651\u064e\u0647\u0652\u062a\u064f \u0648\u064e\u062c\u0652\u0647\u0650\u064a \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e\u060c \u0648\u064e\u0623\u064e\u0644\u0652\u062c\u064e\u0623\u0652\u062a\u064f \u0638\u064e\u0647\u0652\u0631\u0650\u064a \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e\u060c \u0631\u064e\u063a\u0652\u0628\u064e\u0629\u064b \u0648\u064e\u0631\u064e\u0647\u0652\u0628\u064e\u0629\u064b \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e\u060c \u0644\u0627\u064e \u0645\u064e\u0644\u0652\u062c\u064e\u0623\u064e \u0648\u064e\u0644\u0627\u064e \u0645\u064e\u0646\u0652\u062c\u064e\u0627 \u0645\u0650\u0646\u0652\u0643\u064e \u0625\u0650\u0644\u0627\u0651\u064e \u0625\u0650\u0644\u064e\u064a\u0652\u0643\u064e\u060c \u0622\u0645\u064e\u0646\u0652\u062a\u064f \u0628\u0650\u0643\u0650\u062a\u064e\u0627\u0628\u0650\u0643\u064e \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0623\u064e\u0646\u0652\u0632\u064e\u0644\u0652\u062a\u064e\u060c \u0648\u064e\u0628\u0650\u0646\u064e\u0628\u0650\u064a\u0651\u0650\u0643\u064e \u0627\u0644\u0651\u064e\u0630\u0650\u064a \u0623\u064e\u0631\u0652\u0633\u064e\u0644\u0652\u062a\u064e.",
    transliteration:
      "All\u0101humma aslamtu nafs\u012b ilayk, wa fawwa\u1e0dtu amr\u012b ilayk, wa wajjahtu wajh\u012b ilayk, wa alja\u2019tu \u1e93ahr\u012b ilayk, raghbatan wa rahbatan ilayk, l\u0101 malja\u2019a wa l\u0101 manj\u0101 minka ill\u0101 ilayk, \u0101mantu bikit\u0101bikal-ladh\u012b anzalt, wa binabiyyikal-ladh\u012b arsalt.",
    translation:
      "O Allah, I submit myself to You, entrust my affair to You, turn my face to You, and lay my back relying upon You, hoping in You and fearing You. There is no refuge and no escape from You except to You. I believe in Your Book that You revealed and Your Prophet whom You sent.",
    benefit: "Make it the last supplication before sleep when possible.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 11/113; Muslim 4/2081; Hisn al-Muslim 111.",
    preferredTiming: "Before sleeping; perform wudu, lie on the right side, and make this the final words if possible.",
    hadithText:
      "\u0642\u0627\u0644 \ufdfa: \u00ab\u0625\u0650\u0630\u064e\u0627 \u0623\u064e\u062a\u064e\u064a\u0652\u062a\u064e \u0645\u064e\u0636\u0652\u062c\u064e\u0639\u064e\u0643\u064e \u0641\u064e\u062a\u064e\u0648\u064e\u0636\u0651\u064e\u0623\u0652 \u0648\u064f\u0636\u064f\u0648\u0621\u064e\u0643\u064e \u0644\u0650\u0644\u0635\u0651\u064e\u0644\u0627\u064e\u0629\u0650\u060c \u062b\u064f\u0645\u0651\u064e \u0627\u0636\u0652\u0637\u064e\u062c\u0650\u0639\u0652 \u0639\u064e\u0644\u064e\u0649 \u0634\u0650\u0642\u0651\u0650\u0643\u064e \u0627\u0644\u0623\u064e\u064a\u0652\u0645\u064e\u0646\u0650\u060c \u062b\u064f\u0645\u0651\u064e \u0642\u064f\u0644\u0652...\u00bb \u062b\u0645 \u0642\u0627\u0644: \u00ab\u0641\u064e\u0625\u0650\u0646\u0652 \u0645\u064f\u062a\u0651\u064e \u0645\u0650\u0646\u0652 \u0644\u064e\u064a\u0652\u0644\u064e\u062a\u0650\u0643\u064e \u0641\u064e\u0623\u064e\u0646\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u0649 \u0627\u0644\u0652\u0641\u0650\u0637\u0652\u0631\u064e\u0629\u0650\u060c \u0648\u064e\u0627\u062c\u0652\u0639\u064e\u0644\u0652\u0647\u064f\u0646\u0651\u064e \u0622\u062e\u0650\u0631\u064e \u0645\u064e\u0627 \u062a\u064e\u062a\u064e\u0643\u064e\u0644\u0651\u064e\u0645\u064f \u0628\u0650\u0647\u0650\u00bb.",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
    notes: "Make it the last supplication before sleep when possible.",
    sourceUrl: "https://sunnah.com/hisn%3A111",
  },
];

const WAKING_UP_AZKAR: Zikr[] = [
  {
    id: "wu-hm-1",
    category: "waking_up",
    orderIndex: 0,
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ.",
    transliteration: "Alḥamdu lillāhil-ladhī aḥyānā baʿda mā amātanā wa ilayhin-nushūr.",
    translation:
      "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.",
    benefit: "Sahih al-Bukhari.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 11/113; Muslim 4/2083; Hisn al-Muslim 1.",
    hadithText:
      "عَنْ حُذَيْفَةَ، وَأَبِي ذَرٍّ، رضى الله عنهما قَالاَ كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم إِذَا أَوَى إِلَى فِرَاشِهِ قَالَ: «بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ» وَإِذَا اسْتَيْقَظَ قَالَ: «الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ».",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "wu-hm-2",
    category: "waking_up",
    orderIndex: 1,
    arabicText:
      "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلاَ إِلَهَ إِلاَّ اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي.",
    transliteration:
      "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shay’in qadīr. Subḥānallāhi, walḥamdu lillāhi, wa lā ilāha illallāhu, wallāhu akbar, wa lā ḥawla wa lā quwwata illā billāhil-ʿAliyyil-ʿAẓīm. Rabbighfir lī.",
    translation:
      "None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things. Glory is to Allah. All praise is to Allah. None has the right to be worshipped but Allah. Allah is the Greatest. There is no power and no might except by Allah. My Lord, forgive me.",
    benefit:
      "Whoever says this will be forgiven, and if he supplicates Allah, his prayer will be answered; if he performs ablution and prays, his prayer will be accepted.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 3/39; Hisn al-Muslim 2.",
    hadithText:
      "مَنْ تَعَارَّ مِنَ اللَّيْلِ فَقَالَ... ثُمَّ قَالَ: اللَّهُمَّ اغْفِرْ لِي. أَوْ دَعَا اسْتُجِيبَ لَهُ، فَإِنْ تَوَضَّأَ وَصَلَّى قُبِلَتْ صَلاَتُهُ.",
    authenticityNote: "Sahih al-Bukhari.",
  },
];

const HOME_AZKAR: Zikr[] = [
  {
    id: "home-hm-15",
    category: "home",
    orderIndex: 0,
    arabicText: "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ.",
    transliteration: "Bismillāh, tawakkaltu ʿalallāh, wa lā ḥawla wa lā quwwata illā billāh.",
    translation:
      "In the Name of Allah, I have placed my trust in Allah, there is no might and no power except by Allah.",
    benefit:
      "When you say this, it will be said to you: 'You are guided, defended and protected.' The devil will go far away from you.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/325; At-Tirmidhi 5/490; Hisn al-Muslim 15.",
    hadithText:
      "مَنْ قَالَ يَعْنِي إِذَا خَرَجَ مِنْ بَيْتِهِ: بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ، يُقَالُ لَهُ كُفِيتَ وَوُقِيتَ وَتَنَحَّى عَنْهُ الشَّيْطَانُ.",
    authenticityNote: "Sahih according to Al-Albani.",
  },
  {
    id: "home-hm-16",
    category: "home",
    orderIndex: 1,
    arabicText: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا.",
    transliteration: "Bismillāhi walajnā, wa bismillāhi kharajnā, wa ʿalā Rabbīnā tawakkalnā.",
    translation: "In the Name of Allah we enter, in the Name of Allah we leave, and upon our Lord we depend.",
    benefit: "To be said upon entering the home. The person should then greet his family.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 4/325; Hisn al-Muslim 16.",
    hadithText:
      "إِذَا وَلَجَ الرَّجُلُ بَيْتَهُ فَلْيَقُلْ: بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا ثُمَّ لِيُسَلِّمْ عَلَى أَهْلِهِ.",
    authenticityNote: "Hasan according to Al-Albani.",
  },
];

const MOSQUE_AZKAR: Zikr[] = [
  {
    id: "msq-hm-20",
    category: "mosque",
    orderIndex: 0,
    arabicText:
      "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ... بِسْمِ اللَّهِ، وَالصَّلاَةُ وَالسَّلاَمُ عَلَى رَسُولِ اللَّهِ... اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
    transliteration:
      "Aʿūdhu billāhil-ʿAẓīm, wa bi-wajhihil-karīm, wa sulṭānihil-qadīm, minash-shayṭānir-rajīm... Bismillāhi, waṣ-ṣalātu was-salāmu ʿalā rasūlillāh... Allāhummaf-taḥ lī abwāba raḥmatik.",
    translation:
      "I seek refuge in Almighty Allah, by His Noble Face, by His primordial power, from Satan the outcast. In the Name of Allah, and blessings and peace be upon the Messenger of Allah. O Allah, open before me the doors of Your mercy.",
    benefit: "Upon entering the mosque. He will be protected from Satan for the rest of the day.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud; Muslim 1/494; Hisn al-Muslim 20.",
    hadithText: "إِذَا دَخَلَ أَحَدُكُمُ الْمَسْجِدَ فَلْيَقُلِ اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
    authenticityNote: "Sahih Muslim and Abu Dawud (Sahih Al-Albani).",
  },
  {
    id: "msq-hm-21",
    category: "mosque",
    orderIndex: 1,
    arabicText:
      "بِسْمِ اللَّهِ وَالصَّلاَةُ وَالسَّلاَمُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ.",
    transliteration:
      "Bismillāhi waṣ-ṣalātu was-salāmu ʿalā rasūlillāh, Allāhumma innī as’aluka min faḍlik, Allāhummaʿṣimnī minash-shayṭānir-rajīm.",
    translation:
      "In the Name of Allah, and peace and blessings be upon the Messenger of Allah. O Allah, I ask for Your favor, O Allah, protect me from Satan the outcast.",
    benefit: "To be said upon leaving the mosque.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 1/494; Ibn Majah; Hisn al-Muslim 21.",
    hadithText: "وَإِذَا خَرَجَ فَلْيَقُلِ اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ.",
    authenticityNote: "Sahih Muslim.",
  },
];

const AFTER_PRAYER_AZKAR: Zikr[] = [
  {
    id: "ap-hm-66",
    category: "after_prayer",
    orderIndex: 0,
    arabicText:
      "أَسْتَغْفِرُ اللَّهَ (ثَلاَثاً)... اللَّهُمَّ أَنْتَ السَّلاَمُ، وَمِنْكَ السَّلاَمُ، تَبَارَكْتَ يَا ذَا الْجَلاَلِ وَالإِكْرَامِ.",
    transliteration:
      "Astaghfirullāh (three times)... Allāhumma antas-salām, wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām.",
    translation:
      "I ask Allah for forgiveness (three times). O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honor.",
    benefit: "To be said immediately after concluding the prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 1/414; Hisn al-Muslim 66.",
    hadithText:
      "كَانَ رَسُولُ اللَّهِ صلى الله عليه وسلم إِذَا انْصَرَفَ مِنْ صَلاَتِهِ اسْتَغْفَرَ ثَلاَثًا وَقَالَ: «اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ ذَا الْجَلاَلِ وَالإِكْرَامِ».",
    authenticityNote: "Sahih Muslim.",
  },
  {
    id: "ap-hm-67",
    category: "after_prayer",
    orderIndex: 1,
    arabicText:
      "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ، وَلاَ مُعْطِيَ لِمَا مَنَعْتَ، وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.",
    transliteration:
      "Lā ilāha illallāhu waḥdahu lā sharīka lah, lahul-mulku wa lahul-ḥamd, wa huwa ʿalā kulli shay’in qadīr, Allāhumma lā māniʿa limā aʿṭayt, wa lā muʿṭiya limā manaʿt, wa lā yanfaʿu dhal-jaddi minkal-jadd.",
    translation:
      "None has the right to be worshipped but Allah alone, He has no partner, His is the dominion and His is the praise, and He is Able to do all things. O Allah, there is none who can withhold what You give, and none may give what You have withheld; and the might of a mighty person cannot benefit him against You.",
    benefit: "Reported by Al-Bukhari to be said after every obligatory prayer.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 1/255; Muslim 1/414; Hisn al-Muslim 67.",
    hadithText:
      "أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم كَانَ يَقُولُ فِي دُبُرِ كُلِّ صَلاَةٍ مَكْتُوبَةٍ... (الحديث)",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
];

const RESTROOM_AZKAR: Zikr[] = [
  {
    id: "rst-hm-10",
    category: "restroom",
    orderIndex: 0,
    arabicText: "(بِسْمِ اللَّهِ)، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبْثِ وَالْخَبَائِثِ.",
    transliteration: "(Bismillāh), Allāhumma innī aʿūdhu bika minal-khubthi wal-khabā’ith.",
    translation: "(In the Name of Allah). O Allah, I seek refuge in You from the male and female evil devils.",
    benefit: "Said before entering the restroom.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Al-Bukhari 1/45; Muslim 1/283; Hisn al-Muslim 10.",
    hadithText:
      "كَانَ النَّبِيُّ صلى الله عليه وسلم إِذَا دَخَلَ الْخَلاَءَ قَالَ: «اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ».",
    authenticityNote: "Sahih al-Bukhari and Sahih Muslim.",
  },
  {
    id: "rst-hm-11",
    category: "restroom",
    orderIndex: 1,
    arabicText: "غُفْرَانَكَ.",
    transliteration: "Ghufrānak.",
    translation: "I ask You (Allah) for forgiveness.",
    benefit: "Said upon exiting the restroom.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud; At-Tirmidhi; Hisn al-Muslim 11.",
    hadithText: "كَانَ النَّبِيُّ صلى الله عليه وسلم إِذَا خَرَجَ مِنَ الْخَلاَءِ قَالَ: «غُفْرَانَكَ».",
    authenticityNote: "Sahih according to Al-Albani.",
  },
];

const FOOD_DRINK_AZKAR: Zikr[] = [
  {
    id: "fd-hm-178",
    category: "food_drink",
    orderIndex: 0,
    arabicText: "بِسْمِ اللَّهِ. (فَإِنْ نَسِيَ فِي أَوَّلِهِ فَلْيَقُلْ): بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ.",
    transliteration:
      "Bismillāh. (If you forget to say it at the beginning, then say): Bismillāhi fī awwalihi wa ākhirih.",
    translation: "In the Name of Allah. (If forgotten, say): In the Name of Allah, in its beginning and its end.",
    benefit: "To be said before eating.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud 3/347; At-Tirmidhi 4/288; Hisn al-Muslim 178.",
    hadithText:
      "إِذَا أَكَلَ أَحَدُكُمْ فَلْيَذْكُرِ اسْمَ اللَّهِ تَعَالَى فَإِنْ نَسِيَ أَنْ يَذْكُرَ اسْمَ اللَّهِ تَعَالَى فِي أَوَّلِهِ فَلْيَقُلْ بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ.",
    authenticityNote: "Sahih according to Al-Albani.",
  },
  {
    id: "fd-hm-179",
    category: "food_drink",
    orderIndex: 1,
    arabicText: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ.",
    transliteration: "Alḥamdu lillāhil-ladhī aṭʿamanī hādhā, wa razaqanīhi, min ghayri ḥawlin minnī wa lā quwwah.",
    translation:
      "All praise is to Allah Who has fed me this and provided it for me without any might or power on my part.",
    benefit: "Whoever says this after eating, his previous sins will be forgiven.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Abu Dawud, Ibn Majah, At-Tirmidhi; Hisn al-Muslim 179.",
    hadithText:
      "مَنْ أَكَلَ طَعَامًا ثُمَّ قَالَ: الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا الطَّعَامَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلاَ قُوَّةٍ غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ.",
    authenticityNote: "Hasan according to Al-Albani.",
  },
];

const TRAVEL_AZKAR: Zikr[] = [
  {
    id: "trv-hm-205",
    category: "travel",
    orderIndex: 0,
    arabicText:
      "اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، ﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ * وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ﴾ اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالأَهْلِ.",
    transliteration:
      "Allāhu akbar, Allāhu akbar, Allāhu akbar, Subḥānal-ladhī sakhkhara lanā hādhā wa mā kunnā lahu muqrinīn. Wa innā ilā Rabbinā lamunqalibūn. Allāhumma innā nas’aluka fī safarinā hādhal-birra wat-taqwā, wa minal-ʿamali mā tarḍā, Allāhumma hawwin ʿalaynā safaranā hādhā, waṭwi ʿannā buʿdah, Allāhumma antas-ṣāḥibu fis-safar, wal-khalīfatu fil-ahl, Allāhumma innī aʿūdhu bika min waʿthā’is-safar, wa ka’ābatil-manẓar, wa sū’il-munqalabi fil-māli wal-ahl.",
    translation:
      "Allah is the Most Great. Allah is the Most Great. Allah is the Most Great. Glory is to Him Who has provided this for us though we could never have had it by our efforts. Surely, unto our Lord we are returning. O Allah, we ask You on this our journey for goodness and piety, and for works that are pleasing to You. O Allah, lighten this journey for us and make its distance easy for us. O Allah, You are our Companion on the road and the One in Whose care we leave our family. O Allah, I seek refuge in You from this journey's hardships, and from the wicked sights in store and from finding our family and property in misfortune upon returning.",
    benefit: "To be said when setting out on a journey.",
    repetitionCount: 1,
    countLabel: "1",
    sourceReference: "Muslim 2/978; Hisn al-Muslim 205.",
    hadithText:
      "أَنَّ رَسُولَ اللَّهِ صلى الله عليه وسلم كَانَ إِذَا اسْتَوَى عَلَى بَعِيرِهِ خَارِجًا إِلَى سَفَرٍ كَبَّرَ ثَلاَثًا ثُمَّ قَالَ: سُبْحَانَ الَّذِي سَخَّرَ لَنَا... (الحديث)",
    authenticityNote: "Sahih Muslim.",
  },
];

const ALL_AZKAR = [
  ...MORNING_AZKAR,
  ...EVENING_AZKAR,
  ...SLEEP_AZKAR,
  ...WAKING_UP_AZKAR,
  ...HOME_AZKAR,
  ...MOSQUE_AZKAR,
  ...AFTER_PRAYER_AZKAR,
  ...RESTROOM_AZKAR,
  ...FOOD_DRINK_AZKAR,
  ...TRAVEL_AZKAR,
];

const getAzkarByCategory = (cat: CategoryId) =>
  ALL_AZKAR.filter((z) => z.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);

const getCategoryTotal = (cat: CategoryId) => getAzkarByCategory(cat).length;

const ZIKR_LABELS: Record<string, string> = Object.fromEntries(
  ALL_AZKAR.map((z) => [z.id, z.translation.split(".")[0] ?? z.transliteration]),
);

export {
  ALL_AZKAR,
  EVENING_AZKAR,
  MORNING_AZKAR,
  SLEEP_AZKAR,
  WAKING_UP_AZKAR,
  HOME_AZKAR,
  MOSQUE_AZKAR,
  AFTER_PRAYER_AZKAR,
  RESTROOM_AZKAR,
  FOOD_DRINK_AZKAR,
  TRAVEL_AZKAR,
  ZIKR_LABELS,
  getAzkarByCategory,
  getCategoryTotal,
};
