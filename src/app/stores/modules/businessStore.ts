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

export type BusinessPreference = {
  send_receipt_to_business?: boolean;
  send_receipt_to_customer?: boolean;
  charge_fee_to_customer?: boolean;
};

export type BusinessDetails = {
  name: string;
  alt_id: string;
  business_type?: "individual" | "registered";
  industry?: string;
  email?: string;
  phone?: string;
  logo?: string | null;
  max_balance?: number | null;
  kyc_status?: "unverified" | "verified";
  kyc_verified_at?: string | null;
  settlement_bank_code?: string | null;
  settlement_account_number?: string | null;
  settlement_account_name?: string | null;
  is_active?: boolean;
  preference?: BusinessPreference;
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

export type UpdateBusinessDetailsPayload = {
  alt_id: string;
  name?: string;
  email?: string;
  phone?: string;
  industry?: string;
  logo?: number;
};

type UpdateBusinessDetailsResponse = {
  success: boolean;
  message: string;
  data: {
    alt_id: string;
    name: string;
    email?: string;
    phone?: string;
    industry?: string;
    logo?: string;
  };
};

type UpgradeToRegisteredResponse = {
  success: boolean;
  message: string;
  data: {
    alt_id: string;
    business_type: "individual" | "registered";
    max_balance: number | null;
    kyc_status: "unverified" | "verified";
    kyc_verified_at: string | null;
  };
};

export type UpdateSettlementBankPayload = {
  alt_id: string;
  settlement_bank_code: string;
  settlement_account_number: string;
  settlement_account_name: string;
};

type UpdateSettlementBankResponse = {
  success: boolean;
  message: string;
  data: {
    alt_id: string;
    settlement_bank_code: string;
    settlement_account_number: string;
    settlement_account_name: string;
  };
};

export type UpdatePreferencePayload = {
  alt_id: string;
  send_receipt_to_business?: boolean;
  send_receipt_to_customer?: boolean;
  charge_fee_to_customer?: boolean;
};

type UpdatePreferenceResponse = {
  success: boolean;
  message: string;
  data: BusinessPreference;
};

export type BusinessBalance = {
  alt_id: string;
  balance: number;
  pending_balance: number;
};

type GetBusinessBalanceResponse = {
  success: boolean;
  data: BusinessBalance;
};

const STORAGE_KEY = "selected_business_id";

type BusinessState = {
  selectedBusinessId: string | null;
  hasHydrated: boolean;
  businessDetails: BusinessDetails | null;
  balance: BusinessBalance | null;
  isCreating: boolean;
  isLoadingDetails: boolean;
  isLoadingBalance: boolean;
  isDeactivating: boolean;
  isUpdatingDetails: boolean;
  isUpgrading: boolean;
  isUpdatingSettlementBank: boolean;
  isUpdatingPreference: boolean;

  hydrateSelectedBusinessId: () => void;
  setSelectedBusinessId: (altId: string) => void;
  clearSelectedBusiness: () => void;

  fetchBusinessDetails: (altId: string) => Promise<void>;
  fetchBusinessBalance: (altId: string) => Promise<void>;
  createBusiness: (
    payload: CreateBusinessPayload,
  ) => Promise<{ success: boolean; message?: string; altId?: string }>;
  deactivateBusiness: (
    altId: string,
  ) => Promise<{ success: boolean; message?: string }>;
  updateBusinessDetails: (
    payload: UpdateBusinessDetailsPayload,
  ) => Promise<{ success: boolean; message?: string }>;
  upgradeToRegistered: (
    altId: string,
  ) => Promise<{ success: boolean; message?: string }>;
  updateSettlementBank: (
    payload: UpdateSettlementBankPayload,
  ) => Promise<{ success: boolean; message?: string }>;
  updatePreference: (
    payload: UpdatePreferencePayload,
  ) => Promise<{ success: boolean; message?: string }>;
};

export const useBusinessStore = create<BusinessState>()((set, get) => ({
  selectedBusinessId: null,
  hasHydrated: false,
  businessDetails: null,
  balance: null,
  isCreating: false,
  isLoadingDetails: false,
  isLoadingBalance: false,
  isDeactivating: false,
  isUpdatingDetails: false,
  isUpgrading: false,
  isUpdatingSettlementBank: false,
  isUpdatingPreference: false,

  hydrateSelectedBusinessId: () => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    set({ selectedBusinessId: stored ?? null, hasHydrated: true });
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
    set({ selectedBusinessId: null, businessDetails: null, balance: null });
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

  fetchBusinessBalance: async (altId) => {
    set({ isLoadingBalance: true });
    try {
      const res = await api.get<GetBusinessBalanceResponse>(
        "/business/balance",
        { params: { alt_id: altId } },
      );
      if (res.data.success) {
        set({ balance: res.data.data, isLoadingBalance: false });
      } else {
        set({ isLoadingBalance: false });
      }
    } catch {
      set({ isLoadingBalance: false });
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

  updateBusinessDetails: async (payload) => {
    set({ isUpdatingDetails: true });
    try {
      const res = await api.put<UpdateBusinessDetailsResponse>(
        "/business",
        payload,
      );

      if (res.data.success) {
        set((state) => ({
          businessDetails: state.businessDetails
            ? { ...state.businessDetails, ...res.data.data }
            : state.businessDetails,
          isUpdatingDetails: false,
        }));
      } else {
        set({ isUpdatingDetails: false });
      }

      return { success: res.data.success, message: res.data.message };
    } catch (err: any) {
      set({ isUpdatingDetails: false });
      return {
        success: false,
        message:
          err.response?.data?.message ?? "Failed to update business details",
      };
    }
  },

  upgradeToRegistered: async (altId) => {
    set({ isUpgrading: true });
    try {
      const res = await api.post<UpgradeToRegisteredResponse>(
        "/business/upgrade",
        { alt_id: altId },
      );

      if (res.data.success) {
        set((state) => ({
          businessDetails:
            state.businessDetails && state.businessDetails.alt_id === altId
              ? { ...state.businessDetails, ...res.data.data }
              : state.businessDetails,
          isUpgrading: false,
        }));
      } else {
        set({ isUpgrading: false });
      }

      return { success: res.data.success, message: res.data.message };
    } catch (err: any) {
      set({ isUpgrading: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to upgrade business",
      };
    }
  },

  updateSettlementBank: async (payload) => {
    set({ isUpdatingSettlementBank: true });
    try {
      const res = await api.put<UpdateSettlementBankResponse>(
        "/business/settlement-bank",
        payload,
      );

      if (res.data.success) {
        set((state) => ({
          businessDetails: state.businessDetails
            ? { ...state.businessDetails, ...res.data.data }
            : state.businessDetails,
          isUpdatingSettlementBank: false,
        }));
      } else {
        set({ isUpdatingSettlementBank: false });
      }

      return { success: res.data.success, message: res.data.message };
    } catch (err: any) {
      set({ isUpdatingSettlementBank: false });
      return {
        success: false,
        message:
          err.response?.data?.message ?? "Failed to update settlement bank",
      };
    }
  },

  updatePreference: async (payload) => {
    set({ isUpdatingPreference: true });
    try {
      const res = await api.put<UpdatePreferenceResponse>(
        "/business/preference",
        payload,
      );

      if (res.data.success) {
        set((state) => ({
          businessDetails: state.businessDetails
            ? {
                ...state.businessDetails,
                preference: {
                  ...state.businessDetails.preference,
                  ...res.data.data,
                },
              }
            : state.businessDetails,
          isUpdatingPreference: false,
        }));
      } else {
        set({ isUpdatingPreference: false });
      }

      return { success: res.data.success, message: res.data.message };
    } catch (err: any) {
      set({ isUpdatingPreference: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to update preference",
      };
    }
  },
}));