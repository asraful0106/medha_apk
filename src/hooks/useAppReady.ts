// @/src/hooks/useAppReady.ts
import { useEffect, useState } from "react";
import { useAuthStore } from "@/src/store/authStore";
import { useLanguage } from "@/src/hooks/language/LanguageContext";

export function useAppReady() {
  const isAuthHydrated = useAuthStore((state) => state.isHydrated);
  const { isHydrated: isLangHydrated } = useLanguage();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isAuthHydrated && isLangHydrated) {
      const timer = setTimeout(() => setIsReady(true), 100);
      return () => clearTimeout(timer);
    }
    setIsReady(false);
  }, [isAuthHydrated, isLangHydrated]);

  return { isReady };
}
