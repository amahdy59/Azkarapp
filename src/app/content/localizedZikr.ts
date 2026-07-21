import type { AppLanguage, Zikr } from "../types";

/**
 * Editorial Arabic summaries for the benefit field. Keeping these separate from
 * the source data makes it harder to accidentally present a translation as part
 * of the original zikr or hadith text.
 */
const ARABIC_BENEFITS: Readonly<Record<string, string>> = {
  "Also appears in before-sleep adhkar.": "يرد هذا الذكر أيضًا ضمن أذكار ما قبل النوم.",
  "Authentic/Hasan as cited by Hisn al-Muslim/Sunnah.com.": "صححه أو حسنه أهل العلم كما هو موثق في حصن المسلم.",
  "Authenticated by al-Albani in Sahih al-Targhib wa al-Tarhib as cited in Hisn al-Muslim/Sunnah.com.":
    "صححه الألباني في صحيح الترغيب والترهيب، كما هو موثق في حصن المسلم.",
  "Authenticated by al-Albani in Sahih al-Tirmidhi as cited in Hisn al-Muslim/Sunnah.com.":
    "صححه الألباني في صحيح الترمذي، كما هو موثق في حصن المسلم.",
  "Duplicate wording with HM-85; retained here because Hisn lists it in before-sleep chapter too.":
    "هذا النص مماثل للذكر رقم ٨٥، وأُبقي هنا لأن حصن المسلم أورده أيضًا في باب أذكار النوم.",
  "Full Arabic text appears in HM-75.": "النص العربي الكامل وارد في الذكر رقم ٧٥.",
  "Full surah text not expanded to keep the workbook usable; recite from Qur’an.":
    "لم يُدرج نص السورتين كاملًا هنا؛ تُقرآن من المصحف.",
  "Full surah texts are already listed in morning/evening rows HM-76a/b/c.":
    "نصوص السور كاملة موجودة في أذكار الصباح والمساء، في الأذكار ٧٦ أ، ب، ج.",
  "Full verses are al-Baqarah 2:285-286.": "الآيتان الكاملتان هما خاتمة سورة البقرة (٢:٢٨٥–٢٨٦).",
  "Hasan according to al-Albani as cited in Hisn al-Muslim/Sunnah.com.": "حسنه الألباني كما هو موثق في حصن المسلم.",
  "Hasan according to Ibn Baz as cited in Hisn al-Muslim/Sunnah.com.": "حسنه الشيخ ابن باز كما هو موثق في حصن المسلم.",
  "Hasan chain according to Ibn al-Qayyim as cited in Hisn al-Muslim/Sunnah.com.":
    "إسناده حسن عند ابن القيم كما هو موثق في حصن المسلم.",
  "Hasan/Sahih as cited by Hisn al-Muslim/Sunnah.com.": "ورد بإسناد حسن أو صحيح كما هو موثق في حصن المسلم.",
  "Hisn notes: recite 100 times during the day.": "يُقال مائة مرة خلال اليوم كما ورد في حصن المسلم.",
  "Included as the opening item of the morning/evening chapter.": "ورد هذا الذكر في افتتاح باب أذكار الصباح والمساء.",
  "Included in Hisn al-Muslim; grading not displayed on the Sunnah.com page.":
    "أورده حصن المسلم، ولا تظهر درجة الحديث في صفحة المصدر.",
  "Make it the last supplication before sleep when possible.":
    "يُستحب أن يكون هذا الدعاء آخر ما يُقال قبل النوم عند الاستطاعة.",
  "One chain reliable (Jayyid) as cited by Hisn al-Muslim/Sunnah.com.": "أحد أسانيده جيد كما هو موثق في حصن المسلم.",
  "Recited together with al-Falaq and an-Nas three times each.":
    "تُقرأ سورة الإخلاص مع سورتي الفلق والناس ثلاث مرات لكل سورة.",
  "Recited together with al-Ikhlas and al-Falaq three times each.":
    "تُقرأ سورة الناس مع سورتي الإخلاص والفلق ثلاث مرات لكل سورة.",
  "Recited together with al-Ikhlas and an-Nas three times each.":
    "تُقرأ سورة الفلق مع سورتي الإخلاص والناس ثلاث مرات لكل سورة.",
  "Reported as accepted/authentic in cited sources; grading noted by Hisn al-Muslim/Sunnah.com.":
    "ورد مقبولًا أو صحيحًا في المصادر المذكورة، وبيّن حصن المسلم درجته.",
  "Sahih al-Bukhari and Sahih Muslim.": "رواه البخاري ومسلم في صحيحيهما.",
  "Sahih al-Bukhari.": "رواه البخاري في صحيحه.",
  "Sahih Muslim.": "رواه مسلم في صحيحه.",
  "Sahih/Hasan as cited by Hisn al-Muslim/Sunnah.com.": "ورد بإسناد صحيح أو حسن كما هو موثق في حصن المسلم.",
  "Same wording as HM-92 but with 100 count.": "نصه مماثل للذكر رقم ٩٢، لكن العدد هنا مائة مرة.",
  "Same wording as HM-93 but different count and virtue.": "نصه مماثل للذكر رقم ٩٣، مع اختلاف العدد والفضل الوارد.",
  "Use evening wording in the evening row.": "تُستخدم صيغة المساء عند قراءته في المساء.",
  "Use the evening wording in the evening row.": "تُستخدم صيغة المساء عند قراءته في المساء.",
  "Whoever says this will be forgiven, and if he supplicates Allah, his prayer will be answered; if he performs ablution and prays, his prayer will be accepted.":
    "من قاله غُفر له، وإن دعا استُجيب له، وإن توضأ وصلى قُبلت صلاته.",
  "When you say this, it will be said to you: 'You are guided, defended and protected.' The devil will go far away from you.":
    "من قاله يقال له: هديت وكفيت ووقيت، ويتنحى عنه الشيطان.",
  "To be said upon entering the home. The person should then greet his family.":
    "يُقال عند الدخول إلى المنزل، ثم يُسلّم على أهله.",
  "Upon entering the mosque. He will be protected from Satan for the rest of the day.":
    "يُقال عند دخول المسجد. ويُعصم من الشيطان سائر اليوم.",
  "To be said upon leaving the mosque.": "يُقال عند الخروج من المسجد.",
  "To be said immediately after concluding the prayer.": "يُقال فور الانتهاء من الصلاة المكتوبة.",
  "Reported by Al-Bukhari to be said after every obligatory prayer.": "رواه البخاري، ويُقال دبر كل صلاة مكتوبة.",
  "Said before entering the restroom.": "يُقال قبل دخول الخلاء.",
  "Said upon exiting the restroom.": "يُقال عند الخروج من الخلاء.",
  "To be said before eating.": "يُقال قبل الطعام.",
  "Whoever says this after eating, his previous sins will be forgiven.": "من قاله بعد طعامه غُفر له ما تقدم من ذنبه.",
  "To be said when setting out on a journey.": "يُقال عند الشروع في السفر.",
};

const ARABIC_CITATION_NAMES: ReadonlyArray<readonly [string, string]> = [
  ["An-Nasa’i Amal al-Yawm wa al-Laylah", "النسائي، عمل اليوم والليلة"],
  ["Haythami Majmaʿ az-Zawa’id", "الهيثمي، مجمع الزوائد"],
  ["Sahih al-Jamiʿ", "صحيح الجامع"],
  ["Al-Adab al-Mufrad", "الأدب المفرد"],
  ["Hisn al-Muslim", "حصن المسلم"],
  ["Ibn as-Sunni", "ابن السني"],
  ["At-Tabarani", "الطبراني"],
  ["At-Tirmidhi", "الترمذي"],
  ["An-Nasa’i", "النسائي"],
  ["Al-Bukhari", "البخاري"],
  ["Abu Dawud", "أبو داود"],
  ["Ibn Majah", "ابن ماجه"],
  ["Ibn Hibban", "ابن حبان"],
  ["Al-Albani", "الألباني"],
  ["Al-Hakim", "الحاكم"],
  ["Qur’an", "القرآن الكريم"],
  ["Muslim", "مسلم"],
  ["Ahmad", "أحمد"],
];

function formatArabicCitationNumerals(value: string) {
  return value.replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)] ?? digit);
}

export function getLocalizedZikrBenefit(zikr: Zikr, language: AppLanguage) {
  if (language === "en") {
    return zikr.benefit;
  }

  return ARABIC_BENEFITS[zikr.benefit] ?? "وردت فائدة هذا الذكر في المصدر المذكور أدناه.";
}

export function getLocalizedSourceReference(zikr: Zikr, language: AppLanguage) {
  if (language === "en") {
    return zikr.sourceReference;
  }

  let localized = zikr.sourceReference
    .replace(/(\d+)a\b/g, "$1أ")
    .replace(/\bno\.\s*/g, "رقم ")
    .replace(/\bin\b/g, "في")
    .replace(/\band\b/g, "و");
  for (const [englishName, arabicName] of ARABIC_CITATION_NAMES) {
    localized = localized.replaceAll(englishName, arabicName);
  }

  localized = localized.replaceAll(";", "؛").replaceAll(",", "،");

  return formatArabicCitationNumerals(localized);
}
