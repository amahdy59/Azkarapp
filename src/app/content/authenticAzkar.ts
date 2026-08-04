import type { AppLanguage } from "../types";

export type AuthenticZikrCategory = "tasbeeh" | "tahliel" | "hawqalah" | "istighfar" | "salawat" | "baqiyat";

export interface AuthenticZikrItem {
  id: string;
  textAr: string;
  textEn: string;
  category: AuthenticZikrCategory;
  categoryNameAr: string;
  categoryNameEn: string;
  sourceRefAr: string;
  sourceRefEn: string;
  virtueAr: string;
  virtueEn: string;
  recommendedTarget: number;
  hadithGradeAr: string;
  hadithGradeEn: string;
}

export const AUTHENTIC_AZKAR_COLLECTION: AuthenticZikrItem[] = [
  {
    id: "auth_subhanallah_wabihamdihi",
    textAr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    textEn: "Subhanallahi wa bihamdihi",
    category: "tasbeeh",
    categoryNameAr: "التسبيح والتحميد",
    categoryNameEn: "Tasbeeh & Tahmeed",
    sourceRefAr: "صحيح مسلم #2692 ، صحيح البخاري #6405",
    sourceRefEn: "Sahih Muslim #2692, Sahih Bukhari #6405",
    virtueAr:
      "مَنْ قَالَ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، فِي يَوْمٍ مِائَةَ مَرَّةٍ، حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ",
    virtueEn: "Whoever says it 100 times a day, his sins will be forgiven even if they were like the foam of the sea.",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_subhanallah_alazeem",
    textAr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    textEn: "Subhanallahi wa bihamdihi, Subhanallahil-Azeem",
    category: "tasbeeh",
    categoryNameAr: "التسبيح والتحميد",
    categoryNameEn: "Tasbeeh & Tahmeed",
    sourceRefAr: "صحيح البخاري #6682 ، صحيح مسلم #2694",
    sourceRefEn: "Sahih Bukhari #6682, Sahih Muslim #2694",
    virtueAr: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ",
    virtueEn: "Two words light on the tongue, heavy in the balance, beloved to the Most Merciful.",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_la_ilaha_illallah_wahdahu",
    textAr:
      "لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    textEn: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    category: "tahliel",
    categoryNameAr: "التهليل والتوحيد",
    categoryNameEn: "Tahliel & Tawheed",
    sourceRefAr: "صحيح البخاري #3293 ، صحيح مسلم #2691",
    sourceRefEn: "Sahih Bukhari #3293, Sahih Muslim #2691",
    virtueAr:
      "مَنْ قَالَهَا مِائَةَ مَرَّةٍ كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ",
    virtueEn:
      "Whoever recites it 100 times gets the reward of freeing 10 slaves, 100 good deeds written, and 100 sins wiped.",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_la_hawla_wala_quwwata",
    textAr: "لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ",
    textEn: "La hawla wa la quwwata illa billah",
    category: "hawqalah",
    categoryNameAr: "الحوقلة",
    categoryNameEn: "Hawqalah",
    sourceRefAr: "صحيح البخاري #6384 ، صحيح مسلم #2704",
    sourceRefEn: "Sahih Bukhari #6384, Sahih Muslim #2704",
    virtueAr: "كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ",
    virtueEn: "A treasure from the treasures of Paradise.",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_astaghfirullah_wa_atubu_ilaih",
    textAr: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    textEn: "Astaghfirullaha wa atubu ilayh",
    category: "istighfar",
    categoryNameAr: "الاستغفار والتوبة",
    categoryNameEn: "Istighfar & Repentance",
    sourceRefAr: "صحيح البخاري #6307",
    sourceRefEn: "Sahih Bukhari #6307",
    virtueAr: "وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً",
    virtueEn: "The Prophet ﷺ used to seek Allah's forgiveness and repent more than seventy times a day.",
    recommendedTarget: 70,
    hadithGradeAr: "صحيح البخاري",
    hadithGradeEn: "Sahih Al-Bukhari",
  },
  {
    id: "auth_salawat_on_prophet",
    textAr: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    textEn: "Allahumma salli wa sallim 'ala nabiyyina Muhammad",
    category: "salawat",
    categoryNameAr: "الصلاة على النبي ﷺ",
    categoryNameEn: "Salawat on Prophet",
    sourceRefAr: "صحيح الترغيب والترهيب #963 ، صحيح مسلم #408",
    sourceRefEn: "Sahih Al-Targheeb #963, Sahih Muslim #408",
    virtueAr: "مَنْ صَلَّى عَلَيَّ صَلاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا",
    virtueEn: "Whoever sends blessings upon me once, Allah sends blessings upon him ten times.",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح مسلم",
    hadithGradeEn: "Sahih Muslim",
  },
  {
    id: "auth_baqiyat_salihat",
    textAr: "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلا إِلَهَ إِلا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
    textEn: "Subhanallah, walhamdulillah, wa la ilaha illallah, wallahu akbar",
    category: "baqiyat",
    categoryNameAr: "الباقيات الصالحات",
    categoryNameEn: "Baqiyat Salihat",
    sourceRefAr: "صحيح مسلم #2695",
    sourceRefEn: "Sahih Muslim #2695",
    virtueAr:
      "أَحَبُّ الْكَلامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلا إِلَهَ إِلا اللَّهُ، وَاللَّهُ أَكْبَرُ",
    virtueEn:
      "The most beloved words to Allah are four: Subhanallah, Al-hamdulillah, La ilaha illallah, and Allahu Akbar.",
    recommendedTarget: 33,
    hadithGradeAr: "صحيح مسلم",
    hadithGradeEn: "Sahih Muslim",
  },
  {
    id: "auth_subhanallah_adada_khalqihi",
    textAr:
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، عَدَدَ خَلْقِهِ ، وَرِضَا نَفْسِهِ ، وَزِنَةَ عَرْشِهِ ، وَمِدَادَ كَلِمَاتِهِ",
    textEn: "Subhanallahi wa bihamdihi, 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatihi",
    category: "tasbeeh",
    categoryNameAr: "التسبيح والتحميد",
    categoryNameEn: "Tasbeeh & Tahmeed",
    sourceRefAr: "صحيح مسلم #2726",
    sourceRefEn: "Sahih Muslim #2726",
    virtueAr:
      "لَقَدْ قُلْتُ بَعْدَكِ أَرْبَعَ كَلِمَاتٍ، ثَلاثَ مَرَّاتٍ، لَوْ وُزِنَتْ بِمَا قُلْتِ مُنْذُ الْيَوْمِ لَوَزَنَتْهُنَّ",
    virtueEn: "Four phrases recited three times that weigh heavier than a whole morning of supplication.",
    recommendedTarget: 3,
    hadithGradeAr: "صحيح مسلم",
    hadithGradeEn: "Sahih Muslim",
  },
  {
    id: "auth_sayyid_al_istighfar",
    textAr:
      "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِك عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ",
    textEn:
      "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata'tu...",
    category: "istighfar",
    categoryNameAr: "الاستغفار والتوبة",
    categoryNameEn: "Istighfar & Repentance",
    sourceRefAr: "صحيح البخاري #6306 (سيد الاستغفار)",
    sourceRefEn: "Sahih Bukhari #6306 (Sayyid al-Istighfar)",
    virtueAr:
      "مَنْ قَالَهَا مِنَ النَّهَارِ مُوقِنًا بِهَا فَمَاتَ مِنْ يَوْمِهِ قَبْلَ أَنْ يُمْسِيَ فَهُوَ مِنْ أَهْلِ الْجَنَّةِ",
    virtueEn:
      "Whoever recites it during the day with conviction and dies before evening will be among the people of Paradise.",
    recommendedTarget: 1,
    hadithGradeAr: "صحيح البخاري",
    hadithGradeEn: "Sahih Al-Bukhari",
  },
];

export function getAuthenticZikrCategories(language: AppLanguage) {
  const isAr = language === "ar";
  return [
    { id: "all", label: isAr ? "الكل" : "All" },
    { id: "tasbeeh", label: isAr ? "التسبيح والتحميد" : "Tasbeeh" },
    { id: "tahliel", label: isAr ? "التهليل والتوحيد" : "Tahliel" },
    { id: "hawqalah", label: isAr ? "الحوقلة" : "Hawqalah" },
    { id: "istighfar", label: isAr ? "الاستغفار" : "Istighfar" },
    { id: "salawat", label: isAr ? "الصلاة على النبي ﷺ" : "Salawat" },
    { id: "baqiyat", label: isAr ? "الباقيات الصالحات" : "Baqiyat Salihat" },
  ];
}
