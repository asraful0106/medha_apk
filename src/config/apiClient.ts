// @/src/config/apiClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { envVars } from "./envVars";
import { getDeviceId } from "../utils/getDeviceId";
import { consoleDev } from "../utils/consoleDev";
import { loadTokens, saveTokens } from "../storage/tokenStorage";
import { CustomAlert } from "../components/CustomAlert";
import { router } from "expo-router";

const BASE_URL = envVars.BASE_URL;

// ─── Registered callbacks ─────────────────────────────────────────────────────
// authStore calls registerForceLogout() once on boot.
// apiClient never imports authStore — zero circular dependency.
type ForceLogoutFn = () => void;
let _forceLogout: ForceLogoutFn | null = null;

export function registerForceLogout(fn: ForceLogoutFn) {
  _forceLogout = fn;
}

// ─── Axios instance ───────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Device-Type": "phone",
  },
});

// ─── Refresh mutex ────────────────────────────────────────────────────────────
// Collapses concurrent 401s into a single refresh call.
// All queued retries share the same promise and get the same new token.
let _refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    const { refreshToken } = await loadTokens();
    // console.log("RefreshToken: ", refreshToken);
    if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

    // Use bare axios — not apiClient — to avoid re-entering this interceptor
    const res = await axios.post(
      `${BASE_URL}/auth/reset-token`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" }, timeout: 15000 },
    );

    const body = res.data;
    if (!body?.success || !body?.data?.access_token) {
      throw new Error("REFRESH_FAILED");
    }

    await saveTokens(body.data.access_token, body.data.refresh_token);
    return body.data.access_token as string;
  })().finally(() => {
    _refreshPromise = null;
  });

  return _refreshPromise;
}

// ─── Request interceptor — attach Device ID ───────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Attach device id
    const deviceId = await getDeviceId();
    config.headers["X-Device-ID"] = deviceId || "unknown";

    // Attach accessToken
    const { accessToken } = await loadTokens();
    // console.log("AccessToken: ", accessToken);
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    consoleDev.log({ comingFrom: "apiClient.ts", line: 81 }, error);

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean;
    };

    // console.log("Error: ", error);
    // console.log("Response: ", error.response?.status);
    // console.log("Response: ", error.response?.data?.code);
    // console.log("Response: ", !originalRequest._retried);

    // ── 401 → silent token refresh + retry ───────────────────────────────────
    if (
      error.response?.status === 401 &&
      (error.response?.data?.code === "AUTH_TOKEN_UNOTHORIZED" ||
        error.response?.data?.code === "AUTH_TOKEN_INVALID") &&
      !originalRequest._retried
    ) {
      originalRequest._retried = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        // Refresh failed — delegate logout to whoever registered the handler.
        // CustomAlert is imported directly; it has no store dependency.
        _forceLogout?.();
        CustomAlert.show({
          title: "Session Expired",
          message: "Please sign in again to continue.",
          variant: "warning",
          actions: [
            {
              label: "OK",
              style: "default",
              onPress: () => {
                router.replace("/(auth)/login");
              },
            },
          ],
        });
        return Promise.reject(error);
      }
    }

    // ── Other server errors: resolve so stores handle TApiErrorResponse ───────
    if (error.response) {
      return Promise.resolve(error.response);
    }

    // ── Network / timeout ─────────────────────────────────────────────────────
    const msg = error.message?.toLowerCase() ?? "";
    if (
      error.code === "ERR_NETWORK" ||
      msg.includes("network") ||
      msg.includes("failed")
    ) {
      throw new Error(
        "Network request failed. Please check your internet connection and try again.",
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("Request timed out. Please try again.");
    }

    throw new Error("Something went wrong. Please try again later.");
  },
);

export default apiClient;
