import type { AppLanguage } from "../types";
import { normalizeSearchText } from "./searchNormalization";

export type RevelationType = "meccan" | "medinan";

export interface SurahMeta {
  readonly number: number;
  readonly nameArabic: string;
  readonly nameEnglish: string;
  readonly startPage: number;
  readonly versesCount: number;
  readonly revelationType: RevelationType;
}

export interface JuzMeta {
  readonly number: number;
  readonly nameArabic: string;
  readonly nameEnglish: string;
  readonly startPage: number;
  readonly startSurahNumber: number;
  readonly startAyah: number;
}

export const SURAHS: readonly SurahMeta[] = [
  {
    number: 1,
    nameArabic: "الفاتحة",
    nameEnglish: "Al-Fatihah",
    startPage: 1,
    versesCount: 7,
    revelationType: "meccan",
  },
  {
    number: 2,
    nameArabic: "البقرة",
    nameEnglish: "Al-Baqarah",
    startPage: 2,
    versesCount: 286,
    revelationType: "medinan",
  },
  {
    number: 3,
    nameArabic: "آل عمران",
    nameEnglish: "Ali 'Imran",
    startPage: 50,
    versesCount: 200,
    revelationType: "medinan",
  },
  {
    number: 4,
    nameArabic: "النساء",
    nameEnglish: "An-Nisa",
    startPage: 77,
    versesCount: 176,
    revelationType: "medinan",
  },
  {
    number: 5,
    nameArabic: "المائدة",
    nameEnglish: "Al-Ma'idah",
    startPage: 106,
    versesCount: 120,
    revelationType: "medinan",
  },
  {
    number: 6,
    nameArabic: "الأنعام",
    nameEnglish: "Al-An'am",
    startPage: 128,
    versesCount: 165,
    revelationType: "meccan",
  },
  {
    number: 7,
    nameArabic: "الأعراف",
    nameEnglish: "Al-A'raf",
    startPage: 151,
    versesCount: 206,
    revelationType: "meccan",
  },
  {
    number: 8,
    nameArabic: "الأنفال",
    nameEnglish: "Al-Anfal",
    startPage: 177,
    versesCount: 75,
    revelationType: "medinan",
  },
  {
    number: 9,
    nameArabic: "التوبة",
    nameEnglish: "At-Tawbah",
    startPage: 187,
    versesCount: 129,
    revelationType: "medinan",
  },
  { number: 10, nameArabic: "يونس", nameEnglish: "Yunus", startPage: 208, versesCount: 109, revelationType: "meccan" },
  { number: 11, nameArabic: "هود", nameEnglish: "Hud", startPage: 221, versesCount: 123, revelationType: "meccan" },
  { number: 12, nameArabic: "يوسف", nameEnglish: "Yusuf", startPage: 235, versesCount: 111, revelationType: "meccan" },
  {
    number: 13,
    nameArabic: "الرعد",
    nameEnglish: "Ar-Ra'd",
    startPage: 249,
    versesCount: 43,
    revelationType: "medinan",
  },
  {
    number: 14,
    nameArabic: "إبراهيم",
    nameEnglish: "Ibrahim",
    startPage: 255,
    versesCount: 52,
    revelationType: "meccan",
  },
  {
    number: 15,
    nameArabic: "الحجر",
    nameEnglish: "Al-Hijr",
    startPage: 262,
    versesCount: 99,
    revelationType: "meccan",
  },
  {
    number: 16,
    nameArabic: "النحل",
    nameEnglish: "An-Nahl",
    startPage: 267,
    versesCount: 128,
    revelationType: "meccan",
  },
  {
    number: 17,
    nameArabic: "الإسراء",
    nameEnglish: "Al-Isra",
    startPage: 282,
    versesCount: 111,
    revelationType: "meccan",
  },
  {
    number: 18,
    nameArabic: "الكهف",
    nameEnglish: "Al-Kahf",
    startPage: 293,
    versesCount: 110,
    revelationType: "meccan",
  },
  { number: 19, nameArabic: "مريم", nameEnglish: "Maryam", startPage: 305, versesCount: 98, revelationType: "meccan" },
  { number: 20, nameArabic: "طه", nameEnglish: "Taha", startPage: 312, versesCount: 135, revelationType: "meccan" },
  {
    number: 21,
    nameArabic: "الأنبياء",
    nameEnglish: "Al-Anbiya",
    startPage: 322,
    versesCount: 112,
    revelationType: "meccan",
  },
  {
    number: 22,
    nameArabic: "الحج",
    nameEnglish: "Al-Hajj",
    startPage: 332,
    versesCount: 78,
    revelationType: "medinan",
  },
  {
    number: 23,
    nameArabic: "المؤمنون",
    nameEnglish: "Al-Mu'minun",
    startPage: 342,
    versesCount: 118,
    revelationType: "meccan",
  },
  {
    number: 24,
    nameArabic: "النور",
    nameEnglish: "An-Nur",
    startPage: 350,
    versesCount: 64,
    revelationType: "medinan",
  },
  {
    number: 25,
    nameArabic: "الفرقان",
    nameEnglish: "Al-Furqan",
    startPage: 359,
    versesCount: 77,
    revelationType: "meccan",
  },
  {
    number: 26,
    nameArabic: "الشعراء",
    nameEnglish: "Ash-Shu'ara",
    startPage: 367,
    versesCount: 227,
    revelationType: "meccan",
  },
  {
    number: 27,
    nameArabic: "النمل",
    nameEnglish: "An-Naml",
    startPage: 377,
    versesCount: 93,
    revelationType: "meccan",
  },
  {
    number: 28,
    nameArabic: "القصص",
    nameEnglish: "Al-Qasas",
    startPage: 385,
    versesCount: 88,
    revelationType: "meccan",
  },
  {
    number: 29,
    nameArabic: "العنكبوت",
    nameEnglish: "Al-'Ankabut",
    startPage: 396,
    versesCount: 69,
    revelationType: "meccan",
  },
  { number: 30, nameArabic: "الروم", nameEnglish: "Ar-Rum", startPage: 404, versesCount: 60, revelationType: "meccan" },
  { number: 31, nameArabic: "لقمان", nameEnglish: "Luqman", startPage: 411, versesCount: 34, revelationType: "meccan" },
  {
    number: 32,
    nameArabic: "السجدة",
    nameEnglish: "As-Sajdah",
    startPage: 415,
    versesCount: 30,
    revelationType: "meccan",
  },
  {
    number: 33,
    nameArabic: "الأحزاب",
    nameEnglish: "Al-Ahzab",
    startPage: 418,
    versesCount: 73,
    revelationType: "medinan",
  },
  { number: 34, nameArabic: "سبأ", nameEnglish: "Saba", startPage: 428, versesCount: 54, revelationType: "meccan" },
  { number: 35, nameArabic: "فاطر", nameEnglish: "Fatir", startPage: 434, versesCount: 45, revelationType: "meccan" },
  { number: 36, nameArabic: "يس", nameEnglish: "Ya-Sin", startPage: 440, versesCount: 83, revelationType: "meccan" },
  {
    number: 37,
    nameArabic: "الصافات",
    nameEnglish: "As-Saffat",
    startPage: 446,
    versesCount: 182,
    revelationType: "meccan",
  },
  { number: 38, nameArabic: "ص", nameEnglish: "Sad", startPage: 453, versesCount: 88, revelationType: "meccan" },
  {
    number: 39,
    nameArabic: "الزمر",
    nameEnglish: "Az-Zumar",
    startPage: 458,
    versesCount: 75,
    revelationType: "meccan",
  },
  { number: 40, nameArabic: "غافر", nameEnglish: "Ghafir", startPage: 467, versesCount: 85, revelationType: "meccan" },
  {
    number: 41,
    nameArabic: "فصلت",
    nameEnglish: "Fussilat",
    startPage: 477,
    versesCount: 54,
    revelationType: "meccan",
  },
  {
    number: 42,
    nameArabic: "الشورى",
    nameEnglish: "Ash-Shura",
    startPage: 483,
    versesCount: 53,
    revelationType: "meccan",
  },
  {
    number: 43,
    nameArabic: "الزخرف",
    nameEnglish: "Az-Zukhruf",
    startPage: 489,
    versesCount: 89,
    revelationType: "meccan",
  },
  {
    number: 44,
    nameArabic: "الدخان",
    nameEnglish: "Ad-Dukhan",
    startPage: 496,
    versesCount: 59,
    revelationType: "meccan",
  },
  {
    number: 45,
    nameArabic: "الجاثية",
    nameEnglish: "Al-Jathiyah",
    startPage: 499,
    versesCount: 37,
    revelationType: "meccan",
  },
  {
    number: 46,
    nameArabic: "الأحقاف",
    nameEnglish: "Al-Ahqaf",
    startPage: 502,
    versesCount: 35,
    revelationType: "meccan",
  },
  {
    number: 47,
    nameArabic: "محمد",
    nameEnglish: "Muhammad",
    startPage: 507,
    versesCount: 38,
    revelationType: "medinan",
  },
  {
    number: 48,
    nameArabic: "الفتح",
    nameEnglish: "Al-Fath",
    startPage: 511,
    versesCount: 29,
    revelationType: "medinan",
  },
  {
    number: 49,
    nameArabic: "الحجرات",
    nameEnglish: "Al-Hujurat",
    startPage: 515,
    versesCount: 18,
    revelationType: "medinan",
  },
  { number: 50, nameArabic: "ق", nameEnglish: "Qaf", startPage: 518, versesCount: 45, revelationType: "meccan" },
  {
    number: 51,
    nameArabic: "الذاريات",
    nameEnglish: "Adh-Dhariyat",
    startPage: 520,
    versesCount: 60,
    revelationType: "meccan",
  },
  { number: 52, nameArabic: "الطور", nameEnglish: "At-Tur", startPage: 523, versesCount: 49, revelationType: "meccan" },
  {
    number: 53,
    nameArabic: "النجم",
    nameEnglish: "An-Najm",
    startPage: 526,
    versesCount: 62,
    revelationType: "meccan",
  },
  {
    number: 54,
    nameArabic: "القمر",
    nameEnglish: "Al-Qamar",
    startPage: 528,
    versesCount: 55,
    revelationType: "meccan",
  },
  {
    number: 55,
    nameArabic: "الرحمن",
    nameEnglish: "Ar-Rahman",
    startPage: 531,
    versesCount: 78,
    revelationType: "medinan",
  },
  {
    number: 56,
    nameArabic: "الواقعة",
    nameEnglish: "Al-Waqi'ah",
    startPage: 534,
    versesCount: 96,
    revelationType: "meccan",
  },
  {
    number: 57,
    nameArabic: "الحديد",
    nameEnglish: "Al-Hadid",
    startPage: 537,
    versesCount: 29,
    revelationType: "medinan",
  },
  {
    number: 58,
    nameArabic: "المجادلة",
    nameEnglish: "Al-Mujadila",
    startPage: 542,
    versesCount: 22,
    revelationType: "medinan",
  },
  {
    number: 59,
    nameArabic: "الحشر",
    nameEnglish: "Al-Hashr",
    startPage: 545,
    versesCount: 24,
    revelationType: "medinan",
  },
  {
    number: 60,
    nameArabic: "الممتحنة",
    nameEnglish: "Al-Mumtahanah",
    startPage: 549,
    versesCount: 13,
    revelationType: "medinan",
  },
  {
    number: 61,
    nameArabic: "الصف",
    nameEnglish: "As-Saff",
    startPage: 551,
    versesCount: 14,
    revelationType: "medinan",
  },
  {
    number: 62,
    nameArabic: "الجمعة",
    nameEnglish: "Al-Jumu'ah",
    startPage: 553,
    versesCount: 11,
    revelationType: "medinan",
  },
  {
    number: 63,
    nameArabic: "المنافقون",
    nameEnglish: "Al-Munafiqun",
    startPage: 554,
    versesCount: 11,
    revelationType: "medinan",
  },
  {
    number: 64,
    nameArabic: "التغابن",
    nameEnglish: "At-Taghabun",
    startPage: 556,
    versesCount: 18,
    revelationType: "medinan",
  },
  {
    number: 65,
    nameArabic: "الطلاق",
    nameEnglish: "At-Talaq",
    startPage: 558,
    versesCount: 12,
    revelationType: "medinan",
  },
  {
    number: 66,
    nameArabic: "التحريم",
    nameEnglish: "At-Tahrim",
    startPage: 560,
    versesCount: 12,
    revelationType: "medinan",
  },
  {
    number: 67,
    nameArabic: "الملك",
    nameEnglish: "Al-Mulk",
    startPage: 562,
    versesCount: 30,
    revelationType: "meccan",
  },
  {
    number: 68,
    nameArabic: "القلم",
    nameEnglish: "Al-Qalam",
    startPage: 564,
    versesCount: 52,
    revelationType: "meccan",
  },
  {
    number: 69,
    nameArabic: "الحاقة",
    nameEnglish: "Al-Haqqah",
    startPage: 566,
    versesCount: 52,
    revelationType: "meccan",
  },
  {
    number: 70,
    nameArabic: "المعارج",
    nameEnglish: "Al-Ma'arij",
    startPage: 568,
    versesCount: 44,
    revelationType: "meccan",
  },
  { number: 71, nameArabic: "نوح", nameEnglish: "Nuh", startPage: 570, versesCount: 28, revelationType: "meccan" },
  { number: 72, nameArabic: "الجن", nameEnglish: "Al-Jinn", startPage: 572, versesCount: 28, revelationType: "meccan" },
  {
    number: 73,
    nameArabic: "المزمل",
    nameEnglish: "Al-Muzzammil",
    startPage: 574,
    versesCount: 20,
    revelationType: "meccan",
  },
  {
    number: 74,
    nameArabic: "المدثر",
    nameEnglish: "Al-Muddaththir",
    startPage: 575,
    versesCount: 56,
    revelationType: "meccan",
  },
  {
    number: 75,
    nameArabic: "القيامة",
    nameEnglish: "Al-Qiyamah",
    startPage: 577,
    versesCount: 40,
    revelationType: "meccan",
  },
  {
    number: 76,
    nameArabic: "الإنسان",
    nameEnglish: "Al-Insan",
    startPage: 578,
    versesCount: 31,
    revelationType: "medinan",
  },
  {
    number: 77,
    nameArabic: "المرسلات",
    nameEnglish: "Al-Mursalat",
    startPage: 580,
    versesCount: 50,
    revelationType: "meccan",
  },
  {
    number: 78,
    nameArabic: "النبأ",
    nameEnglish: "An-Naba",
    startPage: 582,
    versesCount: 40,
    revelationType: "meccan",
  },
  {
    number: 79,
    nameArabic: "النازعات",
    nameEnglish: "An-Nazi'at",
    startPage: 583,
    versesCount: 46,
    revelationType: "meccan",
  },
  { number: 80, nameArabic: "عبس", nameEnglish: "'Abasa", startPage: 585, versesCount: 42, revelationType: "meccan" },
  {
    number: 81,
    nameArabic: "التكوير",
    nameEnglish: "At-Takwir",
    startPage: 586,
    versesCount: 29,
    revelationType: "meccan",
  },
  {
    number: 82,
    nameArabic: "الانفطار",
    nameEnglish: "Al-Infitar",
    startPage: 587,
    versesCount: 19,
    revelationType: "meccan",
  },
  {
    number: 83,
    nameArabic: "المطففين",
    nameEnglish: "Al-Mutaffifin",
    startPage: 587,
    versesCount: 36,
    revelationType: "meccan",
  },
  {
    number: 84,
    nameArabic: "الانشقاق",
    nameEnglish: "Al-Inshiqaq",
    startPage: 589,
    versesCount: 25,
    revelationType: "meccan",
  },
  {
    number: 85,
    nameArabic: "البروج",
    nameEnglish: "Al-Buruj",
    startPage: 590,
    versesCount: 22,
    revelationType: "meccan",
  },
  {
    number: 86,
    nameArabic: "الطارق",
    nameEnglish: "At-Tariq",
    startPage: 591,
    versesCount: 17,
    revelationType: "meccan",
  },
  {
    number: 87,
    nameArabic: "الأعلى",
    nameEnglish: "Al-A'la",
    startPage: 591,
    versesCount: 19,
    revelationType: "meccan",
  },
  {
    number: 88,
    nameArabic: "الغاشية",
    nameEnglish: "Al-Ghashiyah",
    startPage: 592,
    versesCount: 26,
    revelationType: "meccan",
  },
  {
    number: 89,
    nameArabic: "الفجر",
    nameEnglish: "Al-Fajr",
    startPage: 593,
    versesCount: 30,
    revelationType: "meccan",
  },
  {
    number: 90,
    nameArabic: "البلد",
    nameEnglish: "Al-Balad",
    startPage: 594,
    versesCount: 20,
    revelationType: "meccan",
  },
  {
    number: 91,
    nameArabic: "الشمس",
    nameEnglish: "Ash-Shams",
    startPage: 595,
    versesCount: 15,
    revelationType: "meccan",
  },
  {
    number: 92,
    nameArabic: "الليل",
    nameEnglish: "Al-Layl",
    startPage: 595,
    versesCount: 21,
    revelationType: "meccan",
  },
  {
    number: 93,
    nameArabic: "الضحى",
    nameEnglish: "Ad-Duha",
    startPage: 596,
    versesCount: 11,
    revelationType: "meccan",
  },
  {
    number: 94,
    nameArabic: "الشرح",
    nameEnglish: "Ash-Sharh",
    startPage: 596,
    versesCount: 8,
    revelationType: "meccan",
  },
  { number: 95, nameArabic: "التين", nameEnglish: "At-Tin", startPage: 597, versesCount: 8, revelationType: "meccan" },
  {
    number: 96,
    nameArabic: "العلق",
    nameEnglish: "Al-'Alaq",
    startPage: 597,
    versesCount: 19,
    revelationType: "meccan",
  },
  { number: 97, nameArabic: "القدر", nameEnglish: "Al-Qadr", startPage: 598, versesCount: 5, revelationType: "meccan" },
  {
    number: 98,
    nameArabic: "البينة",
    nameEnglish: "Al-Bayyinah",
    startPage: 598,
    versesCount: 8,
    revelationType: "medinan",
  },
  {
    number: 99,
    nameArabic: "الزلزلة",
    nameEnglish: "Az-Zalzalah",
    startPage: 599,
    versesCount: 8,
    revelationType: "medinan",
  },
  {
    number: 100,
    nameArabic: "العاديات",
    nameEnglish: "Al-'Adiyat",
    startPage: 599,
    versesCount: 11,
    revelationType: "meccan",
  },
  {
    number: 101,
    nameArabic: "القارعة",
    nameEnglish: "Al-Qari'ah",
    startPage: 600,
    versesCount: 11,
    revelationType: "meccan",
  },
  {
    number: 102,
    nameArabic: "التكاثر",
    nameEnglish: "At-Takathur",
    startPage: 600,
    versesCount: 8,
    revelationType: "meccan",
  },
  {
    number: 103,
    nameArabic: "العصر",
    nameEnglish: "Al-'Asr",
    startPage: 601,
    versesCount: 3,
    revelationType: "meccan",
  },
  {
    number: 104,
    nameArabic: "الهمزة",
    nameEnglish: "Al-Humazah",
    startPage: 601,
    versesCount: 9,
    revelationType: "meccan",
  },
  { number: 105, nameArabic: "الفيل", nameEnglish: "Al-Fil", startPage: 601, versesCount: 5, revelationType: "meccan" },
  { number: 106, nameArabic: "قريش", nameEnglish: "Quraysh", startPage: 602, versesCount: 4, revelationType: "meccan" },
  {
    number: 107,
    nameArabic: "الماعون",
    nameEnglish: "Al-Ma'un",
    startPage: 602,
    versesCount: 7,
    revelationType: "meccan",
  },
  {
    number: 108,
    nameArabic: "الكوثر",
    nameEnglish: "Al-Kawthar",
    startPage: 602,
    versesCount: 3,
    revelationType: "meccan",
  },
  {
    number: 109,
    nameArabic: "الكافرون",
    nameEnglish: "Al-Kafirun",
    startPage: 603,
    versesCount: 6,
    revelationType: "meccan",
  },
  {
    number: 110,
    nameArabic: "النصر",
    nameEnglish: "An-Nasr",
    startPage: 603,
    versesCount: 3,
    revelationType: "medinan",
  },
  {
    number: 111,
    nameArabic: "المسد",
    nameEnglish: "Al-Masad",
    startPage: 603,
    versesCount: 5,
    revelationType: "meccan",
  },
  {
    number: 112,
    nameArabic: "الإخلاص",
    nameEnglish: "Al-Ikhlas",
    startPage: 604,
    versesCount: 4,
    revelationType: "meccan",
  },
  {
    number: 113,
    nameArabic: "الفلق",
    nameEnglish: "Al-Falaq",
    startPage: 604,
    versesCount: 5,
    revelationType: "meccan",
  },
  { number: 114, nameArabic: "الناس", nameEnglish: "An-Nas", startPage: 604, versesCount: 6, revelationType: "meccan" },
];

export const JUZS: readonly JuzMeta[] = [
  { number: 1, nameArabic: "الجزء الأول", nameEnglish: "Juz 1", startPage: 1, startSurahNumber: 1, startAyah: 1 },
  { number: 2, nameArabic: "الجزء الثاني", nameEnglish: "Juz 2", startPage: 22, startSurahNumber: 2, startAyah: 142 },
  { number: 3, nameArabic: "الجزء الثالث", nameEnglish: "Juz 3", startPage: 42, startSurahNumber: 2, startAyah: 253 },
  { number: 4, nameArabic: "الجزء الرابع", nameEnglish: "Juz 4", startPage: 62, startSurahNumber: 3, startAyah: 93 },
  { number: 5, nameArabic: "الجزء الخامس", nameEnglish: "Juz 5", startPage: 82, startSurahNumber: 4, startAyah: 24 },
  { number: 6, nameArabic: "الجزء السادس", nameEnglish: "Juz 6", startPage: 102, startSurahNumber: 4, startAyah: 148 },
  { number: 7, nameArabic: "الجزء السابع", nameEnglish: "Juz 7", startPage: 122, startSurahNumber: 5, startAyah: 82 },
  { number: 8, nameArabic: "الجزء الثامن", nameEnglish: "Juz 8", startPage: 142, startSurahNumber: 6, startAyah: 111 },
  { number: 9, nameArabic: "الجزء التاسع", nameEnglish: "Juz 9", startPage: 162, startSurahNumber: 7, startAyah: 88 },
  { number: 10, nameArabic: "الجزء العاشر", nameEnglish: "Juz 10", startPage: 182, startSurahNumber: 8, startAyah: 41 },
  {
    number: 11,
    nameArabic: "الجزء الحادي عشر",
    nameEnglish: "Juz 11",
    startPage: 202,
    startSurahNumber: 9,
    startAyah: 93,
  },
  {
    number: 12,
    nameArabic: "الجزء الثاني عشر",
    nameEnglish: "Juz 12",
    startPage: 222,
    startSurahNumber: 11,
    startAyah: 6,
  },
  {
    number: 13,
    nameArabic: "الجزء الثالث عشر",
    nameEnglish: "Juz 13",
    startPage: 242,
    startSurahNumber: 12,
    startAyah: 53,
  },
  {
    number: 14,
    nameArabic: "الجزء الرابع عشر",
    nameEnglish: "Juz 14",
    startPage: 262,
    startSurahNumber: 15,
    startAyah: 1,
  },
  {
    number: 15,
    nameArabic: "الجزء الخامس عشر",
    nameEnglish: "Juz 15",
    startPage: 282,
    startSurahNumber: 17,
    startAyah: 1,
  },
  {
    number: 16,
    nameArabic: "الجزء السادس عشر",
    nameEnglish: "Juz 16",
    startPage: 302,
    startSurahNumber: 18,
    startAyah: 75,
  },
  {
    number: 17,
    nameArabic: "الجزء السابع عشر",
    nameEnglish: "Juz 17",
    startPage: 322,
    startSurahNumber: 21,
    startAyah: 1,
  },
  {
    number: 18,
    nameArabic: "الجزء الثامن عشر",
    nameEnglish: "Juz 18",
    startPage: 342,
    startSurahNumber: 23,
    startAyah: 1,
  },
  {
    number: 19,
    nameArabic: "الجزء التاسع عشر",
    nameEnglish: "Juz 19",
    startPage: 362,
    startSurahNumber: 25,
    startAyah: 21,
  },
  {
    number: 20,
    nameArabic: "الجزء العشرون",
    nameEnglish: "Juz 20",
    startPage: 382,
    startSurahNumber: 27,
    startAyah: 56,
  },
  {
    number: 21,
    nameArabic: "الجزء الحادي والعشرون",
    nameEnglish: "Juz 21",
    startPage: 402,
    startSurahNumber: 29,
    startAyah: 46,
  },
  {
    number: 22,
    nameArabic: "الجزء الثاني والعشرون",
    nameEnglish: "Juz 22",
    startPage: 422,
    startSurahNumber: 33,
    startAyah: 31,
  },
  {
    number: 23,
    nameArabic: "الجزء الثالث والعشرون",
    nameEnglish: "Juz 23",
    startPage: 442,
    startSurahNumber: 36,
    startAyah: 28,
  },
  {
    number: 24,
    nameArabic: "الجزء الرابع والعشرون",
    nameEnglish: "Juz 24",
    startPage: 462,
    startSurahNumber: 39,
    startAyah: 32,
  },
  {
    number: 25,
    nameArabic: "الجزء الخامس والعشرون",
    nameEnglish: "Juz 25",
    startPage: 482,
    startSurahNumber: 41,
    startAyah: 47,
  },
  {
    number: 26,
    nameArabic: "الجزء السادس والعشرون",
    nameEnglish: "Juz 26",
    startPage: 502,
    startSurahNumber: 46,
    startAyah: 1,
  },
  {
    number: 27,
    nameArabic: "الجزء السابع والعشرون",
    nameEnglish: "Juz 27",
    startPage: 522,
    startSurahNumber: 51,
    startAyah: 31,
  },
  {
    number: 28,
    nameArabic: "الجزء الثامن والعشرون",
    nameEnglish: "Juz 28",
    startPage: 542,
    startSurahNumber: 58,
    startAyah: 1,
  },
  {
    number: 29,
    nameArabic: "الجزء التاسع والعشرون",
    nameEnglish: "Juz 29",
    startPage: 562,
    startSurahNumber: 67,
    startAyah: 1,
  },
  {
    number: 30,
    nameArabic: "الجزء الثلاثون",
    nameEnglish: "Juz 30",
    startPage: 582,
    startSurahNumber: 78,
    startAyah: 1,
  },
];

export function getJuzNumberForPage(page: number): number {
  if (page < 1) return 1;
  if (page > 604) return 30;
  for (let i = JUZS.length - 1; i >= 0; i--) {
    if (page >= JUZS[i]!.startPage) {
      return i + 1;
    }
  }
  return 1;
}

export function getSurahNumberForPage(page: number): number {
  for (let i = SURAHS.length - 1; i >= 0; i--) {
    if (page >= SURAHS[i]!.startPage) {
      return SURAHS[i]!.number;
    }
  }
  return 1;
}

export function getSurahMeta(surahNumber: number | string): SurahMeta | undefined {
  const num = typeof surahNumber === "string" ? parseInt(surahNumber, 10) : surahNumber;
  return SURAHS.find((s) => s.number === num);
}

export function getSurahDisplayName(surahNumber: number | string, language: AppLanguage): string {
  const num = typeof surahNumber === "string" ? parseInt(surahNumber, 10) : surahNumber;
  const surah = SURAHS.find((s) => s.number === num);
  if (!surah) {
    return language === "ar" ? `سورة ${num}` : `Surah ${num}`;
  }
  return language === "ar" ? `سورة ${surah.nameArabic}` : `Surah ${surah.nameEnglish}`;
}

/**
 * The surah's name without the word "Surah".
 *
 * A 60px tool rail has room for the name or for the word that says it is a
 * name, not both — and the name is the half that tells the reader anything.
 */
export function getSurahShortName(surahNumber: number | string, language: AppLanguage): string {
  const num = typeof surahNumber === "string" ? parseInt(surahNumber, 10) : surahNumber;
  const surah = SURAHS.find((s) => s.number === num);
  if (!surah) return String(num);
  return language === "ar" ? surah.nameArabic : surah.nameEnglish;
}

export function searchSurahs(query: string, _language?: AppLanguage): SurahMeta[] {
  const clean = query.trim();
  if (!clean) return [...SURAHS];

  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 114) {
    const exact = SURAHS.find((s) => s.number === num);
    return exact ? [exact] : [];
  }

  const normalized = normalizeSearchText(clean);
  const lowerClean = clean.toLowerCase();

  return SURAHS.filter((s) => {
    return (
      normalizeSearchText(s.nameArabic).includes(normalized) ||
      s.nameEnglish.toLowerCase().includes(lowerClean) ||
      s.number.toString().includes(clean)
    );
  });
}

/**
 * Starting page in the 604-page Madani Mushaf (King Fahd Complex, Hafs)
 * for each of the 240 Quarters (Rub' al-Hizb).
 * Each Juz contains 8 Quarters (2 Hizbs × 4 Quarters).
 */
export const RUB_START_PAGES: readonly number[] = [
  1, 5, 7, 9, 11, 14, 17, 19, 22, 24, 27, 29, 32, 34, 37, 39, 42, 44, 46, 49, 51, 54, 56, 59, 62, 64, 67, 69, 72, 74,
  77, 79, 82, 84, 87, 89, 92, 94, 97, 100, 102, 104, 106, 109, 112, 114, 117, 119, 121, 124, 126, 129, 132, 134, 137,
  140, 142, 144, 146, 148, 151, 154, 156, 158, 162, 164, 167, 170, 173, 175, 177, 179, 182, 184, 187, 189, 192, 194,
  196, 199, 201, 204, 206, 209, 212, 214, 217, 219, 222, 224, 226, 228, 231, 233, 236, 238, 242, 244, 247, 249, 252,
  254, 256, 259, 262, 264, 267, 270, 272, 275, 277, 280, 282, 284, 287, 289, 292, 295, 297, 299, 302, 304, 306, 309,
  312, 315, 317, 319, 322, 324, 326, 329, 332, 334, 336, 339, 342, 344, 347, 350, 352, 354, 356, 359, 362, 364, 367,
  369, 371, 374, 377, 379, 382, 384, 386, 389, 392, 394, 396, 399, 402, 404, 407, 410, 413, 415, 418, 420, 422, 425,
  426, 429, 431, 433, 436, 439, 442, 444, 446, 449, 451, 454, 456, 459, 462, 464, 467, 469, 472, 474, 477, 479, 482,
  484, 486, 488, 491, 493, 496, 499, 502, 505, 507, 510, 513, 515, 517, 519, 522, 524, 526, 529, 531, 534, 536, 539,
  542, 544, 547, 550, 553, 554, 558, 560, 562, 564, 566, 569, 572, 575, 577, 579, 582, 585, 587, 589, 591, 594, 596,
  600,
];

export const RUB_FIRST_WORDS: readonly string[] = [
  // Juz 1
  "الحمد لله",
  "إِنَّ اللَّهَ",
  "أَتَأْمُرُونَ",
  "وَإِذِ اسْتَسْقَى",
  "أَفَتَطْمَعُونَ",
  "وَلَقَدْ جَاءَكُم",
  "مَا نَنسَخْ",
  "وَإِذِ ابْتَلَى",
  // Juz 2
  "سَيَقُولُ",
  "إِنَّ الصَّفَا",
  "لَّيْسَ الْبِرَّ",
  "يَسْأَلُونَكَ عَنِ الأَهِلَّةِ",
  "وَاذْكُرُوا اللَّهَ",
  "يَسْأَلُونَكَ عَنِ الْخَمْرِ",
  "وَالْوَالِدَاتُ",
  "أَلَمْ تَرَ",
  // Juz 3
  "تِلْكَ الرُّسُلُ",
  "قَوْلٌ مَّعْرُوفٌ",
  "لَّيْسَ عَلَيْكَ",
  "وَإِن كُنتُمْ",
  "قُلْ أُؤَنَبِّئُكُم",
  "إِنَّ اللَّهَ",
  "فَلَمَّا أَحَسَّ",
  "وَمِنْ أَهْلِ",
  // Juz 4
  "كُلُّ الطَّعَامِ",
  "لَيْسُوا",
  "وَسَارِعُوا",
  "إِذْ تُصْعِدُونَ",
  "يَسْتَبْشِرُونَ",
  "لَتُبْلَوُنَّ",
  "يَا أَيُّهَا",
  "وَلَكُمْ",
  // Juz 5
  "وَالْمُحْصَنَاتُ",
  "وَاعْبُدُوا",
  "إِنَّ اللَّهَ",
  "فَلْيُقَاتِلْ",
  "فَمَا لَكُمْ",
  "وَمَن يُهَاجِرْ",
  "لَّا خَيْرَ",
  "يَا أَيُّهَا",
  // Juz 6
  "لَّا يُحِبُّ",
  "إِنَّا أَوْحَيْنَا",
  "يَسْتَفْتُونَكَ",
  "وَلَقَدْ أَخَذَ",
  "وَاتْلُ",
  "أَوْفُوا بِالْعُقُودِ",
  "يَا أَيُّهَا",
  "يَا أَيُّهَا",
  // Juz 7
  "لَتَجِدَنَّ",
  "جَعَلَ اللَّهُ",
  "يَوْمَ يَجْمَعُ",
  "وَلَهُ مَا",
  "إِنَّمَا",
  "وَعِندَهُ",
  "وَإِذْ قَالَ",
  "إِنَّ اللَّهَ",
  // Juz 8
  "وَلَوْ أَنَّنَا",
  "لَهُمْ دَارُ",
  "وَهُوَ الَّذِي",
  "قُلْ تَعَالَوْا",
  "المص",
  "يابَنِى",
  "وَإِذَا صُرِفَتْ",
  "وَإِلَى",
  // Juz 9
  "قَالَ الْمَلَأُ",
  "وَأَوْحَيْنَا",
  "وَوَاعَدْنَا",
  "وَاكْتُبْ",
  "وَإِذْ نَتَقْنَا",
  "هُوَ الَّذِي",
  "يَسْأَلُونَكَ",
  "إِنَّ شَرَّ",
  // Juz 10
  "وَاعْلَمُوا",
  "وَإِن جَنَحُوا",
  "بَرَاءَةٌ",
  "أَجَعَلْتُمْ",
  "يَا أَيُّهَا",
  "وَلَوْ أَرَادُوا",
  "إِنَّمَا",
  "وَمِنْهُم",
  // Juz 11
  "إِنَّمَا",
  "إِنَّ اللَّهَ",
  "وَمَا كَانَ",
  "وَلَوْ يُعَجِّلُ",
  "لِّلَّذِينَ",
  "وَيَسْتَنبِأُونَكَ",
  "وَاتْلُ",
  "وَجَاوَزْنَا",
  // Juz 12
  "وَمَا مِن",
  "مَثَلُ الْفَرِيقَيْنِ",
  "وَقَالَ",
  "وَإِلَى",
  "وَإِلَى",
  "وَأَمَّا",
  "لَّقَدْ كَانَ",
  "وَقَالَ",
  // Juz 13
  "وَمَا أُبَرِّئُ",
  "قَالُوا",
  "رَبِّ قَدْ",
  "وَإِن تَعْجَبْ",
  "أَفَمَن",
  "مَّثَلُ الْجَنَّةِ",
  "قَالَتْ رُسُلُهُمْ",
  "أَلَمْ تَرَ",
  // Juz 14
  "الر تِلْكَ",
  "نَبِّئْ عِبَادِي",
  "الَّذِينَ",
  "وَقِيلَ",
  "وَقَالَ",
  "ضَرَبَ اللَّهُ",
  "إِنَّ اللَّهَ",
  "يَوْمَ تَأْتِى",
  // Juz 15
  "سُبْحَانَ الَّذِي",
  "وَقَضَى",
  "قُلْ كُونُوا",
  "وَلَقَدْ كَرَّمْنَا",
  "أَوَلَمْ يَرَوْا",
  "وَتَرَى الشَّمْسَ",
  "وَاضْرِبْ لَهُم",
  "مَّا أَشْهَدتُّهُمْ",
  // Juz 16
  "قَالَ أَلَمْ",
  "وَتَرَكْنَا",
  "فَحَمَلَتْهُ فَانتَبَذَتْ",
  "فَخَلَفَ مِن بَعْدِهِمْ",
  "إِنَّ الَّذِينَ",
  "مِنْهَا",
  "وَمَا أَعْجَلَكَ",
  "وَعَنَتِ",
  // Juz 17
  "اقْتَرَبَ لِلنَّاسِ",
  "وَمَن يَقُلْ",
  "وَلَقَدْ آتَيْنَا",
  "وَأَيُّوبَ",
  "يَا أَيُّهَا",
  "هَذَانِ خَصْمَانِ",
  "إِنَّ اللَّهَ",
  "ذَلِكَ",
  // Juz 18
  "قَدْ أَفْلَحَ",
  "هَيْهَاتَ",
  "وَلَوْ رَحِمْنَاهُمْ",
  "سُورَةٌ أَنزَلْنَاهَا",
  "يَا أَيُّهَا",
  "اللَّهُ",
  "وَأَقْسَمُوا",
  "إِنَّمَا",
  // Juz 19
  "وَقَالَ",
  "وَهُوَ الَّذِي",
  "طسم",
  "وَأَوْحَيْنَا",
  "قَالُوا",
  "أَوْفُوا",
  "طس تِلْكَ",
  "قَالَ سَنَنظُرُ",
  // Juz 20
  "فَمَا كَانَ",
  "وَإِذَا وَقَعَ",
  "وَحَرَّمْنَا",
  "فَلَمَّا قَضَى",
  "وَلَقَدْ وَصَّلْنَا",
  "إِنَّ قَارُونَ",
  "إِنَّ الَّذِي",
  "فَآمَنَ",
  // Juz 21
  "وَلَا تُجَادِلُوا",
  "وَمَا هَذِهِ",
  "مُنِيبِينَ",
  "اللَّهُ",
  "وَمَن يُسْلِمْ",
  "قُلْ يَتَوَفَّىكُم",
  "يَا أَيُّهَا",
  "قَدْ يَعْلَمُ",
  // Juz 22
  "وَمَن يَقْنُتْ",
  "تُرْجِي",
  "لَّئِن لَّمْ",
  "وَلَقَدْ آتَيْنَا",
  "قُلْ مَن يَرْزُقُكُم",
  "قُلْ إِنَّمَا",
  "يَا أَيُّهَا",
  "إِنَّ اللَّهَ",
  // Juz 23
  "وَمَا أَنزَلْنَا",
  "أَلَمْ أَعْهَدْ",
  "احْشُرُوا",
  "وَإِنَّ مِن شِيعَتِهِ",
  "فَنَبَذْنَاهُ",
  "وَهَلْ أَتَىكَ",
  "وَعِندَهُمْ",
  "وَإِذَا مَسَّ",
  // Juz 24
  "فَمَنْ أَظْلَمُ",
  "قُلْ يَا عِبَادِي",
  "وَتَرَى الْمَلَائِكَةَ",
  "أَوَلَمْ يَسِيرُوا",
  "وَيَا قَوْمِ",
  "قُلْ إِنِّى",
  "قُلْ أَئِنَّكُمْ",
  "وَقَيَّضْنَا",
  // Juz 25
  "إِلَيْهِ",
  "شَرَعَ لَكُم",
  "وَلَوْ بَسَطَ",
  "وَمَا كَانَ",
  "قَالَ أَوَلَوْ",
  "وَلَمَّا",
  "وَلَقَدْ فَتَنَّا",
  "اللَّهُ",
  // Juz 26
  "وَبَدَا لَهُمْ",
  "وَاذْكُرْ أَخَا",
  "أَفَلَمْ يَسِيرُوا",
  "يَا أَيُّهَا",
  "لَّقَدْ رَضِيَ",
  "مُّحَمَّدٌ",
  "قَالَتِ الْأَعْرَابُ",
  "قَالَ قَرِينُهُ",
  // Juz 27
  "قَالَ فَمَا",
  "وَيَطُوفُ",
  "وَكَم مِّن مَّلَكٍ",
  "كَذَّبَتْ قَبْلَهُمْ",
  "وَمَا أَمْرُنَا",
  "فِيهِنَّ خَيْرَاتٌ",
  "فَلَا أُقْسِمُ",
  "أَلَمْ يَأْنِ",
  // Juz 28
  "قَدْ سَمِعَ",
  "أَلَمْ تَرَ أَنَّ اللَّهَ",
  "أَلَمْ تَرَ إِلَى الَّذِينَ",
  "عَسَى اللَّهُ",
  "يُسَبِّحُ",
  "وَإِذَا رَأَيْتَهُمْ",
  "إِذَا نُودِيَ",
  "لَا تُلْهِكُمْ",
  // Juz 29
  "تَبَارَكَ الَّذِي",
  "فَلَمَّا رَأَوْهُ",
  "خَاشِعَةً أَبْصَارُهُمْ",
  "إِنَّ الْإِنسَانَ",
  "قُلْ أُوحِيَ",
  "إِنَّ رَبَّكَ",
  "فَمَا تَنفَعُهُمْ",
  "وَيَطُوفُ",
  // Juz 30
  "عَمَّ يَتَسَاءَلُونَ",
  "عَبَسَ وَتَوَلَّى",
  "إِذَا السَّمَاءُ",
  "فَالْيَوْمَ الَّذِينَ",
  "وَالسَّمَاءِ",
  "وَجِيءَ",
  "فَسَنُيَسِّرُهُ لِلْعُسْرَى",
  "أَفَلَا يَعْلَمُ",
];

export interface HizbQuarterInfo {
  readonly quarterNumber: number; // 1 to 4 within the hizb
  readonly rubNumber: number; // 1 to 240 overall
  readonly startPage: number;
  readonly firstWord: string;
}

export interface HizbInfo {
  readonly hizbNumber: number; // 1 to 60 overall
  readonly startPage: number;
  readonly quarters: readonly HizbQuarterInfo[];
}

export function getHizbsForJuz(juzNumber: number): readonly [HizbInfo, HizbInfo] {
  const safeJuz = Math.max(1, Math.min(30, juzNumber));
  const hizb1Number = (safeJuz - 1) * 2 + 1;
  const hizb2Number = hizb1Number + 1;

  const baseRubIndex = (safeJuz - 1) * 8;

  const quartersHizb1: HizbQuarterInfo[] = [0, 1, 2, 3].map((qIdx) => ({
    quarterNumber: qIdx + 1,
    rubNumber: baseRubIndex + qIdx + 1,
    startPage: RUB_START_PAGES[baseRubIndex + qIdx] ?? 1,
    firstWord: RUB_FIRST_WORDS[baseRubIndex + qIdx] ?? "",
  }));

  const quartersHizb2: HizbQuarterInfo[] = [4, 5, 6, 7].map((qIdx) => ({
    quarterNumber: qIdx - 3,
    rubNumber: baseRubIndex + qIdx + 1,
    startPage: RUB_START_PAGES[baseRubIndex + qIdx] ?? 1,
    firstWord: RUB_FIRST_WORDS[baseRubIndex + qIdx] ?? "",
  }));

  return [
    {
      hizbNumber: hizb1Number,
      startPage: quartersHizb1[0]!.startPage,
      quarters: quartersHizb1,
    },
    {
      hizbNumber: hizb2Number,
      startPage: quartersHizb2[0]!.startPage,
      quarters: quartersHizb2,
    },
  ];
}

export function getHizbNumberForPage(page: number): number {
  if (page < 1) return 1;
  if (page >= 604) return 60;
  for (let h = 60; h >= 1; h--) {
    const startPage = RUB_START_PAGES[(h - 1) * 4] ?? 1;
    if (page >= startPage) return h;
  }
  return 1;
}
