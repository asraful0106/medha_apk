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
        back: "Back",
      },
      login: {
        welcome_back: "Welcome\nback",
        email: "Email",
        password: "Password",
        remember_me: "Remember me",
        forget_password: "Forget Password?",
        login: "Login",
        email_address: "Email Address",
        sign_in_to_conitnue_your_learning_journey:
          "Sign in to continue your learning journey.",
        dont_have_an_account: "Don't have an account?",
        sign_up: "Sign Up",
        or: "or",
        login_failed: "Login Failed",
        email_is_required: "Email is required",
        enter_a_valid_email: "Enter a valid email",
        password_is_required: "Password is required",
        password_must_be_at_least_8_characters:
          "Password must be at least 8 characters",
      },
      comingSoon: {
        badge: "Coming Soon",
        title: "Something Great\nIs Coming",
        subtitle: "We're putting the finishing touches ...",
        eta: "Expected",
        notify: "Notify Me When It's Ready",
      },
      setting: {
        generalSetting: "General Setting",
        theme: "Theme",
        language: "Language",
      },
      maintenance: {
        badge: "Under Maintenance",
        title: "We're Fixing\nThings Up",
        subtitle:
          "Our team is working hard to bring everything back online. Thanks for your patience!",
        progressLabel: "Restoration in progress",
        eta: "Back online",
      },
      errors: {
        incorrect_credentials: "Incorrect Credentials",
        account_suspended: "Account Suspended",
        invalid_request: "Invalid Request",
        connection_error: "Connection Error",
        something_went_wrong_please_try_again:
          "Something went wrong. Please try again.",
        ok: "OK",
        try_again: "Try Again",
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
        back: "ব্যাক",
      },
      login: {
        welcome_back: "ফিরে আসার জন্য আপনাকে\nস্বাগতম",
        email: "ইমেইল",
        password: "পাসওয়ার্ড",
        remember_me: "আমাকে মনে রাখুন",
        forget_password: "পাসওয়ার্ড ভুলে গেছেন?",
        login: "লগইন",
        email_address: "ইমেইল অ্যাড্রেস",
        sign_in_to_conitnue_your_learning_journey:
          "আপনার শেখার যাত্রা চালিয়ে যেতে সাইন ইন করুন।",
        dont_have_an_account: "আপনার কি কোনো অ্যাকাউন্ট নেই?",
        sign_up: "সাইন আপ",
        or: "অথবা",
        login_failed: "লগইন ব্যর্থ হয়েছে",
        email_is_required: "ইমেইল আবশ্যক",
        enter_a_valid_email: "একটি বৈধ ইমেইল প্রদান করুন",
        password_is_required: "পাসওয়ার্ড আবশ্যক",
        password_must_be_at_least_8_characters:
          "পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে",
      },
      comingSoon: {
        badge: "শীঘ্রই আসছে",
        title: "চমৎকার কিছু\nআসছে",
        subtitle: "আমরা শেষ মুহূর্তের কাজগুলো সম্পন্ন করছি...",
        eta: "প্রত্যাশিত",
        notify: "প্রস্তুত হলে আমাকে জানাও",
      },
      setting: {
        generalSetting: "সাধারণ সেটিংস",
        theme: "থিম",
        language: "ভাষা",
      },
      maintenance: {
        badge: "সার্ভিস আপডেট চলছে",
        title: "আমরা সিস্টেম\nআপডেট করছি",
        subtitle:
          "আমাদের টিম দ্রুত কাজ করছে যাতে সবকিছু আবার স্বাভাবিকভাবে চালু করা যায়। একটু ধৈর্য ধরার জন্য ধন্যবাদ!",
        progressLabel: "সার্ভিস পুনরুদ্ধার চলছে",
        eta: "শিগগিরই আবার চালু হবে",
      },
      errors: {
        incorrect_credentials: "ভুল তথ্য প্রদান করা হয়েছে",
        account_suspended: "অ্যাকাউন্ট স্থগিত করা হয়েছে",
        invalid_request: "অবৈধ অনুরোধ",
        connection_error: "সংযোগ ত্রুটি",
        something_went_wrong_please_try_again:
          "কিছু সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        ok: "ঠিক আছে",
        try_again: "আবার চেষ্টা করুন",
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
