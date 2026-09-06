import type { ReminderContext } from "../types";

/**
 * The reviewed source library behind the contextual reminder.
 *
 * 41 sources: 18 Qur'an entries and 23 narrations, every one of them Sahih.
 * Only the curation lives here — which moments a source belongs to, and the
 * line that introduces it. Qur'anic Arabic is not written in this file: it is
 * generated into relevantNowVerses.ts from the same pipeline and editions the
 * app already uses for its Qur'an text, and joined by id.
 *
 * Four narrations carry a `zikrId` rather than their own text. They are
 * already reviewed entries in the azkar corpus, and a second copy here would be
 * a second thing to correct when one of them is corrected.
 */
export interface RelevantNowSource {
  id: string;
  type: "quran" | "hadith";
  contexts: readonly ReminderContext[];
  /** Absent for Qur'an entries, which take theirs from the generated verse. */
  reference?: string;
  referenceArabic?: string;
  /** Set when the narration is an existing reviewed zikr rather than text here. */
  zikrId?: string;
  arabic?: string;
  english?: string;
  /** The editorial line that says why this is what to read now. */
  message: string;
  messageArabic: string;
}

export const RELEVANT_NOW_LIBRARY: readonly RelevantNowSource[] = [
  {
    id: "Q01",
    type: "quran",
    contexts: ["dhuhr", "maghrib", "isha", "after_prayer"],
    message: "The prayer has an appointed time, and this is it.",
    messageArabic: "الصلاة موقوتة، وهذا وقتها.",
  },
  {
    id: "Q02",
    type: "quran",
    contexts: ["general"],
    message: "The prayer is meant to change what you do after it.",
    messageArabic: "الصلاة إنما شُرعت لتغيّر ما بعدها.",
  },
  {
    id: "Q03",
    type: "quran",
    contexts: ["before_fajr", "fajr", "dhuhr", "isha"],
    message: "Prayer runs from the sun's decline to the dark of night, and the dawn recitation is witnessed.",
    messageArabic: "الصلاة من دلوك الشمس إلى غسق الليل، وقرآن الفجر مشهود.",
  },
  {
    id: "Q04",
    type: "quran",
    contexts: ["morning", "evening"],
    message: "Remember Him abundantly, and glorify Him morning and evening.",
    messageArabic: "اذكروه ذكراً كثيراً، وسبّحوه بكرة وأصيلاً.",
  },
  {
    id: "Q05",
    type: "quran",
    contexts: ["morning", "evening", "maghrib"],
    message: "The day's turning points are named one by one as times to glorify Him.",
    messageArabic: "مواقيت اليوم سُمّيت واحداً واحداً أوقاتاً للتسبيح.",
  },
  {
    id: "Q06",
    type: "quran",
    contexts: ["morning", "evening"],
    message: "Remember Me and I will remember you.",
    messageArabic: "فاذكروني أذكركم.",
  },
  {
    id: "Q07",
    type: "quran",
    contexts: ["morning", "evening"],
    message: "It is in the remembrance of Allah that hearts find rest.",
    messageArabic: "ألا بذكر الله تطمئن القلوب.",
  },
  {
    id: "Q08",
    type: "quran",
    contexts: ["asr"],
    message: "Guard the prayers, and the middle prayer above all.",
    messageArabic: "حافظوا على الصلوات والصلاة الوسطى.",
  },
  {
    id: "Q09",
    type: "quran",
    contexts: ["fajr", "morning", "evening", "asr", "after_prayer"],
    message: "Glorify Him before sunrise and before sunset, in the night and after prostration.",
    messageArabic: "سبّح قبل طلوع الشمس وقبل الغروب، ومن الليل وأدبار السجود.",
  },
  {
    id: "Q10",
    type: "quran",
    contexts: ["fajr", "asr", "evening"],
    message: "Praise Him before sunrise, before sunset, and through the hours of the night.",
    messageArabic: "سبّح قبل طلوع الشمس وقبل غروبها، وآناء الليل.",
  },
  {
    id: "Q11",
    type: "quran",
    contexts: ["maghrib", "isha"],
    message: "Establish prayer at the two ends of the day and in the early part of the night.",
    messageArabic: "أقم الصلاة طرفي النهار وزلفاً من الليل.",
  },
  {
    id: "Q12",
    type: "quran",
    contexts: ["last_third"],
    message: "Rise for part of the night — an extra beyond what is due from you.",
    messageArabic: "ومن الليل فتهجّد به نافلة لك.",
  },
  {
    id: "Q13",
    type: "quran",
    contexts: ["last_third"],
    message: "They spend the night before their Lord, prostrating and standing.",
    messageArabic: "يبيتون لربهم سجداً وقياماً.",
  },
  {
    id: "Q14",
    type: "quran",
    contexts: ["last_third"],
    message: "Recite what is manageable of it. The measure is what you can keep.",
    messageArabic: "فاقرءوا ما تيسر منه. والمقياس ما تستطيع الدوام عليه.",
  },
  {
    id: "Q15",
    type: "quran",
    contexts: ["before_sleep", "last_third"],
    message: "They remember Allah standing, sitting and lying on their sides.",
    messageArabic: "يذكرون الله قياماً وقعوداً وعلى جنوبهم.",
  },
  {
    id: "Q16",
    type: "quran",
    contexts: ["before_sleep"],
    message: "Ayat al-Kursi — its place at bedtime is set by authentic Sunnah.",
    messageArabic: "آية الكرسي، وموضعها عند النوم ثبت بالسنة الصحيحة.",
  },
  {
    id: "Q17",
    type: "quran",
    contexts: ["before_sleep"],
    message: "The closing verses of al-Baqarah, for the night ahead.",
    messageArabic: "خواتيم سورة البقرة، لليلتك.",
  },
  {
    id: "Q18",
    type: "quran",
    contexts: ["friday"],
    message: "When the call comes, leave the trade; when the prayer ends, go seek His bounty.",
    messageArabic: "إذا نودي فاسعوا وذروا البيع، فإذا قُضيت فانتشروا وابتغوا من فضل الله.",
  },
  {
    id: "H01",
    type: "hadith",
    contexts: ["dhuhr", "asr", "maghrib", "isha", "fajr"],
    reference: "Sahih al-Bukhari 527",
    referenceArabic: "صحيح البخاري ٥٢٧",
    arabic:
      "عن عبد الله بن مسعود رضي الله عنه قال: سألت النبي ﷺ: أي العمل أحب إلى الله؟ قال: «الصلاة على وقتها». قلت: ثم أي؟ قال: «بر الوالدين». قلت: ثم أي؟ قال: «الجهاد في سبيل الله».",
    english:
      "‘Abdullah ibn Mas‘ud (may Allah be pleased with him) said: I asked the Prophet ﷺ: Which deed is most beloved to Allah? He said: “Prayer at its proper time.” I said: Then what? He said: “Kindness to parents.” I said: Then what? He said: “Striving in the way of Allah.”",
    message: "Praying it now, in its window, is the deed named first.",
    messageArabic: "أداؤها في وقتها هو العمل الذي قُدّم على غيره.",
  },
  {
    id: "H02",
    type: "hadith",
    contexts: ["dhuhr", "asr", "maghrib", "isha", "fajr"],
    reference: "Sahih al-Bukhari 645",
    referenceArabic: "صحيح البخاري ٦٤٥",
    arabic: "عن عبد الله بن عمر رضي الله عنهما أن رسول الله ﷺ قال: «صلاة الجماعة تفضل صلاة الفذ بسبع وعشرين درجة».",
    english:
      "‘Abdullah ibn ‘Umar (may Allah be pleased with them both) reported that the Messenger of Allah ﷺ said: “Prayer in congregation is better than prayer alone by twenty-seven degrees.”",
    message: "If the mosque is within reach, this prayer is worth the walk.",
    messageArabic: "إن كان المسجد قريباً فهذه الصلاة تستحق المشي إليه.",
  },
  {
    id: "H03",
    type: "hadith",
    contexts: ["before_fajr"],
    reference: "Sahih Muslim 725a",
    referenceArabic: "صحيح مسلم ٧٢٥أ",
    arabic: "عن عائشة رضي الله عنها عن النبي ﷺ قال: «ركعتا الفجر خير من الدنيا وما فيها».",
    english:
      "‘A’ishah (may Allah be pleased with her) reported from the Prophet ﷺ that he said: “The two cycles before the dawn prayer are better than the world and everything in it.”",
    message: "Two short cycles before Fajr, weighed against the whole world.",
    messageArabic: "ركعتان خفيفتان قبل الفجر، وُزنتا بالدنيا كلها.",
  },
  {
    id: "H04",
    type: "hadith",
    contexts: ["fajr"],
    reference: "Sahih Muslim 657a",
    referenceArabic: "صحيح مسلم ٦٥٧أ",
    arabic:
      "عن جندب بن عبد الله رضي الله عنه قال: قال رسول الله ﷺ: «من صلى الصبح فهو في ذمة الله، فلا يطلبنكم الله من ذمته بشيء».",
    english:
      "Jundub ibn ‘Abdullah (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Whoever prays the dawn prayer is under Allah’s protection, so let Allah not call you to account for anything from His protection.”",
    message: "Fajr places the whole day that follows under Allah's protection.",
    messageArabic: "صلاة الفجر تجعل يومك كله في ذمة الله.",
  },
  {
    id: "H05",
    type: "hadith",
    contexts: ["fajr", "isha"],
    reference: "Sahih Muslim 656a",
    referenceArabic: "صحيح مسلم ٦٥٦أ",
    arabic:
      "عن عثمان بن عفان رضي الله عنه قال: قال رسول الله ﷺ: «من صلى العشاء في جماعة فكأنما قام نصف الليل، ومن صلى الصبح في جماعة فكأنما صلى الليل كله».",
    english:
      "‘Uthman ibn ‘Affan (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “Whoever prays Isha in congregation, it is as though he stood half the night; and whoever prays the dawn prayer in congregation, it is as though he prayed the whole night.”",
    message: "Isha and Fajr in congregation are counted as a night of prayer.",
    messageArabic: "العشاء والفجر في جماعة تُحسبان قيام ليلة.",
  },
  {
    id: "H06",
    type: "hadith",
    contexts: ["fajr", "asr"],
    reference: "Sahih al-Bukhari 555",
    referenceArabic: "صحيح البخاري ٥٥٥",
    arabic:
      "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: «يتعاقبون فيكم ملائكة بالليل وملائكة بالنهار، ويجتمعون في صلاة الفجر وصلاة العصر، ثم يعرج الذين باتوا فيكم فيسألهم ربهم وهو أعلم بهم: كيف تركتم عبادي؟ فيقولون: تركناهم وهم يصلون، وأتيناهم وهم يصلون».",
    english:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Angels take turns among you by night and by day, and they gather at the dawn prayer and the afternoon prayer. Then those who stayed with you ascend, and their Lord asks them — though He knows best about them: How did you leave My servants? They say: We left them praying, and we came to them while they were praying.”",
    message: "Fajr and Asr are the two prayers the angels gather for.",
    messageArabic: "الفجر والعصر هما الصلاتان اللتان تجتمع فيهما الملائكة.",
  },
  {
    id: "H07",
    type: "hadith",
    contexts: ["fajr", "asr"],
    reference: "Sahih al-Bukhari 574",
    referenceArabic: "صحيح البخاري ٥٧٤",
    arabic: "عن أبي موسى الأشعري رضي الله عنه أن رسول الله ﷺ قال: «من صلى البردين دخل الجنة».",
    english:
      "Abu Musa al-Ash‘ari (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Whoever prays the two cool prayers will enter Paradise.”",
    message: "The two cool prayers are Fajr and Asr — the two easiest to let slip.",
    messageArabic: "البردان هما الفجر والعصر، وهما أكثر ما يُتهاون فيه.",
  },
  {
    id: "H08",
    type: "hadith",
    contexts: ["morning", "evening"],
    reference: "Sahih al-Bukhari 6306",
    referenceArabic: "صحيح البخاري ٦٣٠٦",
    zikrId: "misc-ref-8",
    message: "The master supplication for forgiveness, said with certainty, morning or night.",
    messageArabic: "سيد الاستغفار، يُقال موقناً به صباحاً أو مساءً.",
  },
  {
    id: "H09",
    type: "hadith",
    contexts: ["dhuha", "morning"],
    reference: "Sahih Muslim 720",
    referenceArabic: "صحيح مسلم ٧٢٠",
    arabic:
      "عن أبي ذر رضي الله عنه عن النبي ﷺ قال: «يصبح على كل سلامى من أحدكم صدقة، فكل تسبيحة صدقة، وكل تحميدة صدقة، وكل تهليلة صدقة، وكل تكبيرة صدقة، وأمر بالمعروف صدقة، ونهي عن المنكر صدقة، ويجزئ من ذلك ركعتان يركعهما من الضحى».",
    english:
      "Abu Dharr (may Allah be pleased with him) reported from the Prophet ﷺ that he said: “Each morning a charity is due from every joint of one of you. Every glorification of Allah is a charity, every praise of Him is a charity, every declaration that there is no god but Allah is a charity, every magnification of Him is a charity; enjoining good is a charity and forbidding wrong is a charity. And two cycles prayed in the forenoon suffice for all of that.”",
    message: "Two cycles in the forenoon settle the charity due from every joint.",
    messageArabic: "ركعتان في الضحى تكفيان عن صدقة كل مفصل في جسدك.",
  },
  {
    id: "H10",
    type: "hadith",
    contexts: ["dhuha", "before_sleep"],
    reference: "Sahih al-Bukhari 1178",
    referenceArabic: "صحيح البخاري ١١٧٨",
    arabic:
      "عن أبي هريرة رضي الله عنه قال: أوصاني خليلي ﷺ بثلاث: صيام ثلاثة أيام من كل شهر، وركعتي الضحى، وأن أوتر قبل أن أنام.",
    english:
      "Abu Hurayrah (may Allah be pleased with him) said: My dear friend ﷺ counselled me with three things: fasting three days of every month, the two cycles of the forenoon, and praying Witr before I sleep.",
    message: "Witr before sleeping, so the night is not left to chance.",
    messageArabic: "الوتر قبل النوم، حتى لا تُترك الليلة للحظ.",
  },
  {
    id: "H11",
    type: "hadith",
    contexts: ["dhuhr", "maghrib", "isha", "before_fajr"],
    reference: "Sahih al-Bukhari 1180",
    referenceArabic: "صحيح البخاري ١١٨٠",
    arabic:
      "عن عبد الله بن عمر رضي الله عنهما قال: صليت مع النبي ﷺ ركعتين قبل الظهر وركعتين بعدها، وركعتين بعد الجمعة، وركعتين بعد المغرب، وركعتين بعد العشاء.",
    english:
      "‘Abdullah ibn ‘Umar (may Allah be pleased with them both) said: I prayed with the Prophet ﷺ two cycles before the noon prayer and two after it, two after the Friday prayer, two after the sunset prayer, and two after the night prayer.",
    message: "The regular Sunnah cycles sit around this prayer, not apart from it.",
    messageArabic: "السنن الرواتب تدور حول هذه الصلاة، لا بعيداً عنها.",
  },
  {
    id: "H12",
    type: "hadith",
    contexts: ["dhuhr", "maghrib", "isha", "after_prayer"],
    reference: "Sahih Muslim 728c",
    referenceArabic: "صحيح مسلم ٧٢٨ج",
    arabic:
      "عن أم حبيبة رضي الله عنها قالت: قال رسول الله ﷺ: «من صلى في يوم وليلة ثنتي عشرة ركعة بُني له بيت في الجنة».",
    english:
      "Umm Habibah (may Allah be pleased with her) said: The Messenger of Allah ﷺ said: “Whoever prays twelve cycles in a day and a night, a house is built for him in Paradise.”",
    message: "Twelve voluntary cycles across the day, and a house is built for them.",
    messageArabic: "اثنتا عشرة ركعة في اليوم والليلة، يُبنى بها بيت في الجنة.",
  },
  {
    id: "H13",
    type: "hadith",
    contexts: ["asr"],
    reference: "Sahih Muslim 627f",
    referenceArabic: "صحيح مسلم ٦٢٧و",
    arabic:
      "عن علي بن أبي طالب رضي الله عنه قال: قال رسول الله ﷺ يوم الأحزاب: «شغلونا عن الصلاة الوسطى صلاة العصر، ملأ الله بيوتهم وقبورهم ناراً».",
    english:
      "‘Ali ibn Abi Talib (may Allah be pleased with him) said: On the day of the Confederates the Messenger of Allah ﷺ said: “They kept us from the middle prayer, the afternoon prayer. May Allah fill their houses and their graves with fire.”",
    message: "The middle prayer the Qur'an singles out is this one — Asr.",
    messageArabic: "الصلاة الوسطى التي خصّها القرآن هي هذه: العصر.",
  },
  {
    id: "H14",
    type: "hadith",
    contexts: ["asr"],
    reference: "Sahih al-Bukhari 552",
    referenceArabic: "صحيح البخاري ٥٥٢",
    arabic: "عن ابن عمر رضي الله عنهما أن رسول الله ﷺ قال: «الذي تفوته صلاة العصر كأنما وُتر أهله وماله».",
    english:
      "Ibn ‘Umar (may Allah be pleased with them both) reported that the Messenger of Allah ﷺ said: “Whoever misses the afternoon prayer, it is as though he were bereft of his family and his wealth.”",
    message: "Asr is the one the day tends to swallow. It is still open.",
    messageArabic: "العصر هي التي يبتلعها انشغال النهار عادةً. وما زال وقتها قائماً.",
  },
  {
    id: "H15",
    type: "hadith",
    contexts: ["after_prayer"],
    reference: "Sahih Muslim 597a",
    referenceArabic: "صحيح مسلم ٥٩٧أ",
    arabic:
      "عن أبي هريرة رضي الله عنه أن فقراء المهاجرين أتوا رسول الله ﷺ فذكروا له سبق أهل الدثور بالدرجات، فقال: «ألا أعلمكم شيئاً تدركون به من سبقكم؟ تسبحون وتحمدون وتكبرون خلف كل صلاة ثلاثاً وثلاثين».",
    english:
      "Abu Hurayrah (may Allah be pleased with him) reported that the poor among the Emigrants came to the Messenger of Allah ﷺ and mentioned that the wealthy had outstripped them in rank. He said: “Shall I not teach you something by which you will catch up with those ahead of you? Glorify Allah, praise Him and magnify Him thirty-three times after every prayer.”",
    message: "Thirty-three each, right where you are sitting, before you stand.",
    messageArabic: "ثلاث وثلاثون من كل واحدة، في مجلسك قبل أن تقوم.",
  },
  {
    id: "H16",
    type: "hadith",
    contexts: ["before_sleep"],
    reference: "Sahih al-Bukhari 2311",
    referenceArabic: "صحيح البخاري ٢٣١١",
    zikrId: "s-hm-100",
    message: "Ayat al-Kursi at bedtime, and a guardian remains until morning.",
    messageArabic: "آية الكرسي عند النوم، فلا يزال عليك حافظ حتى تصبح.",
  },
  {
    id: "H17",
    type: "hadith",
    contexts: ["before_sleep"],
    reference: "Sahih al-Bukhari 5009",
    referenceArabic: "صحيح البخاري ٥٠٠٩",
    zikrId: "s-hm-101",
    message: "The last two verses of al-Baqarah suffice a person for the night.",
    messageArabic: "الآيتان من آخر البقرة تكفيان من قالهما في ليلته.",
  },
  {
    id: "H18",
    type: "hadith",
    contexts: ["before_sleep"],
    reference: "Sahih al-Bukhari 6311",
    referenceArabic: "صحيح البخاري ٦٣١١",
    zikrId: "s-hm-111",
    message: "Wudu, the right side, and the words made the last thing you say.",
    messageArabic: "وضوء، ثم على الشق الأيمن، وتجعل هذا الدعاء آخر كلامك.",
  },
  {
    id: "H19",
    type: "hadith",
    contexts: ["last_third"],
    reference: "Sahih al-Bukhari 1145",
    referenceArabic: "صحيح البخاري ١١٤٥",
    arabic:
      "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: «ينزل ربنا تبارك وتعالى كل ليلة إلى السماء الدنيا حين يبقى ثلث الليل الآخر، فيقول: من يدعوني فأستجيب له، من يسألني فأعطيه، من يستغفرني فأغفر له».",
    english:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Our Lord, blessed and exalted, descends each night to the lowest heaven when the last third of the night remains, and says: Who is calling upon Me, that I may answer him? Who is asking of Me, that I may give him? Who is seeking My forgiveness, that I may forgive him?”",
    message: "You are awake in the hour the question is being asked.",
    messageArabic: "أنت مستيقظ في الساعة التي يُنادى فيها.",
  },
  {
    id: "H20",
    type: "hadith",
    contexts: ["friday"],
    reference: "Sahih Muslim 854b",
    referenceArabic: "صحيح مسلم ٨٥٤ب",
    arabic:
      "عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: «خير يوم طلعت عليه الشمس يوم الجمعة، فيه خُلق آدم، وفيه أُدخل الجنة، وفيه أُخرج منها».",
    english:
      "Abu Hurayrah (may Allah be pleased with him) said: The Messenger of Allah ﷺ said: “The best day on which the sun rises is Friday. On it Adam was created, on it he was admitted to Paradise, and on it he was brought out of it.”",
    message: "Today is the best day the sun rises on.",
    messageArabic: "هذا اليوم خير يوم طلعت عليه الشمس.",
  },
  {
    id: "H21",
    type: "hadith",
    contexts: ["friday_after_asr"],
    reference: "Sunan an-Nasa'i 1389 (Sahih)",
    referenceArabic: "سنن النسائي ١٣٨٩ (صحيح)",
    arabic:
      "عن جابر بن عبد الله رضي الله عنهما عن رسول الله ﷺ قال: «يوم الجمعة اثنتا عشرة ساعة، منها ساعة لا يوجد فيها عبد مسلم يسأل الله شيئاً إلا آتاه إياه، فالتمسوها آخر ساعة بعد العصر».",
    english:
      "Jabir ibn ‘Abdullah (may Allah be pleased with them both) reported from the Messenger of Allah ﷺ that he said: “Friday has twelve hours, among them an hour in which no Muslim servant asks Allah for something but that He gives it to him. Seek it in the last hour after the afternoon prayer.”",
    message: "The hour to ask in is the last one before Maghrib. It is now.",
    messageArabic: "ساعة الإجابة هي الأخيرة قبل المغرب. وهي الآن.",
  },
  {
    id: "H22",
    type: "hadith",
    contexts: ["monday"],
    reference: "Sahih Muslim 1162e",
    referenceArabic: "صحيح مسلم ١١٦٢هـ",
    arabic:
      "عن أبي قتادة الأنصاري رضي الله عنه أن رسول الله ﷺ سئل عن صوم يوم الاثنين، فقال: «ذاك يوم وُلدت فيه، ويوم بُعثت — أو أُنزل عليّ فيه».",
    english:
      "Abu Qatadah al-Ansari (may Allah be pleased with him) reported that the Messenger of Allah ﷺ was asked about fasting on Monday, and he said: “That is a day on which I was born, and a day on which I was sent — or on which revelation came down to me.”",
    message: "Monday carries its own reason to fast.",
    messageArabic: "الاثنين له سببه الخاص في الصيام.",
  },
  {
    id: "H23",
    type: "hadith",
    contexts: ["monday", "thursday"],
    reference: "Sahih Muslim 2565c",
    referenceArabic: "صحيح مسلم ٢٥٦٥ج",
    arabic:
      "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: «تُعرض الأعمال في كل اثنين وخميس، فيغفر الله لكل امرئ لا يشرك بالله شيئاً، إلا امرأً كانت بينه وبين أخيه شحناء، فيقول: اتركوا هذين حتى يصطلحا».",
    english:
      "Abu Hurayrah (may Allah be pleased with him) reported that the Messenger of Allah ﷺ said: “Deeds are presented every Monday and Thursday, and Allah forgives every person who associates nothing with Him — except a person between whom and his brother there is rancour. He says: Leave these two until they reconcile.”",
    message: "Deeds are presented today. One quarrel is enough to hold yours back.",
    messageArabic: "الأعمال تُعرض اليوم. وخصومة واحدة تكفي لتأخير عملك.",
  },
];
