import type { AppLanguage } from "../types";

export type AuthenticZikrCategory = "tasbeeh" | "tahliel" | "hawqalah" | "istighfar" | "salawat" | "baqiyat";

export interface AuthenticZikrItem {
  id: string;
  textAr: string;
  textEn: string;
  shortNameAr: string;
  shortNameEn: string;
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
  hadithTextAr: string;
  hadithTextEn: string;
  sourceUrl?: string;
}

export const AUTHENTIC_AZKAR_COLLECTION: AuthenticZikrItem[] = [
  {
    id: "auth_subhanallah_wabihamdihi",
    textAr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    textEn: "Subhanallahi wa bihamdihi",
    shortNameAr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    shortNameEn: "Subhanallahi wa bihamdihi",
    category: "tasbeeh",
    categoryNameAr: "التسبيح والتحميد",
    categoryNameEn: "Tasbeeh & Tahmeed",
    sourceRefAr: "صحيح البخاري #6405",
    sourceRefEn: "Sahih Bukhari #6405",
    sourceUrl: "https://sunnah.com/bukhari:6405",
    virtueAr:
      "مَنْ قَالَ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، فِي يَوْمٍ مِائَةَ مَرَّةٍ، حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ",
    virtueEn: "Whoever says it 100 times a day, his sins will be forgiven even if they were like the foam of the sea.",
    hadithTextAr:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ قَالَ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ، حُطَّتْ خَطَايَاهُ وَإِنْ كَانَتْ مِثْلَ زَبَدِ الْبَحْرِ».",
    hadithTextEn:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever says: Glory be to Allah and praise be to Him — a hundred times in a day, his sins are wiped away, even were they like the foam of the sea.”",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_subhanallah_alazeem",
    textAr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    textEn: "Subhanallahi wa bihamdihi, Subhanallahil-Azeem",
    shortNameAr: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، سُبْحَانَ اللَّهِ الْعَظِيمِ",
    shortNameEn: "Subhanallahi wa bihamdihi...",
    category: "tasbeeh",
    categoryNameAr: "التسبيح والتحميد",
    categoryNameEn: "Tasbeeh & Tahmeed",
    sourceRefAr: "صحيح البخاري #6682 ، صحيح مسلم #2694",
    sourceRefEn: "Sahih Bukhari #6682, Sahih Muslim #2694",
    sourceUrl: "https://sunnah.com/bukhari:6682",
    virtueAr: "كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ",
    virtueEn: "Two words light on the tongue, heavy in the balance, beloved to the Most Merciful.",
    hadithTextAr:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ».",
    hadithTextEn:
      "Abu Hurayrah (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Two words are light upon the tongue, heavy in the scale, beloved to the Most Merciful: Glory be to Allah and praise be to Him; glory be to Allah the Immense.”",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_la_ilaha_illallah_wahdahu",
    textAr:
      "لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    textEn: "La ilaha illallahu wahdahu la shareeka lah, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadeer",
    shortNameAr: "لا إِلَهَ إِلا اللَّهُ وَحْدَهُ...",
    shortNameEn: "La ilaha illallah wahdahu...",
    category: "tahliel",
    categoryNameAr: "التهليل والتوحيد",
    categoryNameEn: "Tahliel & Tawheed",
    sourceRefAr: "صحيح البخاري #3293 ، صحيح مسلم #2691",
    sourceRefEn: "Sahih Bukhari #3293, Sahih Muslim #2691",
    sourceUrl: "https://sunnah.com/bukhari:3293",
    virtueAr:
      "مَنْ قَالَهَا مِائَةَ مَرَّةٍ كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ",
    virtueEn:
      "Whoever recites it 100 times gets the reward of freeing 10 slaves, 100 good deeds written, and 100 sins wiped.",
    hadithTextAr:
      "عَنْ أَبِي هُرَيْرَةَ رضي الله عنه أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ قَالَ لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، فِي يَوْمٍ مِائَةَ مَرَّةٍ، كَانَتْ لَهُ عَدْلَ عَشْرِ رِقَابٍ، وَكُتِبَتْ لَهُ مِائَةُ حَسَنَةٍ، وَمُحِيَتْ عَنْهُ مِائَةُ سَيِّئَةٍ، وَكَانَتْ لَهُ حِرْزًا مِنَ الشَّيْطَانِ يَوْمَهُ ذَلِكَ حَتَّى يُمْسِيَ، وَلَمْ يَأْتِ أَحَدٌ بِأَفْضَلَ مِمَّا جَاءَ بِهِ إِلَّا أَحَدٌ عَمِلَ أَكْثَرَ مِنْ ذَلِكَ».",
    hadithTextEn:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever says: There is no god but Allah alone, with no partner; His is the dominion and His is the praise, and He is capable of all things — a hundred times in a day, it is for him the equal of freeing ten slaves, a hundred good deeds are recorded for him, a hundred bad deeds are wiped away, and it is a protection for him from Satan for that day until evening; and no one brings anything better than what he brought, except one who does more than that.”",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_la_hawla_wala_quwwata",
    textAr: "لا حَوْلَ وَلا قُوَّةَ إِلا بِاللَّهِ",
    textEn: "La hawla wa la quwwata illa billah",
    shortNameAr: "الحوقلة",
    shortNameEn: "Hawqalah",
    category: "hawqalah",
    categoryNameAr: "الحوقلة",
    categoryNameEn: "Hawqalah",
    sourceRefAr: "صحيح البخاري #6384 ، صحيح مسلم #2704",
    sourceRefEn: "Sahih Bukhari #6384, Sahih Muslim #2704",
    sourceUrl: "https://sunnah.com/bukhari:6384",
    virtueAr: "كَنْزٌ مِنْ كُنُوزِ الْجَنَّةِ",
    virtueEn: "A treasure from the treasures of Paradise.",
    hadithTextAr:
      "عَنْ أَبِي مُوسَى الْأَشْعَرِيِّ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ لِي رَسُولُ اللَّهِ ﷺ: «أَلَا أَدُلُّكَ عَلَى كَنْزٍ مِنْ كُنُوزِ الْجَنَّةِ؟ فَقُلْتُ: بَلَى يَا رَسُولَ اللَّهِ، قَالَ: لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ».",
    hadithTextEn:
      "Abu Musa al-Ash‘ari (may Allah be pleased with him) said: The Messenger of Allah ﷺ said to me: “Shall I not direct you to a treasure from the treasures of Paradise?” I said: Yes, Messenger of Allah. He said: “There is no power and no strength except with Allah.”",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح متفق عليه",
    hadithGradeEn: "Sahih (Agreed Upon)",
  },
  {
    id: "auth_astaghfirullah_wa_atubu_ilaih",
    textAr: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    textEn: "Astaghfirullaha wa atubu ilayh",
    shortNameAr: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    shortNameEn: "Astaghfirullaha wa atubu ilayh",
    category: "istighfar",
    categoryNameAr: "الاستغفار والتوبة",
    categoryNameEn: "Istighfar & Repentance",
    sourceRefAr: "صحيح البخاري #6307",
    sourceRefEn: "Sahih Bukhari #6307",
    sourceUrl: "https://sunnah.com/bukhari:6307",
    virtueAr: "وَاللَّهِ إِنِّي لأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً",
    virtueEn: "The Prophet ﷺ used to seek Allah's forgiveness and repent more than seventy times a day.",
    hadithTextAr:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ قَالَ: سَمِعْتُ رَسُولَ اللَّهِ ﷺ يَقُولُ: «وَاللَّهِ إِنِّي لَأَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ فِي الْيَوْمِ أَكْثَرَ مِنْ سَبْعِينَ مَرَّةً».",
    hadithTextEn:
      "Abu Hurayrah (may Allah be pleased with him) said: I heard the Messenger of Allah ﷺ say: “By Allah, I seek Allah's forgiveness and repent to Him more than seventy times a day.”",
    recommendedTarget: 70,
    hadithGradeAr: "صحيح البخاري",
    hadithGradeEn: "Sahih Al-Bukhari",
  },
  {
    id: "auth_salawat_on_prophet",
    textAr: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    textEn: "Allahumma salli wa sallim 'ala nabiyyina Muhammad",
    shortNameAr: "الصلاة على النبي ﷺ",
    shortNameEn: "Salawat on the Prophet ﷺ",
    category: "salawat",
    categoryNameAr: "الصلاة على النبي ﷺ",
    categoryNameEn: "Salawat on Prophet",
    sourceRefAr: "صحيح مسلم #408",
    sourceRefEn: "Sahih Muslim #408",
    sourceUrl: "https://sunnah.com/muslim:408",
    virtueAr: "مَنْ صَلَّى عَلَيَّ صَلاةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا",
    virtueEn: "Whoever sends blessings upon me once, Allah sends blessings upon him ten times.",
    hadithTextAr:
      "عَنْ أَبِي هُرَيْرَةَ رَضِيَ اللَّهُ عَنْهُ، أَنَّ رَسُولَ اللَّهِ ﷺ قَالَ: «مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا».",
    hadithTextEn:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever sends blessings upon me once, Allah sends ten blessings upon him.”",
    recommendedTarget: 100,
    hadithGradeAr: "صحيح مسلم",
    hadithGradeEn: "Sahih Muslim",
  },
  {
    id: "auth_baqiyat_salihat",
    textAr: "سُبْحَانَ اللَّهِ ، وَالْحَمْدُ لِلَّهِ ، وَلا إِلَهَ إِلا اللَّهُ ، وَاللَّهُ أَكْبَرُ",
    textEn: "Subhanallah, walhamdulillah, wa la ilaha illallah, wallahu akbar",
    shortNameAr: "الباقيات الصالحات",
    shortNameEn: "Al-Baqiyat As-Salihat",
    category: "baqiyat",
    categoryNameAr: "الباقيات الصالحات",
    categoryNameEn: "Baqiyat Salihat",
    sourceRefAr: "صحيح مسلم #2137a",
    sourceRefEn: "Sahih Muslim #2137a",
    sourceUrl: "https://sunnah.com/muslim:2137a",
    virtueAr:
      "أَحَبُّ الْكَلامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلا إِلَهَ إِلا اللَّهُ، وَاللَّهُ أَكْبَرُ",
    virtueEn:
      "The most beloved words to Allah are four: Subhanallah, Al-hamdulillah, La ilaha illallah, and Allahu Akbar.",
    hadithTextAr:
      "عَنْ سَمُرَةَ بْنِ جُنْدَبٍ رَضِيَ اللَّهُ عَنْهُ قَالَ: قَالَ رَسُولُ اللَّهِ ﷺ: «أَحَبُّ الْكَلَامِ إِلَى اللَّهِ أَرْبَعٌ: سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، لَا يَضُرُّكَ بِأَيِّهِنَّ بَدَأْتَ».",
    hadithTextEn:
      "Samurah ibn Jundab (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “The dearest words to Allah are four: Subhanallah, Al-hamdulillah, La ilaha illallah, and Allahu Akbar. It does not matter which of them you begin with.”",
    recommendedTarget: 33,
    hadithGradeAr: "صحيح مسلم",
    hadithGradeEn: "Sahih Muslim",
  },
  {
    id: "auth_subhanallah_adada_khalqihi",
    textAr:
      "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ ، عَدَدَ خَلْقِهِ ، وَرِضَا نَفْسِهِ ، وَزِنَةَ عَرْشِهِ ، وَمِدَادَ كَلِمَاتِهِ",
    textEn: "Subhanallahi wa bihamdihi, 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatihi",
    shortNameAr: "سبحان الله وبحمده عدد خلقه...",
    shortNameEn: "Subhanallahi 'adada khalqihi...",
    category: "tasbeeh",
    categoryNameAr: "التسبيح والتحميد",
    categoryNameEn: "Tasbeeh & Tahmeed",
    sourceRefAr: "صحيح مسلم #2726",
    sourceRefEn: "Sahih Muslim #2726",
    sourceUrl: "https://sunnah.com/muslim:2726",
    virtueAr:
      "لَقَدْ قُلْتُ بَعْدَكِ أَرْبَعَ كَلِمَاتٍ، ثَلاثَ مَرَّاتٍ، لَوْ وُزِنَتْ بِمَا قُلْتِ مُنْذُ الْيَوْمِ لَوَزَنَتْهُنَّ",
    virtueEn: "Four phrases recited three times that weigh heavier than a whole morning of supplication.",
    hadithTextAr:
      "عَنْ جُوَيْرِيَةَ رضي الله عنها أَنَّ النَّبِيَّ ﷺ خَرَجَ مِنْ عِنْدِهَا بُكْرَةً حِينَ صَلَّى الصُّبْحَ وَهِيَ فِي مَسْجِدِهَا ثُمَّ رَجَعَ بَعْدَ أَنْ أَضْحَى وَهِيَ جَالِسَةٌ فَقَالَ: «لَقَدْ قُلْتُ بَعْدَكِ أَرْبَعَ كَلِمَاتٍ ثَلاَثَ مَرَّاتٍ لَوْ وُزِنَتْ بِمَا قُلْتِ مُنْذُ الْيَوْمِ لَوَزَنَتْهُنَّ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ عَدَدَ خَلْقِهِ وَرِضَا نَفْسِهِ وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ».",
    hadithTextEn:
      "Juwayriyah (may Allah be pleased with her) reported that the Prophet ﷺ left her early, after he had prayed the dawn prayer, while she was in her place of prayer; then he returned after the forenoon and she was still sitting. He said: “I have said four words three times since I left you which, if weighed against what you have said since the day began, would outweigh them: Glory be to Allah and praise be to Him, as many as His creation, as pleases Him, as the weight of His Throne, and as the ink of His words.”",
    recommendedTarget: 3,
    hadithGradeAr: "صحيح مسلم",
    hadithGradeEn: "Sahih Muslim",
  },
  {
    id: "auth_sayyid_al_istighfar",
    textAr:
      "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِك عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ",
    textEn:
      "Allahumma anta Rabbi la ilaha illa anta, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi-ni'matika 'alayya wa abu'u bi-dhanbi faghfir li fa-innahu la yaghfirudh-dhunuba illa ant",
    shortNameAr: "سيد الاستغفار",
    shortNameEn: "Sayyid al-Istighfar",
    category: "istighfar",
    categoryNameAr: "الاستغفار والتوبة",
    categoryNameEn: "Istighfar & Repentance",
    sourceRefAr: "صحيح البخاري #6306",
    sourceRefEn: "Sahih Bukhari #6306",
    sourceUrl: "https://sunnah.com/bukhari:6306",
    virtueAr:
      "مَنْ قَالَهَا مِنَ النَّهَارِ مُوقِنًا بِهَا فَمَاتَ مِنْ يَوْمِهِ قَبْلَ أَنْ يُمْسِيَ فَهُوَ مِنْ أَهْلِ الْجَنَّةِ",
    virtueEn:
      "Whoever recites it during the day with conviction and dies before evening will be among the people of Paradise.",
    hadithTextAr:
      "عَنْ شَدَّادِ بْنِ أَوْسٍ رَضِيَ اللَّهُ عَنْهُ عَنِ النَّبِيِّ ﷺ قَالَ: «سَيِّدُ الِاسْتِغْفَارِ أَنْ تَقُولَ: اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ». قَالَ: «وَمَنْ قَالَهَا مِنَ النَّهَارِ مُوقِنًا بِهَا فَمَاتَ مِنْ يَوْمِهِ قَبْلَ أَنْ يُمْسِيَ فَهُوَ مِنْ أَهْلِ الْجَنَّةِ، وَمَنْ قَالَهَا مِنَ اللَّيْلِ وَهُوَ مُوقِنٌ بِهَا فَمَاتَ قَبْلَ أَنْ يُصْبِحَ فَهُوَ مِنْ أَهْلِ الْجَنَّةِ».",
    hadithTextEn:
      "Shaddad ibn Aws (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “The master supplication for forgiveness is that you say: O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I hold to Your covenant and Your promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge before You Your favour upon me, and I acknowledge before You my sin, so forgive me — for none forgives sins but You.” He said: “Whoever says it during the day, certain of it, and dies that day before evening, is among the people of Paradise; and whoever says it at night, certain of it, and dies before morning, is among the people of Paradise.”",
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
