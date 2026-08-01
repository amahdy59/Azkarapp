import type { Zikr, ZikrAudioBehavior, ZikrDraft } from "../types";
import { APPROVED_AUDIO_ASSIGNMENTS } from "../audio/audioAssignments";
import { QURAN_PASSAGES } from "./quranPassages";

const QURAN_CONTENT_BY_ID = {
  "m-hm-75": QURAN_PASSAGES.ayatAlKursi,
  "e-hm-75": QURAN_PASSAGES.ayatAlKursi,
  "s-hm-100": QURAN_PASSAGES.ayatAlKursi,
  "ap-ref-9": QURAN_PASSAGES.ayatAlKursi,
  "s-hm-101": QURAN_PASSAGES.lastTwoAlBaqarah,
  "m-hm-76a": QURAN_PASSAGES.alIkhlas,
  "e-hm-76a": QURAN_PASSAGES.alIkhlas,
  "s-hm-99-ikhlas": QURAN_PASSAGES.alIkhlas,
  "m-hm-76b": QURAN_PASSAGES.alFalaq,
  "e-hm-76b": QURAN_PASSAGES.alFalaq,
  "s-hm-99-falaq": QURAN_PASSAGES.alFalaq,
  "m-hm-76c": QURAN_PASSAGES.anNas,
  "e-hm-76c": QURAN_PASSAGES.anNas,
  "s-hm-99-nas": QURAN_PASSAGES.anNas,
  "s-hm-109a": QURAN_PASSAGES.alKafirun,
  "s-hm-110a": QURAN_PASSAGES.asSajdah,
  "s-hm-110b": QURAN_PASSAGES.alMulk,
} as const;

/** Repeated non-Qur'anic wording has one canonical source item. Context-specific benefits and counts stay local. */
const SHARED_ZIKR_ALIASES: Readonly<Record<string, string>> = {
  "e-hm-75a": "m-hm-75a",
  "e-hm-79": "m-hm-79",
  "e-hm-82": "m-hm-82",
  "e-hm-83": "m-hm-83",
  "da-ref-5": "m-hm-83",
  "e-hm-84": "m-hm-84",
  "e-hm-85": "m-hm-85",
  "e-hm-86": "m-hm-86",
  "e-hm-87": "m-hm-87",
  "e-hm-88": "m-hm-88",
  "e-hm-91": "m-hm-91",
  "e-hm-92": "m-hm-93",
  "e-hm-96": "m-hm-96",
  "e-hm-97": "m-hm-97",
  "e-hm-98": "m-hm-98",
  "ap-tasbeeh-subhanallah": "s-hm-106-subhanallah",
  "ap-tasbeeh-alhamdulillah": "s-hm-106-alhamdulillah",
  "ap-tasbeeh-allahuakbar": "s-hm-106-allahu-akbar",
  "fd-ref-1": "pur-ref-1",
  "clo-ref-4": "pur-ref-1",
};

/** Explicit identities only. No text similarity or citation matching is used. */
const CANONICAL_KEY_BY_ID: Readonly<Record<string, string>> = {
  "m-hm-75": "quran-002-255",
  "e-hm-75": "quran-002-255",
  "s-hm-100": "quran-002-255",
  "ap-ref-9": "quran-002-255",
  "m-hm-76a": "quran-112",
  "e-hm-76a": "quran-112",
  "s-hm-99-ikhlas": "quran-112",
  "m-hm-76b": "quran-113",
  "e-hm-76b": "quran-113",
  "s-hm-99-falaq": "quran-113",
  "m-hm-76c": "quran-114",
  "e-hm-76c": "quran-114",
  "s-hm-99-nas": "quran-114",
  "s-hm-101": "quran-002-285-286",
  "s-hm-109a": "quran-109",
  "s-hm-110a": "quran-032",
  "s-hm-110b": "quran-067",
  "m-hm-75a": "zikr:collection-opening",
  "e-hm-75a": "zikr:collection-opening",
  "m-hm-79": "zikr:sayyid-al-istighfar",
  "e-hm-79": "zikr:sayyid-al-istighfar",
  "misc-ref-8": "zikr:sayyid-al-istighfar",
  "friday-dua-02": "zikr:sayyid-al-istighfar",
  "m-hm-82": "zikr:daily-wellbeing",
  "e-hm-82": "zikr:daily-wellbeing",
  "m-hm-83": "quran-009-129-excerpt",
  "e-hm-83": "quran-009-129-excerpt",
  "da-ref-5": "quran-009-129-excerpt",
  "m-hm-84": "zikr:pardon-and-wellbeing",
  "e-hm-84": "zikr:pardon-and-wellbeing",
  "m-hm-85": "zikr:refuge-from-self-and-shaytan",
  "e-hm-85": "zikr:refuge-from-self-and-shaytan",
  "s-hm-109": "zikr:refuge-from-self-and-shaytan",
  "m-hm-86": "zikr:bismillah-no-harm",
  "e-hm-86": "zikr:bismillah-no-harm",
  "misc-ref-9": "zikr:bismillah-no-harm",
  "m-hm-87": "zikr:contentment-with-faith",
  "e-hm-87": "zikr:contentment-with-faith",
  "m-hm-88": "zikr:ya-hayyu-ya-qayyum",
  "e-hm-88": "zikr:ya-hayyu-ya-qayyum",
  "m-hm-91": "zikr:subhanallah-wa-bihamdih",
  "e-hm-91": "zikr:subhanallah-wa-bihamdih",
  "misc-ref-3": "zikr:subhanallah-wa-bihamdih",
  "m-hm-93": "zikr:tahlil-complete",
  "e-hm-92": "zikr:tahlil-complete",
  "ap-ref-3": "zikr:tahlil-complete",
  "ap-tasbeeh-tawhid": "zikr:tahlil-complete",
  "misc-ref-2": "zikr:tahlil-complete",
  "m-hm-96": "zikr:astaghfirullah-wa-atubu-ilayh",
  "e-hm-96": "zikr:astaghfirullah-wa-atubu-ilayh",
  "m-hm-97": "zikr:perfect-words-refuge",
  "e-hm-97": "zikr:perfect-words-refuge",
  "m-hm-98": "zikr:salawat-short",
  "e-hm-98": "zikr:salawat-short",
  "s-hm-106-subhanallah": "zikr:subhanallah",
  "ap-tasbeeh-subhanallah": "zikr:subhanallah",
  "s-hm-106-alhamdulillah": "zikr:alhamdulillah",
  "ap-tasbeeh-alhamdulillah": "zikr:alhamdulillah",
  "s-hm-106-allahu-akbar": "zikr:allahu-akbar",
  "ap-tasbeeh-allahuakbar": "zikr:allahu-akbar",
  "pur-ref-1": "zikr:bismillah",
  "fd-ref-1": "zikr:bismillah",
  "clo-ref-4": "zikr:bismillah",
  "da-ref-4": "zikr:distress-refuge",
  "friday-dua-12": "zikr:distress-refuge",
  "da-ref-2": "zikr:allahumma-rahmataka-arju",
  "friday-dua-20": "zikr:allahumma-rahmataka-arju",
  "friday-dua-32": "zikr:daily-wellbeing",
  "misc-ref-1": "zikr:subhanallah-great",
  "comprehensive-dua-39": "zikr:subhanallah-great",
  "ap-ref-10": "zikr:refuge-from-cowardice",
  "comprehensive-dua-44": "zikr:refuge-from-cowardice",
};

function getAudioBehavior(item: ZikrDraft): ZikrAudioBehavior {
  const prescribedRepeatIsSuitable = item.repetitionCount > 1 && item.repetitionCount <= 10;
  return {
    defaultMode: "play-once",
    supportedModes: prescribedRepeatIsSuitable
      ? ["play-once", "repeat-prescribed-count", "repeat-custom"]
      : ["play-once"],
    repetitionUnit: item.ritualGroupId === "three_quls" ? "ritual-round" : "zikr",
    ...(prescribedRepeatIsSuitable ? { recommendedMaxAutoRepeat: item.repetitionCount } : {}),
  };
}

const BENEFIT_OVERRIDES: Readonly<Record<string, string>> = {
  "m-hm-75": "Protection from the jinn until evening.",
  "e-hm-75": "Protection from the jinn until morning.",
  "m-hm-79": "Whoever says it with certainty and dies that day will enter Paradise.",
  "e-hm-79": "Whoever says it with certainty and dies that night will enter Paradise.",
  "m-hm-82": "Prophetic supplication for bodily, hearing, and sight well-being; recited three times.",
  "e-hm-82": "Prophetic supplication for bodily, hearing, and sight well-being; recited three times.",
  "m-hm-83": "A concise Qur’anic declaration of reliance upon Allah.",
  "e-hm-83": "A concise Qur’anic declaration of reliance upon Allah.",
  "m-hm-84": "A comprehensive daily request for pardon, well-being, and protection.",
  "e-hm-84": "A comprehensive daily request for pardon, well-being, and protection.",
  "m-hm-86": "Said three times; by Allah’s permission, nothing will cause harm.",
  "e-hm-86": "Said three times; by Allah’s permission, nothing will cause harm.",
  "m-hm-87": "Said three times; a pledge of contentment with Allah, Islam, and Muhammad ﷺ.",
  "e-hm-87": "Said three times; a pledge of contentment with Allah, Islam, and Muhammad ﷺ.",
  "m-hm-88": "A plea for Allah to set every affair right and not leave one to oneself.",
  "e-hm-88": "A plea for Allah to set every affair right and not leave one to oneself.",
  "m-hm-91": "Said one hundred times; sins are erased even if like the foam of the sea.",
  "e-hm-91": "Said one hundred times; sins are erased even if like the foam of the sea.",
  "m-hm-94": "Three repetitions outweigh a long morning spent in remembrance.",
  "m-hm-95": "A request after Fajr for beneficial knowledge, lawful provision, and accepted deeds.",
  "m-hm-97": "Said three times in the evening for protection from poisonous harm that night.",
  "e-hm-97": "Said three times in the evening for protection from poisonous harm that night.",
  "e-hm-77e": "The Prophet ﷺ used this remembrance upon entering the evening.",
  "e-hm-78e": "A Prophetic remembrance affirming that life, death, and return are to Allah.",
  "e-hm-80e": "Said four times in the evening; a reported means of freedom from the Fire.",
  "e-hm-81e": "Said in the evening as gratitude for the blessings of the night.",
  "e-hm-89e": "A comprehensive evening request for the good of the night and protection from its evil.",
  "e-hm-90e": "An evening testimony to faith in Allah and the religion of Islam.",
  "m-hm-98": "Ten blessings upon the Prophet ﷺ in the morning; reported as a means to his intercession.",
  "e-hm-98": "Ten blessings upon the Prophet ﷺ in the evening; reported as a means to his intercession.",
};

const QURAN_RELIANCE_CORRECTION: Partial<Zikr> = {
  repetitionCount: 1,
  countLabel: "1",
  benefit: "A Qur’anic declaration that Allah alone is sufficient and worthy of reliance.",
  sourceReference: "Qur’an 9:129.",
  hadithText:
    "قَالَ اللَّهُ تَعَالَى: ﴿حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ﴾.",
  authenticityNote: "Qur’an 9:129; Abu Dawud 5081 is graded fabricated by al-Albani and is not used.",
  sourceUrl: "https://sunnah.com/abudawud%3A5081",
};

const TEXT_OVERRIDES: Readonly<Record<string, Partial<Zikr>>> = {
  "m-hm-83": QURAN_RELIANCE_CORRECTION,
  "e-hm-83": QURAN_RELIANCE_CORRECTION,
  "s-hm-107": {
    transliteration:
      "Allāhumma Rabbas-samāwātis-sab‘i wa Rabbal-‘Arshil-‘Aẓīm, Rabbanā wa Rabba kulli shay’, fāliqal-ḥabbi wan-nawā, wa munzilat-Tawrāti wal-Injīli wal-Furqān. A‘ūdhu bika min sharri kulli shay’in Anta ākhidhun bināṣiyatih. Allāhumma Antal-Awwalu falaysa qablaka shay’, wa Antal-Ākhiru falaysa ba‘daka shay’, wa Antaẓ-Ẓāhiru falaysa fawqaka shay’, wa Antal-Bāṭinu falaysa dūnaka shay’. Iqḍi ‘annad-dayna wa aghninā minal-faqr.",
    translation:
      "O Allah, Lord of the seven heavens and the Magnificent Throne, our Lord and Lord of everything, Splitter of the grain and date-stone, Revealer of the Torah, Gospel, and Criterion: I seek refuge in You from the evil of everything whose forelock You hold. O Allah, You are the First, with nothing before You; the Last, with nothing after You; the Most High, with nothing above You; and the Most Near, with nothing nearer than You. Settle our debt and spare us from poverty.",
  },
  "s-hm-109": {
    transliteration:
      "Allāhumma ‘Ālimal-ghaybi wash-shahādah, Fāṭiras-samāwāti wal-arḍ, Rabba kulli shay’in wa malīkah, ashhadu an lā ilāha illā Ant. A‘ūdhu bika min sharri nafsī, wa min sharrish-shayṭāni wa shirkih, wa an aqtarifa ‘alā nafsī sū’an aw ajurrahu ilā Muslim.",
    translation:
      "O Allah, Knower of the unseen and the witnessed, Creator of the heavens and earth, Lord and Sovereign of everything, I testify that none is worthy of worship but You. I seek refuge in You from the evil of myself, from the evil and idolatrous promptings of Satan, and from committing evil against myself or bringing it upon another Muslim.",
  },
  "s-hm-111": {
    transliteration:
      "Allāhumma aslamtu nafsī ilayk, wa fawwaḍtu amrī ilayk, wa wajjahtu wajhī ilayk, wa alja’tu ẓahrī ilayk, raghbatan wa rahbatan ilayk. Lā malja’a wa lā manjā minka illā ilayk. Āmantu bikitābikal-ladhī anzalt, wa binabiyyikal-ladhī arsalt.",
    translation:
      "O Allah, I submit myself to You, entrust my affairs to You, turn my face to You, and rely upon You, in hope and fear of You. There is no refuge or escape from You except with You. I believe in Your Book which You revealed and in Your Prophet whom You sent.",
  },
  "misc-ref-8": {
    translation:
      "O Allah, You are my Lord. None is worthy of worship but You. You created me and I am Your servant. I keep Your covenant and promise as far as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.",
  },
  "da-ref-6": {
    arabicText:
      "اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ، سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي.",
    transliteration:
      "Allāhumma innī ‘abduk, ibnu ‘abdik, ibnu amatik, nāṣiyatī biyadik, māḍin fiyya ḥukmuk, ‘adlun fiyya qaḍā’uk. As’aluka bikulli ismin huwa lak, sammayta bihi nafsak, aw anzaltahu fī kitābik, aw ‘allamtahu aḥadan min khalqik, aw ista’tharta bihi fī ‘ilmil-ghaybi ‘indak, an taj‘alal-Qur’āna rabī‘a qalbī, wa nūra ṣadrī, wa jalā’a ḥuznī, wa dhahāba hammī.",
    translation:
      "O Allah, I am Your servant, the son of Your servant and the son of Your maidservant. My forelock is in Your hand; Your command over me is executed and Your decree concerning me is just. I ask You by every name belonging to You—by which You named Yourself, revealed in Your Book, taught any of Your creation, or kept with You in knowledge of the unseen—to make the Qur’an the spring of my heart, the light of my chest, the remover of my sadness, and the reliever of my distress.",
    sourceReference: "Musnad Ahmad 3712; Hisn al-Muslim 120.",
    sourceUrl: "https://sunnah.com/hisn%3A120",
  },
  "msq-hm-20": {
    arabicText:
      "أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ. بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ. اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ.",
    transliteration:
      "A‘ūdhu billāhil-‘Aẓīm, wa bi-wajhihil-karīm, wa sulṭānihil-qadīm, minash-shayṭānir-rajīm. Bismillāhi, waṣ-ṣalātu was-salāmu ‘alā rasūlillāh. Allāhummaftaḥ lī abwāba raḥmatik.",
    sourceUrl: "https://sunnah.com/hisn%3A20",
  },
  "da-ref-5": QURAN_RELIANCE_CORRECTION,
  "ne-ref-6": {
    arabicText: "فَادْعُوا اللَّهَ عَزَّ وَجَلَّ، وَكَبِّرُوا، وَتَصَدَّقُوا.",
    transliteration: "Fad‘ullāha ‘azza wa jalla, wa kabbirū, wa taṣaddaqū.",
    translation: "Supplicate Allah Almighty, proclaim His greatness, and give charity.",
    benefit: "Authentic guidance when an eclipse occurs: supplicate, magnify Allah, pray, and give charity.",
    sourceReference: "Sunan Abu Dawud 1191; Sahih al-Bukhari 1044; Sahih Muslim 901.",
    hadithText:
      "قَالَ رَسُولُ اللَّهِ ﷺ: «الشَّمْسُ وَالْقَمَرُ لَا يَخْسِفَانِ لِمَوْتِ أَحَدٍ وَلَا لِحَيَاتِهِ، فَإِذَا رَأَيْتُمْ ذَلِكَ فَادْعُوا اللَّهَ عَزَّ وَجَلَّ، وَكَبِّرُوا، وَتَصَدَّقُوا».",
    authenticityNote: "Sahih (al-Albani); also established in Sahih al-Bukhari and Sahih Muslim.",
    sourceUrl: "https://sunnah.com/abudawud%3A1191",
  },
  "s-hm-110a": {
    benefit: "A report mentions reciting As-Sajdah and Al-Mulk before sleep; scholars differ over its grading.",
    authenticityNote: "Graded Sahih by al-Albani and Da‘if by Darussalam (Jami‘ at-Tirmidhi 2892).",
    sourceUrl: "https://sunnah.com/tirmidhi%3A2892",
  },
  "s-hm-110b": {
    benefit: "This thirty-verse surah intercedes for its companion until he is forgiven.",
    authenticityNote: "Hasan (Jami‘ at-Tirmidhi 2891).",
    sourceReference: "Jami' at-Tirmidhi 2891 (Hasan).",
    sourceUrl: "https://sunnah.com/tirmidhi%3A2891",
  },
};

export function applyContentReview(items: ZikrDraft[]): Zikr[] {
  const byId = new Map(items.map((item) => [item.id, item]));

  for (const item of items) {
    const quran = QURAN_CONTENT_BY_ID[item.id as keyof typeof QURAN_CONTENT_BY_ID];
    if (quran) Object.assign(item, quran);
  }

  for (const [aliasId, canonicalId] of Object.entries(SHARED_ZIKR_ALIASES)) {
    const alias = byId.get(aliasId);
    const canonical = byId.get(canonicalId);
    if (alias && canonical) {
      Object.assign(alias, {
        arabicText: canonical.arabicText,
        transliteration: canonical.transliteration,
        translation: canonical.translation,
      });
    }
  }

  for (const [id, benefit] of Object.entries(BENEFIT_OVERRIDES)) {
    const item = byId.get(id);
    if (item) item.benefit = benefit;
  }
  for (const [id, correction] of Object.entries(TEXT_OVERRIDES)) {
    const item = byId.get(id);
    if (item) Object.assign(item, correction);
  }

  // Abu Dawud 5079 is graded weak by al-Albani, so its special seven-times card is not presented.
  return items
    .filter((item) => item.id !== "ap-ref-11")
    .map((item) => {
      const audioAssetId = APPROVED_AUDIO_ASSIGNMENTS[item.id];
      return Object.assign(item, {
        canonicalKey:
          CANONICAL_KEY_BY_ID[item.id] ??
          (item.id === "friday-kahf-089" || item.id === "friday-kahf-092"
            ? "quran-018-089-092"
            : item.id.startsWith("friday-kahf-")
              ? `quran-018-${item.id.slice(-3)}`
              : `zikr:${item.id}`),
        audioBehavior: getAudioBehavior(item),
        ...(audioAssetId ? { audioAssetId } : {}),
      }) as Zikr;
    });
}
