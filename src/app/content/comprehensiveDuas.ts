import type { ZikrDraft } from "../types";
import { applyContentReview } from "./contentReview";

/**
 * General reviewed collection: 20 essential items followed by optional additions.
 * Hadiths audited and expanded to full authentic texts from dorar.net.
 * Existing `friday-dua-*` IDs are retained because content IDs are stable contracts.
 */
const COMPREHENSIVE_DUA_DRAFTS: ZikrDraft[] = [
  {
    id: "comprehensive-duas-introduction",
    arabicText:
      "تضم هذه المجموعة أدعية جامعة صحيحة أو حسنة في الجملة، مع بيان سياق كل دعاء ودرجة ما يحتاج إلى تنبيه. يمكن قراءتها يوم الجمعة أو في أي وقت مناسب؛ وترتيبها تعليمي وعملي، وليس ترتيبًا تعبديًا ثابتًا.",
    transliteration: "",
    translation:
      "This collection contains comprehensive supplications with each dua's context and any necessary grading note. It may be read on Friday or at any suitable time; its order is educational and practical, not a prescribed ritual sequence.",
    benefit:
      "Use the collection as a flexible guide. Make personal supplications at any point, preserve context-specific timings, and never treat an unsupported count as Sunnah.",
    benefitArabic:
      "تُستخدم المجموعة دليلًا مرنًا؛ ويجوز الدعاء بالحاجة الخاصة وتكرار الدعاء دون اعتقاد عدد غير ثابت في السنة.",
    repetitionCount: 1,
    sourceReference: "Editorial guidance for the reviewed comprehensive dua collection.",
    sourceReferenceArabic: "ضوابط تحريرية للمجموعة المراجعة من الأدعية الجامعة.",
    hadithText: "هذه الأدعية ليست مخصوصة بيوم الجمعة، وترتيبها ليس ترتيبًا تعبديًا ثابتًا.",
    category: "comprehensive_duas",
    orderIndex: 0,
    isCollectionIntroduction: true,
    includedInCore: false,
  },
  {
    id: "friday-dua-01",
    arabicText:
      "اللهم صلِّ على محمد وعلى آل محمد، كما صليت على إبراهيم وعلى آل إبراهيم، إنك حميد مجيد، وبارك على محمد وعلى آل محمد، كما باركت على إبراهيم وعلى آل إبراهيم، إنك حميد مجيد.",
    transliteration: "",
    translation:
      "O Allah, bestow Your honor and favor upon Muhammad and the family of Muhammad, as You bestowed them upon Abraham and the family of Abraham. You are the Praiseworthy, the Glorious. Bless Muhammad and the family of Muhammad, as You blessed Abraham and the family of Abraham. You are the Praiseworthy, the Glorious.",
    benefit: "The Ibrahimic prayer taught by the Prophet ﷺ; Friday is a recommended time to increase prayers upon him.",
    benefitArabic:
      "الصلاة الإبراهيمية\n• صلِّ على محمد: أثنِ عليه في الملأ الأعلى وارفع ذكره.\n• بارك: أنزل الخير الدائم وزِده.\n• حميد مجيد: محمود في أفعاله، عظيم في صفاته.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 3370; Sunan Abu Dawud 1047.",
    sourceReferenceArabic:
      "علّمها النبي ﷺ للصحابة حين سألوه كيف يصلون عليه، كما أمر بالإكثار من الصلاة عليه يوم الجمعة. صحيح البخاري 3370، وسنن أبي داود 1047.",
    hadithText:
      "عن كعب بن عجرة رضي الله عنه قال: قيل: يا رسول الله، أما السلام عليك فقد عرفناه، فكيف الصلاة عليك؟ قال: «قولوا: اللهم صلِّ على محمد وعلى آل محمد، كما صليت على إبراهيم وعلى آل إبراهيم، إنك حميد مجيد، وبارك على محمد وعلى آل محمد، كما باركت على إبراهيم وعلى آل إبراهيم، إنك حميد مجيد». (أخرجه البخاري 3370، ومسلم 406). وعن أوس بن أوس رضي الله عنه قال: قال رسول الله ﷺ: «إن من أفضل أيامكم يوم الجمعة... فأكثروا عليّ من الصلاة فيه فإن صلاتكم معروضة عليّ». (أخرجه أبو داود 1047 وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 1,
    includedInCore: true,
  },
  {
    id: "friday-dua-02",
    arabicText:
      "اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك عليّ، وأبوء بذنبي، فاغفر لي، فإنه لا يغفر الذنوب إلا أنت.",
    transliteration: "",
    translation:
      "O Allah, You are my Lord; none has the right to be worshipped except You. You created me, and I am Your servant. I remain committed to my covenant and promise to You as far as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your blessings upon me, and I confess my sin, so forgive me, for no one forgives sins except You.",
    benefit: "The chief supplication for forgiveness, combining servitude, gratitude, confession, and hope.",
    benefitArabic:
      "سيد الاستغفار\n• عهدك: الالتزام بتوحيد الله وطاعته.\n• أبوء: أُقر وأعترف.\n• ما استطعت: بحسب قدرتي البشرية مع الاعتراف بالتقصير.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6306.",
    sourceReferenceArabic:
      "سماه النبي ﷺ أفضل صيغ الاستغفار، وبيّن فضله لمن يقوله صباحًا أو مساءً موقنًا به. صحيح البخاري 6306.",
    hadithText:
      "عن شداد بن أوس رضي الله عنه، عن النبي ﷺ قال: «سيد الاستغفار أن تقول: اللهم أنت ربي لا إله إلا أنت، خلقتني وأنا عبدك، وأنا على عهدك ووعدك ما استطعت، أعوذ بك من شر ما صنعت، أبوء لك بنعمتك عليّ، وأبوء بذنبي فاغفر لي؛ فإنه لا يغفر الذنوب إلا أنت». قال: «ومن قالها من النهار موقنًا بها، فمات من يومه قبل أن يمسي، فهو من أهل الجنة، ومن قالها من الليل وهو موقن بها، فمات قبل أن يصبح، فهو من أهل الجنة». (أخرجه البخاري 6306).",
    category: "comprehensive_duas",
    orderIndex: 2,
    includedInCore: true,
  },
  {
    id: "friday-dua-03",
    arabicText:
      "اللهم إني ظلمت نفسي ظلمًا كثيرًا، ولا يغفر الذنوب إلا أنت، فاغفر لي مغفرةً من عندك، وارحمني، إنك أنت الغفور الرحيم.",
    transliteration: "",
    translation:
      "O Allah, I have greatly wronged myself, and no one forgives sins except You. Grant me a special forgiveness from You and have mercy on me. You are truly the All-Forgiving, the Most Merciful.",
    benefit: "A concise confession of personal shortcomings and request for Allah's special forgiveness and mercy.",
    benefitArabic:
      "الاعتراف بالتقصير وطلب المغفرة\n• ظلمت نفسي: أضررت بها بالذنوب والتقصير.\n• مغفرة من عندك: مغفرة واسعة لا يستحقها العبد بعمله وحده.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 834.",
    sourceReferenceArabic:
      "طلب أبو بكر رضي الله عنه من النبي ﷺ دعاءً يقوله في صلاته، فعلّمه هذا الدعاء. صحيح البخاري 834.",
    hadithText:
      "عن أبي بكر الصديق رضي الله عنه أنه قال لرسول الله ﷺ: علّمني دعاءً أدعو به في صلاتي، قال: «قل: اللهم إني ظلمت نفسي ظلمًا كثيرًا، ولا يغفر الذنوب إلا أنت، فاغفر لي مغفرةً من عندك، وارحمني إنك أنت الغفور الرحيم». (أخرجه البخاري 834، ومسلم 2705).",
    category: "comprehensive_duas",
    orderIndex: 3,
    includedInCore: true,
  },
  {
    id: "friday-dua-04",
    arabicText: "ربنا آتنا في الدنيا حسنة، وفي الآخرة حسنة، وقنا عذاب النار.",
    transliteration: "",
    translation:
      "Our Lord, grant us what is good in this world and what is good in the Hereafter, and protect us from the punishment of the Fire.",
    benefit: "A comprehensive Qur'anic request for every good in this life and the Hereafter.",
    benefitArabic:
      "أجمع دعاء للدنيا والآخرة\n• حسنة الدنيا: كل خير نافع؛ كالإيمان والعافية والرزق والأسرة الصالحة.\n• حسنة الآخرة: المغفرة والنجاة والجنة.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6389; Sahih Muslim 2690.",
    sourceReferenceArabic: "كان من أكثر أدعية النبي ﷺ. صحيح البخاري 6389 وصحيح مسلم 2690.",
    hadithText:
      "عن أنس بن مالك رضي الله عنه قال: كان أكثر دعاء النبي ﷺ: «اللهم ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار». وكان أنس إذا أراد أن يدعو بدعوة دعا بها، فإذا أراد أن يدعو بدعاء دعا بها فيه. (أخرجه البخاري 6389، ومسلم 2690).",
    category: "comprehensive_duas",
    orderIndex: 4,
    includedInCore: true,
  },
  {
    id: "friday-dua-05",
    arabicText: "اللهم إني أسألك الهدى، والتقى، والعفاف، والغنى.",
    transliteration: "",
    translation:
      "O Allah, I ask You for true guidance, mindfulness of You, moral purity and restraint, and contented self-sufficiency.",
    benefit: "A concise request for guidance, mindfulness of Allah, moral restraint, and contentment.",
    benefitArabic:
      "دعاء الهداية والتقوى والعفاف\n• الهدى: معرفة الحق والعمل به.\n• التقى: اتخاذ ما يحمي من سخط الله.\n• العفاف: الامتناع عما لا يحل.\n• الغنى: غنى النفس والكفاية عن سؤال الناس.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2721.",
    sourceReferenceArabic: "من دعاء النبي ﷺ الجامع. صحيح مسلم 2721.",
    hadithText:
      "عن عبد الله بن مسعود رضي الله عنه، عن النبي ﷺ أنه كان يقول: «اللهم إني أسألك الهدى والتقى والعفاف والغنى». (أخرجه مسلم 2721).",
    category: "comprehensive_duas",
    orderIndex: 5,
    includedInCore: true,
  },
  {
    id: "friday-dua-06",
    arabicText: "اللهم أعنّي على ذكرك، وشكرك، وحسن عبادتك.",
    transliteration: "",
    translation: "O Allah, help me to remember You, to thank You, and to worship You in the best manner.",
    benefit: "A Prophetic request for help in remembering, thanking, and worshipping Allah well.",
    benefitArabic: "طلب العون على العبادة\n• حسن عبادتك: أداء العبادة بإخلاص ومتابعة وإتقان، لا مجرد كثرتها.",
    repetitionCount: 1,
    sourceReference: "Sunan Abu Dawud 1522.",
    sourceReferenceArabic:
      "أخذ النبي ﷺ بيد معاذ رضي الله عنه وأوصاه ألا يترك هذا الدعاء في دبر كل صلاة. سنن أبي داود 1522، صحيح.",
    hadithText:
      "عن معاذ بن جبل رضي الله عنه أن رسول الله ﷺ أخذ بيده وقال: «يا معاذ، والله إني لأحبك، والله إني لأحبك»، فقال: «أوصيك يا معاذ لا تدعنّ في دبر كل صلاة تقول: اللهم أعني على ذكرك وشكرك وحسن عبادتك». (أخرجه أبو داود 1522، والنسائي 1303، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 6,
    includedInCore: true,
  },
  {
    id: "friday-dua-07",
    arabicText: "يا مقلب القلوب، ثبّت قلبي على دينك.",
    transliteration: "",
    translation: "O Turner of hearts, keep my heart firm upon Your religion.",
    benefit: "A frequently recited Prophetic plea for a heart that remains firm upon the religion.",
    benefitArabic:
      "دعاء ثبات القلب\n• مقلب القلوب: الذي يصرف القلوب كيف يشاء.\n• الثبات: استمرار الإيمان والاستقامة مع تغير الأحوال.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 2140.",
    sourceReferenceArabic: "كان النبي ﷺ يكثر من هذا الدعاء. جامع الترمذي 2140، وقال الترمذي: حديث حسن.",
    hadithText:
      "عن أنس رضي الله عنه قال: كان رسول الله ﷺ يكثر أن يقول: «يا مقلب القلوب ثبت قلبي على دينك»، فقلت: يا رسول الله، آمنا بك وبما جئت به فهل تخاف علينا؟ قال: «نعم، إن القلوب بين إصبعين من أصابع الله يقلبها كيف يشاء». (أخرجه الترمذي 2140، وأحمد 12107، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 7,
    includedInCore: true,
  },
  {
    id: "friday-dua-08",
    arabicText: "اللهم مصرف القلوب، صرّف قلوبنا على طاعتك.",
    transliteration: "",
    translation: "O Director of hearts, direct our hearts toward obedience to You.",
    benefit: "A request for Allah to direct the heart steadily toward obedience.",
    benefitArabic:
      "صرف القلب إلى الطاعة\n• مصرف القلوب: المتصرف في ميول القلوب وإراداتها.\n• صرفها على الطاعة: ثبّتها ووجّهها إلى ما يرضيك.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2655.",
    sourceReferenceArabic: "من دعاء النبي ﷺ، رواه عبد الله بن عمرو رضي الله عنهما. صحيح مسلم 2655.",
    hadithText:
      "عن عبد الله بن عمرو بن العاص رضي الله عنهما أنه سمع رسول الله ﷺ يقول: «إن قلوب بني آدم كلها بين إصبعين من أصابع الرحمن، كقلب واحد، يصرفه حيث يشاء»، ثم قال رسول الله ﷺ: «اللهم مصرف القلوب صرف قلوبنا على طاعتك». (أخرجه مسلم 2655).",
    category: "comprehensive_duas",
    orderIndex: 8,
    includedInCore: true,
  },
  {
    id: "friday-dua-09",
    arabicText:
      "اللهم إني أعوذ بك من العجز والكسل، والجبن والبخل، والهرم، وعذاب القبر. اللهم آتِ نفسي تقواها، وزكِّها أنت خير من زكّاها، أنت وليها ومولاها. اللهم إني أعوذ بك من علم لا ينفع، ومن قلب لا يخشع، ومن نفس لا تشبع، ومن دعوة لا يُستجاب لها.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from helplessness, laziness, cowardice, miserliness, decrepit old age, and the punishment of the grave. O Allah, grant my soul its mindfulness of You and purify it; You are the best to purify it. You are its Guardian and Master. I seek refuge in You from knowledge that brings no benefit, a heart that has no humility, a soul that is never satisfied, and a supplication that is not answered.",
    benefit:
      "A comprehensive plea for purification of the soul and protection from disabling traits and an unresponsive heart.",
    benefitArabic:
      "تزكية النفس والاستعاذة من القلب الغافل\n• العجز: عدم القدرة على فعل الخير.\n• الكسل: ترك الخير مع القدرة عليه.\n• زكِّها: طهّرها ونمِّ فيها الإيمان.\n• نفس لا تشبع: نفس يسيطر عليها الطمع.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2722.",
    sourceReferenceArabic: "من الأدعية النبوية الجامعة. صحيح مسلم 2722.",
    hadithText:
      "عن زيد بن أرقم رضي الله عنه قال: لا أقول لكم إلا كما كان رسول الله ﷺ يقول؛ كان يقول: «اللهم إني أعوذ بك من العجز والكسل، والجبن والبخل، والهرم وعذاب القبر، اللهم آت نفسي تقواها، وزكها أنت خير من زكاها، أنت وليها ومولاها، اللهم إني أعوذ بك من علم لا ينفع، ومن قلب لا يخشع، ومن نفس لا تشبع، ومن دعوة لا يستجاب لها». (أخرجه مسلم 2722).",
    category: "comprehensive_duas",
    orderIndex: 9,
    includedInCore: true,
  },
  {
    id: "friday-dua-10",
    arabicText:
      "اللهم أصلح لي ديني الذي هو عصمة أمري، وأصلح لي دنياي التي فيها معاشي، وأصلح لي آخرتي التي فيها معادي، واجعل الحياة زيادةً لي في كل خير، واجعل الموت راحةً لي من كل شر.",
    transliteration: "",
    translation:
      "O Allah, set right my religion, which safeguards all my affairs. Set right my worldly life, in which I live and earn my livelihood. Set right my Hereafter, to which I will return. Make life an increase for me in every good, and make death a relief for me from every evil.",
    benefit: "A comprehensive request to set right one's religion, worldly life, and final return.",
    benefitArabic:
      "إصلاح الدين والدنيا والآخرة\n• عصمة أمري: ما يحفظ شؤوني من الفساد والضياع.\n• معاشي: حياتي وأسباب رزقي.\n• معادي: مرجعي ومصيري بعد الموت.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2720.",
    sourceReferenceArabic: "من دعاء النبي ﷺ. صحيح مسلم 2720.",
    hadithText:
      "عن أبي هريرة رضي الله عنه قال: كان رسول الله ﷺ يقول: «اللهم أصلح لي ديني الذي هو عصمة أمري، وأصلح لي دنياي التي فيها معاشي، وأصلح لي آخرتي التي فيها معادي، واجعل الحياة زيادة لي في كل خير، واجعل الموت راحة لي من كل شر». (أخرجه مسلم 2720).",
    category: "comprehensive_duas",
    orderIndex: 10,
    includedInCore: true,
  },
  {
    id: "friday-dua-11",
    arabicText:
      "اللهم إني أسألك العافية في الدنيا والآخرة، اللهم إني أسألك العفو والعافية في ديني ودنياي، وأهلي ومالي، اللهم استر عوراتي، وآمِن روعاتي، اللهم احفظني من بين يديّ، ومن خلفي، وعن يميني، وعن شمالي، ومن فوقي، وأعوذ بعظمتك أن أُغتال من تحتي.",
    transliteration: "",
    translation:
      "O Allah, I ask You for well-being and protection in this world and the Hereafter. I ask You for pardon and well-being in my religion, worldly life, family, and property. Conceal my faults and calm my fears. Guard me from in front, from behind, from my right, from my left, and from above; and I seek refuge in Your greatness from being unexpectedly destroyed from beneath me.",
    benefit: "A daily Prophetic request for pardon, well-being, calm, and protection from every direction.",
    benefitArabic:
      "العفو والعافية والحفظ\n• العافية: السلامة والحماية في الدين والبدن والحياة.\n• عوراتي: عيوبي وما أخشى انكشافه.\n• روعاتي: مخاوفي وفزعي.\n• أغتال من تحتي: يصيبني هلاك مفاجئ من أسفل، كالخسف.",
    repetitionCount: 1,
    sourceReference: "Sunan Abu Dawud 5074.",
    sourceReferenceArabic: "لم يكن النبي ﷺ يترك هذا الدعاء صباحًا ولا مساءً. سنن أبي داود 5074، صحيح.",
    hadithText:
      "عن عبد الله بن عمر رضي الله عنهما قال: لم يكن رسول الله ﷺ يدع هؤلاء الدعوات حين يمسي وحين يصبح: «اللهم إني أسألك العافية في الدنيا والآخرة، اللهم إني أسألك العفو والعافية في ديني ودنياي وأهلي ومالي، اللهم استر عوراتي وآمن روعاتي، اللهم احفظني من بين يدي ومن خلفي وعن يميني وعن شمالي ومن فوقي، وأعوذ بعظمتك أن أغتال من تحتي». (أخرجه أبو داود 5074، وابن ماجه 3871، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 11,
    includedInCore: true,
  },
  {
    id: "friday-dua-12",
    arabicText: "اللهم رحمتك أرجو، فلا تكلني إلى نفسي طرفة عين، وأصلح لي شأني كله، لا إله إلا أنت.",
    transliteration: "",
    translation:
      "O Allah, it is Your mercy that I hope for. Do not leave me to myself even for the blink of an eye. Set right every part of my affairs. None has the right to be worshipped except You.",
    benefit: "A supplication for distress that places hope in Allah's mercy and asks Him to set every affair right.",
    benefitArabic:
      "دعاء المكروب\n• لا تكلني إلى نفسي: لا تتركني معتمدًا على قوتي وتدبيري وحدي.\n• طرفة عين: أقصر لحظة.\n• شأني كله: ديني ودنياي وقلبي وأسرتي وعملي.",
    repetitionCount: 1,
    sourceReference: "Sunan Abu Dawud 5090.",
    sourceReferenceArabic:
      "وصف في الرواية بأنه من أدعية المكروب. سنن أبي داود 5090، وإسناده حسن في تقييم الألباني المعروض بالمصدر.",
    hadithText:
      "عن أبي بكرة نفيع بن الحارث رضي الله عنه، أن رسول الله ﷺ قال: «دعوات المكروب: اللهم رحمتك أرجو فلا تكلني إلى نفسي طرفة عين، وأصلح لي شأني كله لا إله إلا أنت». (أخرجه أبو داود 5090، وأحمد 20430، وحسنه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 12,
    includedInCore: true,
  },
  {
    id: "friday-dua-13",
    arabicText: "اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والجبن والبخل، وغلبة الدين وقهر الرجال.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from anxiety and grief, helplessness and laziness, cowardice and miserliness, the crushing burden of debt, and being overpowered by people.",
    benefit: "A Prophetic refuge from anxiety, grief, helplessness, laziness, debt, and oppression.",
    benefitArabic:
      "الاستعاذة من الهم والحزن والدَّين\n• الهم: انشغال القلب بما يُخشى وقوعه.\n• الحزن: الألم على ما وقع أو فات.\n• غلبة الدين: أن يثقل الدين صاحبه ولا يستطيع سداده.\n• قهر الرجال: تسلط الناس وظلمهم.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6369.",
    sourceReferenceArabic: "كان النبي ﷺ يدعو به، وعلّمه لمن أثقلته الهموم والديون. صحيح البخاري 6369.",
    hadithText:
      "عن أنس بن مالك رضي الله عنه قال: كنت أخدم رسول الله ﷺ إذا نزل، فكنت أسمعه يكثر أن يقول: «اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والبخل والجبن، وضلع الدين، وغلبة الرجال». (أخرجه البخاري 6369).",
    category: "comprehensive_duas",
    orderIndex: 13,
    includedInCore: true,
  },
  {
    id: "friday-dua-14",
    arabicText: "اللهم إني أعوذ بك من زوال نعمتك، وتحول عافيتك، وفجاءة نقمتك، وجميع سخطك.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from the disappearance of Your blessings, the loss of the well-being You have granted, the sudden arrival of Your punishment, and everything that brings Your displeasure.",
    benefit: "A refuge from lost blessings, lost well-being, sudden punishment, and all that displeases Allah.",
    benefitArabic:
      "الحماية من زوال النعم\n• تحول عافيتك: تغير السلامة إلى مرض أو بلاء.\n• فجاءة نقمتك: حلول العقوبة على نحو مفاجئ.\n• سخطك: غضبك وعدم رضاك.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2739.",
    sourceReferenceArabic: "من دعاء النبي ﷺ. صحيح مسلم 2739.",
    hadithText:
      "عن عبد الله بن عمر رضي الله عنهما قال: كان من دعاء رسول الله ﷺ: «اللهم إني أعوذ بك من زوال نعمتك، وتحول عافيتك، وفجاءة نقمتك، وجميع سخطك». (أخرجه مسلم 2739).",
    category: "comprehensive_duas",
    orderIndex: 14,
    includedInCore: true,
  },
  {
    id: "friday-dua-15",
    arabicText: "اللهم إني أعوذ بك من جهد البلاء، ودَرَك الشقاء، وسوء القضاء، وشماتة الأعداء.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from unbearable trials, being overtaken by misery, an evil outcome in what is decreed, and enemies rejoicing at my misfortune.",
    benefit: "A refuge from unbearable trials, misery, harmful outcomes, and an enemy's rejoicing.",
    benefitArabic:
      "الاستعاذة من شدة البلاء\n• جهد البلاء: البلاء الشاق الذي يبلغ بالإنسان غاية المشقة.\n• درك الشقاء: أن يلحق بالإنسان الشقاء ويحيط به.\n• شماتة الأعداء: فرح العدو بما يصيب الإنسان من مصيبة.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6347.",
    sourceReferenceArabic: "كان النبي ﷺ يتعوذ من هذه الأربع. صحيح البخاري 6347.",
    hadithText:
      "عن أبي هريرة رضي الله عنه قال: كان رسول الله ﷺ يتعوذ من جهد البلاء، ودرك الشقاء، وسوء القضاء، وشماتة الأعداء. (أخرجه البخاري 6347، ومسلم 2707).",
    category: "comprehensive_duas",
    orderIndex: 15,
    includedInCore: true,
  },
  {
    id: "friday-dua-16",
    arabicText:
      "اللهم إني أسألك من الخير كله، عاجله وآجله، ما علمت منه وما لم أعلم، وأعوذ بك من الشر كله، عاجله وآجله، ما علمت منه وما لم أعلم. اللهم إني أسألك من خير ما سألك عبدك ونبيك، وأعوذ بك من شر ما عاذ به عبدك ونبيك. اللهم إني أسألك الجنة وما قرّب إليها من قول أو عمل، وأعوذ بك من النار وما قرّب إليها من قول أو عمل، وأسألك أن تجعل كل قضاء قضيته لي خيرًا.",
    transliteration: "",
    translation:
      "O Allah, I ask You for every kind of good, immediate and future, known to me and unknown to me. I seek refuge in You from every kind of evil, immediate and future, known to me and unknown to me. I ask You for the good sought by Your servant and Prophet, and I seek refuge in You from the evil from which Your servant and Prophet sought refuge. I ask You for Paradise and for every word or deed that draws me near to it. I seek refuge in You from the Fire and every word or deed that draws me near to it. Make every decree You determine for me ultimately good.",
    benefit: "A comprehensive request for every known and unknown good, Paradise, and a good outcome in every decree.",
    benefitArabic:
      "الدعاء الجامع لكل الخير\n• عاجله وآجله: ما يأتي قريبًا وما يأتي مستقبلًا أو في الآخرة.\n• قضاء قضيته: ما قدّره الله ووقع بإرادته.\n• اجعله خيرًا: اجعل عاقبته نافعة مباركة، ولو خفي وجه الخير أولًا.",
    repetitionCount: 1,
    sourceReference: "Sunan Ibn Majah 3846.",
    sourceReferenceArabic: "علّمه النبي ﷺ لعائشة رضي الله عنها. سنن ابن ماجه 3846، مصنف صحيح في المصدر.",
    hadithText:
      "عن عائشة رضي الله عنها، أن رسول الله ﷺ علمها هذا الدعاء: «اللهم إني أسألك من الخير كله عاجله وآجله ما علمت منه وما لم أعلم، وأعوذ بك من الشر كله عاجله وآجله ما علمت منه وما لم أعلم، اللهم إني أسألك من خير ما سألك عبدك ونبيك، وأعوذ بك من شر ما عاذ به عبدك ونبيك، اللهم إني أسألك الجنة وما قرب إليها من قول أو عمل، وأعوذ بك من النار وما قرب إليها من قول أو عمل، وأسألك أن تجعل كل قضاء قضيته لي خيرا». (أخرجه ابن ماجه 3846، وأحمد 25019، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 16,
    includedInCore: true,
  },
  {
    id: "friday-dua-17",
    arabicText:
      "اللهم بعلمك الغيب، وقدرتك على الخلق، أحيني ما علمت الحياة خيرًا لي، وتوفني إذا علمت الوفاة خيرًا لي. اللهم وأسألك خشيتك في الغيب والشهادة، وكلمة الحق في الرضا والغضب، وأسألك القصد في الفقر والغنى، ونعيمًا لا ينفد، وقرة عين لا تنقطع، والرضا بعد القضاء، وبرد العيش بعد الموت، ولذة النظر إلى وجهك، والشوق إلى لقائك، في غير ضراء مضرة، ولا فتنة مضلة. اللهم زيّنا بزينة الإيمان، واجعلنا هداة مهتدين.",
    transliteration: "",
    translation:
      "O Allah, by Your knowledge of the unseen and Your power over creation, keep me alive for as long as You know life to be better for me, and cause me to die when You know death to be better for me. Grant me reverent fear of You in private and in public, truthful speech in contentment and anger, and moderation in poverty and wealth. I ask You for delight that never ends, joy that never ceases, contentment after Your decree, comfort after death, the delight of looking upon Your Face, and longing to meet You—without a harmful calamity or a misleading trial. Adorn us with faith, and make us rightly guided people who guide others.",
    benefit:
      "A request for a faithful life and ending, truthful balance, lasting delight, contentment, and longing to meet Allah.",
    benefitArabic:
      "دعاء حسن الخاتمة والرضا والشوق إلى الله\n• القصد: الاعتدال بلا إسراف ولا تقتير.\n• قرة عين: سرور ثابت تسكن به النفس.\n• برد العيش: طيب الحياة وراحتها.\n• ضراء مضرة: مصيبة تجر ضررًا في الدين.\n• فتنة مضلة: اختبار يؤدي إلى الانحراف.",
    repetitionCount: 1,
    sourceReference: "Sunan an-Nasa'i 1305.",
    sourceReferenceArabic: "من دعاء سمعه عمار بن ياسر رضي الله عنه من النبي ﷺ في الصلاة. سنن النسائي 1305، حسن.",
    hadithText:
      "عن عمار بن ياسر رضي الله عنه أنه صلى صلاة فأوجز فيها، فقالوا له: خففت أو أوجزت الصلاة؟ فقال: أما إنه على ذلك قد دعوت فيها بدعوات سمعتهن من رسول الله ﷺ، فلما قام تبعه رجل فسأله عن الدعاء ثم جاء فأخبر القوم به: «اللهم بعلمك الغيب وقدرتك على الخلق أحيني ما علمت الحياة خيرا لي وتوفني إذا علمت الوفاة خيرا لي، اللهم وأسألك خشيتك في الغيب والشهادة، وكلمة الحق في الرضا والغضب، والقصد في الفقر والغنى، ونعيما لا ينفد، وقرة عين لا تنقطع، والرضا بعد القضاء، وبرد العيش بعد الموت، ولذة النظر إلى وجهك والشوق إلى لقائك في غير ضراء مضرة ولا فتنة مضلة، اللهم زينا بزينة الإيمان واجعلنا هداة مهتدين». (أخرجه النسائي 1305، وأحمد 18325، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 17,
    includedInCore: true,
  },
  {
    id: "friday-dua-18",
    arabicText:
      "اللهم إني أسألك الثبات في الأمر، والعزيمة على الرشد، وأسألك شكر نعمتك، وحسن عبادتك، وأسألك قلبًا سليمًا، ولسانًا صادقًا، وأسألك من خير ما تعلم، وأعوذ بك من شر ما تعلم، وأستغفرك لما تعلم، إنك أنت علام الغيوب.",
    transliteration: "",
    translation:
      "O Allah, I ask You for steadfastness in all matters and firm resolve to follow what is right. I ask You to enable me to thank You for Your blessings and worship You well. Grant me a sound heart and a truthful tongue. I ask You for the good that You know, seek refuge in You from the evil that You know, and ask Your forgiveness for what You know. You are the One who fully knows all that is unseen.",
    benefit:
      "A request for steadfastness, sound resolve, gratitude, sincere worship, a sound heart, and a truthful tongue.",
    benefitArabic:
      "الثبات والعزيمة والقلب السليم\n• العزيمة على الرشد: الإرادة الجادة لاتباع الصواب.\n• قلب سليم: قلب سليم من الشرك والحقد والفساد.\n• علام الغيوب: العليم بكل ما غاب عن الخلق.",
    repetitionCount: 1,
    sourceReference: "Sunan an-Nasa'i 1304; Musnad Ahmad 17114.",
    sourceReferenceArabic: "حديث شداد بن أوس رضي الله عنه في السلسلة الصحيحة برقم 3228 وموقع الدرر السنية.",
    hadithText:
      "عن شداد بن أوس رضي الله عنه قال: قال لي رسول الله ﷺ: «يا شداد بن أوس، إذا رأيت الناس قد اكتنزوا الذهب والفضة، فاكنز هؤلاء الكلمات: اللهم إني أسألك الثبات في الأمر، والعزيمة على الرشد، وأسألك شكر نعمتك، وحسن عبادتك، وأسألك لسانًا صادقًا، وقلبًا سليمًا، وأسألك من خير ما تعلم، وأعوذ بك من شر ما تعلم، وأستغفرك لما تعلم، إنك أنت علام الغيوب». (أخرجه النسائي 1304، وأحمد 17114، والطبراني في الكبير 7135، وصححه الألباني في السلسلة الصحيحة 3228).",
    category: "comprehensive_duas",
    orderIndex: 18,
    includedInCore: true,
  },
  {
    id: "friday-dua-19",
    arabicText: "اللهم إني أسألك الجنة، وأعوذ بك من النار.",
    transliteration: "",
    translation: "O Allah, I ask You for Paradise, and I seek refuge in You from the Fire.",
    benefit: "The shortest comprehensive request for the greatest reward and protection from the greatest punishment.",
    benefitArabic: "سؤال الجنة والاستعاذة من النار\n• دعاء بالغ الاختصار يجمع أعظم مطلوب وأعظم ما يُستعاذ منه.",
    repetitionCount: 1,
    sourceReference: "Sunan Abu Dawud 792.",
    sourceReferenceArabic:
      "قالها رجل في صلاته، فأقرّه النبي ﷺ وقال إن أدعيته وأدعية معاذ تدور حول طلب الجنة والنجاة من النار. سنن أبي داود 792، صحيح.",
    hadithText:
      "عن بعض أصحاب النبي ﷺ أن النبي ﷺ قال لرجل: «كيف تقول في الصلاة؟»، قال: أتأهد وأقول: اللهم إني أسألك الجنة، وأعوذ بك من النار، أما إني لا أحسن دندنتك ولا دندنة معاذ، فقال النبي ﷺ: «حولها ندندن». (أخرجه أبو داود 792، وابن ماجه 910، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 19,
    includedInCore: true,
  },
  {
    id: "friday-dua-20",
    arabicText: "لا إله إلا أنت، سبحانك، إني كنت من الظالمين.",
    transliteration: "",
    translation:
      "None has the right to be worshipped except You. You are far above every imperfection. I have truly been among those who wronged themselves.",
    benefit:
      "The supplication of Yunus combines Allah's oneness, glorification, and honest acknowledgement of wrongdoing.",
    benefitArabic:
      "دعاء ذي النون\n• التوحيد: لا إله إلا أنت.\n• التنزيه: سبحانك.\n• الاعتراف بالتقصير: إني كنت من الظالمين.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3505.",
    sourceReferenceArabic:
      "هو دعاء يونس عليه السلام في بطن الحوت، وأخبر النبي ﷺ أن المسلم لا يدعو به في حاجة إلا استجاب الله له. جامع الترمذي 3505، صحيح.",
    hadithText:
      "عن سعد بن أبي وقاص رضي الله عنه قال: قال رسول الله ﷺ: «دعوة ذي النون إذ دعا وهو في بطن الحوت: لا إله إلا أنت سبحانك إني كنت من الظالمين، إنه لم يدعُ بها رجل مسلم في شيء قط إلا استجاب الله له». (أخرجه الترمذي 3505، وأحمد 1465، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 20,
    includedInCore: true,
  },
  {
    id: "friday-dua-21",
    arabicText:
      "اللهم اغفر لي خطيئتي وجهلي، وإسرافي في أمري، وما أنت أعلم به مني. اللهم اغفر لي جدي وهزلي، وخطئي وعمدي، وكل ذلك عندي. اللهم اغفر لي ما قدمت وما أخرت، وما أسررت وما أعلنت، وما أنت أعلم به مني، أنت المقدّم وأنت المؤخّر، وأنت على كل شيء قدير.",
    transliteration: "",
    translation:
      "O Allah, forgive my sins, my ignorance, my excesses in my affairs, and what You know about me better than I do. Forgive what I have done seriously and jokingly, mistakenly and deliberately—for all of that is present in me. Forgive what I have done before and what I may do later, what I have concealed and what I have made public, and whatever You know about me better than I do. You bring forward and You delay, and You have power over all things.",
    benefit: "A comprehensive request for forgiveness of known and hidden mistakes, whether deliberate or accidental.",
    benefitArabic:
      "الاستغفار من الخطأ والجهل والتقصير\n• إسرافي: تجاوزي للحد.\n• جدي وهزلي: ما صدر في حال الجد أو المزاح.\n• المقدم والمؤخر: الذي يقدم ويؤخر بحكمته.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6398.",
    sourceReferenceArabic: "من أدعية النبي ﷺ الجامعة في الاستغفار. صحيح البخاري 6398.",
    hadithText:
      "عن أبي موسى الأشعري رضي الله عنه، عن النبي ﷺ أنه كان يدعو بهذا الدعاء: «اللهم اغفر لي خطيئتي وجهلي، وإسرافي في أمري، وما أنت أعلم به مني، اللهم اغفر لي جدي وهزلي، وخطئي وعمدي، وكل ذلك عندي، اللهم اغفر لي ما قدمت وما أخرت، وما أسررت وما أعلنت، وما أنت أعلم به مني، أنت المقدم وأنت المؤخر، وأنت على كل شيء قدير». (أخرجه البخاري 6398، ومسلم 2719).",
    category: "comprehensive_duas",
    orderIndex: 21,
    includedInCore: false,
  },
  {
    id: "friday-dua-22",
    arabicText: "اللهم اغفر لي ذنبي كله، دقَّه وجلَّه، وأوله وآخره، وعلانيته وسره.",
    transliteration: "",
    translation:
      "O Allah, forgive all my sins: the small and the great, the first and the last, the public and the hidden.",
    benefit: "A request for forgiveness covering every sin: small or great, early or late, public or private.",
    benefitArabic: "الاستغفار من الذنوب كلها\n• دقّه وجلّه: صغيره وكبيره.\n• علانيته وسره: ما ظهر للناس وما خفي عنهم.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 483.",
    sourceReferenceArabic: "كان النبي ﷺ يقوله في السجود. صحيح مسلم 483.",
    hadithText:
      "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ كان يقول في سجوده: «اللهم اغفر لي ذنبي كله، دقه وجله، وأوله وآخره، وعلانيته وسره». (أخرجه مسلم 483).",
    category: "comprehensive_duas",
    orderIndex: 22,
    includedInCore: false,
  },
  {
    id: "friday-dua-23",
    arabicText:
      "اللهم إني أعوذ بك من البخل، وأعوذ بك من الجبن، وأعوذ بك أن أُرد إلى أرذل العمر، وأعوذ بك من فتنة الدنيا، وأعوذ بك من عذاب القبر.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from miserliness and cowardice, from being returned to the most feeble stage of old age, from the trials of worldly life, and from the punishment of the grave.",
    benefit: "A refuge from miserliness, cowardice, severe old age, worldly trials, and punishment in the grave.",
    benefitArabic:
      "الاستعاذة من البخل والجبن وأرذل العمر\n• أرذل العمر: الشيخوخة الشديدة المصحوبة بضعف العقل والبدن.\n• فتنة الدنيا: ما يختبر الدين من شهوات وشبهات ومصائب.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6365.",
    sourceReferenceArabic: "من الدعاء الذي كان النبي ﷺ يقوله. صحيح البخاري 6365.",
    hadithText:
      "عن مصعب بن سعد بن أبي وقاص رضي الله عنه قال: كان سعد يعلم بنيه هؤلاء الكلمات كما يعلم المعلم الغلمان الكتاب، ويقول: إن رسول الله ﷺ كان يتعوذ بهن دبر الصلاة: «اللهم إني أعوذ بك من البخل، وأعوذ بك من الجبن، وأعوذ بك أن أرد إلى أرذل العمر، وأعوذ بك من فتنة الدنيا، وأعوذ بك من عذاب القبر». (أخرجه البخاري 6365).",
    category: "comprehensive_duas",
    orderIndex: 23,
    includedInCore: false,
  },
  {
    id: "friday-dua-24",
    arabicText:
      "اللهم إني أعوذ بك من الكسل والهرم، والمأثم والمغرم، ومن فتنة القبر وعذاب القبر، ومن فتنة النار وعذاب النار، ومن شر فتنة الغنى، وأعوذ بك من فتنة الفقر، وأعوذ بك من فتنة المسيح الدجال. اللهم اغسل عني خطاياي بماء الثلج والبرد، ونقِّ قلبي من الخطايا كما نقيت الثوب الأبيض من الدنس، وباعد بيني وبين خطاياي كما باعدت بين المشرق والمغرب.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from laziness, decrepit old age, sin and burdensome debt; from the trial and punishment of the grave; from the trial and punishment of the Fire; from the harmful trial of wealth; from the trial of poverty; and from the trial of the False Messiah. Wash away my sins with the water of snow and hail. Purify my heart from sin as a white garment is cleansed of stains, and distance me from my sins as You have distanced the east from the west.",
    benefit:
      "A comprehensive refuge from sin, debt, the trials of the grave and Fire, wealth and poverty, and the False Messiah.",
    benefitArabic:
      "الاستعاذة من فتن القبر والنار والغنى والفقر\n• المأثم: الوقوع في الذنب.\n• المغرم: الدَّين أو الالتزام المالي الملازم.\n• فتنة الغنى: الطغيان والبطر أو استعمال المال في الحرام.\n• الدنس: الوسخ والعيب.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 6368.",
    sourceReferenceArabic: "النص الكامل من دعاء النبي ﷺ الوارد في صحيح البخاري 6368.",
    hadithText:
      "عن عائشة رضي الله عنها أن النبي ﷺ كان يدعو بهؤلاء الكلمات: «اللهم إني أعوذ بك من الكسل والهرم، والمأثم والمغرم، ومن فتنة القبر وعذاب القبر، ومن فتنة النار وعذاب النار، ومن شر فتنة الغنى، وأعوذ بك من فتنة الفقر، وأعوذ بك من فتنة المسيح الدجال، اللهم اغسل عني خطاياي بماء الثلج والبرد، ونق قلبي من الخطايا كما نقيت الثوب الأبيض من الدنس، وباعد بيني وبين خطاياي كما باعدت بين المشرق والمغرب». (أخرجه البخاري 6368، ومسلم 589).",
    category: "comprehensive_duas",
    orderIndex: 24,
    includedInCore: false,
  },
  {
    id: "friday-dua-25",
    arabicText:
      "اللهم باعد بيني وبين خطاياي كما باعدت بين المشرق والمغرب، اللهم نقِّني من خطاياي كما ينقّى الثوب الأبيض من الدنس، اللهم اغسلني من خطاياي بالماء والثلج والبرد.",
    transliteration: "",
    translation:
      "O Allah, distance me from my sins as You have distanced the east from the west. Purify me from my sins as a white garment is purified from stains. Wash away my sins with water, snow, and hail.",
    benefit: "A prayer for complete cleansing from sins and separation from their effects.",
    benefitArabic: "التنقية من الخطايا\n• صور التنقية بالماء والثلج والبرد تدل على كمال التطهير وإطفاء أثر الذنوب.",
    repetitionCount: 1,
    sourceReference: "Sahih al-Bukhari 744.",
    sourceReferenceArabic: "كان النبي ﷺ يقوله بعد تكبيرة الإحرام وقبل القراءة في الصلاة. صحيح البخاري 744.",
    hadithText:
      "عن أبي هريرة رضي الله عنه قال: كان رسول الله ﷺ يسكت بين التكبير وبين القراءة إسكاتة، فقلت: بأبي أنت وأمي يا رسول الله، أرأيت سكوتك بين التكبير والقراءة ما تقول؟ قال: «أقول: اللهم باعد بيني وبين خطاياي كما باعدت بين المشرق والمغرب، اللهم نقني من الخطايا كما ينقى الثوب الأبيض من الدنس، اللهم اغسل خطاياي بالماء والثلج والبرد». (أخرجه البخاري 744، ومسلم 598).",
    category: "comprehensive_duas",
    orderIndex: 25,
    includedInCore: false,
  },
  {
    id: "friday-dua-26",
    arabicText: "اللهم إني أعوذ بك من شر ما عملت، ومن شر ما لم أعمل.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from the evil consequences of what I have done and from the evil of what I have not yet done.",
    benefit: "A concise refuge from the consequences of past wrongdoing and future evil.",
    benefitArabic:
      "الاستعاذة من شر الأعمال\n• يشمل الاستعاذة من آثار الذنوب السابقة، ومن الوقوع مستقبلًا في أعمال الشر.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2716.",
    sourceReferenceArabic: "من دعاء النبي ﷺ. صحيح مسلم 2716.",
    hadithText:
      "عن فروة بن نوفل الأشجعي قال: سألت عائشة رضي الله عنها عما كان رسول الله ﷺ يدعو به الله، فقالت: كان يقول: «اللهم إني أعوذ بك من شر ما عملت، ومن شر ما لم أعمل». (أخرجه مسلم 2716).",
    category: "comprehensive_duas",
    orderIndex: 26,
    includedInCore: false,
  },
  {
    id: "friday-dua-27",
    arabicText:
      "اللهم لك أسلمت، وبك آمنت، وعليك توكلت، وإليك أنبت، وبك خاصمت. اللهم إني أعوذ بعزتك، لا إله إلا أنت، أن تضلني، أنت الحي الذي لا يموت، والجن والإنس يموتون.",
    transliteration: "",
    translation:
      "O Allah, to You I have submitted, in You I have believed, upon You I have relied, to You I have returned in repentance, and with Your aid I contend for the truth. I seek refuge in Your might—none has the right to be worshipped except You—from being led astray. You are the Ever-Living who never dies, while jinn and human beings die.",
    benefit:
      "A declaration of submission, faith, reliance, repentance, and dependence on Allah for protection from misguidance.",
    benefitArabic:
      "دعاء التوكل والإنابة والثبات\n• أنبت: رجعت إلى الله بالتوبة والطاعة.\n• بك خاصمت: بحجتك ومعونتك أدافع عن الحق.\n• أن تضلني: أن تتركني للضلال بسبب تقصيري.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2717.",
    sourceReferenceArabic: "دعاء ثابت عن النبي ﷺ. صحيح مسلم 2717.",
    hadithText:
      "عن عبد الله بن عباس رضي الله عنهما، أن رسول الله ﷺ كان يقول: «اللهم لك أسلمت، وبك آمنت، وعليك توكلت، وإليك أنبت، وبك خاصمت، اللهم إني أعوذ بعزتك، لا إله إلا أنت، أن تضلني، أنت الحي الذي لا يموت، والجن والإنس يموتون». (أخرجه البخاري 7383، ومسلم 2717).",
    category: "comprehensive_duas",
    orderIndex: 27,
    includedInCore: false,
  },
  {
    id: "friday-dua-28",
    arabicText:
      "اللهم رب جبرائيل وميكائيل وإسرافيل، فاطر السماوات والأرض، عالم الغيب والشهادة، أنت تحكم بين عبادك فيما كانوا فيه يختلفون، اهدني لما اختُلف فيه من الحق بإذنك، إنك تهدي من تشاء إلى صراط مستقيم.",
    transliteration: "",
    translation:
      "O Allah, Lord of Gabriel, Michael, and Israfil; Originator of the heavens and the earth; Knower of the unseen and the seen: You judge between Your servants regarding their disagreements. Guide me, by Your permission, to the truth concerning that over which people have differed. You guide whom You will to a straight path.",
    benefit: "The Prophetic opening for night prayer, asking for guidance to the truth amid disagreement.",
    benefitArabic:
      "دعاء افتتاح قيام الليل\n• فاطر: خالق على غير مثال سابق.\n• الغيب والشهادة: ما غاب وما ظهر.\n• بإذنك: بتوفيقك وإرادتك.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 770.",
    sourceReferenceArabic: "كان النبي ﷺ يفتتح به صلاة الليل. صحيح مسلم 770.",
    hadithText:
      "عن عائشة أم المؤمنين رضي الله عنها أنها سئلت: بأي شيء كان نبي الله ﷺ يفتتح صلاته إذا قام من الليل؟ قالت: كان إذا قام من الليل افتتح صلاته: «اللهم رب جبرائيل وميكائيل وإسرافيل، فاطر السماوات والأرض، عالم الغيب والشهادة، أنت تحكم بين عبادك فيما كانوا فيه يختلفون، اهدني لما اختلف فيه من الحق بإذنك، إنك تهدي من تشاء إلى صراط مستقيم». (أخرجه مسلم 770).",
    category: "comprehensive_duas",
    orderIndex: 28,
    includedInCore: false,
  },
  {
    id: "friday-dua-29",
    arabicText:
      "اللهم إني أعوذ برضاك من سخطك، وبمعافاتك من عقوبتك، وأعوذ بك منك، لا أحصي ثناءً عليك، أنت كما أثنيت على نفسك.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in Your pleasure from Your displeasure, in Your pardon and protection from Your punishment, and in You from what may come from You. I cannot fully enumerate Your praise; You are as You have praised Yourself.",
    benefit:
      "A profound refuge in Allah's pleasure, pardon, and protection while acknowledging that His praise cannot be exhausted.",
    benefitArabic:
      "الاستعاذة برضا الله وعفوه\n• بمعافاتك: بعفوك وسلامتك وحمايتك.\n• أعوذ بك منك: لا ملجأ من الله إلا إليه.\n• لا أحصي ثناء: لا أستطيع بلوغ غاية مدحك.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 486.",
    sourceReferenceArabic: "قاله النبي ﷺ في سجوده ليلًا. صحيح مسلم 486.",
    hadithText:
      "عن عائشة رضي الله عنها قالت: فقدت رسول الله ﷺ ليلة من الفراش فالتمسته فوقعت يدي على أخمص قدميه وهو في المسجد وهما منصوبتان وهو يقول: «اللهم إني أعوذ برضاك من سخطك، وبمعافاتك من عقوبتك، وأعوذ بك منك لا أحصي ثناء عليك أنت كما أثنيت على نفسك». (أخرجه مسلم 486).",
    category: "comprehensive_duas",
    orderIndex: 29,
    includedInCore: false,
  },
  {
    id: "friday-dua-30",
    arabicText:
      "اللهم اجعل في قلبي نورًا، وفي لساني نورًا، وفي سمعي نورًا، وفي بصري نورًا، ومن فوقي نورًا، ومن تحتي نورًا، وعن يميني نورًا، وعن شمالي نورًا، ومن أمامي نورًا، ومن خلفي نورًا، واجعل في نفسي نورًا، وأعظم لي نورًا.",
    transliteration: "",
    translation:
      "O Allah, place light in my heart, light upon my tongue, light in my hearing, and light in my sight. Place light above me and beneath me, to my right and to my left, in front of me and behind me. Place light within my soul, and grant me an ever-greater light.",
    benefit:
      "A request for the light of faith, insight, guidance, and righteousness throughout one's inner and outward life.",
    benefitArabic: "دعاء النور\n• النور يشمل نور الإيمان والبصيرة والقرآن والهداية وصلاح الجوارح.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 763.",
    sourceReferenceArabic: "ورد ضمن دعاء النبي ﷺ في قيام الليل وعند توجهه إلى صلاة الفجر. صحيح مسلم 763.",
    hadithText:
      "عن عبد الله بن عباس رضي الله عنهما قال: بت عند خالتي ميمونة، فقام النبي ﷺ من الليل فأتى طهوره ثم قام فصلى، فقام إلى جنبه الأيسر فأخذ بأذني فجعلني عن يمينه، فصلى ثلاث عشرة ركعة، ثم نام حتى نفخ، وكان إذا نام نفخ، فآذنه بلال بالصلاة فصلى ولم يتوضأ، وكان في دعائه: «اللهم اجعل في قلبي نورا، وفي لساني نورا، وفي سمعي نورا، وفي بصري نورا، ومن فوقي نورا، ومن تحتي نورا، وعن يميني نورا، وعن شمالي نورا، ومن أمامي نورا، ومن خلفي نورا، واجعل في نفسي نورا، وأعظم لي نورا». (أخرجه البخاري 6316، ومسلم 763).",
    category: "comprehensive_duas",
    orderIndex: 30,
    includedInCore: false,
  },
  {
    id: "friday-dua-31",
    arabicText:
      "اللهم فاطر السماوات والأرض، عالم الغيب والشهادة، رب كل شيء ومليكه، أشهد أن لا إله إلا أنت، أعوذ بك من شر نفسي، ومن شر الشيطان وشَرَكِه، وأن أقترف على نفسي سوءًا، أو أجرّه إلى مسلم.",
    transliteration: "",
    translation:
      "O Allah, Originator of the heavens and the earth, Knower of the unseen and the seen, Lord and Sovereign of everything: I testify that none has the right to be worshipped except You. I seek refuge in You from the evil within myself, from the evil and snares of Satan, from committing evil against myself, and from bringing it upon another Muslim.",
    benefit:
      "A morning, evening, and bedtime refuge from the evil of the self, Satan, and harming oneself or another Muslim.",
    benefitArabic:
      "الاستعاذة من النفس والشيطان\n• شَرَك الشيطان: حبائله ومكائده.\n• أقترف: أرتكب وأكتسب.\n• أجرّه إلى مسلم: أتسبب في إيصال الضرر أو الذنب إلى غيري.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3529.",
    sourceReferenceArabic: "علّمه النبي ﷺ لأبي بكر رضي الله عنه ليقوله صباحًا ومساءً وعند النوم.",
    hadithText:
      "عن أبي بكر الصديق رضي الله عنه أنه قال: يا رسول الله مرني بشيء أقوله إذا أصبحت وإذا أمسيت، قال: «قل: اللهم فاطر السماوات والأرض عالم الغيب والشهادة رب كل شيء ومليكه، أشهد أن لا إله إلا أنت، أعوذ بك من شر نفسي ومن شر الشيطان وشِركه، وأن أقترف على نفسي سوءًا أو أجرَّه إلى مسلم»، قال: «قلها إذا أصبحت، وإذا أمسيت، وإذا أخذت مضجعك». (أخرجه الترمذي 3529، وأبو داود 5067، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 31,
    includedInCore: false,
  },
  {
    id: "friday-dua-32",
    arabicText:
      "اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت. اللهم إني أعوذ بك من الكفر والفقر، وأعوذ بك من عذاب القبر، لا إله إلا أنت.",
    transliteration: "",
    translation:
      "O Allah, grant well-being to my body. O Allah, grant well-being to my hearing. O Allah, grant well-being to my sight. None has the right to be worshipped except You. I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You.",
    benefit:
      "A Prophetic request for bodily, hearing, and sight well-being and protection from disbelief, poverty, and grave punishment.",
    benefitArabic: "دعاء العافية في البدن والسمع والبصر\n• السلامة من الكفر والفقر وعذاب القبر.",
    repetitionCount: 1,
    sourceReference: "Sunan Abu Dawud 5090.",
    sourceReferenceArabic:
      "ورد أنه يقال ثلاث مرات صباحًا وثلاثًا مساءً. سنن أبي داود 5090، إسناده حسن بحسب الحكم المعروض في المصدر.",
    hadithText:
      "عن عبد الرحمن بن أبي بكرة أنه قال لأبيه: يا أبت، إني أسمعك تدعو كل غداة: اللهم عافني في بدني، اللهم عافني في سمعي، اللهم عافني في بصري، لا إله إلا أنت، تعيدها ثلاثًا حين تصبح، وثلاثًا حين تمسي، فقال: إني سمعت رسول الله ﷺ يدعو بهن فأنا أحب أن أستن بسنته. (أخرجه أبو داود 5090، وأحمد 20430، وحسنه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 32,
    includedInCore: false,
  },
  {
    id: "friday-dua-33",
    arabicText: "اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك.",
    transliteration: "",
    translation:
      "O Allah, make what You have permitted sufficient for me so that I have no need for what You have forbidden, and enrich me through Your favor so that I need no one besides You.",
    benefit: "A request for lawful sufficiency, freedom from the forbidden, and contentment through Allah's favor.",
    benefitArabic:
      "الاستغناء بالحلال وسداد الديون\n• اكفني بحلالك: ارزقني من الحلال ما يبعدني عن الحرام.\n• أغنني بفضلك: ارزقني الكفاية وغنى النفس.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3563.",
    sourceReferenceArabic:
      "علّمه علي رضي الله عنه لرجل أثقله الدَّين، وقال إن النبي ﷺ علّمه إياه. جامع الترمذي 3563، حسن.",
    hadithText:
      "عن علي بن أبي طالب رضي الله عنه أن مكاتبًا جاءه فقال: إني قد عجزت عن كتابتي فأعني، قال: ألا أعلمك كلمات علمنيهن رسول الله ﷺ لو كان عليك مثل جبل صبير دينًا أداه الله عنك؟ قال: «قل: اللهم اكفني بحلالك عن حرامك، وأغنني بفضلك عمن سواك». (أخرجه الترمذي 3563، وأحمد 1319، وحسنه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 33,
    includedInCore: false,
  },
  {
    id: "friday-dua-34",
    arabicText:
      "رب أعنّي ولا تعن عليّ، وانصرني ولا تنصر عليّ، وامكر لي ولا تمكر عليّ، واهدني ويسّر الهدى لي، وانصرني على من بغى عليّ. رب اجعلني لك شكّارًا، لك ذكّارًا، لك رهّابًا، لك مطواعًا، لك مخبتًا، إليك أوّاهًا منيبًا. رب تقبّل توبتي، واغسل حوبتي، وأجب دعوتي، وثبّت حجتي، وسدّد لساني، واهد قلبي، واسلل سخيمة صدري.",
    transliteration: "",
    translation:
      "My Lord, help me and do not aid anyone against me. Grant me victory and do not grant victory over me. Plan in my favor and do not allow plans to prevail against me. Guide me, make guidance easy for me, and support me against whoever wrongfully transgresses against me. Make me deeply thankful to You, constantly remembering You, reverently fearful of You, readily obedient to You, humbly submissive, tender-hearted, and continually returning to You. Accept my repentance, wash away my sin, answer my supplication, make my proof firm, guide my heart, direct my tongue to what is right, and remove all resentment from my chest.",
    benefit:
      "A comprehensive plea for help, guidance, repentance, truthful speech, a guided heart, and a chest free of resentment.",
    benefitArabic:
      "دعاء النصرة والتوبة وتطهير الصدر\n• امكر لي: دبّر لي ما يدفع مكر الظالمين.\n• شكّارًا وذكّارًا: كثير الشكر والذكر.\n• مخبتًا: خاضعًا مطمئنًا إلى الله.\n• أوّاهًا: كثير التضرع والخشية.\n• حوبتي: إثمي وذنبي.\n• اسلل سخيمة صدري: انزع ما في صدري من حقد وغل.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3551.",
    sourceReferenceArabic:
      "كان النبي ﷺ يدعو به. جامع الترمذي 3551، ووصفه الترمذي بأنه حسن صحيح، وصنّف صحيحًا في المصدر.",
    hadithText:
      "عن عبد الله بن عباس رضي الله عنهما قال: كان النبي ﷺ يدعو يقول: «رب أعني ولا تعن علي، وانصرني ولا تنصر علي، وامكر لي ولا تمكر علي، واهدني ويسر الهدى إلي، وانصرني على من بغى علي، رب اجعلني لك شكارًا، لك ذكارًا، لك رهاربًا، لك مطواعًا، لك مخبتًا، إليك أوّاهًا منيبًا، رب تقبل توبتي، واغسل حوبتي، وأجب دعوتي، وثبت حجتي، واهد قلبي، وسدد لساني، واسلل سخيمة صدري». (أخرجه الترمذي 3551، وأبو داود 1510، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 34,
    includedInCore: false,
  },
  {
    id: "friday-dua-35",
    arabicText: "اللهم إنك عفو تحب العفو فاعفُ عني.",
    transliteration: "",
    translation: "O Allah, You are the One who pardons completely, and You love to pardon, so pardon me.",
    benefit: "A concise request to Allah, the One who erases sins and loves to pardon, for complete pardon.",
    benefitArabic:
      "دعاء العفو\n• العفو: محو الذنب وآثاره، وهو أبلغ من مجرد الستر.\n• فاعف عني: امح ذنوبي ولا تؤاخذني بها.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3513.",
    sourceReferenceArabic:
      "علّمه النبي ﷺ لعائشة رضي الله عنها لتقوله في ليلة القدر. وهو دعاء صحيح عام المعنى، يجوز الدعاء به في الجمعة وغيرها، لكنه ليس مخصوصًا بيوم الجمعة. جامع الترمذي 3513، صحيح.",
    hadithText:
      "عن عائشة رضي الله عنها أنها قالت: يا رسول الله أرأيت إن علمت أي ليلة ليلة القدر ما أقول فيها؟ قال: «قولي: اللهم إنك عفو تحب العفو فاعف عني». (أخرجه الترمذي 3513، وابن ماجه 3850، وصححه الألباني).",
    category: "comprehensive_duas",
    orderIndex: 35,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-36",
    arabicText: "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي، وَارْزُقْنِي.",
    transliteration: "",
    translation: "O Allah, forgive me, have mercy on me, guide me, grant me well-being, and provide for me.",
    benefit:
      "Five essential needs in one concise supplication: forgiveness, mercy, guidance, well-being, and lawful provision.",
    benefitArabic:
      "دعاء جامع لخمس حاجات أساسية\n• عافني: ارزقني السلامة في الدين والبدن والحياة.\n• ارزقني: ارزقني رزقًا حلالًا نافعًا.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2697b.",
    sourceReferenceArabic: "صحيح مسلم 2697ب.",
    hadithText:
      "عن طارق بن أشيم الأشجعي رضي الله عنه قال: كان الرجل إذا أسلم علّمه النبي ﷺ الصلاة، ثم أمره أن يدعو بهذه الكلمات: «اللهم اغفر لي، وارحمني، واهدني، وعافني، وارزقني». (أخرجه مسلم 2697).",
    sourceUrl: "https://sunnah.com/muslim%3A2697b",
    attributionType: "taught_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 36,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-37",
    arabicText:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّكَ أَنْتَ اللَّهُ، الْأَحَدُ الصَّمَدُ، الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ.",
    transliteration: "",
    translation:
      "O Allah, I ask You by virtue of the fact that You are Allah, the One, the Self-Sufficient Master upon whom all depend; You neither beget nor were begotten, and none is equal or comparable to You.",
    benefit:
      "A man invoked Allah with these words, and the Prophet ﷺ confirmed that he had asked by Allah's Greatest Name. State your personal request after this invocation.",
    benefitArabic:
      "دعاء باسم الله الأعظم\n• الأحد: الواحد المتفرد.\n• الصمد: الكامل المقصود في الحوائج.\n• كفوًا: مثيلًا أو نظيرًا.",
    repetitionCount: 1,
    sourceReference: "Sunan Ibn Majah 3857; Sahih (Darussalam).",
    sourceReferenceArabic: "سنن ابن ماجه 3857؛ صحيح بحسب تصنيف دار السلام.",
    hadithText:
      "عن بريدة بن الحصيب رضي الله عنه، أن رسول الله ﷺ سمع رجلًا يقول: اللهم إني أسألك بأني أشهد أنك أنت الله لا إله إلا أنت الأحد الصمد الذي لم يلد ولم يولد ولم يكن له كفوًا أحد، فقال رسول الله ﷺ: «لقد سأل الله باسمه الأعظم الذي إذا سئل به أعطى، وإذا دعي به أجاب». (أخرجه أبو داود 1493، والترمذي 3475، وابن ماجه 3857، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/ibnmajah%3A3857",
    attributionType: "approved_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 37,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-38",
    arabicText:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ، لَا إِلَهَ إِلَّا أَنْتَ، وَحْدَكَ لَا شَرِيكَ لَكَ، الْمَنَّانُ، بَدِيعُ السَّمَاوَاتِ وَالْأَرْضِ، ذُو الْجَلَالِ وَالْإِكْرَامِ.",
    transliteration: "",
    translation:
      "O Allah, I ask You because all praise belongs to You. None has the right to be worshipped except You alone, without partner: the Bestower of abundant favors, the incomparable Originator of the heavens and the earth, the Possessor of majesty and honor.",
    benefit:
      "Another invocation approved by the Prophet ﷺ as asking Allah by His Greatest Name; it may be followed by one's personal request.",
    benefitArabic:
      "دعاء باسم الله الأعظم\n• المنان: كثير العطاء والإنعام.\n• بديع السماوات والأرض: خالقهما على غير مثال سابق.\n• ذو الجلال والإكرام: صاحب العظمة والفضل المطلق.",
    repetitionCount: 1,
    sourceReference: "Sunan Ibn Majah 3858; Hasan (Darussalam).",
    sourceReferenceArabic: "سنن ابن ماجه 3858؛ حسن بحسب تصنيف دار السلام.",
    hadithText:
      "عن أنس بن مالك رضي الله عنه أنه كان مع رسول الله ﷺ جالسًا ورجل يصلي ثم دعا: اللهم إني أسألك بأن لك الحمد لا إله إلا أنت المنان بديع السماوات والأرض يا ذا الجلال والإكرام يا حي يا قيوم، فقال النبي ﷺ: «لقد دعا الله باسمه العظيم الذي إذا دعي به أجاب، وإذا سئل به أعطى». (أخرجه أبو داود 1495، والترمذي 3544، وابن ماجه 3858، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/ibnmajah%3A3858",
    attributionType: "approved_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 38,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-39",
    arabicText: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي.",
    transliteration: "",
    translation: "O Allah, guide me and make me correct and steadfast in what I say and do.",
    benefit: "A concise request for both clear guidance and sound, straight conduct in decisions, speech, and action.",
    benefitArabic:
      "دعاء الهداية والسداد\n• اهدني: دلني على الطريق الصحيح ووفقني لاتباعه.\n• سددني: اجعل قولي وعملي وقراري مستقيمًا مصيبًا.",
    repetitionCount: 1,
    sourceReference: "Sahih Muslim 2725a.",
    sourceReferenceArabic: "صحيح مسلم 2725أ.",
    hadithText:
      "عن علي بن أبي طالب رضي الله عنه قال: قال لي رسول الله ﷺ: «قل: اللهم اهدني وسددني، واذكر بالهدى هدايتك الطريق، والسداد سداد السهم». (أخرجه مسلم 2725).",
    sourceUrl: "https://sunnah.com/muslim%3A2725a",
    attributionType: "taught_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 39,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-40",
    arabicText: "اللَّهُمَّ أَلْهِمْنِي رُشْدِي، وَأَعِذْنِي مِنْ شَرِّ نَفْسِي.",
    transliteration: "",
    translation: "O Allah, inspire me with sound guidance and protect me from the evil within my own soul.",
    benefit:
      "A request for sound judgment and protection from pride, desire, anger, negligence, and other harms of the self.",
    benefitArabic:
      "دعاء الهداية والوقاية من شر النفس\n• ألهمني: أيقظ في قلبي ووفقني.\n• رشدي: الصواب في الاعتقاد والحكم والعمل.\n• شر نفسي: ما فيها من هوى وغضب وغفلة.",
    repetitionCount: 1,
    sourceReference:
      "Jami' at-Tirmidhi 3483; Tirmidhi called it Hasan Gharib, while the displayed Darussalam grading is Da'if.",
    sourceReferenceArabic: "جامع الترمذي 3483؛ وصفه الترمذي بالحسن الغريب، بينما يظهر تصنيف دار السلام: ضعيف.",
    hadithText:
      "عن عمران بن حصين رضي الله عنهما، أن النبي ﷺ قال لأبيه حصين: «يا حصين كم تعبد اليوم إلهًا؟»، قال: سبعة: ستا في الأرض وواحدا في السماء، قال: «فأيهم تعد لرغبتك ورهبتك؟»، قال: الذي في السماء، قال: «يا حصين أما إنك لو أسلمت علمتك كلمتين تنفعانك»، فلما أسلم حصين قال: يا رسول الله علمني الكلمتين اللتين وعدتني، فقال: «قل: اللهم ألهمك رشدي، وأعذني من شر نفسي». (أخرجه الترمذي 3483، وقال: حديث حسن غريب).",
    authenticityNote:
      "Grading differs on the cited page: Tirmidhi says Hasan Gharib; the displayed Darussalam classification is Da'if.",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3483",
    attributionType: "taught_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 40,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-41",
    arabicText:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ حُبَّكَ، وَحُبَّ مَنْ يُحِبُّكَ، وَالْعَمَلَ الَّذِي يُبَلِّغُنِي حُبَّكَ. اللَّهُمَّ اجْعَلْ حُبَّكَ أَحَبَّ إِلَيَّ مِنْ نَفْسِي، وَأَهْلِي، وَمِنَ الْمَاءِ الْبَارِدِ.",
    transliteration: "",
    translation:
      "O Allah, I ask You for Your love, the love of those who love You, and the deeds that will bring me to Your love. O Allah, make Your love dearer to me than myself, my family, and cold water.",
    benefit:
      "A supplication of Prophet Dawud asking for Allah's love, the love of those who love Him, and deeds that lead to His love.",
    benefitArabic:
      "دعاء محبة الله\n• يبلغني حبك: يوصلني إلى محبتك ورضاك.\n• الماء البارد: كناية عن شدة المحبة والتعلق والراحة.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3490; Hasan (Darussalam).",
    sourceReferenceArabic: "جامع الترمذي 3490؛ حسن بحسب تصنيف دار السلام.",
    hadithText:
      "عن أبي الدرداء رضي الله عنه قال: قال رسول الله ﷺ: «كان من دعاء داود يقول: اللهم إني أسألك حبك، وحب من يحبك، والعمل الذي يبلغني حبك، اللهم اجعل حبك أحب إلي من نفسي وأهلي، ومن الماء البارد». (أخرجه الترمذي 3490، وقال: حديث حسن غريب).",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3490",
    attributionType: "reported_by_prophet_from_another_prophet",
    category: "comprehensive_duas",
    orderIndex: 41,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-42",
    arabicText: "رَبِّ اغْفِرْ لِي، وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ.",
    transliteration: "",
    translation:
      "My Lord, forgive me and accept my repentance. You are truly the One who repeatedly accepts repentance, the Most Merciful.",
    benefit:
      "The Companions counted the Prophet ﷺ saying this one hundred times in a single gathering. The count belongs to that reported context and is not Friday-specific; fewer repetitions remain permissible.",
    benefitArabic:
      "دعاء التوبة والاستغفار في المجلس\n• تب علي: اقبل توبتي ووفقني للثبات عليها.\n• التواب: كثير التوفيق للتوبة والقبول لها.",
    repetitionCount: 100,
    sourceReference: "Sunan Abi Dawud 1516; Sahih (al-Albani).",
    sourceReferenceArabic: "سنن أبي داود 1516؛ صحيح بحسب تصنيف الألباني.",
    hadithText:
      "عن عبد الله بن عمر رضي الله عنهما قال: إن كنا لنعد لرسول الله ﷺ في المجلس الواحد مائة مرة يقول: «رب اغفر لي وتب علي إنك أنت التواب الرحيم». (أخرجه أبو داود 1516، والترمذي 3434، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/abudawud%3A1516",
    attributionType: "said_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 42,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-43",
    arabicText:
      "اللَّهُمَّ إِنِّي أَسْأَلُكَ فِعْلَ الْخَيْرَاتِ، وَتَرْكَ الْمُنْكَرَاتِ، وَحُبَّ الْمَسَاكِينِ، وَأَنْ تَغْفِرَ لِي وَتَرْحَمَنِي، وَإِذَا أَرَدْتَ فِتْنَةَ قَوْمٍ فَتَوَفَّنِي غَيْرَ مَفْتُونٍ، وَأَسْأَلُكَ حُبَّكَ، وَحُبَّ مَنْ يُحِبُّكَ، وَحُبَّ عَمَلٍ يُقَرِّبُنِي إِلَى حُبِّكَ.",
    transliteration: "",
    translation:
      "O Allah, I ask You to enable me to perform good deeds, abandon evil deeds, and love the needy. Forgive me and have mercy on me. When You decree a trial through which people may be led astray, take me to You without allowing me to be overcome by that trial. I ask You for Your love, the love of those who love You, and the love of every deed that brings me closer to Your love.",
    benefit:
      "A comprehensive request for righteous action, avoidance of evil, mercy toward the needy, protection during trials, and every path leading to Allah's love.",
    benefitArabic:
      "دعاء المحبة والنجاة من الفتن\n• الخيرات: الأعمال الصالحة النافعة.\n• المنكرات: ما أنكره الشرع من قول أو عمل.\n• غير مفتون: محفوظًا من الضلال في الدين.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3235; Hasan (Darussalam).",
    sourceReferenceArabic: "جامع الترمذي 3235؛ حسن بحسب تصنيف دار السلام.",
    hadithText:
      "عن معاذ بن جبل رضي الله عنه أن النبي ﷺ رأى ربه في المنام فقال له: يا محمد إذا صليت فقل: «اللهم إني أسألك فعل الخيرات، وترك المنكرات، وحب المساكين، وأن تغفر لي وترحمني، وإذا أردت فتنة قوم فتوفني غير مفتون، وأسألك حبك، وحب من يحبك، وحب عمل يقربني إلى حبك»، وقال رسول الله ﷺ: «إنها حق فادرسوها ثم تعلموها». (أخرجه الترمذي 3235، وأحمد 22109، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3235",
    attributionType: "taught_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 43,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-44",
    arabicText: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.",
    transliteration: "",
    translation:
      "O Allah, I ask You for beneficial knowledge, wholesome and lawful provision, and deeds that are accepted.",
    benefit:
      "The Prophet ﷺ said this after completing the Fajr prayer; that primary context remains important even when it appears in this general collection.",
    benefitArabic:
      "دعاء ما بعد صلاة الفجر\n• علمًا نافعًا: يعمر به الدين والآخرة.\n• رزقًا طيبًا: حلالًا لا شبهة فيه.\n• عملًا متقبلًا: خالصًا صوابًا.",
    repetitionCount: 1,
    sourceReference: "Sunan Ibn Majah 925; Sahih (Darussalam).",
    sourceReferenceArabic: "سنن ابن ماجه 925؛ صحيح بحسب تصنيف دار السلام.",
    preferredTiming: "Recited after Fajr prayer.",
    hadithText:
      "عن أم سلمة رضي الله عنها، أن النبي ﷺ كان يقول إذا صلى الصبح حين يسلم: «اللهم إني أسألك علمًا نافعًا، ورزقًا طيبًا، وعملًا متقبلًا». (أخرجه ابن ماجه 925، وأحمد 26521، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/ibnmajah%3A925",
    attributionType: "said_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 44,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-45",
    arabicText: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ مُنْكَرَاتِ الْأَخْلَاقِ، وَالْأَعْمَالِ، وَالْأَهْوَاءِ.",
    transliteration: "",
    translation: "O Allah, I seek refuge in You from reprehensible character, evil actions, and corrupt desires.",
    benefit:
      "A refuge from corrupt traits such as arrogance, envy, cruelty, and dishonesty; from evil acts; and from desires that oppose truth and guidance.",
    benefitArabic:
      "الاستعاذة من فساد الأخلاق\n• منكرات الأخلاق: الصفات المذمومة كالكبر والحسد.\n• الأهواء: الميول والشهوات المخالفة للحق.",
    repetitionCount: 1,
    sourceReference: "Jami' at-Tirmidhi 3591; Sahih (Darussalam).",
    sourceReferenceArabic: "جامع الترمذي 3591؛ صحيح بحسب تصنيف دار السلام.",
    hadithText:
      "عن زياد بن علاقة، عن عمه قطبة بن مالك رضي الله عنه قال: كان النبي ﷺ يقول: «اللهم إني أعوذ بك من منكرات الأخلاق، والأعمال، والأهواء». (أخرجه الترمذي 3591، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/tirmidhi%3A3591",
    attributionType: "said_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 45,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-46",
    arabicText:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبَرَصِ، وَالْجُنُونِ، وَالْجُذَامِ، وَمِنْ سَيِّئِ الْأَسْقَامِ.",
    transliteration: "",
    translation: "O Allah, I seek refuge in You from leukoderma, insanity, leprosy, and severe or harmful diseases.",
    benefit:
      "A Prophetic refuge from serious illnesses. Here al-baras is translated as leukoderma or loss of skin pigmentation, not elephantiasis.",
    benefitArabic:
      "الاستعاذة من شداد الأمراض\n• البرص: فقدان صبغة الجلد.\n• الجذام: مرض تلف الأعصاب والجلد.\n• سيئ الأسقام: الأمراض الشديدة المؤذية.",
    repetitionCount: 1,
    sourceReference: "Sunan Abi Dawud 1554; Sahih (al-Albani).",
    sourceReferenceArabic: "سنن أبي داود 1554؛ صحيح بحسب تصنيف الألباني.",
    hadithText:
      "عن أنس بن مالك رضي الله عنه أن النبي ﷺ كان يقول: «اللهم إني أعوذ بك من البرص، والجنون، والجذام، ومن سيئ الأسقام». (أخرجه أبو داود 1554، والنسائي 5493، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/abudawud%3A1554",
    attributionType: "said_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 46,
    includedInCore: false,
  },
  {
    id: "comprehensive-dua-47",
    arabicText:
      "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْفَقْرِ، وَالْقِلَّةِ، وَالذِّلَّةِ، وَأَعُوذُ بِكَ مِنْ أَنْ أَظْلِمَ أَوْ أُظْلَمَ.",
    transliteration: "",
    translation:
      "O Allah, I seek refuge in You from poverty, insufficiency, and humiliation, and I seek refuge in You from wronging others or being wronged.",
    benefit:
      "A refuge from genuine insufficiency and degrading dependence, and from both sides of injustice: committing it or suffering it.",
    benefitArabic:
      "الاستعاذة من الفقر والظلم\n• القلة: عدم كفاية الاحتياج الأساسي.\n• الذلة: الهوان والضعف أمام الخلق.\n• أظلم أو أُظلم: وقوع الظلم مني أو علي.",
    repetitionCount: 1,
    sourceReference: "Sunan Abi Dawud 1544; Sahih (al-Albani).",
    sourceReferenceArabic: "سنن أبي داود 1544؛ صحيح بحسب تصنيف دار السلام.",
    hadithText:
      "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ كان يقول: «اللهم إني أعوذ بك من الفقر، والقلة، والذلة، وأعوذ بك من أن أظلم أو أظلم». (أخرجه أبو داود 1544، والنسائي 5460، وصححه الألباني).",
    sourceUrl: "https://sunnah.com/abudawud%3A1544",
    attributionType: "said_by_prophet",
    category: "comprehensive_duas",
    orderIndex: 47,
    includedInCore: false,
  },
];

export const COMPREHENSIVE_DUAS = applyContentReview(COMPREHENSIVE_DUA_DRAFTS);
