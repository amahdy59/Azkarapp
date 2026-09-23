import type { ZikrDraft } from "../types";

const reference = "An established wording for this stage of the prayer.";
const referenceArabic = "لفظ ثابت لهذا الموضع من الصلاة.";

export const IN_PRAYER_AZKAR: ZikrDraft[] = [
  {
    id: "in-prayer-introduction",
    category: "in_prayer",
    orderIndex: 0,
    arabicText: "أذكار الصلاة",
    transliteration: "",
    translation: "In-prayer Sunnah supplications",
    benefit:
      "A stage-by-stage reference for established wording within the prayer. Where more than one authentic wording exists, choose one; do not treat every entry as a single required checklist.",
    benefitArabic:
      "مرجع مرتب بحسب مواضع الصلاة للألفاظ الثابتة. عند تعدد الصيغ الصحيحة يُختار منها، ولا تُعامل العناصر كلها كقائمة واجبة في صلاة واحدة.",
    repetitionCount: 1,
    sourceReference: "Editorial scope note; see the cited evidence on each item.",
    sourceReferenceArabic: "تنبيه تحريري؛ يُرجع إلى دليل كل عنصر.",
    isCollectionIntroduction: true,
  },
  {
    id: "in-prayer-opening-forgiveness",
    category: "in_prayer",
    orderIndex: 1,
    arabicText:
      "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ",
    transliteration:
      "Allahumma ba'id bayni wa bayna khatayaya kama ba'adta baynal-mashriqi wal-maghrib. Allahumma naqqini min khatayaya kama yunaqqa ath-thawb al-abyadu min ad-danas. Allahummaghsil khatayaya bil-ma'i wath-thalji wal-barad.",
    translation:
      "O Allah, distance me from my sins as You have distanced the East from the West. O Allah, cleanse me of my sins as a white garment is cleansed of filth. O Allah, wash away my sins with water, snow, and hail.",
    benefit: reference,
    benefitArabic: referenceArabic,
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 744.",
    sourceReferenceArabic: "صحيح البخاري ٧٤٤.",
    preferredTiming: "After the opening takbir, before recitation.",
    attributionType: "said_by_prophet",
    sourceUrl: "https://sunnah.com/bukhari%3A744",
  },
  {
    id: "in-prayer-ruku-tasbih",
    category: "in_prayer",
    orderIndex: 2,
    arabicText: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    transliteration: "Subhana Rabbiyal-'Azim.",
    translation: "Glory be to my Lord, the Magnificent.",
    benefit: "Established glorification in bowing. The reviewed reference gives three repetitions.",
    benefitArabic: "تسبيح ثابت في الركوع، ويذكر المرجع المحقق ثلاث تسبيحات.",
    repetitionCount: 3,
    sourceReference: "Hisn al-Muslim 33; see Al-Albani, Sahih at-Tirmidhi 1/83.",
    sourceReferenceArabic: "حصن المسلم ٣٣؛ وانظر صحيح الترمذي للألباني ١/٨٣.",
    preferredTiming: "While bowing (ruku').",
    attributionType: "said_by_prophet",
    sourceUrl: "https://sunnah.com/hisn%3A33",
  },
  {
    id: "in-prayer-rising-praise",
    category: "in_prayer",
    orderIndex: 3,
    arabicText: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ",
    transliteration: "Sami'a Allahu liman hamidah. Rabbana wa lakal-hamd.",
    translation: "Allah hears the one who praises Him. Our Lord, all praise is for You.",
    benefit:
      "Established wording when rising from bowing; the imam says the first phrase and the worshipper responds with praise according to their prayer role.",
    benefitArabic: "لفظ ثابت عند الرفع من الركوع؛ يقول الإمام التحميد الأول ويتبع المصلي بالحمد بحسب موضعه في الصلاة.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 795.",
    sourceReferenceArabic: "صحيح البخاري ٧٩٥.",
    preferredTiming: "On rising from bowing (ruku').",
    attributionType: "said_by_prophet",
    sourceUrl: "https://sunnah.com/bukhari/10/190",
  },
  {
    id: "in-prayer-sujud-tasbih",
    category: "in_prayer",
    orderIndex: 4,
    arabicText: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    transliteration: "Subhana Rabbiyal-A'la.",
    translation: "Glory be to my Lord, the Most High.",
    benefit: "Established glorification in prostration. The reviewed reference gives three repetitions.",
    benefitArabic: "تسبيح ثابت في السجود، ويذكر المرجع المحقق ثلاث تسبيحات.",
    repetitionCount: 3,
    sourceReference: "Hisn al-Muslim 41; see Al-Albani, Sahih at-Tirmidhi 1/83.",
    sourceReferenceArabic: "حصن المسلم ٤١؛ وانظر صحيح الترمذي للألباني ١/٨٣.",
    preferredTiming: "While prostrating (sujud).",
    attributionType: "said_by_prophet",
    sourceUrl: "https://sunnah.com/hisn%3A41",
  },
  {
    id: "in-prayer-between-prostrations",
    category: "in_prayer",
    orderIndex: 5,
    arabicText: "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَعَافِنِي وَاهْدِنِي وَارْزُقْنِي",
    transliteration: "Allahummaghfir li warhamni wa 'afini wahdini warzuqni.",
    translation: "O Allah, forgive me, have mercy on me, grant me well-being, guide me, and provide for me.",
    benefit: reference,
    benefitArabic: referenceArabic,
    repetitionCount: 1,
    sourceReference: "Sunan Abi Dawud 850 (Hasan, al-Albani).",
    sourceReferenceArabic: "سنن أبي داود ٨٥٠ (حسن، الألباني).",
    preferredTiming: "While sitting between the two prostrations.",
    authenticityNote: "Hasan according to Al-Albani.",
    attributionType: "said_by_prophet",
    sourceUrl: "https://sunnah.com/abudawud/2/460",
  },
  {
    id: "in-prayer-tashahhud",
    category: "in_prayer",
    orderIndex: 6,
    arabicText:
      "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    transliteration:
      "At-tahiyyatu lillahi was-salawatu wat-tayyibat. As-salamu 'alayka ayyuhan-nabiyyu wa rahmatullahi wa barakatuh. As-salamu 'alayna wa 'ala 'ibadillahis-salihin. Ash-hadu an la ilaha illallah wa ash-hadu anna Muhammadan 'abduhu wa rasuluh.",
    translation:
      "All greetings, prayers, and pure words are for Allah. Peace be upon you, O Prophet, and Allah's mercy and blessings. Peace be upon us and Allah's righteous servants. I testify that none is worthy of worship except Allah and that Muhammad is His servant and Messenger.",
    benefit: "The tashahhud wording taught by the Prophet ﷺ in the prayer.",
    benefitArabic: "من صيغة التشهد التي علّمها النبي ﷺ في الصلاة.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 831.",
    sourceReferenceArabic: "صحيح البخاري ٨٣١.",
    preferredTiming: "During the sitting for tashahhud.",
    attributionType: "taught_by_prophet",
    sourceUrl: "https://sunnah.com/bukhari/10/225",
  },
  {
    id: "in-prayer-ibrahimiyyah",
    category: "in_prayer",
    orderIndex: 7,
    arabicText:
      "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ",
    transliteration:
      "Allahumma salli 'ala Muhammadin wa 'ala ali Muhammadin kama sallayta 'ala ali Ibrahima innaka Hamidun Majid. Allahumma barik 'ala Muhammadin wa 'ala ali Muhammadin kama barakta 'ala ali Ibrahima innaka Hamidun Majid.",
    translation:
      "O Allah, send prayers upon Muhammad and the family of Muhammad as You sent prayers upon the family of Ibrahim; You are Praiseworthy, Glorious. O Allah, bless Muhammad and the family of Muhammad as You blessed the family of Ibrahim; You are Praiseworthy, Glorious.",
    benefit: "A Prophetic formula for sending prayers and blessings upon the Prophet ﷺ.",
    benefitArabic: "صيغة نبوية للصلاة والبركة على النبي ﷺ.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6357.",
    sourceReferenceArabic: "صحيح البخاري ٦٣٥٧.",
    preferredTiming: "After the final tashahhud, before supplication and salam.",
    attributionType: "taught_by_prophet",
    sourceUrl: "https://sunnah.com/bukhari/80/54-55",
  },
  {
    id: "in-prayer-before-salam-refuge",
    category: "in_prayer",
    orderIndex: 8,
    arabicText:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ جَهَنَّمَ، وَمِنْ عَذَابِ الْقَبْرِ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
    transliteration:
      "Allahumma inni a'udhu bika min 'adhabi Jahannam, wa min 'adhabil-qabr, wa min fitnatil-mahya wal-mamat, wa min sharri fitnatil-Masihid-Dajjal.",
    translation:
      "O Allah, I seek refuge in You from the punishment of Hell, the punishment of the grave, the trials of life and death, and the evil trial of the False Messiah.",
    benefit: "An explicit Prophetic instruction after tashahhud and before salam.",
    benefitArabic: "أمر نبوي صريح بالاستعاذة به بعد التشهد وقبل السلام.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 588a.",
    sourceReferenceArabic: "صحيح مسلم ٥٨٨أ.",
    preferredTiming: "After the final tashahhud, before salam.",
    attributionType: "taught_by_prophet",
    sourceUrl: "https://sunnah.com/muslim%3A588a",
  },
];

for (const zikr of IN_PRAYER_AZKAR) {
  if (!zikr.isCollectionIntroduction && !zikr.hadithText) {
    zikr.hadithText = zikr.arabicText;
    zikr.hadithTextEnglish = zikr.translation;
  }
}
