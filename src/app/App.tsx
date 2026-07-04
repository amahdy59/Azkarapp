import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "motion/react";
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Home, BookOpen, Settings, Search, Check, Play, Pause,
  Info, Flame, Share2, RotateCcw, X, Volume2, Wifi,
  SkipForward, SkipBack,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── Design tokens (match Azkar/Colors Figma vars) ────────────────────────────
const T = {
  bg:          "#0A1228",
  surface:     "#111B35",
  surfaceEl:   "#182040",
  gold:        "#C8941A",
  goldLight:   "#E8B420",
  teal:        "#1A7060",
  tealBg:      "#0A2B25",
  textPrimary: "#F5F0E8",
  textSec:     "#D4D0E0",
  textMuted:   "#9290B0",
  border:      "#182040",
  success:     "#2D7A50",
  danger:      "#C0392B",
  // light mode
  bgLight:     "#F8F5F0",
  surfLight:   "#FFFFFF",
  surfElLight: "#F2EEE9",
  goldDark:    "#A87614",
  textDarkL:   "#1A1228",
  textSecL:    "#4A4570",
  textMutedL:  "#8E8AAA",
  borderLight: "#E5E0D8",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type View =
  | "home" | "category" | "reader" | "counter" | "completion"
  // Phase 2 — English onboarding
  | "splash" | "onboard1" | "onboard2" | "onboard3" | "language" | "login" | "phone" | "otp"
  // Phase 2 — Arabic onboarding (shown when device locale is Arabic)
  | "ar_onboard1" | "ar_onboard2" | "ar_onboard3"
  // Phase 3
  | "settings"
  // Phase 4
  | "search";

type CategoryId = "morning" | "evening" | "before_sleep";
type SettingsPanel = "theme" | "accessibility" | "downloads" | "notifications" | "progress";
type FontSize = "small" | "medium" | "large" | "extra_large";

interface Zikr {
  id: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  benefit: string;
  repetitionCount: number;
  sourceReference: string;
  category: CategoryId;
  orderIndex: number;
}

interface Session {
  id: string;
  category: CategoryId;
  date: string;
  completedCount: number;
  totalCount: number;
  durationSeconds: number;
  isComplete: boolean;
}

// ─── Azkar content (Hisnul Muslim) ────────────────────────────────────────────
const MORNING_AZKAR: Zikr[] = [
  { id:"m1", category:"morning", orderIndex:0,
    arabicText:"اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ\nلَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ",
    transliteration:"Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm",
    translation:"Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
    benefit:"Whoever recites Ayat al-Kursi in the morning will be protected by Allah until evening, and whoever recites it in the evening will be protected until morning.",
    repetitionCount:1, sourceReference:"Bukhari · 5010" },
  { id:"m2", category:"morning", orderIndex:1,
    arabicText:"أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ\nوَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:"Asbahna wa asbahal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah",
    translation:"We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah.",
    benefit:"The Prophet ﷺ used to say this every morning. It is a declaration of Allah's ownership of all things at the start of the day.",
    repetitionCount:1, sourceReference:"Muslim · 2723" },
  { id:"m3", category:"morning", orderIndex:2,
    arabicText:"اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا\nوَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    transliteration:"Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur",
    translation:"O Allah, by Your leave we have reached the morning and by Your leave we reach the evening, by You we live and by You we die, and unto You is our resurrection.",
    benefit:"This supplication acknowledges Allah's complete control over our lives — morning, evening, life and death.",
    repetitionCount:1, sourceReference:"Tirmidhi · 3391" },
  { id:"m4", category:"morning", orderIndex:3,
    arabicText:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration:"Subhanallahi wa bihamdih",
    translation:"Glory is to Allah and praise is to Him.",
    benefit:"Whoever says this 100 times in the morning will have his sins forgiven even if they are like the foam of the sea.",
    repetitionCount:100, sourceReference:"Bukhari · 6405" },
  { id:"m5", category:"morning", orderIndex:4,
    arabicText:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    transliteration:"Allahumma salli wa sallim 'ala nabiyyina Muhammad",
    translation:"O Allah, send prayers and peace upon our Prophet Muhammad.",
    benefit:"Whoever sends blessings upon me once, Allah sends blessings upon him tenfold and erases ten sins from him.",
    repetitionCount:10, sourceReference:"Muslim · 408" },
  { id:"m6", category:"morning", orderIndex:5,
    arabicText:"رَضِيتُ بِاللَّهِ رَبًّا وَبِالإِسْلَامِ دِينًا\nوَبِمُحَمَّدٍ ﷺ نَبِيًّا",
    transliteration:"Radeetu billahi rabban, wa bil-islami deenan, wa bi-muhammadin sallallahu 'alayhi wa sallama nabiyya",
    translation:"I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet.",
    benefit:"It is the right of Allah upon every Muslim who says this three times each morning and evening that He should please them on the Day of Resurrection.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5072" },
  { id:"m7", category:"morning", orderIndex:6,
    arabicText:"يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ\nأَصْلِحْ لِي شَأْنِي كُلَّهُ",
    transliteration:"Ya Hayyu ya Qayyumu, birahmatika astaghith, aslih li sha'ni kullahu",
    translation:"O Ever-Living, O Self-Sustaining, by Your mercy I seek assistance. Rectify for me all of my affairs.",
    benefit:"The Prophet ﷺ taught this to Fatimah (may Allah be pleased with her) to recite every morning and evening.",
    repetitionCount:1, sourceReference:"Hakim · 1/545" },
  { id:"m8", category:"morning", orderIndex:7,
    arabicText:"أَصْبَحْتُ أُشْهِدُ اللَّهَ وَحَمَلَةَ عَرْشِهِ\nوَمَلَائِكَتَهُ وَجَمِيعَ خَلْقِهِ أَنَّهُ لَا إِلَهَ إِلَّا هُوَ",
    transliteration:"Asbahtu ushhidullaha wa hamalata 'arshih, wa mala'ikatahu wa jami'a khalqih, annahu la ilaha illa hu",
    translation:"I take as witness Allah and His angels who carry the Throne, and all of His creation: that there is no deity except Him.",
    benefit:"Whoever says this four times in the morning, Allah frees a quarter of them from the Fire for each recitation.",
    repetitionCount:4, sourceReference:"Abu Dawud · 5069" },
  { id:"m9", category:"morning", orderIndex:8,
    arabicText:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ\nفِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration:"Allahumma inni as'alukal-'afiyata fid-dunya wal-akhirah",
    translation:"O Allah, I ask You for well-being in this world and in the Hereafter.",
    benefit:"No one has been given anything better than well-being and certainty, so ask Allah for them.",
    repetitionCount:1, sourceReference:"Ibn Majah · 3871" },
  { id:"m10", category:"morning", orderIndex:9,
    arabicText:"سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ\nوَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ",
    transliteration:"Subhanallah, walhamdu lillah, wa la ilaha illallah, wallahu akbar",
    translation:"Glory is to Allah, and praise is to Allah, and none has the right to be worshipped except Allah, and Allah is the Greatest.",
    benefit:"These four phrases are the most beloved words to Allah. It does not matter which one you start with.",
    repetitionCount:33, sourceReference:"Muslim · 2137" },
  { id:"m11", category:"morning", orderIndex:10,
    arabicText:"اللَّهُمَّ عَافِنِي فِي بَدَنِي\nاللَّهُمَّ عَافِنِي فِي سَمْعِي وَبَصَرِي",
    transliteration:"Allahumma 'afini fi badani, Allahumma 'afini fi sam'i wa basari",
    translation:"O Allah, grant me health in my body. O Allah, grant me health in my hearing and sight.",
    benefit:"Abu Bakr (may Allah be pleased with him) used to recite this supplication every morning and evening.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5090" },
  { id:"m12", category:"morning", orderIndex:11,
    arabicText:"اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ\nوَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ",
    transliteration:"Allahumma inni a'udhu bika minal-kufri wal-faqr, wa a'udhu bika min 'adhabil-qabr",
    translation:"O Allah, I seek refuge with You from disbelief and poverty, and I seek refuge with You from the punishment of the grave.",
    benefit:"This supplication protects against three of the greatest trials: disbelief, poverty, and punishment in the grave.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5090" },
  { id:"m13", category:"morning", orderIndex:12,
    arabicText:"حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ\nعَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration:"Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul-'arshil-'azim",
    translation:"Allah is sufficient for me. None has the right to be worshipped except Him. Upon Him I rely and He is the Lord of the Exalted Throne.",
    benefit:"Whoever says this seven times each morning and evening, Allah will take care of whatever concerns them.",
    repetitionCount:7, sourceReference:"Abu Dawud · 5081" },
  { id:"m14", category:"morning", orderIndex:13,
    arabicText:"بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ\nفِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:"Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
    translation:"In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    benefit:"Whoever says this three times in the morning will not be struck by any affliction until the evening.",
    repetitionCount:3, sourceReference:"Tirmidhi · 3388" },
  { id:"m15", category:"morning", orderIndex:14,
    arabicText:"اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ\nخَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    transliteration:"Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't",
    translation:"O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant.",
    benefit:"Sayyidul Istighfar — the master supplication for forgiveness. Whoever says it with conviction in the morning and dies that day enters Paradise.",
    repetitionCount:1, sourceReference:"Bukhari · 6306" },
];

const EVENING_AZKAR: Zikr[] = [
  { id:"e1", category:"evening", orderIndex:0,
    arabicText:"أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ\nوَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration:"Amsayna wa amsal mulku lillah, walhamdu lillah, la ilaha illallahu wahdahu la shareeka lah",
    translation:"We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah.",
    benefit:"The evening version of the morning supplication, declaring Allah's sovereignty as the day draws to a close.",
    repetitionCount:1, sourceReference:"Muslim · 2723" },
  { id:"e2", category:"evening", orderIndex:1,
    arabicText:"اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا\nوَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ",
    transliteration:"Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir",
    translation:"O Allah, by Your leave we have reached the evening and by Your leave we reach the morning, by You we live and by You we die, and unto You is the final return.",
    benefit:"A reminder at day's end that all affairs belong to Allah, and we return to Him.",
    repetitionCount:1, sourceReference:"Tirmidhi · 3391" },
  { id:"e3", category:"evening", orderIndex:2,
    arabicText:"أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ\nمِنْ شَرِّ مَا خَلَقَ",
    transliteration:"A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translation:"I seek refuge in the perfect words of Allah from the evil of what He has created.",
    benefit:"Whoever says this three times in the evening will be protected from snake bites and scorpion stings that night.",
    repetitionCount:3, sourceReference:"Muslim · 2709" },
  { id:"e4", category:"evening", orderIndex:3,
    arabicText:"اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ\nوَحَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ اللَّهُ",
    transliteration:"Allahumma inni amsaytu ushhiduka wa hamalata 'arshika wa mala'ikataka wa jami'a khalqika annakallah",
    translation:"O Allah, I have reached the evening taking You as witness, and the bearers of Your Throne, Your angels, and all Your creation, that You are Allah.",
    benefit:"Whoever says this four times in the evening, Allah will free a quarter of him from the Fire for each recitation.",
    repetitionCount:4, sourceReference:"Abu Dawud · 5069" },
  { id:"e5", category:"evening", orderIndex:4,
    arabicText:"سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration:"Subhanallahi wa bihamdih",
    translation:"Glory is to Allah and praise is to Him.",
    benefit:"Whoever says this 100 times in the evening will have his sins forgiven even if they are like the foam of the sea.",
    repetitionCount:100, sourceReference:"Bukhari · 6405" },
  { id:"e6", category:"evening", orderIndex:5,
    arabicText:"اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ\nفَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    transliteration:"Allahumma ma amsa bi min ni'matin faminka wahdaka la shareeka lak, falakal-hamdu wa lakash-shukr",
    translation:"O Allah, what blessing I have reached this evening is from You alone, without partner, so for You is all praise and unto You all thanks.",
    benefit:"Whoever says this in the evening has given thanks for that day.",
    repetitionCount:1, sourceReference:"Abu Dawud · 5073" },
  { id:"e7", category:"evening", orderIndex:6,
    arabicText:"اللَّهُمَّ فَاطِرَ السَّمَوَاتِ وَالأَرْضِ\nعَالِمَ الغَيْبِ وَالشَّهَادَةِ رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ",
    transliteration:"Allahumma fatiras-samawati wal-ard, 'alimal-ghaybi wash-shahadah, rabba kulli shay'in wa malikah",
    translation:"O Allah, Creator of the heavens and earth, Knower of the seen and unseen, Lord and Sovereign of all things.",
    benefit:"The Prophet ﷺ taught this to be recited each morning and evening to renew one's submission to Allah.",
    repetitionCount:1, sourceReference:"Abu Dawud · 5070" },
  { id:"e8", category:"evening", orderIndex:7,
    arabicText:"اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ\nفِي الدُّنْيَا وَالآخِرَةِ",
    transliteration:"Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhirah",
    translation:"O Allah, I ask You for pardon and well-being in this world and the Hereafter.",
    benefit:"Ibn Umar (may Allah be pleased with him) never left these words morning or evening. They gather for you the good of this world and the Hereafter.",
    repetitionCount:1, sourceReference:"Ibn Majah · 3871" },
  { id:"e9", category:"evening", orderIndex:8,
    arabicText:"بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ\nفِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration:"Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
    translation:"In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing.",
    benefit:"Whoever says this three times in the evening will not be struck by any affliction until the morning.",
    repetitionCount:3, sourceReference:"Tirmidhi · 3388" },
  { id:"e10", category:"evening", orderIndex:9,
    arabicText:"حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ\nعَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliteration:"Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul-'arshil-'azim",
    translation:"Allah is sufficient for me. None has the right to be worshipped except Him. Upon Him I rely and He is the Lord of the Exalted Throne.",
    benefit:"Whoever says this seven times each evening, Allah will take care of whatever concerns them.",
    repetitionCount:7, sourceReference:"Abu Dawud · 5081" },
  { id:"e11", category:"evening", orderIndex:10,
    arabicText:"اللَّهُمَّ عَافِنِي فِي بَدَنِي\nاللَّهُمَّ عَافِنِي فِي سَمْعِي وَبَصَرِي",
    transliteration:"Allahumma 'afini fi badani, Allahumma 'afini fi sam'i wa basari",
    translation:"O Allah, grant me health in my body. O Allah, grant me health in my hearing and sight.",
    benefit:"A supplication for comprehensive wellbeing recited by the righteous every evening.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5090" },
  { id:"e12", category:"evening", orderIndex:11,
    arabicText:"اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    transliteration:"Allahumma salli wa sallim 'ala nabiyyina Muhammad",
    translation:"O Allah, send prayers and peace upon our Prophet Muhammad.",
    benefit:"Sending blessings upon the Prophet ﷺ in the evening is from the Sunnah and brings abundant reward.",
    repetitionCount:10, sourceReference:"Muslim · 408" },
  { id:"e13", category:"evening", orderIndex:12,
    arabicText:"يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ\nأَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    transliteration:"Ya Hayyu ya Qayyumu, birahmatika astaghith, aslih li sha'ni kullahu, wa la takilni ila nafsi tarfata 'ayn",
    translation:"O Ever-Living, O Self-Sustaining, by Your mercy I seek assistance. Rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
    benefit:"The Prophet ﷺ taught Fatimah (may Allah be pleased with her) to say this morning and evening as her daily protection.",
    repetitionCount:1, sourceReference:"Hakim · 1/545" },
  { id:"e14", category:"evening", orderIndex:13,
    arabicText:"أَعُوذُ بِاللَّهِ السَّمِيعِ الْعَلِيمِ\nمِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliteration:"A'udhu billahis-sami'il-'alimi minash-shaytanir-rajim",
    translation:"I seek refuge in Allah, the All-Hearing, the All-Knowing, from the outcast Shaytan.",
    benefit:"Seeking refuge from Shaytan in the evening protects one through the night from his whispers and plots.",
    repetitionCount:3, sourceReference:"Tirmidhi · 3392" },
  { id:"e15", category:"evening", orderIndex:14,
    arabicText:"اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ\nخَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    transliteration:"Allahumma anta rabbi la ilaha illa ant, khalaqtani wa ana 'abduk, wa ana 'ala 'ahdika wa wa'dika mastata't",
    translation:"O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant.",
    benefit:"Sayyidul Istighfar — the master supplication for forgiveness. Whoever says it with conviction in the evening and dies that night enters Paradise.",
    repetitionCount:1, sourceReference:"Bukhari · 6306" },
];

const SLEEP_AZKAR: Zikr[] = [
  { id:"s1", category:"before_sleep", orderIndex:0,
    arabicText:"بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration:"Bismika Allahumma amutu wa ahya",
    translation:"In Your name O Allah, I die and I live.",
    benefit:"The Prophet ﷺ would say this when lying down to sleep, acknowledging that sleep is a minor form of death.",
    repetitionCount:1, sourceReference:"Bukhari · 6312" },
  { id:"s2", category:"before_sleep", orderIndex:1,
    arabicText:"اللَّهُمَّ قِنِي عَذَابَكَ\nyَوْمَ تَبْعَثُ عِبَادَكَ",
    transliteration:"Allahumma qini 'adhabaka yawma tab'athu 'ibadak",
    translation:"O Allah, protect me from Your punishment on the Day when You resurrect Your servants.",
    benefit:"The Prophet ﷺ would say this three times before sleeping, seeking protection from the punishment of the grave.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5045" },
  { id:"s3", category:"before_sleep", orderIndex:2,
    arabicText:"سُبْحَانَ اللَّهِ",
    transliteration:"Subhanallah",
    translation:"Glory is to Allah.",
    benefit:"The Prophet ﷺ told Ali and Fatimah to say SubhanAllah 33 times, Alhamdulillah 33 times, and Allahu Akbar 34 times before sleeping — this is better than a servant for you.",
    repetitionCount:33, sourceReference:"Bukhari · 5362" },
  { id:"s4", category:"before_sleep", orderIndex:3,
    arabicText:"الْحَمْدُ لِلَّهِ",
    transliteration:"Alhamdulillah",
    translation:"All praise is for Allah.",
    benefit:"Part of the pre-sleep tasbih taught by the Prophet ﷺ to his daughter Fatimah. Saying Alhamdulillah 33 times before sleep brings immense blessings.",
    repetitionCount:33, sourceReference:"Bukhari · 5362" },
  { id:"s5", category:"before_sleep", orderIndex:4,
    arabicText:"اللَّهُ أَكْبَرُ",
    transliteration:"Allahu Akbar",
    translation:"Allah is the Greatest.",
    benefit:"The final part of the pre-sleep tasbih: 34 times Allahu Akbar. Better than a servant to help you with your needs.",
    repetitionCount:34, sourceReference:"Bukhari · 5362" },
  { id:"s6", category:"before_sleep", orderIndex:5,
    arabicText:"اللَّهُمَّ بِاسْمِكَ أَحْيَا وَأَمُوتُ",
    transliteration:"Allahumma bismika ahya wa amut",
    translation:"O Allah, with Your name I live and with Your name I die.",
    benefit:"Beginning one's sleep with the name of Allah is a Sunnah act that brings blessings and protection throughout the night.",
    repetitionCount:1, sourceReference:"Bukhari · 6324" },
  { id:"s7", category:"before_sleep", orderIndex:6,
    arabicText:"اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ\nوَفَوَّضْتُ أَمْرِي إِلَيْكَ وَوَجَّهْتُ وَجْهِي إِلَيْكَ",
    transliteration:"Allahumma aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa wajjahtu wajhi ilayk",
    translation:"O Allah, I submit myself to You, entrust my affairs to You, and turn my face toward You.",
    benefit:"The Prophet ﷺ instructed: If you die this night, you die upon the fitrah.",
    repetitionCount:1, sourceReference:"Bukhari · 247" },
  { id:"s8", category:"before_sleep", orderIndex:7,
    arabicText:"قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ\nلَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration:"Qul huwa Allahu ahad, Allahus-samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad",
    translation:"Say: He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.",
    benefit:"The Prophet ﷺ used to recite Al-Ikhlas, Al-Falaq, and An-Nas three times each before sleeping, then wipe over his body.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5056" },
  { id:"s9", category:"before_sleep", orderIndex:8,
    arabicText:"قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ\nوَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
    transliteration:"Qul a'udhu biraббil-falaq, min sharri ma khalaq, wa min sharri ghasiqin idha waqab",
    translation:"Say: I seek refuge in the Lord of daybreak from the evil of that which He created, and from the evil of darkness when it settles.",
    benefit:"Surah Al-Falaq, recited three times before sleep. The Prophet ﷺ said there is no protection like it.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5056" },
  { id:"s10", category:"before_sleep", orderIndex:9,
    arabicText:"قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَهِ النَّاسِ\nمِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
    transliteration:"Qul a'udhu birabbin-nas, malikin-nas, ilahin-nas, min sharril-waswasil-khannas",
    translation:"Say: I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer.",
    benefit:"Surah An-Nas, the final protection before sleep. Reciting the last two surahs creates a shield through the night.",
    repetitionCount:3, sourceReference:"Abu Dawud · 5056" },
];

const ALL_AZKAR = [...MORNING_AZKAR, ...EVENING_AZKAR, ...SLEEP_AZKAR];

const CATEGORIES = [
  { id: "morning" as CategoryId,      name: "Morning Azkar",  nameArabic: "أذكار الصباح", icon: "sun",      totalCount: 15 },
  { id: "evening" as CategoryId,      name: "Evening Azkar",  nameArabic: "أذكار المساء", icon: "crescent", totalCount: 15 },
  { id: "before_sleep" as CategoryId, name: "Before Sleep",   nameArabic: "أذكار النوم",  icon: "stars",    totalCount: 10 },
];

const WEEK_DATA = [
  { day: "Mon", count: 28 }, { day: "Tue", count: 40 }, { day: "Wed", count: 15 },
  { day: "Thu", count: 40 }, { day: "Fri", count: 38 }, { day: "Sat", count: 40 }, { day: "Sun", count: 22 },
];

const SESSIONS: Session[] = [
  { id:"1", category:"morning",      date:"Today",      completedCount:15, totalCount:15, durationSeconds:480, isComplete:true },
  { id:"2", category:"evening",      date:"Yesterday",  completedCount:12, totalCount:15, durationSeconds:390, isComplete:false },
  { id:"3", category:"before_sleep", date:"2 days ago", completedCount:10, totalCount:10, durationSeconds:300, isComplete:true },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAzkarByCategory = (cat: CategoryId) =>
  ALL_AZKAR.filter(z => z.category === cat).sort((a, b) => a.orderIndex - b.orderIndex);

// ─── Primitive components ─────────────────────────────────────────────────────

function CatIcon({ type, size = 22, color = T.gold }: { type: string; size?: number; color?: string }) {
  if (type === "sun") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3.8" fill={color} />
      {[0,45,90,135,180,225,270,315].map((deg, i) => (
        <line key={i}
          x1={12 + 6 * Math.cos(deg * Math.PI / 180)} y1={12 + 6 * Math.sin(deg * Math.PI / 180)}
          x2={12 + 8.8 * Math.cos(deg * Math.PI / 180)} y2={12 + 8.8 * Math.sin(deg * Math.PI / 180)}
          stroke={color} strokeWidth="1.8" strokeLinecap="round"
        />
      ))}
    </svg>
  );
  if (type === "crescent") return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20.4 13.4A8.4 8.4 0 1 1 10.6 3.6 6.5 6.5 0 0 0 20.4 13.4z" fill={color} />
    </svg>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="5"  r="1.4" fill={color} />
      <circle cx="6"  cy="9"  r="1.2" fill={color} opacity=".7" />
      <circle cx="18" cy="9"  r="1.2" fill={color} opacity=".7" />
      <circle cx="8"  cy="15" r="1.4" fill={color} />
      <circle cx="16" cy="15" r="1.4" fill={color} />
      <circle cx="12" cy="19" r="1.2" fill={color} opacity=".7" />
      <circle cx="12" cy="11" r="2.4" fill={color} />
    </svg>
  );
}

function MaleAvatar({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill={T.surfaceEl} />
      <circle cx="20" cy="15" r="7" fill={T.gold} opacity=".9" />
      <path d="M6 38c0-7.7 6.3-14 14-14s14 6.3 14 14" fill={T.gold} opacity=".6" />
    </svg>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange}
      className="relative inline-flex h-[31px] w-[51px] items-center rounded-full transition-colors duration-300 focus:outline-none shrink-0"
      style={{ background: checked ? T.gold : T.surfaceEl }}
    >
      <span className={`inline-block h-[27px] w-[27px] rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
    </button>
  );
}

function ProgressBar({ value, max, height = 8, trackColor, fillColor }:
  { value: number; max: number; height?: number; trackColor?: string; fillColor?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: trackColor ?? T.surfaceEl }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: fillColor ?? T.gold }} />
    </div>
  );
}

function RepBadge({ count, done }: { count: number; done: boolean }) {
  return (
    <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
      style={{
        fontFamily: "DM Mono, monospace",
        background: done ? `${T.gold}20` : `${T.teal}25`,
        color: done ? T.gold : T.teal,
        border: `1px solid ${done ? T.gold + "40" : T.teal + "50"}`,
      }}>
      ×{count}
    </span>
  );
}

function PulseRings({ trigger }: { trigger: number }) {
  return (
    <div key={trigger} className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {[0, 120, 240].map((delay, i) => (
        <div key={i} className="absolute rounded-full pulse-ring"
          style={{
            width: `${148 + i * 44}px`, height: `${148 + i * 44}px`,
            border: `2px solid ${T.gold}`,
            animationDuration: "700ms",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
            animationFillMode: "forwards",
            animationDelay: `${delay}ms`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

function CounterRing({ count, total, size = 160 }: { count: number; total: number; size?: number }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const pct = total > 0 ? count / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} stroke={T.surfaceEl} strokeWidth="10" fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={T.gold} strokeWidth="10" fill="none"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        style={{ transition: "stroke-dashoffset 180ms cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}

function WaveformBars({ active }: { active: boolean }) {
  const heights = [0.35, 0.75, 0.55, 1, 0.6, 0.8, 0.4];
  return (
    <div className="flex items-center gap-[2px]" style={{ height: 20 }}>
      {heights.map((h, i) => (
        <div key={i} className="w-[3px] rounded-full"
          style={{
            height: "100%", background: "rgba(255,255,255,0.7)",
            transform: `scaleY(${h})`, transformOrigin: "center",
            animation: active ? `waveform ${0.5 + i * 0.08}s ease-in-out ${i * 0.07}s infinite` : "none",
          }}
        />
      ))}
    </div>
  );
}

// ─── Layout shells ────────────────────────────────────────────────────────────

function Header({ title, subtitle, onBack, right }:
  { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-4 shrink-0 border-b"
      style={{ height: 56, borderColor: T.border }}>
      {onBack && (
        <button onClick={onBack}
          className="flex items-center justify-center rounded-full transition-colors"
          style={{ width: 44, height: 44, minWidth: 44 }}
          onMouseEnter={e => (e.currentTarget.style.background = T.surfaceEl)}
          onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
          <ChevronLeft size={22} style={{ color: T.textPrimary }} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ fontSize: 17, lineHeight: "24px", color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function BottomNav({ active, onChange }: {
  active: "home" | "azkar" | "settings";
  onChange: (t: "home" | "azkar" | "settings") => void;
}) {
  const tabs = [
    { id: "home" as const,     label: "Home",     Icon: Home },
    { id: "azkar" as const,    label: "Azkar",    Icon: BookOpen },
    { id: "settings" as const, label: "Settings", Icon: Settings },
  ];
  return (
    <div className="flex shrink-0 border-t" style={{ height: 83, paddingBottom: 20, borderColor: T.border, background: T.surface }}>
      {tabs.map(({ id, label, Icon }) => {
        const on = active === id;
        return (
          <button key={id} onClick={() => onChange(id)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-opacity active:opacity-70">
            <Icon size={22} style={{ color: on ? T.gold : T.textMuted }} />
            <span style={{ fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 500, color: on ? T.gold : T.textMuted }}>
              {label}
            </span>
            {on && <div className="rounded-full" style={{ width: 4, height: 4, background: T.gold, marginTop: -2 }} />}
          </button>
        );
      })}
    </div>
  );
}

// ─── Screen 1: Home ───────────────────────────────────────────────────────────

function HomeScreen({ completed, onCategory, onSearch }:
  { completed: Record<CategoryId, Set<number>>; onCategory: (c: CategoryId) => void; onSearch: () => void }) {
  const h = new Date().getHours();
  const timeLabel = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
  const totalDone = Object.values(completed).reduce((s, set) => s + set.size, 0);
  const totalAll  = CATEGORIES.reduce((s, c) => s + c.totalCount, 0);

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <MaleAvatar size={44} />
          <div>
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{timeLabel}</p>
            <p style={{ fontSize: 20, color: T.textPrimary, fontFamily: "Inter, sans-serif", fontWeight: 800, lineHeight: "26px" }}>Ahmad</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSearch}
            className="flex items-center justify-center rounded-full transition-colors"
            style={{ width: 44, height: 44, background: T.surface }}>
            <Search size={18} style={{ color: T.textPrimary }} />
          </button>
        </div>
      </div>

      {/* Arabic greeting */}
      <div className="px-5 mb-4">
        <div className="rounded-2xl px-5 py-4" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <p className="text-center" style={{ fontSize: 24, color: T.gold, fontFamily: "'Noto Naskh Arabic', serif", fontWeight: 700, lineHeight: "38px" }}>
            السَّلَامُ عَلَيْكُم وَرَحْمَةُ اللَّهِ
          </p>
          {totalDone > 0 && (
            <div className="mt-3">
              <div className="flex justify-between mb-1.5">
                <span style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Today's progress</span>
                <span style={{ fontSize: 11, color: T.gold, fontFamily: "DM Mono, monospace", fontWeight: 700 }}>{totalDone}/{totalAll}</span>
              </div>
              <ProgressBar value={totalDone} max={totalAll} height={6} />
            </div>
          )}
        </div>
      </div>

      {/* Category cards */}
      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-3 pb-4">
        {CATEGORIES.map(cat => {
          const done = completed[cat.id]?.size ?? 0;
          const complete = done === cat.totalCount;
          return (
            <button key={cat.id} onClick={() => onCategory(cat.id)}
              className="w-full text-left rounded-2xl p-4 transition-all active:scale-[0.98]"
              style={{ background: T.surface, border: `1px solid ${complete ? T.gold + "50" : T.border}` }}>
              <div className="flex items-center gap-4">
                {/* Icon circle */}
                <div className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: 52, height: 52, background: complete ? `${T.gold}20` : T.surfaceEl }}>
                  <CatIcon type={cat.icon} size={26} color={complete ? T.gold : T.gold} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>{cat.name}</p>
                    {complete
                      ? <span className="flex items-center gap-1 rounded-full px-2 py-0.5" style={{ background: `${T.gold}20`, fontSize: 10, color: T.gold, fontFamily: "Inter, sans-serif", fontWeight: 700 }}>
                          <Check size={10} /> Done
                        </span>
                      : <span style={{ fontSize: 12, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>{done}/{cat.totalCount}</span>
                    }
                  </div>
                  <p className="mb-2" style={{ fontSize: 14, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif" }}>{cat.nameArabic}</p>
                  <ProgressBar value={done} max={cat.totalCount} height={7} />
                </div>

                <ChevronRight size={16} style={{ color: T.textMuted, flexShrink: 0 }} />
              </div>
            </button>
          );
        })}

        {/* Streak card */}
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 52, height: 52, background: `${T.gold}15` }}>
            <Flame size={24} style={{ color: T.gold }} />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 12, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Current Streak</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: T.gold, fontFamily: "DM Mono, monospace" }}>7 days</p>
          </div>
          <div className="text-right">
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Best</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: T.textSec, fontFamily: "DM Mono, monospace" }}>14</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Screen 2: Category list ──────────────────────────────────────────────────

function CategoryScreen({ catId, completed, onZikr, onBack }:
  { catId: CategoryId; completed: Set<number>; onZikr: (i: number) => void; onBack: () => void }) {
  const azkar = getAzkarByCategory(catId);
  const cat   = CATEGORIES.find(c => c.id === catId)!;
  const done  = completed.size;
  const resumeIdx = azkar.findIndex((_, i) => !completed.has(i));
  const pct = Math.round((done / azkar.length) * 100);

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <Header title={cat.name} subtitle={`${done} of ${azkar.length} complete`} onBack={onBack} />

      {/* Progress strip */}
      <div className="px-5 py-4 shrink-0" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 12, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Progress</p>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.gold, fontFamily: "DM Mono, monospace" }}>{pct}%</p>
        </div>
        <ProgressBar value={done} max={azkar.length} height={8} />

        {done < azkar.length && (
          <button onClick={() => onZikr(Math.max(0, resumeIdx))}
            className="w-full mt-3 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{ height: 48, background: T.gold, color: T.bg, fontSize: 15, fontFamily: "Inter, sans-serif" }}>
            {done === 0 ? "Start Session" : `Resume · Zikr ${resumeIdx + 1}`}
            <ChevronRight size={18} />
          </button>
        )}
        {done === azkar.length && (
          <div className="w-full mt-3 rounded-xl flex items-center justify-center gap-2"
            style={{ height: 48, background: `${T.gold}15`, border: `1px solid ${T.gold}40` }}>
            <Check size={18} style={{ color: T.gold }} />
            <span style={{ color: T.gold, fontSize: 15, fontWeight: 700, fontFamily: "Inter, sans-serif" }}>Session Complete</span>
          </div>
        )}
      </div>

      {/* Zikr list */}
      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-2">
        {azkar.map((z, i) => {
          const isDone = completed.has(i);
          return (
            <button key={z.id} onClick={() => onZikr(i)}
              className="w-full text-left rounded-xl p-4 flex items-center gap-3 transition-all active:scale-[0.98]"
              style={{ background: T.surface, border: `1px solid ${isDone ? T.gold + "30" : T.border}` }}>
              {/* Status circle */}
              <div className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 36, height: 36,
                  background: isDone ? T.gold : "transparent",
                  border: `2px solid ${isDone ? T.gold : T.surfaceEl}` }}>
                {isDone
                  ? <Check size={15} style={{ color: T.bg }} />
                  : <span style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, fontFamily: "DM Mono, monospace" }}>{i + 1}</span>
                }
              </div>

              <div className="flex-1 min-w-0">
                <p className="mb-0.5 truncate" dir="rtl"
                  style={{ fontSize: 16, color: isDone ? T.textMuted : T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "26px" }}>
                  {z.arabicText.split("\n")[0]}
                </p>
                <p className="truncate" style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", fontStyle: "italic" }}>
                  {z.transliteration.slice(0, 50)}…
                </p>
              </div>

              <RepBadge count={z.repetitionCount} done={isDone} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Screen 3: Zikr Reader ────────────────────────────────────────────────────

function ReaderScreen({ catId, idx, isDone, onBack, onCounter, onNext, onPrev }:
  { catId: CategoryId; idx: number; isDone: boolean;
    onBack: () => void; onCounter: () => void; onNext: () => void; onPrev: () => void }) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const [benefitOpen, setBenefitOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const touchStartX = useRef<number | null>(null);

  if (!z) return null;

  const handleSwipe = (dx: number) => {
    if (dx > 60) onPrev();
    else if (dx < -60) onNext();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (touchStartX.current !== null) { handleSwipe(e.changedTouches[0].clientX - touchStartX.current); touchStartX.current = null; } }}>

      {/* Header */}
      <Header title={`Zikr ${idx + 1} of ${azkar.length}`} subtitle={CATEGORIES.find(c=>c.id===catId)?.name}
        onBack={onBack}
        right={
          <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={idx === 0}
              className="flex items-center justify-center rounded-full transition-colors"
              style={{ width: 36, height: 36, opacity: idx === 0 ? 0.3 : 1 }}>
              <SkipBack size={16} style={{ color: T.textMuted }} />
            </button>
            <button onClick={onNext} disabled={idx === azkar.length - 1}
              className="flex items-center justify-center rounded-full transition-colors"
              style={{ width: 36, height: 36, opacity: idx === azkar.length - 1 ? 0.3 : 1 }}>
              <SkipForward size={16} style={{ color: T.textMuted }} />
            </button>
          </div>
        }
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
        {/* Arabic text card */}
        <div className="rounded-2xl px-5 py-6" style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          {isDone && (
            <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: `1px solid ${T.border}` }}>
              <Check size={14} style={{ color: T.gold }} />
              <span style={{ fontSize: 11, color: T.gold, fontFamily: "Inter, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Completed</span>
            </div>
          )}
          {/* Arabic */}
          <p className="text-center mb-4" dir="rtl"
            style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "52px" }}>
            {z.arabicText}
          </p>
          {/* Transliteration */}
          <p className="text-center mb-3"
            style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif", fontStyle: "italic", lineHeight: "20px" }}>
            {z.transliteration}
          </p>
          {/* Translation */}
          <p className="text-center"
            style={{ fontSize: 14, color: T.textSec, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
            {z.translation}
          </p>
        </div>

        {/* Benefit accordion */}
        <button onClick={() => setBenefitOpen(o => !o)}
          className="w-full rounded-xl text-left transition-colors"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}>
          <div className="flex items-center gap-3 p-4">
            <div className="flex items-center justify-center rounded-lg shrink-0"
              style={{ width: 32, height: 32, background: `${T.gold}15` }}>
              <Info size={14} style={{ color: T.gold }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", flex: 1 }}>Benefit & Virtue</p>
            <div style={{ color: T.textMuted }}>
              {benefitOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
          {benefitOpen && (
            <div className="px-4 pb-4 fade-in" style={{ borderTop: `1px solid ${T.border}` }}>
              <p className="pt-3" style={{ fontSize: 13, color: T.textSec, fontFamily: "Inter, sans-serif", lineHeight: "21px" }}>
                {z.benefit}
              </p>
              <span className="inline-block mt-3 rounded-full px-3 py-1"
                style={{ fontSize: 11, color: T.teal, background: `${T.teal}15`, border: `1px solid ${T.teal}40`, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                {z.sourceReference}
              </span>
            </div>
          )}
        </button>

        {/* Audio player */}
        <div className="rounded-xl px-4 py-3 flex items-center gap-3" style={{ background: T.tealBg, border: `1px solid ${T.teal}40` }}>
          <button onClick={() => setPlaying(p => !p)}
            className="flex items-center justify-center rounded-full shrink-0 transition-all active:scale-90"
            style={{ width: 40, height: 40, background: T.teal }}>
            {playing ? <Pause size={15} color="white" /> : <Play size={15} color="white" style={{ marginLeft: 2 }} />}
          </button>
          <WaveformBars active={playing} />
          <div className="flex-1" />
          <button onClick={() => setSpeed(s => s === 0.75 ? 1 : s === 1 ? 1.25 : 0.75)}
            className="rounded-lg px-2 py-1"
            style={{ background: `${T.teal}30`, border: `1px solid ${T.teal}50`, fontSize: 11, color: T.teal, fontFamily: "DM Mono, monospace", fontWeight: 700 }}>
            {speed}×
          </button>
        </div>
      </div>

      {/* Counter zone — bottom tap strip */}
      <button onClick={onCounter}
        className="shrink-0 flex flex-col items-center justify-center gap-2 w-full transition-all active:opacity-80"
        style={{ height: 100, background: T.surface, borderTop: `1px solid ${T.border}` }}>
        <div className="flex items-center gap-3">
          <CounterRing count={isDone ? z.repetitionCount : 0} total={z.repetitionCount} size={52} />
          <div className="text-left">
            <p style={{ fontSize: 22, fontWeight: 800, color: T.gold, fontFamily: "DM Mono, monospace", lineHeight: "28px" }}>
              {isDone ? z.repetitionCount : 0}
              <span style={{ fontSize: 13, color: T.textMuted, fontWeight: 400 }}> / {z.repetitionCount}</span>
            </p>
            <p style={{ fontSize: 10, color: T.textMuted, fontFamily: "Inter, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {isDone ? "✓ Complete — tap to redo" : "Tap to count"}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}

// ─── Screen 4: Full-screen Counter ────────────────────────────────────────────

function CounterScreen({ catId, idx, initialCount, onBack, onComplete, onPrev, onNext }:
  { catId: CategoryId; idx: number; initialCount: number;
    onBack: () => void; onComplete: (idx: number) => void;
    onPrev: () => void; onNext: () => void }) {
  const azkar = getAzkarByCategory(catId);
  const z = azkar[idx];
  const [count, setCount] = useState(initialCount);
  const [pulse, setPulse] = useState(0);
  const [flash, setFlash] = useState(false);
  const [complete, setComplete] = useState(initialCount >= (z?.repetitionCount ?? 1));
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartX = useRef<number | null>(null);

  // Reset when zikr changes
  useEffect(() => {
    setCount(initialCount);
    setComplete(initialCount >= (z?.repetitionCount ?? 1));
  }, [idx]);

  if (!z) return null;

  const handleTap = () => {
    if (complete) return;
    const next = count + 1;
    setCount(next);
    setPulse(p => p + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 120);
    if (next >= z.repetitionCount) {
      setComplete(true);
      setTimeout(() => onComplete(idx), 500);
    }
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setCount(0);
      setComplete(false);
      setPulse(p => p + 1);
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const handleSwipe = (dx: number) => {
    if (dx > 60) onPrev();
    else if (dx < -60) onNext();
  };

  const remaining = z.repetitionCount - count;

  return (
    <div className="flex flex-col h-full select-none" style={{ background: T.bg }}
      onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={e => { if (touchStartX.current !== null) { handleSwipe(e.changedTouches[0].clientX - touchStartX.current); touchStartX.current = null; } }}>

      {/* Top bar — thin, non-interactive feel */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
        <button onClick={onBack}
          className="flex items-center justify-center rounded-full"
          style={{ width: 44, height: 44, background: T.surface }}>
          <ChevronLeft size={20} style={{ color: T.textPrimary }} />
        </button>
        <div className="text-center">
          <p style={{ fontSize: 12, color: T.textMuted, fontFamily: "Inter, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {CATEGORIES.find(c => c.id === catId)?.name}
          </p>
          <p style={{ fontSize: 14, color: T.textSec, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
            Zikr {idx + 1} of {azkar.length}
          </p>
        </div>
        <button onClick={() => { setCount(0); setComplete(false); }}
          className="flex items-center justify-center rounded-full"
          style={{ width: 44, height: 44, background: T.surface }}>
          <RotateCcw size={16} style={{ color: T.textMuted }} />
        </button>
      </div>

      {/* Arabic snippet */}
      <div className="px-6 pb-4 shrink-0">
        <p className="text-center"
          style={{ fontSize: 18, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "32px", direction: "rtl" }}>
          {z.arabicText.split("\n")[0]}
        </p>
      </div>

      {/* Full-screen tap zone */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative cursor-pointer"
        onClick={handleTap}
        onMouseDown={handleLongPressStart}
        onMouseUp={handleLongPressEnd}
        onMouseLeave={handleLongPressEnd}
        onTouchStart={handleLongPressStart}
        onTouchEnd={handleLongPressEnd}
        style={{ background: flash ? `${T.gold}08` : "transparent", transition: "background 80ms" }}>

        <PulseRings trigger={pulse} />

        {/* Ring + count */}
        <div className="relative flex items-center justify-center z-10">
          <CounterRing count={count} total={z.repetitionCount} size={200} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {complete ? (
              <>
                <div className="flex items-center justify-center rounded-full mb-2"
                  style={{ width: 52, height: 52, background: T.gold }}>
                  <Check size={26} style={{ color: T.bg }} />
                </div>
                <p style={{ fontSize: 14, color: T.gold, fontFamily: "Inter, sans-serif", fontWeight: 700 }}>Complete!</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: 56, fontWeight: 800, color: T.gold, fontFamily: "DM Mono, monospace", lineHeight: "60px" }}>{count}</p>
                <p style={{ fontSize: 16, color: T.textMuted, fontFamily: "DM Mono, monospace" }}>of {z.repetitionCount}</p>
              </>
            )}
          </div>
        </div>

        {/* Tap hint */}
        {!complete && (
          <p className="mt-8 z-10"
            style={{ fontSize: 10, color: T.textMuted, fontFamily: "Inter, sans-serif", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.15em" }}>
            Tap anywhere to count
          </p>
        )}
        {!complete && remaining <= 5 && remaining > 0 && (
          <p className="mt-2 z-10"
            style={{ fontSize: 13, color: T.gold, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
            {remaining} more {remaining === 1 ? "time" : "times"}
          </p>
        )}
        {!complete && (
          <p className="absolute bottom-4 z-10"
            style={{ fontSize: 10, color: T.surfaceEl, fontFamily: "Inter, sans-serif" }}>
            Hold to reset
          </p>
        )}
      </div>

      {/* Bottom prev/next nav */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${T.border}` }}>
        <button onClick={onPrev} disabled={idx === 0}
          className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all active:scale-95"
          style={{ background: T.surface, opacity: idx === 0 ? 0.3 : 1 }}>
          <SkipBack size={16} style={{ color: T.textSec }} />
          <span style={{ fontSize: 13, color: T.textSec, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Prev</span>
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {azkar.slice(Math.max(0, idx - 2), Math.min(azkar.length, idx + 3)).map((_, di) => {
            const absIdx = Math.max(0, idx - 2) + di;
            return (
              <div key={absIdx} className="rounded-full transition-all"
                style={{ width: absIdx === idx ? 16 : 6, height: 6, background: absIdx === idx ? T.gold : T.surfaceEl }} />
            );
          })}
        </div>

        <button onClick={onNext} disabled={idx === azkar.length - 1}
          className="flex items-center gap-2 rounded-xl px-4 py-3 transition-all active:scale-95"
          style={{ background: T.surface, opacity: idx === azkar.length - 1 ? 0.3 : 1 }}>
          <span style={{ fontSize: 13, color: T.textSec, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Next</span>
          <SkipForward size={16} style={{ color: T.textSec }} />
        </button>
      </div>
    </div>
  );
}

// ─── Screen 5: Completion ─────────────────────────────────────────────────────

function CompletionScreen({ catId, sessionStart, onHome, onRepeat }:
  { catId: CategoryId; sessionStart: number; onHome: () => void; onRepeat: () => void }) {
  const cat = CATEGORIES.find(c => c.id === catId)!;
  const azkar = getAzkarByCategory(catId);
  const elapsedMin = Math.max(1, Math.round((Date.now() - sessionStart) / 60000));
  const totalReps = azkar.reduce((s, z) => s + z.repetitionCount, 0);

  return (
    <div className="flex flex-col h-full items-center justify-between px-6 py-8 slide-up" style={{ background: T.bg }}>
      <div />

      <div className="flex flex-col items-center gap-6 w-full">
        {/* Gold checkmark circle */}
        <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
          <svg className="absolute inset-0" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="56" stroke={T.gold} strokeWidth="2" fill="none" opacity=".15" />
            <circle cx="60" cy="60" r="56" stroke={T.gold} strokeWidth="2.5" fill="none"
              strokeDasharray="352" strokeDashoffset="0" />
          </svg>
          <div className="flex items-center justify-center rounded-full"
            style={{ width: 80, height: 80, background: T.gold }}>
            <Check size={36} style={{ color: T.bg, strokeWidth: 3 }} />
          </div>
        </div>

        {/* Arabic celebration */}
        <div className="text-center">
          <p style={{ fontSize: 34, color: T.gold, fontFamily: "'Noto Naskh Arabic', serif", fontWeight: 700, lineHeight: "48px" }}>
            مَاشَاءَ اللَّه
          </p>
          <p style={{ fontSize: 22, color: T.textPrimary, fontFamily: "Inter, sans-serif", fontWeight: 800, marginTop: 4 }}>
            Masha&apos;Allah!
          </p>
          <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", marginTop: 6 }}>
            You completed {cat.name}
          </p>
        </div>

        {/* Stats grid */}
        <div className="w-full grid grid-cols-3 gap-3">
          {[
            { value: azkar.length, label: "azkar" },
            { value: totalReps,    label: "repetitions" },
            { value: elapsedMin,   label: "minutes" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl p-4 text-center"
              style={{ background: T.surface, border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: T.gold, fontFamily: "DM Mono, monospace", lineHeight: "32px" }}>{value}</p>
              <p style={{ fontSize: 10, color: T.textMuted, fontFamily: "Inter, sans-serif", marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Streak callout */}
        <div className="w-full rounded-xl px-4 py-3 flex items-center gap-3"
          style={{ background: `${T.gold}10`, border: `1px solid ${T.gold}30` }}>
          <Flame size={20} style={{ color: T.gold }} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.gold, fontFamily: "Inter, sans-serif" }}>7-day streak maintained!</p>
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Consistency is a form of worship.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-3">
        <button onClick={() => {}}
          className="w-full rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ height: 48, background: T.surface, border: `1px solid ${T.border}`, color: T.textSec, fontSize: 15, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
          <Share2 size={16} /> Share Progress
        </button>
        <button onClick={onHome}
          className="w-full rounded-xl font-bold transition-all active:scale-95"
          style={{ height: 52, background: T.gold, color: T.bg, fontSize: 16, fontFamily: "Inter, sans-serif" }}>
          Return Home
        </button>
      </div>
    </div>
  );
}

// ─── Settings Screen — orchestrates all sub-screens via local state ───────────
function SettingsScreen({ darkMode, onToggleDark, onBack }: { darkMode: boolean; onToggleDark: () => void; onBack: () => void }) {
  const [sub, setSub] = useState<SettingsSubScreen>("root");
  const goBack = () => setSub("root");

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {sub === "root" && (
        <>
          <Header title="Settings" onBack={onBack} />
          <SettingsRootPanel onNav={setSub} darkMode={darkMode} onToggleDark={onToggleDark} />
          <motion.div className="flex justify-center py-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0, 0, 1, 1], y: [8, 8, 0, 0] }}
            transition={{ opacity: { duration: 0.61, times: [0, 0.0984, 0.8361, 1], ease: ["linear", "easeOut", "linear"] }, y: { duration: 0.61, times: [0, 0.0984, 0.8361, 1], ease: ["linear", "easeOut", "linear"] } }}>
            <div className="rounded-full" style={{ width: 134, height: 5, background: T.textPrimary, opacity: 0.3 }} />
          </motion.div>
        </>
      )}
      {sub === "accessibility"  && <AccessibilityPanel  onBack={goBack} />}
      {sub === "downloads"      && <DownloadsPanel       onBack={goBack} />}
      {sub === "notifications"  && <NotificationsPanel  onBack={goBack} />}
      {sub === "progress"       && <ProgressPanel        onBack={goBack} />}
      {sub === "about"          && <AboutPanel           onBack={goBack} />}
    </div>
  );
}

// ─── Phase 4: Search ──────────────────────────────────────────────────────────

const RECENT_SEARCHES = ["Istighfar", "Morning Dua", "Ayat al-Kursi"];

// Category badge for search results: Morning=gold, Evening=teal, Sleep=purple
function CategoryBadge({ catId }: { catId: CategoryId }) {
  const cfg = {
    morning:      { label: "Morning", bg: T.gold,      text: T.bg },
    evening:      { label: "Evening", bg: T.teal,      text: T.textPrimary },
    before_sleep: { label: "Sleep",   bg: "#4A3D6B",   text: T.textPrimary },
  }[catId];
  return (
    <div className="flex items-center justify-center rounded-full px-2 py-1 shrink-0"
      style={{ background: cfg.bg }}>
      <p style={{ fontSize: 10, fontWeight: 500, color: cfg.text, fontFamily: "Inter, sans-serif", lineHeight: "14px", whiteSpace: "nowrap" }}>
        {cfg.label}
      </p>
    </div>
  );
}

function SearchScreen({ onBack, onZikr }:
  { onBack: () => void; onZikr: (catId: CategoryId, i: number) => void }) {
  const [q, setQ] = useState("");
  const [recents, setRecents] = useState(RECENT_SEARCHES);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = q.trim().length < 2 ? [] : ALL_AZKAR.filter(z => {
    const lq = q.toLowerCase();
    return z.arabicText.includes(q)
      || z.translation.toLowerCase().includes(lq)
      || z.transliteration.toLowerCase().includes(lq)
      || (ZIKR_LABELS[z.id] ?? "").toLowerCase().includes(lq);
  });

  const handleSubmit = (term: string) => {
    if (!recents.includes(term)) setRecents(r => [term, ...r].slice(0, 5));
    setQ(term);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Top row: back + search input */}
      <div className="flex items-center gap-3 px-5 py-3 shrink-0">
        <button onClick={onBack} className="flex items-center justify-center" style={{ width: 24, height: 24, flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={T.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Search pill input — matches Figma BtnPrimary */}
        <div className="flex items-center gap-3 flex-1 rounded-full px-4"
          style={{ height: 48, background: T.surface }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
            <path d="M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM16 16l-3.3-3.3" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            autoFocus
            type="text"
            placeholder="Search azkar, duas..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && q.trim() && handleSubmit(q.trim())}
            className="flex-1 bg-transparent focus:outline-none"
            style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}
          />
          {/* Gold cursor indicator (visible when empty) */}
          {!q && <div className="shrink-0 rounded-sm" style={{ width: 2, height: 18, background: T.gold }} />}
          {q && (
            <button onClick={() => setQ("")} className="flex items-center justify-center shrink-0" style={{ width: 16, height: 16 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Recent searches */}
        {!q && recents.length > 0 && (
          <div className="mb-6">
            <p className="mb-3" style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "16px" }}>
              RECENT SEARCHES
            </p>
            <div className="flex flex-wrap gap-2">
              {recents.map(r => (
                <button key={r} onClick={() => setQ(r)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 transition-all active:scale-95"
                  style={{ background: T.surfaceEl }}>
                  <p style={{ fontSize: 13, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "20px" }}>{r}</p>
                  <button onClick={e => { e.stopPropagation(); setRecents(rs => rs.filter(s => s !== r)); }}
                    className="flex items-center justify-center" style={{ width: 12, height: 12 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M9 3L3 9M3 3L9 9" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {q.trim().length >= 2 && (
          <div className="flex flex-col gap-2">
            {results.length > 0 && (
              <p className="mb-1" style={{ fontSize: 11, color: T.gold, fontFamily: "Inter, sans-serif", lineHeight: "16px" }}>
                RESULTS FOR {q.toUpperCase()}
              </p>
            )}
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Search size={36} style={{ color: T.surfaceEl }} />
                <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>No results for &quot;{q}&quot;</p>
              </div>
            ) : (
              results.map(z => {
                const zIdx = getAzkarByCategory(z.category).findIndex(a => a.id === z.id);
                const label = ZIKR_LABELS[z.id] ?? z.transliteration.slice(0, 24);
                const subtitle = z.translation.slice(0, 40);
                return (
                  <button key={z.id} onClick={() => onZikr(z.category, zIdx)}
                    className="w-full flex items-center justify-between px-4 rounded-xl transition-all active:scale-[0.98]"
                    style={{ height: 72, background: T.surface }}>
                    <div className="flex flex-col items-start gap-1 min-w-0 flex-1">
                      <p className="truncate w-full" style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "24px" }}>
                        {label}
                      </p>
                      <p className="truncate w-full" style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
                        {subtitle}
                      </p>
                    </div>
                    <CategoryBadge catId={z.category} />
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Footer hint */}
        {!q && (
          <div className="py-6 flex flex-col items-center gap-3">
            <div className="w-full h-px opacity-15" style={{ background: T.textMuted }} />
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "16px", textAlign: "center" }}>
              Try searching by Arabic text or transliteration
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Phase 3: Settings (full drill-down with sub-screens) ──────────────────────

type SettingsSubScreen = "root" | "accessibility" | "downloads" | "notifications" | "progress" | "about";

// Shared primitives used across all settings sub-screens
function SubHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 shrink-0" style={{ height: 56 }}>
      <button onClick={onBack} className="flex items-center justify-center rounded-full" style={{ width: 40, height: 40 }}>
        <ChevronLeft size={20} style={{ color: T.textPrimary }} />
      </button>
      <p style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "24px" }}>{title}</p>
      <div style={{ width: 40 }}>{right}</div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-4" style={{ paddingTop: 24, paddingBottom: 8 }}>
      <p style={{ fontSize: 11, color: T.gold, fontFamily: "Inter, sans-serif", lineHeight: "16px" }}>{label}</p>
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  iconBg?: string;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  hasDivider?: boolean;
}

function SettingsRowItem({ icon, iconBg = T.surfaceEl, label, right, onPress, hasDivider = true }: SettingsRowProps) {
  return (
    <div className="relative">
      <button onClick={onPress}
        className="w-full flex items-center gap-3 px-4 transition-all active:opacity-70"
        style={{ height: 56, background: T.surface }}>
        <div className="flex items-center justify-center rounded-lg shrink-0"
          style={{ width: 36, height: 36, background: iconBg }}>
          {icon}
        </div>
        <p className="flex-1 text-left" style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "24px" }}>
          {label}
        </p>
        {right}
      </button>
      {hasDivider && (
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: T.surfaceEl, marginLeft: 64 }} />
      )}
    </div>
  );
}

function RowChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6 12L10 8L6 4" stroke={T.textMuted} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RowValue({ value }: { value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>{value}</p>
      <RowChevron />
    </div>
  );
}

function RowToggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={e => { e.stopPropagation(); onChange(); }}
      className="relative flex items-center rounded-full transition-colors"
      style={{ width: 44, height: 24, background: checked ? T.gold : "#2A2D3E" }}>
      <span className="absolute rounded-full bg-white shadow-md transition-all duration-200"
        style={{ width: 20, height: 20, top: 2, left: checked ? 22 : 2 }} />
    </button>
  );
}

// Settings Root screen
function SettingsRootPanel({ onNav, darkMode, onToggleDark }: {
  onNav: (s: SettingsSubScreen) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}) {
  return (
    <motion.div className="flex-1 overflow-y-auto"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: [0, 1, 1], y: [8, 0, 0] }}
      transition={{ opacity: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" }, y: { duration: 0.61, times: [0, 0.7377, 1], ease: "easeOut" } }}>

      <SectionLabel label="PREFERENCES" />
      <div className="mx-4 rounded-xl overflow-hidden">
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={T.textPrimary} strokeWidth="1.5" /><path d="M10 2C10 2 7 6 7 10s3 8 3 8M10 2c0 0 3 4 3 8s-3 8-3 8M2 10h16" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
          label="Language" right={<RowValue value="English" />} onPress={() => {}} />
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke={T.textPrimary} strokeWidth="1.5" /><path d="M10 3v14M3 10h14" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
          label="Display Theme"
          right={<div className="flex items-center gap-2"><p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>{darkMode ? "Dark" : "Light"}</p><RowToggle checked={darkMode} onChange={onToggleDark} /></div>}
          onPress={() => {}} />
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M7 7h6M7 13h4" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
          label="Text Size" right={<RowValue value="Medium" />} onPress={() => onNav("accessibility")} hasDivider={false} />
      </div>

      <SectionLabel label="CONTENT" />
      <div className="mx-4 rounded-xl overflow-hidden">
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<Volume2 size={18} style={{ color: T.textPrimary }} />}
          label="Audio Quality" right={<RowValue value="High" />} onPress={() => {}} />
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<Download size={18} style={{ color: T.textPrimary }} />}
          label="Offline Downloads" right={<RowChevron />} onPress={() => onNav("downloads")} hasDivider={false} />
      </div>

      <SectionLabel label="ACCESSIBILITY" />
      <div className="mx-4 rounded-xl overflow-hidden">
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<Settings size={18} style={{ color: T.textPrimary }} />}
          label="Accessibility" right={<RowChevron />} onPress={() => onNav("accessibility")} hasDivider={false} />
      </div>

      <SectionLabel label="ACCOUNT" />
      <div className="mx-4 rounded-xl overflow-hidden">
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<Bell size={18} style={{ color: T.textPrimary }} />}
          label="Notifications" right={<RowChevron />} onPress={() => onNav("notifications")} />
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<Flame size={18} style={{ color: T.textPrimary }} />}
          label="My Progress" right={<RowChevron />} onPress={() => onNav("progress")} />
        <SettingsRowItem
          iconBg={T.surfaceEl} icon={<Info size={18} style={{ color: T.textPrimary }} />}
          label="About & Help" right={<RowChevron />} onPress={() => onNav("about")} hasDivider={false} />
      </div>

      <div style={{ height: 32 }} />
    </motion.div>
  );
}

// Accessibility sub-screen
function AccessibilityPanel({ onBack }: { onBack: () => void }) {
  const [textSize, setTextSize] = useState(2); // 0=Small,1=Med,2=Lg,3=XL
  const [highContrast, setHighContrast] = useState(false);
  const [boldText, setBoldText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [haptic, setHaptic] = useState(true);
  const [rtl, setRtl] = useState(false);
  const [voiceOver, setVoiceOver] = useState(false);
  const [speed, setSpeed] = useState(1);
  const SIZES = ["Small", "Medium", "Large", "Extra Large"];

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <SubHeader title="Accessibility" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        <SectionLabel label="VISUAL" />
        <div className="mx-4 rounded-xl overflow-hidden">
          <div className="px-4 py-4" style={{ background: T.surface, borderBottom: `1px solid ${T.surfaceEl}` }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", marginBottom: 12 }}>Text Size</p>
            <div className="flex items-center gap-2 mb-3">
              <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>A</p>
              <div className="flex-1 relative h-1 rounded-full" style={{ background: T.surfaceEl }}>
                <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${(textSize / 3) * 100}%`, background: T.gold }} />
                <input type="range" min={0} max={3} value={textSize} onChange={e => setTextSize(+e.target.value)}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer" style={{ height: 20, top: -10 }} />
              </div>
              <p style={{ fontSize: 18, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>A</p>
            </div>
            <p className="text-center" style={{ fontSize: 11, color: T.gold, fontFamily: "Inter, sans-serif" }}>{SIZES[textSize]}</p>
          </div>
          <SettingsRowItem iconBg={T.surfaceEl} icon={<Eye size={18} style={{ color: T.textPrimary }} />}
            label="High Contrast" right={<RowToggle checked={highContrast} onChange={() => setHighContrast(v => !v)} />} onPress={() => setHighContrast(v => !v)} />
          <SettingsRowItem iconBg={T.surfaceEl} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14L14 4M9 16a7 7 0 1 0 0-14" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
            label="Bold Text" right={<RowToggle checked={boldText} onChange={() => setBoldText(v => !v)} />} onPress={() => setBoldText(v => !v)} hasDivider={false} />
        </div>

        <SectionLabel label="MOTION" />
        <div className="mx-4 rounded-xl overflow-hidden">
          <SettingsRowItem iconBg={T.surfaceEl} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke={T.textPrimary} strokeWidth="1.5" /><path d="M9 6v3l2 2" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
            label="Reduce Motion" right={<RowToggle checked={reduceMotion} onChange={() => setReduceMotion(v => !v)} />} onPress={() => setReduceMotion(v => !v)} />
          <SettingsRowItem iconBg={T.gold} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2C5.1 2 2 5.1 2 9s3.1 7 7 7c1 0 1.5-.8 1.5-1.5S10 13 9 13c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4" stroke={T.bg} strokeWidth="1.5" strokeLinecap="round" /></svg>}
            label="Haptic Feedback" right={<RowToggle checked={haptic} onChange={() => setHaptic(v => !v)} />} onPress={() => setHaptic(v => !v)} hasDivider={false} />
        </div>

        <SectionLabel label="READING" />
        <div className="mx-4 rounded-xl overflow-hidden">
          <SettingsRowItem iconBg={T.surfaceEl} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M15 4H3M12 9H3M10 14H3" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
            label="Right-to-Left Layout" right={<RowToggle checked={rtl} onChange={() => setRtl(v => !v)} />} onPress={() => setRtl(v => !v)} />
          <SettingsRowItem iconBg={T.surfaceEl} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2v14M5 5l4-3 4 3" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
            label="VoiceOver Compatible" right={<RowToggle checked={voiceOver} onChange={() => setVoiceOver(v => !v)} />} onPress={() => setVoiceOver(v => !v)} hasDivider={false} />
        </div>

        <SectionLabel label="AUDIO" />
        <div className="mx-4 rounded-xl overflow-hidden px-4 py-4" style={{ background: T.surface }}>
          <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", marginBottom: 12 }}>Playback Speed</p>
          <div className="flex gap-2">
            {[0.75, 1, 1.25, 1.5].map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className="flex-1 h-10 rounded-xl transition-all active:scale-95"
                style={{ background: speed === s ? T.gold : T.surfaceEl, fontSize: 13, fontWeight: 600, color: speed === s ? T.bg : T.textMuted, fontFamily: "Inter, sans-serif" }}>
                {s}×
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

// Download Manager sub-screen
function DownloadsPanel({ onBack }: { onBack: () => void }) {
  const [downloads, setDownloads] = useState<Record<CategoryId, "idle" | "downloading" | "done">>({
    morning: "idle", evening: "idle", before_sleep: "downloading",
  });
  const [progress] = useState(60);

  const catMeta = [
    { id: "morning" as CategoryId, icon: "sun", label: "Morning Azkar", size: "8.2 MB" },
    { id: "evening" as CategoryId, icon: "crescent", label: "Evening Azkar", size: "7.8 MB" },
    { id: "before_sleep" as CategoryId, icon: "stars", label: "Before Sleep", size: "5.1 MB" },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <SubHeader title="Offline Downloads" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {/* Teal banner */}
        <div className="mx-4 mt-2 rounded-xl flex items-center gap-3 px-4 py-3" style={{ background: T.teal }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
            <path d="M12 16L7 11M12 16L17 11M12 16V4M5 20h14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "22px", flex: 1 }}>
            Download azkar for offline use — works without internet
          </p>
        </div>

        {/* Download All */}
        <div className="px-4 pt-4 pb-2">
          <button className="w-full h-12 rounded-xl transition-all active:scale-95"
            style={{ border: `1.5px solid ${T.gold}`, background: "transparent" }}>
            <p style={{ fontSize: 17, fontWeight: 600, color: T.gold, fontFamily: "Inter, sans-serif" }}>Download All Categories</p>
          </button>
        </div>

        <SectionLabel label="Available to Download" />
        <div className="flex flex-col gap-3 px-4">
          {catMeta.map(({ id, icon, label, size }) => {
            const state = downloads[id];
            return (
              <div key={id} className="rounded-xl overflow-hidden" style={{ background: T.surface, border: state === "downloading" ? `1px solid ${T.teal}` : "none" }}>
                {state === "downloading" ? (
                  <div className="flex flex-col gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <CatIcon type={icon} size={24} />
                      <p className="flex-1" style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>{label}</p>
                      <p style={{ fontSize: 14, color: T.teal, fontFamily: "Inter, sans-serif" }}>{progress}%</p>
                      <div className="flex items-center justify-center rounded-xl" style={{ width: 28, height: 28, background: "#1C2642" }}>
                        <Pause size={12} style={{ color: T.textPrimary }} />
                      </div>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#1C2642" }}>
                      <div className="h-full rounded-full" style={{ width: `${progress}%`, background: T.teal }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-4" style={{ height: 60 }}>
                    <CatIcon type={icon} size={24} />
                    <div className="flex-1">
                      <p style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "24px" }}>{label}</p>
                      <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>{CATEGORIES.find(c => c.id === id)!.totalCount} azkar · {size}</p>
                    </div>
                    <button onClick={() => setDownloads(d => ({ ...d, [id]: "downloading" }))}
                      className="flex items-center justify-center rounded-full px-3 py-1.5"
                      style={{ background: T.teal }}>
                      <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>DOWNLOAD</p>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SectionLabel label="Storage" />
        <div className="mx-4 rounded-xl p-4 flex flex-col gap-3" style={{ background: T.surface }}>
          <div className="rounded-full overflow-hidden" style={{ height: 6, background: "#1C2642" }}>
            <div className="h-full rounded-full" style={{ width: "24%", background: T.teal }} />
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>
            24.3 MB used · <span style={{ color: T.textPrimary }}>75.7 MB free</span>
          </p>
          <button className="w-full h-11 rounded-xl transition-all active:scale-95"
            style={{ border: `1px solid #C0392B`, background: "transparent" }}>
            <p style={{ fontSize: 14, color: "#C0392B", fontFamily: "Inter, sans-serif" }}>Clear All Downloads</p>
          </button>
        </div>

        <div style={{ height: 32 }} />
      </div>
      <div className="flex justify-center py-5">
        <div className="rounded-full" style={{ width: 134, height: 5, background: T.textPrimary, opacity: 0.3 }} />
      </div>
    </div>
  );
}

// Notification Settings sub-screen
function NotificationsPanel({ onBack }: { onBack: () => void }) {
  const [morningOn, setMorningOn] = useState(true);
  const [eveningOn, setEveningOn] = useState(true);
  const [sleepOn, setSleepOn] = useState(false);
  const [celebration, setCelebration] = useState(true);
  const [streak, setStreak] = useState(false);

  const ReminderRow = ({ label, enabled, onToggle, time }: { label: string; enabled: boolean; onToggle: () => void; time: string }) => (
    <div>
      <div className="flex items-center gap-3 px-4" style={{ height: 56, background: T.surface }}>
        <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: T.gold }}>
          <Bell size={18} style={{ color: T.bg }} />
        </div>
        <p className="flex-1" style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>{label}</p>
        <div className="flex items-center gap-2">
          <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>{enabled ? time : "Not set"}</p>
          <RowToggle checked={enabled} onChange={onToggle} />
        </div>
      </div>
      <div className="h-px mx-4" style={{ background: T.surfaceEl }} />
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <SubHeader title="Notifications" onBack={onBack} />
      <div className="flex-1 overflow-y-auto">
        {/* Status banner */}
        <div className="mx-4 mt-2 rounded-xl flex items-center gap-2 px-3 py-3" style={{ background: T.teal }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="white" strokeWidth="1.5" />
            <path d="M6.5 10L9 12.5L13.5 7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>Notifications are enabled</p>
        </div>

        <SectionLabel label="Azkar Reminders" />
        <div className="mx-4 rounded-xl overflow-hidden">
          <ReminderRow label="Morning Azkar" enabled={morningOn} onToggle={() => setMorningOn(v => !v)} time="6:30 AM" />
          {/* Time picker shown when morning is enabled */}
          {morningOn && (
            <div className="flex items-center justify-center gap-4 py-5" style={{ background: T.surface, borderBottom: `1px solid ${T.surfaceEl}` }}>
              {[{ val: "06", lbl: "HOUR" }, null, { val: "30", lbl: "MIN" }].map((item, i) =>
                item === null ? (
                  <p key={i} style={{ fontSize: 28, fontWeight: 800, color: T.gold, fontFamily: "Inter, sans-serif", letterSpacing: "-0.28px" }}>:</p>
                ) : (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <p style={{ fontSize: 28, fontWeight: 800, color: T.gold, fontFamily: "Inter, sans-serif", letterSpacing: "-0.28px" }}>{item.val}</p>
                    <p style={{ fontSize: 10, fontWeight: 500, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>{item.lbl}</p>
                  </div>
                )
              )}
              <div className="flex items-center justify-center rounded-lg px-2 py-1" style={{ background: T.surface }}>
                <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>AM</p>
              </div>
            </div>
          )}
          <ReminderRow label="Evening Azkar" enabled={eveningOn} onToggle={() => setEveningOn(v => !v)} time="5:00 PM" />
          <div className="flex items-center gap-3 px-4" style={{ height: 56, background: T.surface }}>
            <div className="flex items-center justify-center rounded-lg" style={{ width: 32, height: 32, background: T.gold }}>
              <Bell size={18} style={{ color: T.bg }} />
            </div>
            <p className="flex-1" style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>Before Sleep</p>
            <div className="flex items-center gap-2">
              <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Not set</p>
              <RowToggle checked={sleepOn} onChange={() => setSleepOn(v => !v)} />
            </div>
          </div>
        </div>

        <SectionLabel label="General" />
        <div className="mx-4 rounded-xl overflow-hidden">
          <SettingsRowItem iconBg={T.gold} icon={<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 1l2 5 5 .5-3.5 3.5 1 5L9 13l-4.5 2 1-5L2 6.5 7 6z" stroke={T.bg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            label="Completion Celebration" right={<RowToggle checked={celebration} onChange={() => setCelebration(v => !v)} />} onPress={() => setCelebration(v => !v)} />
          <SettingsRowItem iconBg={T.gold} icon={<Flame size={18} style={{ color: T.bg }} />}
            label="Daily Streak Reminder" right={<RowToggle checked={streak} onChange={() => setStreak(v => !v)} />} onPress={() => setStreak(v => !v)} />
          <SettingsRowItem iconBg={T.gold} icon={<Volume2 size={18} style={{ color: T.bg }} />}
            label="Notification Sound" right={<RowValue value="Gentle Chime" />} onPress={() => {}} hasDivider={false} />
        </div>

        <div style={{ height: 32 }} />
      </div>
      <div className="flex justify-center py-5">
        <div className="rounded-full" style={{ width: 134, height: 5, background: T.textPrimary, opacity: 0.3 }} />
      </div>
    </div>
  );
}

// My Progress sub-screen
function ProgressPanel({ onBack }: { onBack: () => void }) {
  const barHeights = [20, 30, 15, 45, 25, 35, 50];
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const sessions = [
    { date: "Thursday, Jan 29", count: 15, mins: 8 },
    { date: "Wednesday, Jan 28", count: 12, mins: 6 },
    { date: "Tuesday, Jan 27", count: 18, mins: 10 },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <SubHeader title="My Progress" onBack={onBack} />
      <motion.div className="flex-1 overflow-y-auto"
        initial={{ opacity: 0, scaleX: 0.85, scaleY: 0.85, y: 10 }}
        animate={{ opacity: [0, 1, 1], scaleX: [0.85, 1, 1], scaleY: [0.85, 1, 1], y: [10, 0, 0] }}
        transition={{
          opacity: { duration: 0.63, times: [0, 0.7143, 1], ease: "easeOut" },
          scaleX: { duration: 0.63, times: [0, 0.7143, 1], ease: [[0.34, 1.56, 0.64, 1], "linear"] },
          scaleY: { duration: 0.63, times: [0, 0.7143, 1], ease: [[0.34, 1.56, 0.64, 1], "linear"] },
          y: { duration: 0.63, times: [0, 0.7143, 1], ease: "easeOut" },
        }}>

        {/* Hero stat card */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl overflow-hidden flex items-stretch" style={{ background: T.surface }}>
            <div className="w-1 shrink-0" style={{ background: T.gold }} />
            <div className="flex items-start justify-between p-6 flex-1">
              <div className="flex flex-col gap-1">
                <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>Total Azkar Completed</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: T.gold, fontFamily: "Inter, sans-serif", lineHeight: "36px", letterSpacing: "-0.28px" }}>1,247</p>
                <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "16px" }}>Since July 2026</p>
              </div>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.2 }}>
                <path d="M8 36V24M16 36V16M24 36V8M32 36V20M40 36V28" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Streak card */}
        <div className="px-4 pt-4">
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: T.surface }}>
            <div className="flex items-center gap-2">
              <Flame size={20} style={{ color: T.gold }} />
              <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Current Streak</p>
            </div>
            <div>
              <p style={{ fontSize: 28, fontWeight: 800, color: T.gold, fontFamily: "Inter, sans-serif", letterSpacing: "-0.28px" }}>7 days</p>
              <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Best: 21 days</p>
            </div>
            {/* Bar chart */}
            <div className="flex items-end gap-1 h-[50px]">
              {barHeights.map((h, i) => (
                <div key={i} className="flex-1 rounded-t-sm" style={{ height: h, background: i === 6 ? T.gold : "#1C2642" }} />
              ))}
            </div>
            <div className="flex justify-between">
              {days.map((d, i) => (
                <p key={i} style={{ fontSize: 10, fontWeight: 500, color: i === 6 ? T.gold : T.textMuted, fontFamily: "Inter, sans-serif", flex: 1, textAlign: "center" }}>{d}</p>
              ))}
            </div>
          </div>
        </div>

        <SectionLabel label="Category Breakdown" />
        <div className="px-4 flex gap-2">
          {[{ label: "Morning", count: 487, pct: "100%" }, { label: "Evening", count: 430, pct: "88%" }, { label: "Sleep", count: 330, pct: "67%" }].map(({ label, count, pct }) => (
            <div key={label} className="flex-1 rounded-xl p-3 flex flex-col items-center gap-2" style={{ background: T.surface }}>
              <p style={{ fontSize: 11, color: T.gold, fontFamily: "Inter, sans-serif" }}>{label}</p>
              <p style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>{count}</p>
              <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>{pct}</p>
            </div>
          ))}
        </div>

        <SectionLabel label="Recent Sessions" />
        <div className="px-4 flex flex-col gap-2">
          {sessions.map(({ date, count, mins }) => (
            <div key={date} className="flex items-center gap-3 px-4 rounded-xl" style={{ height: 64, background: T.surface }}>
              <div className="flex flex-col flex-1 gap-0.5">
                <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>{date}</p>
                <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>{count} azkar · {mins} min</p>
              </div>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5l2.2 4.5 4.8.7-3.5 3.4.8 4.9L9 12.8l-4.3 2.2.8-4.9L2 6.7l4.8-.7z" stroke={T.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ))}
        </div>

        <div style={{ height: 32 }} />
      </motion.div>

      <motion.div className="flex justify-center py-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: [0, 0, 1, 1], y: [10, 10, 0, 0] }}
        transition={{ opacity: { duration: 0.63, times: [0, 0.127, 0.8413, 1], ease: ["linear", "easeOut", "linear"] }, y: { duration: 0.63, times: [0, 0.127, 0.8413, 1], ease: ["linear", "easeOut", "linear"] } }}>
        <div className="rounded-full" style={{ width: 134, height: 5, background: T.textPrimary, opacity: 0.3 }} />
      </motion.div>
    </div>
  );
}

// About & Help sub-screen
function AboutPanel({ onBack }: { onBack: () => void }) {
  const AboutRow = ({ icon, label, sub, right = <RowChevron />, hasDivider = true }: { icon: React.ReactNode; label: string; sub?: string; right?: React.ReactNode; hasDivider?: boolean }) => (
    <div className="relative">
      <button className="w-full flex items-center gap-3 px-4" style={{ height: 56, background: T.surface }}>
        <div className="flex items-center justify-center rounded-lg shrink-0" style={{ width: 36, height: 36, background: T.surfaceEl }}>
          {icon}
        </div>
        <div className="flex-1 flex flex-col items-start">
          <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>{label}</p>
          {sub && <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>{sub}</p>}
        </div>
        {right}
      </button>
      {hasDivider && <div className="absolute bottom-0 left-16 right-0 h-px" style={{ background: T.surfaceEl }} />}
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <SubHeader title="About Azkar" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-6 py-4">
        {/* App card */}
        <div className="rounded-xl p-6 flex flex-col items-center gap-3" style={{ background: T.surface }}>
          <CrescentMark size={32} />
          <div className="flex flex-col items-center gap-1">
            <p style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary, fontFamily: "Inter, sans-serif", letterSpacing: "-0.11px" }}>Azkar</p>
            <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Daily Islamic Remembrance</p>
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", opacity: 0.6 }}>Version 2.0.1</p>
          </div>
        </div>

        {/* Content source */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, color: T.gold, fontFamily: "Inter, sans-serif", marginBottom: 8, paddingLeft: 4 }}>CONTENT SOURCE</p>
          <div className="rounded-xl overflow-hidden">
            <AboutRow icon={<BookOpen size={18} style={{ color: T.textPrimary }} />} label="Hisnul Muslim" sub="All azkar verified from authentic sources"
              right={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke={T.textMuted} strokeWidth="1.5" /><path d="M8 5v3.5L10 10" stroke={T.textMuted} strokeWidth="1.5" strokeLinecap="round" /></svg>} />
            <AboutRow icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l1.8 4 4.2.6-3 3 .7 4.4L10 12 6.3 14l.7-4.4-3-3 4.2-.6z" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
              label="Hadith References" sub="Bukhari, Muslim, Tirmidhi & more" hasDivider={false} />
          </div>
        </div>

        {/* Support */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, color: T.gold, fontFamily: "Inter, sans-serif", marginBottom: 8, paddingLeft: 4 }}>SUPPORT</p>
          <div className="rounded-xl overflow-hidden">
            <AboutRow icon={<Share2 size={18} style={{ color: T.textPrimary }} />} label="Send Feedback" />
            <AboutRow icon={<Info size={18} style={{ color: T.textPrimary }} />} label="Frequently Asked Questions" />
            <AboutRow icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke={T.textPrimary} strokeWidth="1.5" /><path d="M10 2C10 2 7 6 7 10s3 8 3 8M10 2c0 0 3 4 3 8s-3 8-3 8M2 10h16" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
              label="Visit Website"
              right={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M11 3h2v2M13 3L8 8M7 5H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3" stroke={T.textMuted} strokeWidth="1.5" strokeLinecap="round" /></svg>}
              hasDivider={false} />
          </div>
        </div>

        {/* Legal */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 500, color: T.gold, fontFamily: "Inter, sans-serif", marginBottom: 8, paddingLeft: 4 }}>LEGAL</p>
          <div className="rounded-xl overflow-hidden">
            <AboutRow icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L4 5v6c0 3.3 2.5 6 6 7 3.5-1 6-3.7 6-7V5l-6-3z" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
              label="Privacy Policy" />
            <AboutRow icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12 3H6a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7l-3-4zM12 3v4h3M8 10h4M8 13h4" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" /></svg>}
              label="Terms of Service" hasDivider={false} />
          </div>
        </div>

        <p className="text-center" style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
          Made with ♥ for the Muslim community
        </p>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

// ─── Crescent SVG (shared across onboarding + splash) ─────────────────────────
// Two overlapping circles: gold main + dark carve-out, forming a crescent
function CrescentMark({ size = 80 }: { size?: number }) {
  // Scale everything relative to the 95×95 viewBox from Figma
  const scale = size / 80;
  const vb = 95 * scale;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill="none">
      <circle cx={55 * scale} cy={55 * scale} r={40 * scale} fill={T.gold} />
      <circle cx={35 * scale} cy={35 * scale} r={35 * scale} fill={T.bg} />
    </svg>
  );
}

// ─── Phase 2 Screen: Splash ───────────────────────────────────────────────────
function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-between h-full" style={{ background: T.bg }}>
      {/* Animated center content — fade in + slide up per motion-context */}
      <motion.div
        className="flex flex-col items-center w-full flex-1 pt-20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.5, 0, 0.5, 1] }}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-5">
          <CrescentMark size={80} />
          <div className="flex flex-col items-center gap-2">
            <p style={{ fontSize: 40, fontWeight: 800, color: T.gold, fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif", lineHeight: "44px" }} dir="auto">
              أذكار
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary, fontFamily: "Inter, sans-serif", letterSpacing: "1.44px" }}>
              Azkar
            </p>
            {/* Gold divider */}
            <svg width="60" height="1" viewBox="0 0 60 1" fill="none">
              <line x1="0" y1="0.5" x2="60" y2="0.5" stroke={T.gold} />
            </svg>
          </div>
        </div>

        {/* Secondary label */}
        <p className="mt-10" style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>
          Daily Remembrance
        </p>
      </motion.div>

      {/* Bottom track — fades in after 0.5s per motion-context */}
      <motion.div
        className="flex flex-col items-center gap-3 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: [0, 0, 0.58, 1] }}
      >
        {/* Progress track bar — gold fill ~60% */}
        <div className="rounded-full overflow-hidden" style={{ width: 160, height: 3, background: T.surfaceEl }}>
          <div className="h-full rounded-full" style={{ width: 96, background: T.gold }} />
        </div>
        <p style={{ fontSize: 10, fontWeight: 500, color: T.textMuted, fontFamily: "Inter, sans-serif", opacity: 0.5 }}>
          v2.0
        </p>
      </motion.div>
    </div>
  );
}

// ─── Shared onboarding primitives ─────────────────────────────────────────────

function StepDots({ active, total = 3 }: { active: number; total?: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{
            width: i === active ? 24 : 8, height: 8,
            background: i === active ? T.gold : T.textMuted,
            opacity: i === active ? 1 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

function FeatureDot({ color }: { color: string }) {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0 mt-[7px]">
      <circle cx="4" cy="4" r="4" fill={color} />
    </svg>
  );
}

function FeatureItem({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex gap-[10px] items-start w-full">
      <FeatureDot color={color} />
      <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "22px", flex: 1 }}>
        {text}
      </p>
    </div>
  );
}

function OnboardCTA({ primary, secondary, onPrimary, onSecondary }:
  { primary: string; secondary: string; onPrimary: () => void; onSecondary: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <button onClick={onPrimary}
        className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
        style={{ height: 52, background: T.gold, fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "Inter, sans-serif" }}>
        {primary}
      </button>
      <button onClick={onSecondary}
        style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
        {secondary}
      </button>
    </div>
  );
}

// ─── Phase 2 Screen: Onboarding 1 — Welcome ──────────────────────────────────
function Onboarding1Screen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Illustration zone — 380px, crescent + title overlay */}
      <div className="relative shrink-0 flex items-center justify-center overflow-hidden"
        style={{ height: 380, background: T.bg }}>
        {/* Glow */}
        <svg width="280" height="280" viewBox="0 0 280 280" fill="none" className="absolute">
          <circle cx="140" cy="140" r="140" fill={T.gold} fillOpacity="0.12" />
        </svg>
        {/* Star dots */}
        {[[-60, -30], [40, -50], [-20, 40]].map(([dx, dy], i) => (
          <svg key={i} width="6" height="6" viewBox="0 0 6 6" fill="none"
            className="absolute" style={{ left: `calc(50% + ${dx}px)`, top: `calc(50% + ${dy}px)`, transform: "translate(-50%,-50%)" }}>
            <circle cx="3" cy="3" r="3" fill={T.gold} />
          </svg>
        ))}
        {/* Large crescent — two-circle technique from Figma (210×140 viewBox, r=70 each) */}
        <div className="absolute" style={{ width: 140, height: 140, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <div className="absolute" style={{ inset: "0 -50% 0 0" }}>
            <svg width="210" height="140" viewBox="0 0 210 140" fill="none">
              <circle cx="70"  cy="70" r="70" fill={T.gold} />
              <circle cx="140" cy="70" r="70" fill={T.bg} />
            </svg>
          </div>
        </div>
        {/* Arabic + subtitle below crescent center */}
        <div className="absolute flex flex-col items-center gap-1.5"
          style={{ top: "calc(50% + 70px)", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          <p style={{ fontSize: 44, fontWeight: 800, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif", lineHeight: "48px" }} dir="auto">
            أذكار
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: T.gold, fontFamily: "Inter, sans-serif", letterSpacing: "1.04px" }}>
            AZKAR
          </p>
        </div>
      </div>

      {/* Text + CTA zone */}
      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7 relative">
        {/* Step dots */}
        <StepDots active={0} />

        {/* Headline */}
        <div className="text-center">
          <p style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "36px", letterSpacing: "-0.28px" }}>
            Your Daily Islamic<br />Remembrance
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-center" style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
          Morning · Evening · Before Sleep<br />
          Authentic azkar from Hisnul Muslim
        </p>

        {/* Feature bullets */}
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Authentic duas from Hisnul Muslim"        color={T.teal} />
          <FeatureItem text="15 morning, 15 evening, 10 sleep azkar"  color={T.gold} />
          <FeatureItem text="Works offline — no internet needed"       color={T.teal} />
        </div>

        <div className="flex-1" />
        <OnboardCTA primary="Get Started" secondary="Skip" onPrimary={onNext} onSecondary={onSkip} />
      </div>
    </div>
  );
}

// ─── Phase 2 Screen: Onboarding 2 — Counter demo ─────────────────────────────
function Onboarding2Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  // Static demo ring: 7/33 ≈ 21% filled
  const demoCount = 7;
  const demoTotal = 33;
  const size = 120;
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = demoCount / demoTotal;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Illustration zone */}
      <div className="relative shrink-0 flex items-center justify-center"
        style={{ height: 380, background: T.bg }}>

        {/* Logo mark — top center */}
        <div className="absolute flex flex-col items-center gap-1" style={{ top: 60, left: "calc(50% - 30px)", transform: "translateX(-50%)" }}>
          {/* Small crescent */}
          <div className="relative" style={{ width: 28, height: 28 }}>
            <div className="absolute" style={{ inset: "-17.86% 0 0 -17.86%" }}>
              <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <circle cx="19" cy="19" r="14" fill={T.gold} />
                <circle cx="12" cy="12" r="12" fill={T.bg} />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "20px", whiteSpace: "nowrap" }}>
            Azkar
          </p>
        </div>

        {/* Counter ring demo */}
        <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
          {/* Three pulse rings — static, concentric, low opacity */}
          {[220, 180, 140].map((d, i) => (
            <svg key={i} width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none"
              className="absolute" style={{ opacity: [0.08, 0.14, 0.2][i] }}>
              <circle cx={d/2} cy={d/2} r={d/2 - 0.5} stroke={T.gold} />
            </svg>
          ))}

          {/* Gold arc ring at 120px — partial fill */}
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" className="absolute"
            style={{ transform: "rotate(-90deg)" }}>
            <circle cx={size/2} cy={size/2} r={r} stroke={T.surfaceEl} strokeWidth="10" fill="none" />
            <circle cx={size/2} cy={size/2} r={r} stroke={T.gold} strokeWidth="10" fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
            />
          </svg>

          {/* Count labels */}
          <div className="absolute flex flex-col items-center" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "36px", letterSpacing: "-0.28px" }}>
              {demoCount}
            </p>
            <p style={{ fontSize: 14, color: T.gold, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
              of {demoTotal}
            </p>
          </div>

          {/* +1 badge */}
          <div className="absolute flex items-center justify-center rounded-full px-2 py-1"
            style={{ background: T.teal, top: -10, right: -10 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: T.bg, fontFamily: "Inter, sans-serif", lineHeight: "13px", letterSpacing: "0.72px" }}>
              +1
            </p>
          </div>
        </div>

        {/* TAP TO COUNT label above ring */}
        <p className="absolute"
          style={{ top: "calc(50% - 130px)", fontSize: 9, fontWeight: 700, color: T.gold, fontFamily: "Inter, sans-serif",
            letterSpacing: "0.72px", textTransform: "uppercase", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          TAP TO COUNT
        </p>
      </div>

      {/* Text + CTA zone */}
      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7 relative">
        <StepDots active={1} />

        <div className="text-center">
          <p style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "36px", letterSpacing: "-0.28px" }}>
            Count Every<br />Remembrance
          </p>
        </div>

        <p className="text-center" style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
          Tap anywhere on screen — the whole screen is your counter. Haptic feedback on every tap.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Auto-advances when count is complete"  color={T.gold} />
          <FeatureItem text="Progress saved — never lose your place" color={T.teal} />
          <FeatureItem text="Swipe to navigate between azkar"        color={T.gold} />
        </div>

        <div className="flex-1" />
        <OnboardCTA primary="Next" secondary="Back" onPrimary={onNext} onSecondary={onBack} />
      </div>
    </div>
  );
}

// ─── Phase 2 Screen: Onboarding 3 — Benefits ─────────────────────────────────
function Onboarding3Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Illustration zone */}
      <div className="relative shrink-0 flex items-center justify-center" style={{ height: 380, background: T.bg }}>
        {/* Logo mark */}
        <div className="absolute flex flex-col items-center gap-1" style={{ top: 58, left: "50%", transform: "translateX(-50%)" }}>
          <div className="relative" style={{ width: 28, height: 28 }}>
            <div className="absolute" style={{ inset: "-17.86% 0 0 -17.86%" }}>
              <svg width="33" height="33" viewBox="0 0 33 33" fill="none">
                <circle cx="19" cy="19" r="14" fill={T.gold} />
                <circle cx="12" cy="12" r="12" fill={T.bg} />
              </svg>
            </div>
          </div>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "20px", whiteSpace: "nowrap" }}>Azkar</p>
        </div>

        {/* Star sparkle — top-right of the book stack */}
        <div className="absolute" style={{ top: 118, left: "calc(50% + 60px)" }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <line x1="11" y1="2" x2="11" y2="20" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="11" x2="20" y2="11" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="4.4" y1="4.4" x2="17.6" y2="17.6" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="17.6" y1="4.4" x2="4.4" y2="17.6" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Two book cards */}
        <div className="relative flex items-center justify-center" style={{ width: 232, height: 160 }}>
          <div className="absolute flex items-center justify-center rounded-xl"
            style={{ width: 104, height: 160, background: T.surface, border: `1px solid ${T.gold}`, transform: "rotate(-6deg)", left: 0 }}>
            <p className="text-center px-3" dir="rtl"
              style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "26px" }}>
              اللَّهُمَّ إِنِّي أَسْأَلُكَ
            </p>
          </div>
          <div className="absolute flex items-center justify-center rounded-xl"
            style={{ width: 104, height: 160, background: T.surface, border: `1px solid ${T.gold}`, transform: "rotate(6deg)", right: 0 }}>
            <p className="text-center px-3" dir="rtl"
              style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "26px" }}>
              اللَّهُمَّ إِنِّي أَسْأَلُكَ
            </p>
          </div>
        </div>

        {/* Teal chip */}
        <div className="absolute flex items-center justify-center rounded-full px-3 py-2"
          style={{ bottom: 52, background: T.teal }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.bg, fontFamily: "Inter, sans-serif", letterSpacing: "0.72px", whiteSpace: "nowrap" }}>
            Hisnul Muslim · Authenticated
          </p>
        </div>
      </div>

      {/* Text + CTA */}
      <div className="flex flex-col items-center gap-4 flex-1 px-7 pt-2 pb-7">
        <StepDots active={2} />
        <p style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "36px", letterSpacing: "-0.28px", textAlign: "center" }}>
          Know the Benefit<br />of Every Zikr
        </p>
        <p className="text-center" style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
          Hadith-cited spiritual rewards shown for each remembrance. Understand WHY you recite.
        </p>
        <div className="flex flex-col gap-3 w-full">
          <FeatureItem text="Source reference for every azkar"              color={T.gold} />
          <FeatureItem text="Spiritual reward and virtue explained"         color={T.teal} />
          <FeatureItem text="Light & dark mode · Arabic RTL support"        color={T.gold} />
        </div>
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-3 w-full">
          <button onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ height: 52, background: T.gold, fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "Inter, sans-serif" }}>
            Begin Your Journey
          </button>
          <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "22px" }}>
            Already have an account?{" "}<span style={{ color: T.gold, fontWeight: 600 }}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Arabic onboarding primitives ─────────────────────────────────────

// iOS-style status bar for Arabic screens (they include their own)
function ArStatusBar() {
  return (
    <div className="flex items-center justify-between px-6 shrink-0" style={{ height: 44, paddingTop: 10 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          {[0,1,2,3].map((i) => (
            <rect key={i} x={i * 4.5} y={12 - (3 + i * 3)} width="3" height={3 + i * 3} rx="0.5" fill={T.textPrimary} opacity={i < 3 ? 1 : 1} />
          ))}
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5L8 10.5" stroke={T.textPrimary} strokeWidth="2" strokeLinecap="round"/>
          <path d="M5.5 7C6.3 6.2 7.1 5.8 8 5.8s1.7.4 2.5 1.2" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M3 4.5C4.6 2.9 6.2 2 8 2s3.4.9 5 2.5" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
        {/* Battery */}
        <div className="relative" style={{ width: 24, height: 12 }}>
          <div className="absolute inset-0 rounded-sm" style={{ border: `1.5px solid ${T.textPrimary}`, opacity: 0.6 }} />
          <div className="absolute rounded-sm" style={{ top: 2, left: 2, right: 4, bottom: 2, background: T.textPrimary }} />
          <div className="absolute" style={{ right: -3, top: 3.5, width: 2, height: 5, background: T.textPrimary, opacity: 0.5, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

function ArFeatureRow({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex items-center gap-3 w-full justify-end" dir="rtl">
      <p style={{ fontSize: 14, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", whiteSpace: "nowrap" }} dir="auto">
        {text}
      </p>
      <svg width="6" height="6" viewBox="0 0 6 6" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="3" cy="3" r="3" fill={color} />
      </svg>
    </div>
  );
}

function ArStepDots({ active, total = 3 }: { active: number; total?: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{
            width: i === active ? 24 : 8, height: 8,
            background: i === active ? T.gold : T.textMuted,
            opacity: i === active ? 1 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

function HomeIndicatorBar() {
  return (
    <div className="flex items-center justify-center shrink-0" style={{ height: 34 }}>
      <div className="rounded-full" style={{ width: 134, height: 5, background: T.textPrimary, opacity: 0.3 }} />
    </div>
  );
}

// ─── Arabic Onboarding 1 — مرحباً ─────────────────────────────────────────────
function ArOnboarding1Screen({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <ArStatusBar />

      {/* Illustration zone — 380px */}
      <div className="relative shrink-0 flex items-center justify-center overflow-hidden" style={{ height: 340 }}>
        {/* Blurred glow — Gaussian blur equivalent with CSS */}
        <div className="absolute" style={{
          width: 240, height: 240, borderRadius: "50%",
          background: `radial-gradient(circle, ${T.gold}26 0%, transparent 70%)`,
          filter: "blur(30px)",
        }} />

        {/* Crescent — different geometry from splash: main cx=90,cy=90,r=70 + mask cx=105,cy=65,r=65 */}
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none" className="relative">
          <circle cx="90" cy="90" r="70" fill={T.gold} />
          <circle cx="105" cy="65" r="65" fill={T.bg} />
        </svg>

        {/* Star dots — exact positions from Figma */}
        <div className="absolute" style={{ left: 80, top: 100 }}>
          <svg width="4" height="4" viewBox="0 0 4 4"><circle cx="2" cy="2" r="2" fill={T.gold} /></svg>
        </div>
        <div className="absolute" style={{ left: 300, top: 150 }}>
          <svg width="3" height="3" viewBox="0 0 3 3"><circle cx="1.5" cy="1.5" r="1.5" fill={T.gold} /></svg>
        </div>
        <div className="absolute" style={{ left: 240, top: 60 }}>
          <svg width="5" height="5" viewBox="0 0 5 5"><circle cx="2.5" cy="2.5" r="2.5" fill={T.gold} /></svg>
        </div>

        {/* Arabic title below crescent */}
        <div className="absolute flex flex-col items-center gap-1" style={{ bottom: 24, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
          <p style={{ fontSize: 44, fontWeight: 800, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif", lineHeight: "normal", letterSpacing: "-0.88px" }} dir="auto">
            أذكار
          </p>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.gold, fontFamily: "Inter, sans-serif", letterSpacing: "0.72px", lineHeight: "13px" }} dir="auto">
            أذكـار
          </p>
        </div>
      </div>

      {/* Text + CTA zone */}
      <div className="flex flex-col flex-1 px-7 justify-between pb-5">
        <div className="flex flex-col gap-8">
          <ArStepDots active={0} />

          {/* Headline + subtitle */}
          <div className="flex flex-col gap-3 items-center text-center" dir="rtl">
            <p style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "40px", whiteSpace: "nowrap" }} dir="auto">
              ذكرك الإسلامي اليومي
            </p>
            <div dir="auto" style={{ fontSize: 14, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", textAlign: "center" }}>
              <p>أذكار الصباح · المساء · قبل النوم</p>
              <p>أذكار موثقة من حصن المسلم</p>
            </div>
          </div>

          {/* Feature rows — RTL: text on left of dot (text right-aligned) */}
          <div className="flex flex-col gap-4 w-full">
            <ArFeatureRow text="أدعية موثقة من حصن المسلم"       color={T.gold} />
            <ArFeatureRow text="١٥ صباح، ١٥ مساء، ١٠ أذكار النوم" color="#24A08A" />
            <ArFeatureRow text="يعمل بدون إنترنت — متاح دائماً"  color={T.gold} />
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <button onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ height: 52, background: T.gold, fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif" }}
            dir="auto">
            ابدأ الآن
          </button>
          <button onClick={onSkip}>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", textAlign: "center", width: "100%" }} dir="auto">
              تخطي
            </p>
          </button>
        </div>
      </div>

      <HomeIndicatorBar />
    </div>
  );
}

// ─── Arabic Onboarding 2 — العداد ─────────────────────────────────────────────
function ArOnboarding2Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  // Eastern Arabic counter: 7/33
  const count = 7, total = 33;
  const r = 52, circ = 2 * Math.PI * r;
  const pct = count / total;

  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <ArStatusBar />

      {/* Illustration zone — asymmetric composition per Figma */}
      <div className="relative shrink-0 overflow-hidden" style={{ height: 340, background: T.bg }}>
        {/* Outer centered ring — 240px */}
        <div className="absolute" style={{ left: "50%", top: "50%", width: 240, height: 240, transform: "translate(-50%,-50%)" }}>
          <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
            <circle cx="120" cy="120" r="119.5" stroke={T.gold} opacity="0.1" />
          </svg>
        </div>

        {/* Inner rings — anchored to top-left corner (intentional asymmetric composition) */}
        {[{ d: 190, op: 0.2 }, { d: 150, op: 0.3 }].map(({ d, op }, i) => (
          <div key={i} className="absolute" style={{ left: 0, top: 0, width: d, height: d }}>
            <svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none">
              <circle cx={d/2} cy={d/2} r={d/2 - 0.5} stroke={T.gold} opacity={op} />
            </svg>
          </div>
        ))}

        {/* Gold arc ring — top-left corner, partial fill */}
        <div className="absolute" style={{ left: 0, top: 0, width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="60" cy="60" r={r} stroke={T.surfaceEl} strokeWidth="8" fill="none" />
            <circle cx="60" cy="60" r={r} stroke={T.gold} strokeWidth="8" fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - pct)}
            />
          </svg>
        </div>

        {/* Counter numbers — vertically centered in zone */}
        <div className="absolute flex flex-col items-center gap-0.5"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: T.goldLight, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "13px", letterSpacing: "0.72px" }} dir="auto">
            انقر للعد
          </p>
          <p style={{ fontSize: 56, fontWeight: 800, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif", lineHeight: "normal" }}>
            ٧
          </p>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.gold, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px" }} dir="auto">
            من ٣٣
          </p>
        </div>

        {/* +١ badge at right */}
        <p className="absolute" style={{ right: 48, top: "50%", fontSize: 20, fontWeight: 700, color: "#24A08A", fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "normal" }} dir="auto">
          +١
        </p>
      </div>

      {/* Text + CTA zone */}
      <div className="flex flex-col flex-1 px-7 justify-between pb-5">
        <div className="flex flex-col gap-8">
          <ArStepDots active={1} />

          <div className="flex flex-col gap-3 items-center text-center">
            <p style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "40px", whiteSpace: "nowrap" }} dir="auto">
              عدّ كل ذكر
            </p>
            <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", textAlign: "center" }} dir="auto">
              انقر في أي مكان على الشاشة — كامل الشاشة هو عدادك. اهتزاز خفيف مع كل نقرة.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <ArFeatureRow text="يتقدم تلقائياً عند اكتمال العدد" color={T.gold} />
            <ArFeatureRow text="حفظ التقدم — لن تضيع مكانك"     color={T.gold} />
            <ArFeatureRow text="اسحب للتنقل بين الأذكار"          color={T.gold} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ height: 52, background: T.gold, fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif" }}
            dir="auto">
            التالي
          </button>
          <button onClick={onBack}>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", textAlign: "center", width: "100%" }} dir="auto">
              رجوع
            </p>
          </button>
        </div>
      </div>

      <HomeIndicatorBar />
    </div>
  );
}

// ─── Arabic Onboarding 3 — الفضائل ───────────────────────────────────────────
function ArOnboarding3Screen({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <ArStatusBar />

      {/* Illustration zone */}
      <div className="relative shrink-0 flex items-center justify-center overflow-hidden" style={{ height: 340, background: T.bg }}>
        {/* Star at far left — intentionally asymmetric per design */}
        <div className="absolute" style={{ left: 20, top: 80 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="2" x2="12" y2="22" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="12" x2="22" y2="12" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="4.9" y1="4.9" x2="19.1" y2="19.1" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="19.1" y1="4.9" x2="4.9" y2="19.1" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>

        {/* Book cards — smaller, darker style (Arabic variant) */}
        <div className="relative flex items-end gap-1" style={{ width: 178, height: 117 }}>
          {/* Left card — blank, rotated -5° */}
          <div className="flex items-center justify-center rounded-sm" style={{
            width: 80, height: 110, flexShrink: 0,
            background: "#182540", border: "1px solid #1E3050",
            transform: "rotate(-5deg)", transformOrigin: "center bottom",
          }} />
          {/* Right card — with Arabic text, rotated +5° */}
          <div className="flex items-center justify-center rounded-sm px-2" style={{
            width: 80, height: 110, flexShrink: 0,
            background: "#182540", border: "1px solid #1E3050",
            transform: "rotate(5deg)", transformOrigin: "center bottom",
          }}>
            <p className="text-center" dir="auto"
              style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", width: 60 }}>
              اللَّهُمَّ إِنِّي أَسْأَلُكَ
            </p>
          </div>
        </div>

        {/* Teal chip — near left edge, below books per design */}
        <div className="absolute flex items-center px-3 py-1 rounded-full"
          style={{ left: 20, top: 258, background: T.tealBg, border: `1px solid ${T.teal}` }}>
          <p style={{ fontSize: 10, fontWeight: 500, color: "#24A08A", fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "14px", whiteSpace: "nowrap" }} dir="auto">
            حصن المسلم · موثق
          </p>
        </div>
      </div>

      {/* Text + CTA zone */}
      <div className="flex flex-col flex-1 px-7 justify-between pb-5">
        <div className="flex flex-col gap-8">
          <ArStepDots active={2} />

          <div className="flex flex-col gap-3 items-center text-center">
            <p style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "40px", whiteSpace: "nowrap" }} dir="auto">
              اعرف فضل كل ذكر
            </p>
            <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", textAlign: "center" }} dir="auto">
              فضل كل ذكر مذكور من الحديث النبوي الشريف. افهم لماذا تقرأ هذا الذكر.
            </p>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <ArFeatureRow text="مصدر الحديث لكل ذكر"              color={T.gold} />
            <ArFeatureRow text="الفضل والثواب الروحي موضح"         color={T.gold} />
            <ArFeatureRow text="وضع فاتح وداكن · دعم اللغة العربية" color={T.gold} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={onNext}
            className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
            style={{ height: 52, background: T.gold, fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "'Noto Naskh Arabic', 'Inter', sans-serif" }}
            dir="auto">
            ابدأ رحلتك
          </button>
          <p style={{ fontSize: 14, color: T.textMuted, fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "22px", textAlign: "center" }} dir="auto">
            لديك حساب بالفعل؟{" "}<span style={{ color: T.gold, fontWeight: 600 }}>تسجيل الدخول</span>
          </p>
        </div>
      </div>

      <HomeIndicatorBar />
    </div>
  );
}

// ─── Phase 2 Screen: Language Selection ──────────────────────────────────────
const LANGUAGES_LIST = [
  { code: "en", flag: "🇬🇧", native: "English",          name: "English" },
  { code: "ar", flag: "🇸🇦", native: "العربية",         name: "Arabic" },
  { code: "fr", flag: "🇫🇷", native: "Français",          name: "French" },
  { code: "ur", flag: "🇵🇰", native: "اردو",             name: "Urdu" },
  { code: "tr", flag: "🇹🇷", native: "Türkçe",            name: "Turkish" },
  { code: "id", flag: "🇮🇩", native: "Bahasa Indonesia",  name: "Indonesian" },
  { code: "ml", flag: "🇮🇳", native: "മലയാളം",          name: "Malayalam" },
  { code: "ha", flag: "🇳🇬", native: "Hausa",             name: "Hausa" },
];

function LanguageScreen({ onContinue }: { onContinue: (lang: string) => void }) {
  const [selected, setSelected] = useState("en");
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      {/* Header — logo + titles */}
      <div className="flex flex-col items-center gap-2 px-6 pt-5 pb-4 shrink-0">
        <div className="relative" style={{ width: 32, height: 32 }}>
          <div className="absolute" style={{ inset: "-18.75% 0 0 -18.75%" }}>
            <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
              <circle cx="22" cy="22" r="16" fill={T.gold} />
              <circle cx="14" cy="14" r="14" fill={T.bg} />
            </svg>
          </div>
        </div>
        <p style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>Azkar</p>
        <p style={{ fontSize: 18, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "24px", textAlign: "center" }}>
          Choose Your Language
        </p>
        <p style={{ fontSize: 12, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "16px" }}>
          You can change this later in Settings
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-2 pb-4">
        {LANGUAGES_LIST.map(lang => {
          const active = selected === lang.code;
          return (
            <button key={lang.code} onClick={() => setSelected(lang.code)}
              className="flex items-center gap-3 rounded-xl px-4 w-full transition-all active:scale-[0.98]"
              style={{
                height: 64,
                background: T.surface,
                borderLeft: active ? `4px solid ${T.gold}` : `4px solid transparent`,
                border: active ? `1px solid ${T.gold}40` : `1px solid ${T.border}`,
                borderLeftWidth: 4,
              }}>
              <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{lang.flag}</span>
              <p className="flex-1 text-left" dir="auto"
                style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "24px" }}>
                {lang.native}
              </p>
              <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>{lang.code}</p>
              {active && (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M4 10L8.5 14.5L16 7" stroke={T.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          );
        })}
      </div>

      {/* Continue */}
      <div className="px-6 pb-8 shrink-0">
        <button onClick={() => onContinue(selected)}
          className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ height: 52, background: T.gold, fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "Inter, sans-serif" }}>
          Continue
        </button>
      </div>
    </div>
  );
}

// ─── Phase 2 Screen: Login ────────────────────────────────────────────────────
function LoginScreen({ onPhone, onGuest }: { onPhone: () => void; onGuest: () => void }) {
  return (
    <div className="flex flex-col h-full" style={{ background: T.bg }}>
      <div className="flex flex-col flex-1 px-7 pt-6 pb-6 gap-7">
        {/* Top */}
        <div className="flex flex-col items-center gap-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M35 21.3A14 14 0 1 1 18.7 5 10.8 10.8 0 0 0 35 21.3z"
              stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="6" x2="28" y2="12" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
            <line x1="25" y1="9" x2="31" y2="9" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p style={{ fontSize: 28, fontWeight: 800, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "36px", letterSpacing: "-0.28px", textAlign: "center" }}>
            Welcome to Azkar
          </p>
          <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "20px", textAlign: "center" }}>
            Sign in to sync your progress across all your devices
          </p>
        </div>

        {/* Social auth */}
        <div className="flex flex-col gap-3">
          <button className="w-full flex items-center justify-center gap-3 rounded-lg h-12 transition-all active:scale-95"
            style={{ background: "#FFFFFF" }}>
            <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
              <path fill="#EA4335" d="M24 9.5c3.6 0 6.4 1.4 8.4 3.2l6.3-6.3C34.8 2.8 29.8 0 24 0 14.6 0 6.6 5.5 2.8 13.5l7.3 5.7C11.9 13 17.5 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.6 24.5c0-1.6-.2-3.2-.5-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.9 7.2l7.5 5.8c4.4-4 7.3-10 7.3-17z"/>
              <path fill="#FBBC05" d="M10.1 28.8c-.4-1.2-.6-2.5-.6-3.8 0-1.7.3-3.3.7-4.8L2.8 13.5A24 24 0 0 0 0 24c0 3.8.9 7.5 2.8 10.5l7.3-5.7z"/>
              <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4l-7.5-5.8c-2 1.4-4.6 2.2-7.2 2.2-6.5 0-12-4.4-14-10.2l-7.3 5.7C6.6 42.5 14.6 48 24 48z"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 600, color: "#1A1228", fontFamily: "Inter, sans-serif" }}>Continue with Google</span>
          </button>
          <button className="w-full flex items-center justify-center gap-3 rounded-lg h-[52px] transition-all active:scale-95"
            style={{ background: "#1C1C2E", border: `1.5px solid #3A3A5C` }}>
            <svg width="16" height="20" viewBox="0 0 16 20" fill={T.textPrimary} style={{ flexShrink: 0 }}>
              <path d="M13.2 10.6c0-2.7 2.3-4.1 2.4-4.2-1.3-1.9-3.3-2.1-4-2.2-1.7-.2-3.4 1-4.2 1-.8 0-2.2-1-3.6-.9-1.8 0-3.5 1.1-4.4 2.7C-1.6 10.2-.2 15.2 1.6 18c.9 1.3 1.9 2.7 3.3 2.7s1.8-.8 3.4-.8c1.6 0 2 .8 3.5.8 1.4 0 2.3-1.3 3.2-2.6.6-.9 1.1-1.8 1.4-2.1-.1-.1-2.2-.9-2.2-3.4zM10.5 2.9c.7-.9 1.3-2.2 1.1-3.4-1.1.1-2.4.7-3.1 1.6-.7.8-1.3 2.1-1.1 3.3 1.2.1 2.4-.6 3.1-1.5z"/>
            </svg>
            <span style={{ fontSize: 16, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>Continue with Apple</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: T.surface }} />
          <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>or</p>
          <div className="flex-1 h-px" style={{ background: T.surface }} />
        </div>

        {/* Phone option */}
        <button onClick={onPhone}
          className="w-full flex items-center gap-3 rounded-lg transition-all active:scale-95"
          style={{ height: 56, background: T.surface, border: `1px solid ${T.border}`, padding: "0 16px" }}>
          <div className="flex items-center justify-center rounded-[18px] shrink-0"
            style={{ width: 36, height: 36, background: T.teal }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14.6 11.3c0 .3-.1.5-.2.8-.1.3-.3.5-.5.8-.3.4-.6.8-1 1-.4.2-.8.4-1.2.4-1.1 0-2.4-.3-3.7-.9C6.8 12.8 5.8 12 4.8 11 3.9 10 3.1 9 2.5 7.8 1.9 6.7 1.6 5.6 1.6 4.5c0-.4.1-.9.3-1.3.2-.4.6-.7 1.1-1C3.5 1.6 4.1 1.4 4.7 1.4c.2 0 .4 0 .7.1.2.1.5.2.7.4l2.2 3.2c.2.3.3.5.4.7.1.2.1.4.1.5 0 .2-.1.5-.2.7-.1.2-.3.4-.5.6l-.5.6c-.1.1-.1.2-.1.3s0 .2.1.3c.2.3.5.7.8 1 .4.4.7.8 1.1 1.1.1.1.2.1.3.1.1 0 .2-.1.3-.1l.5-.5c.2-.2.4-.4.6-.5.2-.1.4-.1.6-.1.2 0 .4 0 .5.1.2.1.4.2.7.4l3.2 2.3c.3.2.4.4.4.6z" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col items-start flex-1 min-w-0">
            <p style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "20px" }}>
              Continue with Phone Number
            </p>
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "16px" }}>
              We&apos;ll send a one-time verification code
            </p>
          </div>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
            <path d="M7.5 15L12.5 10L7.5 5" stroke={T.gold} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Guest — dashed gold border */}
        <button onClick={onGuest}
          className="w-full flex flex-col items-center justify-center transition-all active:scale-95"
          style={{ padding: "14px 16px", background: "transparent", border: `1.5px dashed ${T.gold}`, borderRadius: 8 }}>
          <p style={{ fontSize: 17, fontWeight: 600, color: T.gold, fontFamily: "Inter, sans-serif", lineHeight: "24px" }}>
            Continue as Guest
          </p>
          <p style={{ fontSize: 10, fontWeight: 500, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "14px" }}>
            ⚠ Your progress won&apos;t sync across devices
          </p>
        </button>

        <div className="flex-1" />

        <p className="text-center" style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "16px" }}>
          By continuing you agree to our{" "}
          <span style={{ color: T.gold }}>Terms</span>{" & "}
          <span style={{ color: T.gold }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

// ─── Phase 2 Screen: Phone Input ─────────────────────────────────────────────
function PhoneInputScreen({ onSend, onBack, onSkip }: { onSend: () => void; onBack: () => void; onSkip: () => void }) {
  const [phone, setPhone] = useState("");
  const canSend = phone.replace(/\s/g, "").length >= 7;

  return (
    <div className="flex flex-col h-full justify-between" style={{ background: T.bg }}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 56 }}>
          <button onClick={onBack} style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke={T.textPrimary} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>Sign In</p>
          <button onClick={onSkip}>
            <p style={{ fontSize: 17, fontWeight: 600, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>Skip</p>
          </button>
        </div>

        <div className="px-6 pt-6 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p style={{ fontSize: 22, fontWeight: 700, color: T.textPrimary, fontFamily: "Inter, sans-serif", lineHeight: "30px", letterSpacing: "-0.11px" }}>
              Enter Your Number
            </p>
            <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "20px" }}>
              We&apos;ll send a one-time code to verify
            </p>
          </div>

          {/* Phone field — gold border when focused */}
          <div className="flex items-center rounded-xl gap-3 px-3"
            style={{ height: 60, background: T.surface, border: `1.5px solid ${T.gold}` }}>
            <div className="flex items-center gap-1.5 shrink-0 rounded-lg px-2 py-1"
              style={{ border: `1px solid ${T.teal}` }}>
              <span style={{ fontSize: 14, fontFamily: "Inter, sans-serif", color: T.textPrimary }}>🇸🇦 +966</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke={T.textPrimary} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="50 123 4567"
              className="flex-1 bg-transparent focus:outline-none"
              style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}
            />
          </div>

          {/* Countries hint */}
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke={T.textMuted} strokeWidth="1.4" />
              <path d="M7 3.5C5.3 4.2 4.5 5.5 4.5 7s.8 2.8 2.5 3.5M7 3.5C8.7 4.2 9.5 5.5 9.5 7s-.8 2.8-2.5 3.5M3.5 7h7M7 3.5v7" stroke={T.textMuted} strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <p style={{ fontSize: 11, color: T.textMuted, fontFamily: "Inter, sans-serif" }}>We support 190+ countries</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 pb-6 flex flex-col gap-3">
        <button onClick={canSend ? onSend : undefined}
          className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ height: 52, background: T.gold, opacity: canSend ? 1 : 0.5,
            fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "Inter, sans-serif" }}>
          Send Verification Code
        </button>
        <p className="text-center" style={{ fontSize: 10, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "14px" }}>
          By continuing you agree to our{" "}
          <span style={{ color: T.gold }}>Terms of Service</span>
          {" and "}
          <span style={{ color: T.gold }}>Privacy Policy</span>
        </p>
        <div className="flex justify-center pt-1">
          <div className="rounded-full" style={{ width: 134, height: 5, background: T.textPrimary }} />
        </div>
      </div>
    </div>
  );
}

// ─── Phase 2 Screen: OTP Verification ────────────────────────────────────────
function OTPScreen({ onVerify, onBack, onDifferent }: { onVerify: () => void; onBack: () => void; onDifferent: () => void }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(272);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(countdown / 60));
  const secs = String(countdown % 60).padStart(2, "0");
  const filled = digits.filter(Boolean).length;
  const isComplete = filled === 6;

  const handleChange = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
    if (next.every(d => d !== "")) setTimeout(onVerify, 300);
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  return (
    <div className="flex flex-col h-full justify-between" style={{ background: T.bg }}>
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 shrink-0" style={{ height: 56 }}>
          <button onClick={onBack} style={{ width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke={T.textPrimary} strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p style={{ fontSize: 17, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>Verify Number</p>
          <div style={{ width: 44 }} />
        </div>

        <div className="px-6 pt-4 flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "20px" }}>
              Enter the 6-digit code sent to{" "}
              <span style={{ color: T.textPrimary }}>+966 ●●● ●●● 789</span>
            </p>
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke={T.gold} strokeWidth="1.4" />
                <path d="M7 4V7.5L9 9.5" stroke={T.gold} strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: 13, color: T.gold, fontFamily: "Inter, sans-serif", lineHeight: "20px" }}>
                Code expires in {mins}:{secs}
              </p>
            </div>
          </div>

          {/* 6 boxes */}
          <div className="flex gap-2 justify-between">
            {digits.map((d, i) => {
              const isActive = i === filled && !isComplete;
              const isFilled = !!d;
              const isEmpty = !d && !isActive;
              return (
                <div key={i} className="relative flex items-center justify-center rounded-lg"
                  style={{
                    width: 52, height: 60, flexShrink: 0,
                    background: isEmpty ? T.surfaceEl : T.surface,
                    border: isActive ? `2px solid ${T.gold}` : `2px solid transparent`,
                  }}>
                  {isFilled
                    ? <div className="rounded-full" style={{ width: 8, height: 8, background: T.textPrimary }} />
                    : isActive
                    ? <div style={{ width: 2, height: 24, background: T.gold, borderRadius: 1 }} className="animate-pulse" />
                    : null
                  }
                  <input
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text" inputMode="numeric" maxLength={1}
                    value={d} onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    autoFocus={i === 0}
                  />
                </div>
              );
            })}
          </div>

          <p style={{ fontSize: 13, color: T.textMuted, fontFamily: "Inter, sans-serif", lineHeight: "20px", textAlign: "center" }}>
            Didn&apos;t receive a code?{" "}
            {countdown === 0
              ? <span style={{ color: T.gold, fontWeight: 600, cursor: "pointer" }} onClick={() => setCountdown(60)}>Resend</span>
              : <span>Resend in {countdown}s</span>
            }
          </p>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="px-6 pb-6 flex flex-col gap-3">
        <button onClick={isComplete ? onVerify : undefined}
          className="w-full flex items-center justify-center rounded-xl transition-all active:scale-95"
          style={{ height: 52, background: T.gold, opacity: isComplete ? 1 : 0.4,
            fontSize: 17, fontWeight: 600, color: T.bg, fontFamily: "Inter, sans-serif" }}>
          Verify
        </button>
        <button onClick={onDifferent}
          className="w-full flex items-center justify-center rounded-xl h-[52px]"
          style={{ background: "transparent", fontSize: 17, fontWeight: 600, color: T.gold, fontFamily: "Inter, sans-serif" }}>
          Try a different number
        </button>
        <div className="flex justify-center pt-1">
          <div className="rounded-full" style={{ width: 134, height: 5, background: T.textPrimary }} />
        </div>
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]             = useState<View>("splash");
  const [history, setHistory]       = useState<View[]>([]);
  const [activeTab, setActiveTab]   = useState<"home" | "azkar" | "settings">("home");
  const [activeCat, setActiveCat]   = useState<CategoryId>("morning");
  const [activeIdx, setActiveIdx]   = useState(0);
  const [darkMode, setDarkMode]     = useState(true);
  const [sessionStart, setSessionStart] = useState(Date.now());
  const [selectedLang, setSelectedLang] = useState("en");

  // completed[cat] = Set of zikr indices that have been tapped to completion
  const [completed, setCompleted]   = useState<Record<CategoryId, Set<number>>>({
    morning:      new Set<number>([0, 1, 2]),
    evening:      new Set<number>([0]),
    before_sleep: new Set<number>(),
  });

  // Apply theme class to root
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.documentElement.classList.toggle("light-mode", !darkMode);
  }, [darkMode]);

  const push = useCallback((to: View) => {
    setHistory(h => [...h, view]);
    setView(to);
  }, [view]);

  const pop = useCallback(() => {
    setHistory(h => {
      const prev = h[h.length - 1] ?? "home";
      setView(prev);
      return h.slice(0, -1);
    });
  }, []);

  const openCategory = (catId: CategoryId) => {
    setActiveCat(catId);
    setActiveTab("azkar");
    setHistory([]);
    setView("category");
  };

  const openReader = (catId: CategoryId, i: number) => {
    setActiveCat(catId);
    setActiveIdx(i);
    push("reader");
  };

  const openCounter = () => push("counter");

  const markComplete = (idx: number) => {
    setCompleted(prev => {
      const updated = new Set(prev[activeCat]);
      updated.add(idx);
      return { ...prev, [activeCat]: updated };
    });
    // auto advance to next or completion
    const azkar = getAzkarByCategory(activeCat);
    if (idx + 1 < azkar.length) {
      setActiveIdx(idx + 1);
      // stay on counter
    } else {
      setView("completion");
      setHistory([]);
    }
  };

  const goHome = () => { setView("home"); setActiveTab("home"); setHistory([]); };

  const handleNavTab = (tab: "home" | "azkar" | "settings") => {
    setActiveTab(tab);
    setHistory([]);
    if (tab === "home")     { setView("home"); }
    else if (tab === "azkar")   { setView("category"); }
    else if (tab === "settings") { setView("settings"); }
  };

  const showBottomNav = ["home", "category", "settings"].includes(view);
  // Arabic onboarding screens manage their own status bar; English onboarding is full-bleed
  const onboardViews: View[] = ["splash", "onboard1", "onboard2", "onboard3"];
  const showStatusBar = !onboardViews.includes(view);
  const azkar = getAzkarByCategory(activeCat);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#060A15" }}>
      {/* Phone frame */}
      <div className="relative flex flex-col overflow-hidden shadow-2xl"
        style={{ width: 390, height: 844, borderRadius: 44, background: T.bg }}>

        {/* iOS status bar — hidden on splash/onboarding (they manage their own) */}
        {showStatusBar && (
          <div className="flex items-center justify-between px-6 shrink-0" style={{ height: 44, paddingTop: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, fontFamily: "Inter, sans-serif" }}>9:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi size={12} style={{ color: T.textPrimary }} />
              <Volume2 size={12} style={{ color: T.textPrimary }} />
              <div className="relative" style={{ width: 22, height: 11 }}>
                <div className="absolute inset-0 rounded-sm" style={{ border: `1.5px solid ${T.textPrimary}`, opacity: 0.6 }} />
                <div className="absolute rounded-sm" style={{ top: 2, left: 2, right: 4, bottom: 2, background: T.textPrimary }} />
                <div className="absolute rounded-r-sm" style={{ right: -3, top: 3.5, width: 2, height: 4, background: T.textPrimary, opacity: 0.5 }} />
              </div>
            </div>
          </div>
        )}

        {/* Screen */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Phase 2 — onboarding flow */}
          {view === "splash" && (
            <SplashScreen onDone={() => {
              const isArabic = navigator.language.startsWith("ar");
              setView(isArabic ? "ar_onboard1" : "onboard1");
            }} />
          )}
          {view === "onboard1" && (
            <Onboarding1Screen
              onNext={() => setView("onboard2")}
              onSkip={() => { setView("home"); setActiveTab("home"); }}
            />
          )}
          {view === "onboard2" && (
            <Onboarding2Screen
              onNext={() => setView("onboard3")}
              onBack={() => setView("onboard1")}
            />
          )}
          {view === "onboard3" && (
            <Onboarding3Screen
              onNext={() => setView("language")}
              onBack={() => setView("onboard2")}
            />
          )}

          {/* Arabic onboarding — shown for Arabic-locale devices */}
          {view === "ar_onboard1" && (
            <ArOnboarding1Screen
              onNext={() => setView("ar_onboard2")}
              onSkip={() => { setView("language"); }}
            />
          )}
          {view === "ar_onboard2" && (
            <ArOnboarding2Screen
              onNext={() => setView("ar_onboard3")}
              onBack={() => setView("ar_onboard1")}
            />
          )}
          {view === "ar_onboard3" && (
            <ArOnboarding3Screen
              onNext={() => setView("language")}
              onBack={() => setView("ar_onboard2")}
            />
          )}

          {view === "language" && (
            <LanguageScreen
              onContinue={(lang) => { setSelectedLang(lang); setView("login"); }}
            />
          )}
          {view === "login" && (
            <LoginScreen
              onPhone={() => setView("phone")}
              onGuest={() => { setView("home"); setActiveTab("home"); setHistory([]); }}
            />
          )}
          {view === "phone" && (
            <PhoneInputScreen
              onSend={() => setView("otp")}
              onBack={() => setView("login")}
              onSkip={() => { setView("home"); setActiveTab("home"); setHistory([]); }}
            />
          )}
          {view === "otp" && (
            <OTPScreen
              onVerify={() => { setView("home"); setActiveTab("home"); setHistory([]); }}
              onBack={() => setView("phone")}
              onDifferent={() => setView("phone")}
            />
          )}

          {/* Phase 1 — core app */}
          {view === "home" && (
            <HomeScreen completed={completed} onCategory={openCategory} onSearch={() => push("search")} />
          )}
          {view === "category" && (
            <CategoryScreen catId={activeCat} completed={completed[activeCat]}
              onZikr={i => openReader(activeCat, i)} onBack={pop} />
          )}
          {view === "reader" && (
            <ReaderScreen catId={activeCat} idx={activeIdx}
              isDone={completed[activeCat]?.has(activeIdx) ?? false}
              onBack={pop}
              onCounter={() => { setSessionStart(Date.now()); openCounter(); }}
              onNext={() => { if (activeIdx < azkar.length - 1) setActiveIdx(i => i + 1); }}
              onPrev={() => { if (activeIdx > 0) setActiveIdx(i => i - 1); }}
            />
          )}
          {view === "counter" && (
            <CounterScreen catId={activeCat} idx={activeIdx}
              initialCount={completed[activeCat]?.has(activeIdx) ? azkar[activeIdx]?.repetitionCount ?? 0 : 0}
              onBack={pop}
              onComplete={markComplete}
              onPrev={() => { if (activeIdx > 0) setActiveIdx(i => i - 1); }}
              onNext={() => { if (activeIdx < azkar.length - 1) setActiveIdx(i => i + 1); }}
            />
          )}
          {view === "completion" && (
            <CompletionScreen catId={activeCat} sessionStart={sessionStart}
              onHome={goHome} onRepeat={() => { setView("category"); setHistory([]); }} />
          )}
          {view === "settings" && (
            <SettingsScreen darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} onBack={pop} />
          )}
          {view === "search" && (
            <SearchScreen onBack={pop} onZikr={(catId, i) => { openReader(catId, i); }} />
          )}
        </div>

        {/* Bottom nav */}
        {showBottomNav && <BottomNav active={activeTab} onChange={handleNavTab} />}
      </div>
    </div>
  );
}
