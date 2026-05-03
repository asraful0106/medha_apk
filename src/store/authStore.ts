// @/src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient, { registerForceLogout } from "@/src/config/apiClient";
import { saveTokens, loadTokens, deleteTokens } from "../storage/tokenStorage";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { consoleDev } from "../utils/consoleDev";
import { TApiErrorResponse } from "../interfaces/apiResponse";

export interface AuthUser {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  isEmailVerified: boolean;
}

export type AuthFlow =
  | "login"
  | "register"
  | "emailVerifyOtp"
  | "verifyEmail"
  | "forgotPassword"
  | "resetOtp"
  | "newPassword";

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
}

function toApiError(err: unknown, fallbackMessage: string): TApiErrorResponse {
  if (err instanceof Error) {
    return {
      code: "CLIENT_ERROR",
      success: false,
      message: err.message || fallbackMessage,
      data: null,
      status_code: 0,
    };
  }
  return {
    code: "CLIENT_ERROR",
    success: false,
    message: fallbackMessage,
    data: null,
    status_code: 0,
  };
}

interface AuthState {
  // Hydration
  _hasHydrated: boolean;
  isHydrated: boolean;
  _setHasHydrated: (v: boolean) => void;

  // Session
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Flow state
  flowEmail: string;
  resetToken: string | null;
  emailVerifyToken: string | null;

  // UI State
  isLoading: boolean;
  error: TApiErrorResponse | null;

  // Actions
  setLoading: (v: boolean) => void;
  setError: (err: TApiErrorResponse | null) => void;
  setFlowEmail: (email: string) => void;

  loadSecureTokens: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;

  requestEmailOtp: () => Promise<void>;
  verifyEmailOtp: (otp: string) => Promise<void>;
  confirmEmailVerified: () => Promise<void>;

  requestPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (otp: string) => Promise<void>;
  resetPassword: (
    newPassword: string,
    confirmPassword: string,
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Hydration
      _hasHydrated: false,
      isHydrated: false,
      _setHasHydrated: (v: boolean) => set({ _hasHydrated: v, isHydrated: v }),

      // Session defaults
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      flowEmail: "",
      resetToken: null,
      emailVerifyToken: null,

      isLoading: false,
      error: null,

      setLoading: (v) => set({ isLoading: v }),
      setError: (err) => set({ error: err }),
      setFlowEmail: (email) => set({ flowEmail: email }),

      // ─── Rehydrate tokens from SecureStore into memory ────────────────────
      loadSecureTokens: async () => {
        const { accessToken, refreshToken } = await loadTokens();
        set({ accessToken, refreshToken });
      },

      // ─── Auth Actions ─────────────────────────────────────────────────────

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await apiClient.post("/auth/login", {
            email,
            password,
          });

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
            return;
          }

          const userData = res.data;
          await saveTokens(userData.access_token, userData.refresh_token);

          set({
            user: {
              id: userData.id,
              email: userData.email,
              phone: userData.phone,
              first_name: userData.first_name,
              last_name: userData.last_name,
              role: userData.role,
              status: userData.status,
              isEmailVerified: userData.is_email_verified,
            },
            accessToken: userData.access_token,
            refreshToken: userData.refresh_token,
            isAuthenticated: true,
            flowEmail: email,
          });
        } catch (err) {
          set({ error: toApiError(err, "Login failed") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await apiClient.post("/users", payload);

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
            return;
          }

          const userData = res.data;
          set({
            user: {
              id: userData.id,
              email: userData.email,
              phone: userData.phone,
              first_name: userData.first_name,
              last_name: userData.last_name,
              role: userData.role,
              status: userData.status,
              isEmailVerified: userData.is_email_verified,
            },
            flowEmail: payload.email,
            isAuthenticated: false,
          });
        } catch (err) {
          set({ error: toApiError(err, "Registration failed") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const { accessToken, refreshToken } = get();
        set({ isLoading: true });
        try {
          if (accessToken) {
            await apiClient.post("/auth/logout", {
              refresh_token: refreshToken,
            });
          }
        } catch (_) {
          consoleDev.log({comingFrom:"authStore.ts", line: 255}, _)
          // Silently ignore logout errors
        } finally {
          await deleteTokens();
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            flowEmail: "",
            resetToken: null,
            emailVerifyToken: null,
            error: null,
            isLoading: false,
          });
        }
      },

      requestEmailOtp: async () => {
        const { accessToken } = get();
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await apiClient.post(
            "/auth/req-email-verifiy-otp",
            {},
            {
              headers: accessToken
                ? { Authorization: `Bearer ${accessToken}` }
                : undefined,
            },
          );

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
          }
        } catch (err) {
          set({ error: toApiError(err, "Failed to request email OTP") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyEmailOtp: async (otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await apiClient.post("/auth/verify-email-otp", {
            otp,
          });

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
            return;
          }

          set({ emailVerifyToken: res.data?.token ?? null });
        } catch (err) {
          set({ error: toApiError(err, "OTP verification failed") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      confirmEmailVerified: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await apiClient.post(
            "/auth/confirm-email-verified",
            {},
          );

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
            return;
          }

          set((state) => ({
            user: state.user ? { ...state.user, isEmailVerified: true } : null,
          }));
        } catch (err) {
          set({ error: toApiError(err, "Email confirmation failed") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await apiClient.post("/auth/forgot-password", {
            email,
          });

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
            return;
          }

          set({ flowEmail: email });
        } catch (err) {
          set({ error: toApiError(err, "Password reset request failed") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      verifyResetCode: async (otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data: res } = await apiClient.post(
            "/auth/verify-reset-code",
            { otp },
          );

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
            return;
          }

          set({ resetToken: res.data?.token ?? null });
        } catch (err) {
          set({ error: toApiError(err, "Reset code verification failed") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (newPassword: string, confirmPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          const { resetToken } = get();
          const { data: res } = await apiClient.post("/auth/reset-password", {
            new_password: newPassword,
            confirm_password: confirmPassword,
            token: resetToken,
          });

          if (!res.success) {
            set({
              error: {
                code: res.code,
                success: res.success,
                message: res.message,
                data: null,
                status_code: res.status_code,
              },
            });
            return;
          }

          set({ resetToken: null });
        } catch (err) {
          set({ error: toApiError(err, "Password reset failed") });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },
    }),

    {
      name: "medha-auth",
      storage: createJSONStorage(() => AsyncStorage),
      // Tokens intentionally excluded — they live in SecureStore only
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error("[authStore] Rehydration failed:", error);
        else if (state) state._setHasHydrated(true);
      },
    },
  ),
);

// ─── Register the force-logout callback with apiClient ────────────────────────
// This runs once when authStore module is first imported.
// apiClient holds only a plain function reference — no store import needed.
registerForceLogout(() => {
  useAuthStore.getState().logout();
});