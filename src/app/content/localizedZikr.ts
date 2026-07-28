import type { AppLanguage, Zikr } from "../types";

/**
 * Editorial Arabic summaries for the benefit field. Keeping these separate from
 * the source data makes it harder to accidentally present a translation as part
 * of the original zikr or hadith text.
 */
const ARABIC_BENEFITS: Readonly<Record<string, string>> = {
  "Reciting Surah Al-Kafirun before sleeping is a disavowal and immunity from shirk (polytheism).":
    "قراءة سورة الكافرون قبل النوم براءة من الشرك.",
  "Make it the last supplication before sleep. If you die that night, you die upon natural faith (al-Fitrah).":
    "اجعله آخر ما تقول قبل النوم؛ فإن متّ من ليلتك متّ على الفطرة.",
  "Recited 34 times before sleeping.": "تُقال ٣٤ مرة قبل النوم.",
  "Recited when lying down to sleep.": "تُقال عند الاضطجاع للنوم.",
  "Completed to 100 with Tawhid following the 99 Tasbeehs.": "تمام المائة بالتوحيد عقب التسبيحات التسع والتسعين.",
  "Protects against self-harm, Satan, and wronging others.": "حماية وتأمين من شر النفس والشيطان والظلم.",
  "Expresses gratitude for life, food, and shelter before sleep.": "حمد وإقرار بنعم الحياة والطعام والإيواء قبل النوم.",
  "Recited 3 times with right hand under cheek.": "تُقال ٣ مرات مع وضع اليد اليمنى تحت الخد.",
  "Recited 33 times before sleeping.": "تُقال ٣٣ مرة قبل النوم.",
  "Recited 33 times after obligatory prayer.": "تُقال ٣٣ مرة عقب كل صلاة مكتوبة.",
  "Standard supplication when sleeping.": "دعاء نبوي عند النوم.",
  "Whoever recites the last two verses of Surah Al-Baqarah at night, they will suffice him.":
    "من قرأ الآيتين من آخر سورة البقرة في ليلة كفتاه.",
  "Surah Al-Mulk intercedes for its reciter until he is forgiven and protects against the torment of the grave.":
    "سورة الملك تشفع لصاحبها حتى يُغفر له، وتنجي من عذاب القبر.",
  "The Prophet ﷺ would not sleep until he recited Surah As-Sajdah and Surah Al-Mulk.":
    "كان النبي ﷺ لا ينام حتى يقرا سورتي السجدة والملك.",
  "Deep supplication for debt clearance and spiritual protection.": "دعاء جامع لقضاء الدين وحفظ الروح والنفس.",
  "Whoever recites Ayat Al-Kursi after each obligatory prayer, nothing prevents him from entering Paradise except death.":
    "من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.",
  "Whoever recites it when lying down to sleep, a guardian from Allah will remain with him and no devil will approach him until morning.":
    "من قرأها إذا أوى إلى فراشه لم يزل عليه من الله حافظ ولا يقربه شيطان حتى يصبح.",
  "Recited 33 times before sleeping (Hadith of Ali & Fatima).":
    "تُقال ٣٣ مرة قبل النوم (وصية النبي ﷺ لعلي وفاطمة رضي الله عنهما).",
  "Gathers palms, blows lightly into them, recites the 3 Surahs, then wipes over as much of the body as possible. Repeated 3 times.":
    "يجمع كفيه وينفث فيهما فيقرأ المعوذات الثلاث ثم يمسح بهما ما استطاع من جسده، يفعل ذلك ثلاث مرات.",
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
  "Recited before entering the toilet.": "يُقال قبل دخول الخلاء.",
  "Said upon exiting the restroom.": "يُقال عند الخروج من الخلاء.",
  "Recited upon leaving the toilet.": "يُقال عند الخروج من الخلاء.",
  "Recited after completing wudu — opens all eight gates of Paradise.":
    "يُقال بعد تمام الوضوء، وتُفتح له أبواب الجنة الثمانية.",
  "Recited after wudu.": "يُقال بعد الوضوء.",
  "Recited before eating.": "يُقال قبل تناول الطعام.",
  "Recited if forgotten at the start of eating.": "يُقال عند نسيان التسمية في أول الطعام.",
  "Recited after eating.": "يُقال بعد الانتهاء من الطعام.",
  "Recited after completing a meal.": "يُقال عقب الفراغ من الطعام.",
  "Recited when served food.": "دعاء يُقال عند تقديم الطعام.",
  "Dua for the host who served food/drink.": "دعاء للمضيف الذي قدم الطعام أو الشراب.",
  "Recited when hosted for Iftar or a meal.": "دعاء يُقال عند الإفطار أو الاستضافة للطعام.",
  "Said when wearing a garment.": "يُقال عند لبس الثوب.",
  "Said when putting on a new garment.": "يُقال عند لبس الثوب الجديد.",
  "Said to someone wearing a new garment.": "يُقال لمن لبس ثوبًا جديدًا.",
  "Said before undressing to shield from jinn.": "يُقال عند خلع الثوب للحجاب عن أعين الجن.",
  "Recited when mounting a vehicle.": "يُقال عند ركوب الدابة أو الوسيلة.",
  "Recited when setting out on travel.": "يُقال عند الشروع في السفر.",
  "Recited when setting out.": "يُقال عند الانطلاق.",
  "Recited when returning from travel.": "يُقال عند الرجوع من السفر.",
  "Recited upon returning from travel.": "يُقال عند القفول والرجوع من السفر.",
  "Recited upon entering a town or city.": "يُقال عند دخول القرية أو البلدة.",
  "Recited upon entering a village or town.": "يُقال عند دخول القرية أو المدينة.",
  "Comprehensive refuge against grief, debt, and hardship.": "تعوذ جامع من الهم والحزن والدين والغلَبَة.",
  "No Muslim supplicates with this in any distress except that Allah relieves him.":
    "ما دعا بها رجل مسلم في شيء قط إلا استجاب الله له.",
  "Remedy during severe emotional or spiritual distress.": "دواء وشكوى عند الشدة والكرب.",
  "Dua of the distressed person.": "دعوة المكروب.",
  "Recited 7 times; Allah will suffice him in whatever grieves him.":
    "يُقال ٧ مرات؛ كفاه الله ما أهمه من أمر الدنيا والآخرة.",
  "Removes anxiety and replaces sorrow with joy.": "يُذهب الله همه وحزنه وأبدله مكانه فرجًا وفرحًا.",
  "Place hand on painful area and repeat 7 times.": "يضع يده على الذي يلمس من جسده ويقولها ٧ مرات.",
  "Ruqyah dua for visiting a sick person.": "دعاء الرقية عند عيادة المريض.",
  "Prophetic ruqyah for healing and protection.": "رقية نبوية مباركة للشفاء والحفظ.",
  "Recited 7 times when visiting the sick.": "يُقال ٧ مرات عند عيادة المريض.",
  "Prophetic practice before sleep or when feeling ill.": "من هدي النبي ﷺ قبل النوم وعند الشكوى.",
  "Ruqyah Jibril recited for the Prophet ﷺ.": "رقية جبريل عليه السلام للنبي ﷺ.",
  "Complete Islamic greeting earning 30 rewards.": "السلام الإسلامي التام برصيد ثلاثين حسنة.",
  "Complete response to Islamic greeting.": "الرد التام على السلام الإسلامي.",
  "Obligatory response when a brother praises Allah after sneezing.": "دعاء تشميت العاطس إذا حمد الله.",
  "Sneezer's response to 'Yarhamukallah'.": "رد العاطس على من شمّته.",
  "Best expression of gratitude to someone doing a favor.": "أبلغ الثناء والنعماء لمن أدى معروفًا.",
  "Prophetic supplication of blessing for a Muslim.": "دعاء نبوي بالبركة للمسلم.",
  "Dua for a newly married couple.": "دعاء للمتزوج بالبركة والخير.",
  "Recited upon experiencing a calamity or loss.": "يُقال عند المصيبة أو الفقد لتخليف الخير.",
  "Dua upon visiting or hearing of a deceased Muslim.": "دعاء الاسترجاع للميت والتعزية.",
  "Recited when strong winds blow.": "يُقال عند هبوب الريح الشديدة.",
  "Recited when rain starts falling.": "يُقال عند نزول المطر.",
  "Recited after rain stops.": "يُقال بعد انقطاع المطر وانقضائه.",
  "Recited upon hearing thunder.": "يُقال عند سماع الرعد.",
  "Recited upon sighting the new crescent moon.": "يُقال عند رؤية الهلال.",
  "Recited during eclipse prayer.": "يُقال أثناء صلاة الكسوف والخسوف.",
  "Prophetic supplication for divine guidance and firmness.": "دعاء نبوي للثبات والهداية على الدين.",
  "100 times daily — equals freeing 10 slaves, grants 100 good deeds, erases 100 sins, shields from Shaytan.":
    "يُقال مائة مرة يوميًا؛ تعدل عتق عشر رقاب، وتُكتب له مائة حسنة، وتُمحى عنه مائة سيئة، وحرز من الشيطان.",
  "Forgives sins even if they are as abundant as the foam of the sea.": "تُحط بها الخطايا وإن كانت مثل زبد البحر.",
  "Two phrases light on the tongue, heavy on the balance, beloved to the Most Merciful.":
    "كلمتان خفيفتان على اللسان، ثقيلتان في الميزان، حبيبتان إلى الرحمن.",
  "Most comprehensive plea for protection in life and the afterlife.": "أعظم دعاء جامع للعافية في الدنيا والآخرة.",
  "A treasure from the treasures of Paradise.": "كنز من كنز الجنة.",
  "Gathers all goodness of this life and the next.": "دعاء يجمع خيرَي الدنيا والآخرة.",
  "The Master Supplication for Forgiveness. Whoever recites it with conviction during day or night and dies will enter Paradise.":
    "سيد الاستغفار؛ من قاله موقنًا به فمات من يومه أو ليلته دخل الجنة.",
  "Whoever recites it 3 times, nothing will harm him.": "من قاله ثلاث مرات لم يضره شيء.",
  "To be said before eating.": "يُقال قبل الطعام.",
  "Whoever says this after eating, his previous sins will be forgiven.": "من قاله بعد طعامه غُفر له ما تقدم من ذنبه.",
  "To be said when setting out on a journey.": "يُقال عند الشروع في السفر.",
  "Recited immediately after prayer.": "يُقال عقب الصلاة مباشرة.",
  "Affirmation of Tawhid following prayer.": "إقرار بالتوهيد عقب الصلاة.",
  "Declares complete submission to Allah's decree after prayer.": "إقرار بالتسليم المطلق لقضاء الله عقب الصلاة.",
  "Whoever says this after every prayer, his sins will be forgiven even if abundant as sea foam.":
    "من قاله دبر كل صلاة غُفرت خطاياه وإن كانت مثل زبد البحر.",
  "Advised by the Prophet to Mu'adh bin Jabal to recite after every prayer.":
    "وصية النبي ﷺ لمعاذ بن جبل أن يقوله دبر كل صلاة.",
  "Recited 3 times after concluding the prayer.": "يُقال ٣ مرات عقب الانتهاء من الصلاة المكتوبة.",
  "Recited 3 times after every obligatory prayer.": "يُقال ٣ مرات عقب كل صلاة مكتوبة.",
  "Recited 3 times after prayer for forgiveness and peace.": "يُقال ٣ مرات عقب الصلاة للاستغفار وطلب السلام.",
  "Recited 33 times after prayer.": "يُقال ٣٣ مرة عقب كل صلاة مكتوبة.",
  "Recited 33 times after prayer (or 34 times for Takbir).": "يُقال ٣٣ مرة عقب الصلاة (أو ٣٤ للتكبير).",
  "Recited 10 times after Fajr and Maghrib prayers.": "يُقال ١٠ مرات عقب صلاتي الفجر والمغرب.",
  "Comprehensive supplication after prayer.": "دعاء جامع يُقال عقب الصلاة.",
  "Whoever recites it after each obligatory prayer, nothing prevents him from entering Paradise except death.":
    "من قرأها دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت.",
  "Recited after Fajr prayer.": "يُقال عقب صلاة الفجر.",
  "Said before wudu.": "يُقال قبل الوضوء.",
  "Supplication during purification.": "دعاء يُقال أثناء الطهارة.",
  "Supplication upon completing wudu.": "دعاء يُقال عقب الفراغ من الوضوء.",
  "Supplication after wudu.": "دعاء يُقال بعد الوضوء.",
  "Supplication when putting on clothes.": "دعاء يُقال عند لبس الثوب.",
  "Supplication when undressing.": "دعاء يُقال عند خلع الثوب.",
  "Supplication for wearing new clothes.": "دعاء لبس الثوب الجديد.",
  "Supplication congratulated to one wearing new clothes.": "دعاء يُقال لمن لبس ثوبًا جديدًا.",
  "Supplication when boarding a vehicle or starting a journey.": "دعاء ركوب الدابة أو الشروع في السفر.",
  "Supplication during travel.": "دعاء يُقال أثناء السفر.",
  "Supplication upon returning from a journey.": "دعاء يُقال عند الرجوع من السفر.",
  "Supplication during times of distress or hardship.": "دعاء الكرب والشدة.",
  "Supplication in times of severe anxiety or distress.": "دعاء الهم والحزن والغم.",
  "Supplication when faced with an obstacle or difficult matter.": "دعاء تيسير الأمور الصعبة.",
  "Supplication for relief from debt and anxiety.": "دعاء قضاء الدين والهم.",
  "Supplication when visiting the sick.": "دعاء عيادة المريض.",
  "Supplication of Ruqyah for healing.": "دعاء الرقية الشرعية للشفاء.",
  "Ruqyah supplication for healing.": "دعاء الرقية الشرعية للشفاء.",
  "Supplication when experiencing bodily pain.": "دعاء يُقال عند الشعور بوجع في الجسد.",
  "Supplication when visiting graves.": "دعاء زيارة القبور.",
  "Supplication upon greeting another Muslim.": "دعاء رد السلام والتفشية.",
  "Supplication when thanking someone for a favor.": "دعاء يُقال لمن صنع إليك معروفًا.",
  "Supplication when sneezed and thanked.": "دعاء تشميت العاطس.",
  "Supplication upon seeing rain.": "دعاء يُقال عند نزول المطر.",
  "Supplication when hearing thunder.": "دعاء سماع الرعد.",
  "Supplication during strong winds.": "دعاء هبوب الريح.",
  "Supplication upon seeing the new crescent moon.": "دعاء رؤية الهلال.",
  "Supplication when entering a market.": "دعاء دخول السوق.",
  "Supplication before starting a gathering.": "دعاء البدء في المجلس.",
  "Kaffarat al-Majlis (expiation for a gathering).": "دعاء كفارة المجلس.",
};

const ARABIC_CITATION_NAMES: ReadonlyArray<readonly [string, string]> = [
  ["An-Nasa’i Amal al-Yawm wa al-Laylah", "النسائي، عمل اليوم والليلة"],
  ["Haythami Majmaʿ az-Zawa’id", "الهيثمي، مجمع الزوائد"],
  ["Sahih al-Jamiʿ", "صحيح الجامع"],
  ["Al-Adab al-Mufrad", "الأدب المفرد"],
  ["Hisn al-Muslim", "حصن المسلم"],
  ["Ibn as-Sunni", "ابن السني"],
  ["Ibn al-Sunni", "ابن السني"],
  ["At-Tabarani", "الطبراني"],
  ["Jami' at-Tirmidhi", "جامع الترمذي"],
  ["At-Tirmidhi", "الترمذي"],
  ["Sunan an-Nasa'i", "سنن النسائي"],
  ["Sunan an-Nasa’i", "سنن النسائي"],
  ["An-Nasa'i", "النسائي"],
  ["An-Nasa’i", "النسائي"],
  ["al-Kubra", "الكبرى"],
  ["Sahih al-Bukhari", "صحيح البخاري"],
  ["Al-Bukhari", "البخاري"],
  ["Sahih Muslim", "صحيح مسلم"],
  ["Sunan Abu Dawud", "سنن أبي داود"],
  ["Abu Dawud", "أبو داود"],
  ["Sunan Ibn Majah", "سنن ابن ماجه"],
  ["Ibn Majah", "ابن ماجه"],
  ["Ibn Hibban", "ابن حبان"],
  ["Al-Albani", "الألباني"],
  ["Mustadrak al-Hakim", "مستدرك الحاكم"],
  ["al-Hakim", "الحاكم"],
  ["Al-Hakim", "الحاكم"],
  ["Muwatta Imam Malik", "موطأ الإمام مالك"],
  ["Musnad Ahmad", "مسند أحمد"],
  ["Qur’an", "القرآن الكريم"],
  ["Quran", "القرآن الكريم"],
  ["Muslim", "مسلم"],
  ["Ahmad", "أحمد"],
  ["Various Sahih narrations.", "أحاديث صحيحة متفرقة."],
  ["Various Sahih narrations", "أحاديث صحيحة متفرقة"],
  ["Sahih", "صحيح"],
  ["Hasan", "حسن"],
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

const ARABIC_PREFERRED_TIMING: Readonly<Record<string, string>> = {
  "Morning: after Fajr until sunrise. Evening: after ‘Asr until sunset as a strong recommended dhikr sitting.":
    "تُقال في الصباح عقب صلاة الفجر حتى طلوع الشمس، وفي المساء عقب صلاة العصر حتى غروب الشمس.",
  "Morning after Fajr; evening after ‘Asr/sunset window.":
    "تُقال في الصباح بعد الفجر، وفي المساء بعد العصر وقبل الغروب.",
  "Recited 10 times after Fajr and Maghrib prayers; once after Dhuhr, 'Asr, and 'Isha.":
    "تُقال ١٠ مرات عقب صلاتي الفجر والمغرب، ومرة واحدة عقب الظهر والعصر والعشاء.",
  "Recited 3 times each after Fajr and Maghrib; once after Dhuhr, 'Asr, and 'Isha.":
    "تُقرأ ٣ مرات لكل سورة عقب صلاتي الفجر والمغرب، ومرة واحدة عقب الظهر والعصر والعشاء.",
  "Recited immediately after concluding any obligatory prayer.": "تُقال فور الانتهاء من الصلاة المكتوبة.",
  "Recited immediately after the 3 Istighfars following obligatory prayer.":
    "تُقال عقب الاستغفار الثلاثي دبر الصلاة المكتوبة.",
  "Advised by the Prophet ﷺ to recite after every obligatory prayer.": "وصية نبوية مباركة بالقراءة عقب كل صلاة مكتوبة.",
  "Recited 33 times each, followed by Tawhid, after every obligatory prayer.":
    "تُسبح وتُحمد وتُكبر ٣٣ مرة لكل منها، وتُختم بالتوهيد عقب كل صلاة مكتوبة.",
  "Recited after every obligatory prayer. Guaranteed entry to Paradise.":
    "تُقرأ عقب كل صلاة مكتوبة؛ حرز وأمان وموجبة للجنة.",
  "Recited before sleeping.": "تُقال عند الاضطجاع وقبل النوم.",
  "Recited upon waking up.": "تُقال فور الاستيقاظ من النوم.",
  "Recited when leaving the home.": "تُقال عند الخروج من المنزل.",
  "Recited when entering the home.": "تُقال عند دخول المنزل.",
  "Recited when walking to or entering the mosque.": "تُقال عند المشي إلى المسجد أو دخوله.",
  "Recited when exiting the mosque.": "تُقال عند الخروج من المسجد.",
  "Recited after completing wudu.": "تُقال عقب الفراغ من الوضوء.",
  "Recited before eating.": "تُقال قبل البدء في تناول الطعام.",
  "Recited after eating.": "تُقال عقب الانتهاء من الطعام.",
  "Recited when putting on clothes.": "تُقال عند لبس الثوب.",
  "Recited when setting out on a journey.": "تُقال عند الشروع في السفر.",
  "Recited in times of distress or anxiety.": "تُقال عند الكرب والهم والشدة.",
  "Recited when visiting a sick person.": "تُقال عند عيادة المريض.",
  "Recited upon seeing rain or hearing thunder.": "تُقال عند نزول المطر أو سماع الرعد.",
  "Upon rising in the morning; can be recited any time during the day.":
    "تُقال عند الاستيقاظ في الصباح، ويمكن قراءتها في أي وقت خلال اليوم.",
  "Upon rising in the morning.": "تُقال عند الاستيقاظ في الصباح.",
  "After Fajr / upon rising in the morning.": "تُقال بعد صلاة الفجر أو عند الاستيقاظ صباحاً.",
  "During the day; suitable to include in morning/evening routine.": "تُقال خلال اليوم؛ وتناسب أذكار الصباح والمساء.",
  "Morning and evening.": "تُقال في الصباح والمساء.",
  "Recited 10 times after Fajr and 10 times after Maghrib.": "تُقال ١٠ مرات بعد صلاة الفجر و١٠ مرات بعد صلاة المغرب.",
  "Morning after Fajr.": "تُقال في الصباح بعد صلاة الفجر.",
  "After ‘Asr/sunset window.": "تُقال في المساء بعد صلاة العصر وقبل الغروب.",
  "In the evening.": "تُقال في المساء.",
  "Before sleeping, after lying down.": "تُقال عند الاضطجاع وقبل النوم.",
  "When lying down to sleep.": "تُقال عند المأوى إلى الفراش والنوم.",
  "At night before sleeping.": "تُقال ليلاً قبل النوم.",
  "Before sleeping.": "تُقال قبل النوم.",
  "Before sleeping every night.": "تُقال كل ليلة قبل النوم.",
  "When lying down after dusting off the bed.": "تُقال عند الاضطجاع بعد نفض الفراش.",
  "When lying down, placing the right hand under the cheek.": "تُقال عند الاضطجاع مع وضع اليد اليمنى تحت الخد.",
  "Before sleeping; perform wudu, lie on the right side, and make this the final words.":
    "تُقال قبل النوم؛ بعد الوضوء والاضطجاع على الشق الأيمن، وتُجعل آخر ما يُقال.",
  "Recited after Fajr prayer.": "تُقال عقب صلاة الفجر.",
};

const GENERIC_PREFERRED_TIMINGS = new Set<string>([
  "Morning: after Fajr until sunrise. Evening: after ‘Asr until sunset as a strong recommended dhikr sitting.",
  "Morning after Fajr; evening after ‘Asr/sunset window.",
  "Morning after Fajr.",
  "After ‘Asr/sunset window.",
  "In the evening.",
  "Morning and evening.",
  "Upon rising in the morning; can be recited any time during the day.",
  "Upon rising in the morning.",
  "After Fajr / upon rising in the morning.",
  "During the day; suitable to include in morning/evening routine.",
]);

export function hasSpecificRecommendedTiming(zikr: Zikr): boolean {
  if (!zikr.preferredTiming) {
    return false;
  }
  return !GENERIC_PREFERRED_TIMINGS.has(zikr.preferredTiming);
}

export function getLocalizedPreferredTiming(zikr: Zikr, language: AppLanguage): string {
  if (!zikr.preferredTiming) {
    return "";
  }
  if (language === "en") {
    return zikr.preferredTiming;
  }
  return ARABIC_PREFERRED_TIMING[zikr.preferredTiming] ?? zikr.preferredTiming;
}
