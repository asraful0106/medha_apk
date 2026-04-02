import i18n from "./i18n";

const lngToLocale: Record<string, string> = {
  en: "en-US",
  bn: "bn-BD",
  hi: "hi-IN",
  ar: "ar-EG",
  jp: "ja-JP",
};
const lngToCurrency: Record<string, string> = {
  en: "USD",
  bn: "BDT",
  hi: "INR",
  ar: "SAR",
  jp: "JPY",
};

export function formatNumber(
  value: number | string,
  lan = i18n.language,
  opts?: Intl.NumberFormatOptions,
) {
  const locale = lngToLocale[lan] ?? "en-US";
  // console.log(value, lng, locale)
  return new Intl.NumberFormat(locale, { ...opts }).format(Number(value));
}

// export function getCurrencySymbol(lng: string): string {
//   const locale = lngToLocale[lng] ?? "en-US";
//   const currency = lngToCurrency[lng] ?? "USD";

//   const formatter = new Intl.NumberFormat(locale, {
//     style: "currency",
//     currency,
//     currencyDisplay: "symbol", // or "narrowSymbol"
//   });

//   const parts = formatter.formatToParts(1);

//   const symbolPart = parts.find((p) => p.type === "currency");
//   return symbolPart?.value ?? "";
// }
