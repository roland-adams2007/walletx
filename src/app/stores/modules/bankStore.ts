import api from "@/app/api/axios";
import { create } from "zustand";

export type Bank = {
  id: number;
  bank_code: string;
  name: string;
  slug: string;
  is_active: boolean;
};

export type VerifiedAccount = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

type VerifyBankAccountPayload = {
  account_number: string;
  bank_code: string;
};

type VerifyBankAccountResponse = {
  success: boolean;
  message: string;
  data: VerifiedAccount;
};

type BankState = {
  banks: Bank[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  isVerifying: boolean;
  verifiedAccount: VerifiedAccount | null;

  fetchBanks: () => Promise<void>;
  verifyBankAccount: (
    payload: VerifyBankAccountPayload,
  ) => Promise<{
    success: boolean;
    message?: string;
    account?: VerifiedAccount;
  }>;
  clearVerifiedAccount: () => void;
};

export const useBankStore = create<BankState>()((set, get) => ({
  banks: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  isVerifying: false,
  verifiedAccount: null,

  fetchBanks: async () => {
    if (get().hasFetched || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<Bank[]>("/banks");
      set({ banks: res.data, isLoading: false, hasFetched: true });
    } catch (err) {
      set({ error: "Failed to load banks", isLoading: false });
    }
  },

  verifyBankAccount: async (payload) => {
    set({ isVerifying: true });
    try {
      const res = await api.post<VerifyBankAccountResponse>(
        "/bank/verify",
        payload,
      );

      if (res.data.success) {
        set({ verifiedAccount: res.data.data, isVerifying: false });
        return {
          success: true,
          message: res.data.message,
          account: res.data.data,
        };
      }

      set({ isVerifying: false });
      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({ isVerifying: false });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to verify bank account",
      };
    }
  },

  clearVerifiedAccount: () => set({ verifiedAccount: null }),
}));
