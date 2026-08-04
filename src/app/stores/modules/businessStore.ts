import api from "@/app/api/axios";
import { create } from "zustand";

export type CreateBusinessPayload = {
  name: string;
  business_type: "individual" | "registered";
  industry?: string;
  email?: string;
  phone?: string;
};

type CreateBusinessResponse = {
  success: boolean;
  message: string;
  data: {
    name: string;
    alt_id: string;
  };
};

export type BusinessDetails = {
  name: string;
  alt_id: string;
  business_type?: string;
  industry?: string;
  email?: string;
  phone?: string;
  is_active?: boolean;
  [key: string]: unknown;
};

type BusinessDetailsResponse = {
  success: boolean;
  data: BusinessDetails;
};

type DeactivateBusinessResponse = {
  success: boolean;
  message: string;
  data: {
    alt_id: string;
    is_active: boolean;
  };
};

const STORAGE_KEY = "selected_business_id";

type BusinessState = {
  selectedBusinessId: string | null;
  businessDetails: BusinessDetails | null;
  isCreating: boolean;
  isLoadingDetails: boolean;
  isDeactivating: boolean;

  hydrateSelectedBusinessId: () => void;
  setSelectedBusinessId: (altId: string) => void;
  clearSelectedBusiness: () => void;

  fetchBusinessDetails: (altId: string) => Promise<void>;
  createBusiness: (
    payload: CreateBusinessPayload,
  ) => Promise<{ success: boolean; message?: string; altId?: string }>;
  deactivateBusiness: (
    altId: string,
  ) => Promise<{ success: boolean; message?: string }>;
};

export const useBusinessStore = create<BusinessState>()((set, get) => ({
  selectedBusinessId: null,
  businessDetails: null,
  isCreating: false,
  isLoadingDetails: false,
  isDeactivating: false,

  hydrateSelectedBusinessId: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) set({ selectedBusinessId: stored });
  },

  setSelectedBusinessId: (altId) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, altId);
    }
    set({ selectedBusinessId: altId });
  },

  clearSelectedBusiness: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ selectedBusinessId: null, businessDetails: null });
  },

  fetchBusinessDetails: async (altId) => {
    set({ isLoadingDetails: true });
    try {
      const res = await api.get<BusinessDetailsResponse>("/business", {
        params: { alt_id: altId },
      });
      if (res.data.success) {
        set({ businessDetails: res.data.data, isLoadingDetails: false });
      } else {
        set({ isLoadingDetails: false });
      }
    } catch {
      set({ isLoadingDetails: false });
    }
  },

  createBusiness: async (payload) => {
    set({ isCreating: true });
    try {
      const res = await api.post<CreateBusinessResponse>("/business", payload);

      if (res.data.success && res.data.data?.alt_id) {
        const altId = res.data.data.alt_id;
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, altId);
        }
        set({ selectedBusinessId: altId, isCreating: false });
        return { success: true, message: res.data.message, altId };
      }

      set({ isCreating: false });
      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({ isCreating: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to create business",
      };
    }
  },

  deactivateBusiness: async (altId) => {
    set({ isDeactivating: true });
    try {
      const res = await api.post<DeactivateBusinessResponse>(
        "/business/deactivate",
        { alt_id: altId },
      );

      if (res.data.success) {
        set((state) => ({
          businessDetails:
            state.businessDetails && state.businessDetails.alt_id === altId
              ? { ...state.businessDetails, is_active: res.data.data.is_active }
              : state.businessDetails,
          isDeactivating: false,
        }));
      } else {
        set({ isDeactivating: false });
      }

      return { success: res.data.success, message: res.data.message };
    } catch (err: any) {
      set({ isDeactivating: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to deactivate business",
      };
    }
  },
}));
