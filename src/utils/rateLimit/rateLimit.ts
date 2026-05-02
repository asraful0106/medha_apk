// utils/rateLimit.ts

/**
 * Debounce — fires AFTER the user stops pressing.
 * Good for: search, autocomplete, form auto-save.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Throttle — fires IMMEDIATELY then silences for `ms`.
 * Good for: submit buttons, OTP resend, login.
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall < ms) return;
    lastCall = now;
    fn(...args);
  };
}


// Fires instantly, then ignores for 2s — no double-submit
// const handleLogin = useCallback(
//   throttle(async () => {
//     await login(email, password);
//   }, 2000),
//   [email, password],
// );