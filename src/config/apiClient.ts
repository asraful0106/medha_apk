// @/src/config/apiClient.ts
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import { envVars } from "./envVars";
import { getDeviceId } from "../utils/getDeviceId";
import { consoleDev } from "../utils/consoleDev";

const BASE_URL = envVars.BASE_URL;

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Device-Type": "phone",
  },
});

// Request Interceptor - Add Device ID
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const deviceId = await getDeviceId();
    config.headers["X-Device-ID"] = deviceId || "unknown";
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
// - Server-side errors (4xx / 5xx): RESOLVED so each store action handles
//   structured TApiErrorResponse itself.
// - Network / timeout errors: THROWN so they bubble to the catch block.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    consoleDev.log({ comingFrom: "apiClient.ts", line: 34 }, error);

    // ── Server responded with an error status ────────────────────────────
    // Resolve instead of reject so the store receives the full response
    // and can extract the structured TApiErrorResponse from res.data.
    if (error.response) {
      return Promise.resolve(error.response);
    }

    // ── No response received (network / timeout) ─────────────────────────
    const isNetworkError =
      error.code === "ERR_NETWORK" ||
      error.message.toLowerCase().includes("network") ||
      error.message.toLowerCase().includes("failed");

    if (isNetworkError) {
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
