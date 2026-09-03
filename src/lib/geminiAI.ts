// Multilingual Tourist Safety AI Assistant & Incident Auto-Classifier

export interface AIClassificationResult {
  category: 'medical_emergency' | 'theft' | 'lost_person' | 'lost_property' | 'accident' | 'harassment' | 'unsafe_area' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  extractedTitle: string;
  recommendedAction: string;
  isEmergencySOS: boolean;
}

export interface EmergencyPhrase {
  id: string;
  category: string;
  english: string;
  translations: Record<string, { text: string; phonetic?: string }>;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'zh', name: 'Mandarin (中文)', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic (العربية)', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian (Русский)', flag: '🇷🇺' },
  { code: 'it', name: 'Italian (Italiano)', flag: '🇮🇹' },
];

export const EMERGENCY_PHRASES: EmergencyPhrase[] = [
  {
    id: 'p1',
    category: 'Medical',
    english: 'I need an ambulance urgently. Someone is injured.',
    translations: {
      hi: { text: 'मुझे तुरंत एम्बुलेंस चाहिए। कोई घायल है।', phonetic: 'Mujhe turant ambulance chahiye. Koi ghayal hai.' },
      es: { text: 'Necesito una ambulancia urgentemente. Alguien está herido.', phonetic: 'Neh-seh-SEE-toh oo-nah ahm-boo-LAHN-syah' },
      fr: { text: "J'ai besoin d'une ambulance de toute urgence. Quelqu'un est blessé.", phonetic: 'Zhay buh-zwan doon ahm-byoo-lahns' },
      de: { text: 'Ich brauche dringend einen Krankenwagen. Jemand ist verletzt.', phonetic: 'Ikh brow-kheh drin-gend eye-nen kran-ken-vah-gen' },
      ja: { text: '至急救急車が必要です。怪我人がいます。', phonetic: 'Shikyū kyūkyūsha ga hitsuyō desu. Keganin ga imasu.' },
      zh: { text: '我紧急需要救护车。有人受伤了。', phonetic: 'Wǒ jǐnjí xūyào jiùhù chē. Yǒurén shòushāng le.' },
      ar: { text: 'أحتاج إلى سيارة إسعاف بشكل عاجل. هناك شخص مصاب.', phonetic: 'Ahtaj ila sayarat is\'af bi-shakl \'ajil.' },
      ru: { text: 'Мне срочно нужна скорая помощь. Кто-то ранен.', phonetic: 'Mne srochno nuzhna skoraya pomoshch.' },
      it: { text: "Ho urgente bisogno di un'ambulanza. Qualcuno è ferito.", phonetic: 'Oh oor-JEN-teh bee-ZOHN-yoh dee oon ahm-boo-LAHN-tsah' },
    },
  },
  {
    id: 'p2',
    category: 'Police & Safety',
    english: 'Please call the Tourist Police. I have been robbed.',
    translations: {
      hi: { text: 'कृपया टूरिस्ट पुलिस को बुलाएं। मुझे लूट लिया गया है।', phonetic: 'Kripya Tourist Police ko bulayein. Mujhe loot liya gaya hai.' },
      es: { text: 'Por favor llame a la policía turística. Me han robado.', phonetic: 'Por fah-VOR YAH-meh ah lah poh-lee-SEE-ah' },
      fr: { text: "Veuillez appeler la police touristique. J'ai été volé.", phonetic: 'Vuh-yay ah-puh-lay lah poh-lees too-rees-teek' },
      de: { text: 'Bitte rufen Sie die Touristenpolizei. Ich wurde ausgeraubt.', phonetic: 'Bit-teh roo-fen zee dee too-ris-ten-po-li-tsye' },
      ja: { text: '観光警察を呼んでください。強盗に遭いました。', phonetic: 'Kankō keisatsu o yonde kudasai. Gōtō ni aimashita.' },
      zh: { text: '请帮我叫旅游警察。我被抢劫了。', phonetic: 'Qǐng bāng wǒ jiào lǚyóu jǐngchá. Wǒ bèi qiǎngjié le.' },
      ar: { text: 'يرجى الاتصال بشرطة السياحة. لقد تعرضت للسرقة.', phonetic: 'Yurja al-ittisal bi-shurtat as-siyaha.' },
      ru: { text: 'Пожалуйста, вызовите туристическую полицию. Меня ограбили.', phonetic: 'Pozhaluysta, vyzovite turisticheskuyu politsiyu.' },
      it: { text: 'Per favore chiami la polizia turistica. Sono stato derubato.', phonetic: 'Pehr fah-VOH-reh KYAH-mee lah poh-lee-TSEE-ah' },
    },
  },
  {
    id: 'p3',
    category: 'Lost & Direction',
    english: 'I am lost. Where is the nearest embassy or safe hotel?',
    translations: {
      hi: { text: 'मैं रास्ता भटक गया हूँ। सबसे नजदीकी दूतावास या होटल कहाँ है?', phonetic: 'Main rasta bhatak gaya hoon. Sabse nazdeeki dootavas kahan hai?' },
      es: { text: 'Estoy perdido. ¿Dónde está la embajada u hotel seguro más cercano?', phonetic: 'Es-TOY pehr-DEE-doh. DON-deh es-TAH lah em-bah-HAH-dah' },
      fr: { text: "Je suis perdu. Où se trouve l'ambassade ou l'hôtel sécurisé le plus proche ?", phonetic: 'Zhuh swee pehr-dyoo. Oo suh troov lahm-bah-sahd' },
      de: { text: 'Ich habe mich verirrt. Wo ist die nächste Botschaft oder ein sicheres Hotel?', phonetic: 'Ikh hah-beh mikh fehr-irt. Voh ist dee naekh-steh bot-shaft' },
      ja: { text: '道に迷いました。最寄りの大使館や安全なホテルはどこですか？', phonetic: 'Michi ni mayoimashita. Moyori no taishikan wa doko desu ka?' },
      zh: { text: '我迷路了。请问最近的大使馆或安全酒店在哪里？', phonetic: 'Wǒ mílù le. Qǐngwèn zuìjìn de dàshǐguǎn zài nǎlǐ?' },
      ar: { text: 'أنا تائه. أين أقرب سفارة أو فندق آمن؟', phonetic: 'Ana ta\'eh. Ayna aqrab sifarah aw funduq amin?' },
      ru: { text: 'Я заблудился. Где ближайшее посольство или безопасный отель?', phonetic: 'Ya zabludilsya. Gde blizhayshee posol\'stvo?' },
      it: { text: "Mi sono perso. Dov'è l'ambasciata o l'hotel sicuro più vicino?", phonetic: 'Mee SOH-noh PEHR-soh. Doh-veh lahm-bah-SHAH-tah' },
    },
  },
  {
    id: 'p4',
    category: 'Allergy & Medical',
    english: 'I have a severe allergy and cannot breathe properly.',
    translations: {
      hi: { text: 'मुझे गंभीर एलर्जी है और मुझे सांस लेने में तकलीफ हो रही है।', phonetic: 'Mujhe gambhir allergy hai aur saans lene mein takleef ho rahi hai.' },
      es: { text: 'Tengo una alergia severa y no puedo respirar bien.', phonetic: 'TEN-goh oo-nah ah-LEHR-hyah seh-VEH-rah' },
      fr: { text: "J'ai une allergie sévère et j'ai du mal à respirer.", phonetic: 'Zhay oon ah-lehr-zhee say-vehr' },
      de: { text: 'Ich habe eine schwere Allergie und kann kaum atmen.', phonetic: 'Ikh hah-beh eye-neh shveh-reh ah-lehr-gee' },
      ja: { text: '重度のアレルギーがあり、息が苦しいです。', phonetic: 'Jūdo no arerugī ga ari, iki ga kurushii desu.' },
      zh: { text: '我有严重过敏，呼吸困难。', phonetic: 'Wǒ yǒu yánzhòng guòmǐn, hūxī kùnnán.' },
      ar: { text: 'لدي حساسية شديدة ولا أستطيع التنفس بشكل جيد.', phonetic: 'Ladayya hasasiya shadidah wa la astati\' at-tanaffus.' },
      ru: { text: 'У меня тяжелая аллергия, я задыхаюсь.', phonetic: 'U menya tyazhelaya allergiya, ya zadykhayus.' },
      it: { text: 'Ho una grave allergia e non riesco a respirare bene.', phonetic: 'Oh oo-nah GRAH-veh ahl-lehr-JEE-ah' },
    },
  },
];

/**
 * Intelligent rule-based offline classifier and safety intent analyzer
 */
export function classifyIncidentText(text: string): AIClassificationResult {
  const lower = text.toLowerCase();

  // Medical / Life Threat
  if (
    lower.includes('chest pain') ||
    lower.includes('heart attack') ||
    lower.includes('breath') ||
    lower.includes('allergic') ||
    lower.includes('allergy') ||
    lower.includes('unconscious') ||
    lower.includes('bleeding') ||
    lower.includes('fracture') ||
    lower.includes('ambulance') ||
    lower.includes('doctor') ||
    lower.includes('poison')
  ) {
    return {
      category: 'medical_emergency',
      priority: lower.includes('unconscious') || lower.includes('chest pain') || lower.includes('breath') ? 'critical' : 'high',
      confidence: 0.94,
      extractedTitle: 'Medical Emergency Alert',
      recommendedAction: 'Dispatch EMS Ambulance & Alert Nearby Emergency Hospital immediately.',
      isEmergencySOS: true,
    };
  }

  // Theft / Robbery / Pickpocket
  if (
    lower.includes('stolen') ||
    lower.includes('theft') ||
    lower.includes('robbed') ||
    lower.includes('snatched') ||
    lower.includes('pickpocket') ||
    lower.includes('passport stolen') ||
    lower.includes('thief') ||
    lower.includes('scam')
  ) {
    return {
      category: 'theft',
      priority: lower.includes('passport') || lower.includes('armed') ? 'high' : 'medium',
      confidence: 0.91,
      extractedTitle: lower.includes('passport') ? 'Stolen Travel Passport & Valuables' : 'Theft / Pickpocketing Report',
      recommendedAction: 'Alert Tourist Police patrol and generate formal electronic FIR case number.',
      isEmergencySOS: false,
    };
  }

  // Lost Person / Separated Child
  if (
    lower.includes('lost child') ||
    lower.includes('missing') ||
    lower.includes('separated') ||
    lower.includes('cannot find') ||
    lower.includes('lost person') ||
    lower.includes('companion lost')
  ) {
    return {
      category: 'lost_person',
      priority: lower.includes('child') || lower.includes('kid') ? 'critical' : 'high',
      confidence: 0.93,
      extractedTitle: lower.includes('child') ? 'CRITICAL: Separated Missing Child' : 'Missing Tour Member / Companion',
      recommendedAction: 'Broadcast photo description to all active sector patrol officers & station kiosks.',
      isEmergencySOS: lower.includes('child'),
    };
  }

  // Harassment / Unsafe behavior
  if (
    lower.includes('harass') ||
    lower.includes('following me') ||
    lower.includes('stalk') ||
    lower.includes('threat') ||
    lower.includes('unsafe') ||
    lower.includes('danger')
  ) {
    return {
      category: 'harassment',
      priority: 'high',
      confidence: 0.89,
      extractedTitle: 'Harassment & Safety Threat Alert',
      recommendedAction: 'Dispatch Nearest Quick Response Officer & guide tourist into safe verified venue.',
      isEmergencySOS: lower.includes('following') || lower.includes('threat'),
    };
  }

  // Lost Property
  if (
    lower.includes('left my') ||
    lower.includes('lost my') ||
    lower.includes('forgot') ||
    lower.includes('dropped') ||
    lower.includes('camera') ||
    lower.includes('wallet') ||
    lower.includes('phone')
  ) {
    return {
      category: 'lost_property',
      priority: 'low',
      confidence: 0.88,
      extractedTitle: 'Lost Property Query',
      recommendedAction: 'Cross-reference with Lost & Found central repository and notify transit authorities.',
      isEmergencySOS: false,
    };
  }

  // Default fallback
  return {
    category: 'other',
    priority: 'medium',
    confidence: 0.75,
    extractedTitle: 'General Tourist Safety Assistance',
    recommendedAction: 'Review details and route to appropriate local tourist helpdesk.',
    isEmergencySOS: false,
  };
}

/**
 * AI Multilingual Safety Chatbot Response Generator
 */
export async function getSafetyAssistantResponse(
  userQuery: string,
  userLanguage = 'en'
): Promise<{ text: string; actionSuggestion?: string; directCategory?: string }> {
  // Simulate AI latency for realistic feel
  await new Promise((resolve) => setTimeout(resolve, 400));

  const classification = classifyIncidentText(userQuery);
  const q = userQuery.toLowerCase();

  if (classification.isEmergencySOS) {
    return {
      text: `⚠️ **EMERGENCY DETECTED**: ${classification.extractedTitle}\n\nI have prepared an immediate high-priority safety alert. Press the **SOS button** or confirm below to notify the 24/7 Police & Medical Response dispatch center immediately with your live GPS location.\n\n*Emergency Helpline:* Dial **112** (Universal) or **1363** (Tourist Helpline).`,
      actionSuggestion: 'Trigger SOS Emergency',
      directCategory: classification.category,
    };
  }

  if (q.includes('hospital') || q.includes('doctor') || q.includes('pharmacy') || q.includes('medicine')) {
    return {
      text: `🏥 **Nearby Medical Facilities in Navi Mumbai**\n\nI can locate 24/7 tourist-friendly hospitals and certified pharmacies in your current radius with English-speaking doctors.\n\n- **Apollo Hospitals Navi Mumbai (Level-1 Trauma):** +91 22 6280 6280 (Parsik Hill, Belapur)\n- **MGM New Bombay Hospital (Vashi):** +91 22 2782 5000\n- **DY Patil Multi-Speciality Hospital (Nerul):** +91 22 2770 0000\n- **24/7 Apollo Emergency Pharmacy (Palm Beach):** +91 22 2771 1234\n\nWould you like me to pin these on your safety map?`,
      actionSuggestion: 'View Nearby Hospitals on Map',
    };
  }

  if (q.includes('police') || q.includes('embassy') || q.includes('safe') || q.includes('scam')) {
    return {
      text: `🛡️ **Tourist Safety Guidance — Navi Mumbai**\n\n1. Always verify authorized government tourist guides (look for official digital badges).\n2. Avoid unmetered taxis; use official prepaid taxi counters or ride-hailing apps.\n3. The **Navi Mumbai Tourist Police HQ** is located at CBD Belapur Sector 11 (Phone: +91 22 2757 8888).\n4. All active safe corridors and advisory zones are highlighted on your interactive map.`,
      actionSuggestion: 'Open Safety Zone Map',
    };
  }

  if (q.includes('lost') && (q.includes('bag') || q.includes('passport') || q.includes('wallet') || q.includes('phone'))) {
    return {
      text: `📦 **Lost & Found Assistance**\n\nDon't panic! You can immediately register your item in the platform's **Central Lost & Found Registry**. Our system alerts local transit desks, airport police, and participating hotels automatically.\n\n*Quick tip:* If you lost your passport, also file a report with your embassy/consulate immediately.`,
      actionSuggestion: 'Report Lost Item',
    };
  }

  if (q.includes('group') || q.includes('tour') || q.includes('guide')) {
    return {
      text: `👥 **Tourist Group Feature**\n\nYou can create or join a travel group using your tour leader's 6-character code (e.g. \`NM-9421\`). This enables live safety check-ins and emergency broadcasts to your companions.`,
      actionSuggestion: 'Open Groups Hub',
    };
  }

  return {
    text: `Hello! I am your **Global Gennie 24/7 Multi-lingual Safety Companion**.\n\nI can assist you with:\n- Instant Emergency SOS & Dispatch\n- Fast Incident Reporting & Classification\n- Finding Nearby Police, Hospitals & 24/7 Pharmacies in Navi Mumbai\n- Multi-lingual Emergency Translation in 10 Languages\n- Geofenced Safety Zone Warnings & Group Check-ins\n\nHow can I help keep your journey safe right now?`,
  };
}

/**
 * Text to speech synthesizer
 */
export function speakText(text: string, langCode = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
