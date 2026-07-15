export const SUPPORTED_LOCALES = ["en", "hi", "te", "ta", "kn", "ml", "mr"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

type MessageKey =
  | "dashboard.title"
  | "dashboard.welcome"
  | "nav.home"
  | "nav.website"
  | "nav.billing"
  | "nav.share"
  | "nav.domain"
  | "nav.settings"
  | "nav.ai"
  | "editor.pages"
  | "billing.title"
  | "settings.title"
  | "settings.locale"
  | "settings.region";

const MESSAGES: Record<AppLocale, Record<MessageKey, string>> = {
  en: {
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome to ALINKS",
    "nav.home": "Home",
    "nav.website": "Website",
    "nav.billing": "Plan",
    "nav.share": "Share",
    "nav.domain": "Domain",
    "nav.settings": "Settings",
    "nav.ai": "ALINKS AI",
    "editor.pages": "Pages",
    "billing.title": "Your ALINKS plan",
    "settings.title": "Settings",
    "settings.locale": "Language",
    "settings.region": "Region",
  },
  hi: {
    "dashboard.title": "डैशबोर्ड",
    "dashboard.welcome": "ALINKS में आपका स्वागत है",
    "nav.home": "होम",
    "nav.website": "वेबसाइट",
    "nav.billing": "बिलिंग",
    "nav.share": "शेयर",
    "nav.domain": "डोमेन",
    "nav.settings": "सेटिंग्स",
    "nav.ai": "ALINKS AI",
    "editor.pages": "पेज",
    "billing.title": "बिलिंग",
    "settings.title": "सेटिंग्स",
    "settings.locale": "भाषा",
    "settings.region": "क्षेत्र",
  },
  te: {
    "dashboard.title": "డాష్‌బోర్డ్",
    "dashboard.welcome": "ALINKS కు స్వాగతం",
    "nav.home": "హోమ్",
    "nav.website": "వెబ్‌సైట్",
    "nav.billing": "బిల్లింగ్",
    "nav.share": "షేర్",
    "nav.domain": "డొమైన్",
    "nav.settings": "సెట్టింగ్స్",
    "nav.ai": "ALINKS AI",
    "editor.pages": "పేజీలు",
    "billing.title": "బిల్లింగ్",
    "settings.title": "సెట్టింగ్స్",
    "settings.locale": "భాష",
    "settings.region": "ప్రాంతం",
  },
  ta: {
    "dashboard.title": "டாஷ்போர்டு",
    "dashboard.welcome": "ALINKS வரவேற்கிறது",
    "nav.home": "முகப்பு",
    "nav.website": "வலைத்தளம்",
    "nav.billing": "பில்லிங்",
    "nav.share": "பகிர்",
    "nav.domain": "டொமைன்",
    "nav.settings": "அமைப்புகள்",
    "nav.ai": "ALINKS AI",
    "editor.pages": "பக்கங்கள்",
    "billing.title": "பில்லிங்",
    "settings.title": "அமைப்புகள்",
    "settings.locale": "மொழி",
    "settings.region": "பிராந்தியம்",
  },
  kn: {
    "dashboard.title": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "dashboard.welcome": "ALINKS ಗೆ ಸ್ವಾಗತ",
    "nav.home": "ಮುಖಪುಟ",
    "nav.website": "ವೆಬ್‌ಸೈಟ್",
    "nav.billing": "ಬಿಲ್ಲಿಂಗ್",
    "nav.share": "ಹಂಚಿಕೆ",
    "nav.domain": "ಡೊಮೇನ್",
    "nav.settings": "ಸೆಟ್ಟಿಂಗ್ಸ್",
    "nav.ai": "ALINKS AI",
    "editor.pages": "ಪುಟಗಳು",
    "billing.title": "ಬಿಲ್ಲಿಂಗ್",
    "settings.title": "ಸೆಟ್ಟಿಂಗ್ಸ್",
    "settings.locale": "ಭಾಷೆ",
    "settings.region": "ಪ್ರದೇಶ",
  },
  ml: {
    "dashboard.title": "ഡാഷ്‌ബോർഡ്",
    "dashboard.welcome": "ALINKS സ്വാഗതം",
    "nav.home": "ഹോം",
    "nav.website": "വെബ്സൈറ്റ്",
    "nav.billing": "ബില്ലിംഗ്",
    "nav.share": "ഷെയർ",
    "nav.domain": "ഡൊമെയ്ൻ",
    "nav.settings": "സെറ്റിംഗ്സ്",
    "nav.ai": "ALINKS AI",
    "editor.pages": "പേജുകൾ",
    "billing.title": "ബില്ലിംഗ്",
    "settings.title": "സെറ്റിംഗ്സ്",
    "settings.locale": "ഭാഷ",
    "settings.region": "പ്രദേശം",
  },
  mr: {
    "dashboard.title": "डॅशबोर्ड",
    "dashboard.welcome": "ALINKS मध्ये स्वागत",
    "nav.home": "होम",
    "nav.website": "वेबसाइट",
    "nav.billing": "बिलिंग",
    "nav.share": "शेअर",
    "nav.domain": "डोमेन",
    "nav.settings": "सेटिंग्ज",
    "nav.ai": "ALINKS AI",
    "editor.pages": "पृष्ठे",
    "billing.title": "बिलिंग",
    "settings.title": "सेटिंग्ज",
    "settings.locale": "भाषा",
    "settings.region": "प्रदेश",
  },
};

export function t(locale: AppLocale, key: MessageKey): string {
  return MESSAGES[locale]?.[key] ?? MESSAGES.en[key];
}