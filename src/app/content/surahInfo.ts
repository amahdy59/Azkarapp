import type { AppLanguage } from "../types";

export interface SurahMeta {
  readonly number: number;
  readonly nameArabic: string;
  readonly nameEnglish: string;
}

export const SURAHS: readonly SurahMeta[] = [
  { number: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Fatihah" },
  { number: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah" },
  { number: 3, nameArabic: "آل عمران", nameEnglish: "Ali 'Imran" },
  { number: 4, nameArabic: "النساء", nameEnglish: "An-Nisa" },
  { number: 5, nameArabic: "المائدة", nameEnglish: "Al-Ma'idah" },
  { number: 6, nameArabic: "الأنعام", nameEnglish: "Al-An'am" },
  { number: 7, nameArabic: "الأعراف", nameEnglish: "Al-A'raf" },
  { number: 8, nameArabic: "الأنفال", nameEnglish: "Al-Anfal" },
  { number: 9, nameArabic: "التوبة", nameEnglish: "At-Tawbah" },
  { number: 10, nameArabic: "يونس", nameEnglish: "Yunus" },
  { number: 11, nameArabic: "هود", nameEnglish: "Hud" },
  { number: 12, nameArabic: "يوسف", nameEnglish: "Yusuf" },
  { number: 13, nameArabic: "الرعد", nameEnglish: "Ar-Ra'd" },
  { number: 14, nameArabic: "إبراهيم", nameEnglish: "Ibrahim" },
  { number: 15, nameArabic: "الحجر", nameEnglish: "Al-Hijr" },
  { number: 16, nameArabic: "النحل", nameEnglish: "An-Nahl" },
  { number: 17, nameArabic: "الإسراء", nameEnglish: "Al-Isra" },
  { number: 18, nameArabic: "الكهف", nameEnglish: "Al-Kahf" },
  { number: 19, nameArabic: "مريم", nameEnglish: "Maryam" },
  { number: 20, nameArabic: "طه", nameEnglish: "Taha" },
  { number: 21, nameArabic: "الأنبياء", nameEnglish: "Al-Anbiya" },
  { number: 22, nameArabic: "الحج", nameEnglish: "Al-Hajj" },
  { number: 23, nameArabic: "المؤمنون", nameEnglish: "Al-Mu'minun" },
  { number: 24, nameArabic: "النور", nameEnglish: "An-Nur" },
  { number: 25, nameArabic: "الفرقان", nameEnglish: "Al-Furqan" },
  { number: 26, nameArabic: "الشعراء", nameEnglish: "Ash-Shu'ara" },
  { number: 27, nameArabic: "النمل", nameEnglish: "An-Naml" },
  { number: 28, nameArabic: "القصص", nameEnglish: "Al-Qasas" },
  { number: 29, nameArabic: "العنكبوت", nameEnglish: "Al-'Ankabut" },
  { number: 30, nameArabic: "الروم", nameEnglish: "Ar-Rum" },
  { number: 31, nameArabic: "لقمان", nameEnglish: "Luqman" },
  { number: 32, nameArabic: "السجدة", nameEnglish: "As-Sajdah" },
  { number: 33, nameArabic: "الأحزاب", nameEnglish: "Al-Ahzab" },
  { number: 34, nameArabic: "سبأ", nameEnglish: "Saba" },
  { number: 35, nameArabic: "فاطر", nameEnglish: "Fatir" },
  { number: 36, nameArabic: "يس", nameEnglish: "Ya-Sin" },
  { number: 37, nameArabic: "الصافات", nameEnglish: "As-Saffat" },
  { number: 38, nameArabic: "ص", nameEnglish: "Sad" },
  { number: 39, nameArabic: "الزمر", nameEnglish: "Az-Zumar" },
  { number: 40, nameArabic: "غافر", nameEnglish: "Ghafir" },
  { number: 41, nameArabic: "فصلت", nameEnglish: "Fussilat" },
  { number: 42, nameArabic: "الشورى", nameEnglish: "Ash-Shura" },
  { number: 43, nameArabic: "الزخرف", nameEnglish: "Az-Zukhruf" },
  { number: 44, nameArabic: "الدخان", nameEnglish: "Ad-Dukhan" },
  { number: 45, nameArabic: "الجاثية", nameEnglish: "Al-Jathiyah" },
  { number: 46, nameArabic: "الأحقاف", nameEnglish: "Al-Ahqaf" },
  { number: 47, nameArabic: "محمد", nameEnglish: "Muhammad" },
  { number: 48, nameArabic: "الفتح", nameEnglish: "Al-Fath" },
  { number: 49, nameArabic: "الحجرات", nameEnglish: "Al-Hujurat" },
  { number: 50, nameArabic: "ق", nameEnglish: "Qaf" },
  { number: 51, nameArabic: "الذاريات", nameEnglish: "Adh-Dhariyat" },
  { number: 52, nameArabic: "الطور", nameEnglish: "At-Tur" },
  { number: 53, nameArabic: "النجم", nameEnglish: "An-Najm" },
  { number: 54, nameArabic: "القمر", nameEnglish: "Al-Qamar" },
  { number: 55, nameArabic: "الرحمن", nameEnglish: "Ar-Rahman" },
  { number: 56, nameArabic: "الواقعة", nameEnglish: "Al-Waqi'ah" },
  { number: 57, nameArabic: "الحديد", nameEnglish: "Al-Hadid" },
  { number: 58, nameArabic: "المجادلة", nameEnglish: "Al-Mujadila" },
  { number: 59, nameArabic: "الحشر", nameEnglish: "Al-Hashr" },
  { number: 60, nameArabic: "الممتحنة", nameEnglish: "Al-Mumtahanah" },
  { number: 61, nameArabic: "الصف", nameEnglish: "As-Saff" },
  { number: 62, nameArabic: "الجمعة", nameEnglish: "Al-Jumu'ah" },
  { number: 63, nameArabic: "المنافقون", nameEnglish: "Al-Munafiqun" },
  { number: 64, nameArabic: "التغابن", nameEnglish: "At-Taghabun" },
  { number: 65, nameArabic: "الطلاق", nameEnglish: "At-Talaq" },
  { number: 66, nameArabic: "التحريم", nameEnglish: "At-Tahrim" },
  { number: 67, nameArabic: "الملك", nameEnglish: "Al-Mulk" },
  { number: 68, nameArabic: "القلم", nameEnglish: "Al-Qalam" },
  { number: 69, nameArabic: "الحاقة", nameEnglish: "Al-Haqqah" },
  { number: 70, nameArabic: "المعارج", nameEnglish: "Al-Ma'arij" },
  { number: 71, nameArabic: "نوح", nameEnglish: "Nuh" },
  { number: 72, nameArabic: "الجن", nameEnglish: "Al-Jinn" },
  { number: 73, nameArabic: "المزمل", nameEnglish: "Al-Muzzammil" },
  { number: 74, nameArabic: "المدثر", nameEnglish: "Al-Muddaththir" },
  { number: 75, nameArabic: "القيامة", nameEnglish: "Al-Qiyamah" },
  { number: 76, nameArabic: "الإنسان", nameEnglish: "Al-Insan" },
  { number: 77, nameArabic: "المرسلات", nameEnglish: "Al-Mursalat" },
  { number: 78, nameArabic: "النبأ", nameEnglish: "An-Naba" },
  { number: 79, nameArabic: "النازعات", nameEnglish: "An-Nazi'at" },
  { number: 80, nameArabic: "عبس", nameEnglish: "'Abasa" },
  { number: 81, nameArabic: "التكوير", nameEnglish: "At-Takwir" },
  { number: 82, nameArabic: "الانفطار", nameEnglish: "Al-Infitar" },
  { number: 83, nameArabic: "المطففين", nameEnglish: "Al-Mutaffifin" },
  { number: 84, nameArabic: "الانشقاق", nameEnglish: "Al-Inshiqaq" },
  { number: 85, nameArabic: "البروج", nameEnglish: "Al-Buruj" },
  { number: 86, nameArabic: "الطارق", nameEnglish: "At-Tariq" },
  { number: 87, nameArabic: "الأعلى", nameEnglish: "Al-A'la" },
  { number: 88, nameArabic: "الغاشية", nameEnglish: "Al-Ghashiyah" },
  { number: 89, nameArabic: "الفجر", nameEnglish: "Al-Fajr" },
  { number: 90, nameArabic: "البلد", nameEnglish: "Al-Balad" },
  { number: 91, nameArabic: "الشمس", nameEnglish: "Ash-Shams" },
  { number: 92, nameArabic: "الليل", nameEnglish: "Al-Layl" },
  { number: 93, nameArabic: "الضحى", nameEnglish: "Ad-Duha" },
  { number: 94, nameArabic: "الشرح", nameEnglish: "Ash-Sharh" },
  { number: 95, nameArabic: "التين", nameEnglish: "At-Tin" },
  { number: 96, nameArabic: "العلق", nameEnglish: "Al-'Alaq" },
  { number: 97, nameArabic: "القدر", nameEnglish: "Al-Qadr" },
  { number: 98, nameArabic: "البينة", nameEnglish: "Al-Bayyinah" },
  { number: 99, nameArabic: "الزلزلة", nameEnglish: "Az-Zalzalah" },
  { number: 100, nameArabic: "العاديات", nameEnglish: "Al-'Adiyat" },
  { number: 101, nameArabic: "القارعة", nameEnglish: "Al-Qari'ah" },
  { number: 102, nameArabic: "التكاثر", nameEnglish: "At-Takathur" },
  { number: 103, nameArabic: "العصر", nameEnglish: "Al-'Asr" },
  { number: 104, nameArabic: "الهمزة", nameEnglish: "Al-Humazah" },
  { number: 105, nameArabic: "الفيل", nameEnglish: "Al-Fil" },
  { number: 106, nameArabic: "قريش", nameEnglish: "Quraysh" },
  { number: 107, nameArabic: "الماعون", nameEnglish: "Al-Ma'un" },
  { number: 108, nameArabic: "الكوثر", nameEnglish: "Al-Kawthar" },
  { number: 109, nameArabic: "الكافرون", nameEnglish: "Al-Kafirun" },
  { number: 110, nameArabic: "النصر", nameEnglish: "An-Nasr" },
  { number: 111, nameArabic: "المسد", nameEnglish: "Al-Masad" },
  { number: 112, nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlas" },
  { number: 113, nameArabic: "الفلق", nameEnglish: "Al-Falaq" },
  { number: 114, nameArabic: "الناس", nameEnglish: "An-Nas" },
];

const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182, 202, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482,
  502, 522, 542, 562, 582,
];

export function getJuzNumberForPage(page: number): number {
  if (page < 1) return 1;
  if (page > 604) return 30;
  for (let i = JUZ_START_PAGES.length - 1; i >= 0; i--) {
    if (page >= JUZ_START_PAGES[i]!) {
      return i + 1;
    }
  }
  return 1;
}

export function getSurahDisplayName(surahNumber: number | string, language: AppLanguage): string {
  const num = typeof surahNumber === "string" ? parseInt(surahNumber, 10) : surahNumber;
  const surah = SURAHS.find((s) => s.number === num);
  if (!surah) {
    return language === "ar" ? `سورة ${num}` : `Surah ${num}`;
  }
  return language === "ar" ? `سورة ${surah.nameArabic}` : `Surah ${surah.nameEnglish}`;
}
