import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const DEVICE_ID_KEY = "device_id";
const SESSION_KEY = "auth_session";

type AuthSession = {
  access_token: string;
  expires_at: number;
};

function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL + "/api",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const deviceId = getOrCreateDeviceId();
  const session = getSession();

  config.headers = config.headers ?? {};
  config.headers["X-Device-Id"] = deviceId;

  if (session?.access_token) {
    config.headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

function resolveQueue(token: string | null) {
  pendingQueue.forEach((resolve) => resolve(token));
  pendingQueue = [];
}

async function forceLogout() {
  const { useUserStore } = await import("@/app/stores/modules/userStore");
  useUserStore.getState().logout();
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh") ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest._retry = true;
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await api.post("/auth/refresh", {});

      if (!res.data.success || !res.data.access_token) {
        resolveQueue(null);
        await forceLogout();
        return Promise.reject(error);
      }

      const accessToken = res.data.access_token;
      let expiresAt: number;

      if (res.data.expires_in) {
        expiresAt = Math.floor(new Date(res.data.expires_in).getTime() / 1000);
      } else {
        expiresAt = Math.floor(Date.now() / 1000) + 900;
      }

      setSession({
        access_token: accessToken,
        expires_at: expiresAt,
      });

      resolveQueue(accessToken);

      originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(null);
      await forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
