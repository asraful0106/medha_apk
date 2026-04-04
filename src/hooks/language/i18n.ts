// @/src/hooks/language/i18n.ts
import i18n, { use as i18nUse } from "i18next";
import { initReactI18next } from "react-i18next";

export const resources = {
  en: {
    translation: {
      app: {
        MEDHA: "MEDHA",
        medha: "Medha",
        tagline: "Learn smarter, anytime, anywhere.",
        TAGLINE: "LEARN SMARTER, ANYTIME, ANYWHERE.",
      },
      indexs: {
        home: "Home",
        rank: "Rank",
        content: "Content",
        courses: "Courses",
        profile: "Profile",
        notification: "Notification",
        calender: "Calender",
        setting: "Setting",
      },
      setup: {
        step: "Step {{current}} of {{total}}",
        next: "Continue",
        finish: "Create & Get Started",
        back: "Back",
        hint: "You can update your preferences anytime from Settings.",
        tagline: "Learn smarter, anytime, anywhere.",
        badge: "Education Made Easy 🎓",
        getStarted: "Get Started",

        // Step 1 — preferences
        preferences: {
          title: "Your Preferences",
          subtitle: "Choose the language and look that feels right for you.",
          languageLabel: "Language",
          themeLabel: "Appearance",
          themeLight: "Light",
          themeDark: "Dark",
        },
      },
      common: {
        cancel: "Cancel",
        ok: "OK",
        save: "Save",
        remove: "Remove",
        done: "Done",
        close: "Close",
        confirm: "Confirm",
      },
      login: {
        welcome_back: "Welcome back",
        email: "Email",
        password: "Password",
        remember_me: "Remember me",
        forget_password: "Forget Password?",
        login: "Login",
      },
    },
  },

  bn: {
    translation: {
      app: {
        MEDHA: "মেধা",
        medha: "মেধা",
        tagline: "আরও স্মার্টভাবে শিখুন, যেকোনো সময়, যেকোনো জায়গায়।",
        TAGLINE: "আরও স্মার্টভাবে শিখুন, যেকোনো সময়, যেকোনো জায়গায়।",
      },
      indexs: {
        home: "হোম",
        rank: "র‍্যাঙ্ক",
        content: "কনটেন্ট",
        courses: "কোর্সসমূহ",
        profile: "প্রোফাইল",
        notification: "নোটিফিকেশন",
        calender: "ক্যালেন্ডার",
        setting: "সেটিংস",
      },
      setup: {
        step: "ধাপ {{current}} / {{total}}",
        next: "পরবর্তী",
        finish: "তৈরি করুন ও শুরু করুন",
        back: "পিছনে",
        hint: "আপনি যেকোনো সময় সেটিংস থেকে আপনার পছন্দ আপডেট করতে পারেন।",
        tagline: "আরও স্মার্টভাবে শিখুন, যেকোনো সময়, যেকোনো জায়গায়।",
        badge: "শিক্ষা এখন সহজ 🎓",
        getStarted: "শুরু করুন",

        // ধাপ ১ — পছন্দসমূহ
        preferences: {
          title: "আপনার পছন্দ",
          subtitle: "আপনার পছন্দের ভাষা ও থিম বেছে নিন।",
          languageLabel: "ভাষা",
          themeLabel: "থিম",
          themeLight: "লাইট",
          themeDark: "ডার্ক",
        },
      },
      common: {
        cancel: "বাতিল",
        ok: "ঠিক আছে",
        save: "সংরক্ষণ",
        remove: "সরান",
        done: "সম্পন্ন",
        close: "বন্ধ করুন",
        confirm: "নিশ্চিত করুন",
      },
    },
  },
} as const;

i18nUse(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  compatibilityJSON: "v4",
  interpolation: { escapeValue: false },
});

export default i18n;
