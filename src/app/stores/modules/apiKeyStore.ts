import api from "@/app/api/axios";
import { create } from "zustand";

export type ApiKey = {
  public_key: string;
  secret_key: string;
  environment: string;
  webhook_url: string | null;
  ip_whitelist: string[];
  last_used_at: string | null;
};

type GetApiKeysResponse = {
  success: boolean;
  data: ApiKey;
};

type RotateApiKeyResponse = {
  success: boolean;
  message: string;
  data: {
    public_key: string;
    secret_key: string;
    environment: string;
  };
};

type UpdateWebhookResponse = {
  success: boolean;
  message: string;
  data: {
    webhook_url: string | null;
  };
};

type UpdateIpWhitelistResponse = {
  success: boolean;
  message: string;
  data: {
    ip_whitelist: string[];
  };
};

type ApiKeyState = {
  apiKey: ApiKey | null;
  isLoading: boolean;
  isRotating: boolean;
  isUpdatingWebhook: boolean;
  isUpdatingIpWhitelist: boolean;
  error: string | null;
  hasFetched: boolean;

  fetchApiKeys: (businessAltId: string) => Promise<void>;
  rotateApiKey: (
    businessAltId: string,
  ) => Promise<{ success: boolean; message?: string; apiKey?: ApiKey }>;
  updateWebhook: (
    businessAltId: string,
    webhookUrl: string | null,
  ) => Promise<{ success: boolean; message?: string }>;
  updateIpWhitelist: (
    businessAltId: string,
    ipWhitelist: string[],
  ) => Promise<{ success: boolean; message?: string }>;
  clearApiKeys: () => void;
};

export const useApiKeyStore = create<ApiKeyState>()((set, get) => ({
  apiKey: null,
  isLoading: false,
  isRotating: false,
  isUpdatingWebhook: false,
  isUpdatingIpWhitelist: false,
  error: null,
  hasFetched: false,

  fetchApiKeys: async (businessAltId) => {
    if (get().hasFetched || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<GetApiKeysResponse>("/business/api-keys", {
        params: { alt_id: businessAltId },
      });
      if (res.data.success) {
        set({ apiKey: res.data.data, isLoading: false, hasFetched: true });
      } else {
        set({ isLoading: false, error: "Failed to fetch API keys" });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message ?? "Failed to load API keys",
        isLoading: false,
      });
    }
  },

  rotateApiKey: async (businessAltId) => {
    set({ isRotating: true, error: null });
    try {
      const res = await api.post<RotateApiKeyResponse>(
        "/business/api-keys/rotate",
        {
          alt_id: businessAltId,
        },
      );
      if (res.data.success && res.data.data) {
        let updatedKey: ApiKey;
        set((state) => {
          updatedKey = state.apiKey
            ? { ...state.apiKey, ...res.data.data }
            : {
                ...res.data.data,
                webhook_url: null,
                ip_whitelist: [],
                last_used_at: null,
              };
          return { apiKey: updatedKey, isRotating: false };
        });
        return {
          success: true,
          message: res.data.message,
          apiKey: updatedKey!,
        };
      }
      set({ isRotating: false });
      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({ isRotating: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to rotate API key",
      };
    }
  },

  updateWebhook: async (businessAltId, webhookUrl) => {
    set({ isUpdatingWebhook: true, error: null });
    try {
      const res = await api.put<UpdateWebhookResponse>(
        "/business/api-keys/webhook",
        { alt_id: businessAltId, webhook_url: webhookUrl },
      );
      if (res.data.success) {
        set((state) => ({
          apiKey: state.apiKey
            ? { ...state.apiKey, webhook_url: res.data.data.webhook_url }
            : state.apiKey,
          isUpdatingWebhook: false,
        }));
        return { success: true, message: res.data.message };
      }
      set({ isUpdatingWebhook: false });
      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({ isUpdatingWebhook: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to update webhook",
      };
    }
  },

  updateIpWhitelist: async (businessAltId, ipWhitelist) => {
    set({ isUpdatingIpWhitelist: true, error: null });
    try {
      const res = await api.put<UpdateIpWhitelistResponse>(
        "/business/api-keys/ip-whitelist",
        { alt_id: businessAltId, ip_whitelist: ipWhitelist },
      );
      if (res.data.success) {
        set((state) => ({
          apiKey: state.apiKey
            ? { ...state.apiKey, ip_whitelist: res.data.data.ip_whitelist }
            : state.apiKey,
          isUpdatingIpWhitelist: false,
        }));
        return { success: true, message: res.data.message };
      }
      set({ isUpdatingIpWhitelist: false });
      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({ isUpdatingIpWhitelist: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to update IP whitelist",
      };
    }
  },

  clearApiKeys: () => set({ apiKey: null, hasFetched: false, error: null }),
}));
