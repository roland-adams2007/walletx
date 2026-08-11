import api from "@/app/api/axios";
import { create } from "zustand";

export type PayoutListItem = {
  reference: string;
  status: string;
  source: string;
  amount: number;
  fee: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  created_at: string;
  processed_at: string | null;
};

export type PayoutDetail = {
  reference: string;
  status: string;
  source: string;
  amount: number;
  fee: number;
  bank_code: string;
  account_number: string;
  account_name: string;
  narration: string | null;
  gateway_reference: string | null;
  gateway_response: string | null;
  failure_reason: string | null;
  retry_count: number;
  ip_address: string | null;
  device: string | null;
  user_agent: string | null;
  created_at: string | null;
  processed_at: string | null;
  meta: any;
};

type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type GetPayoutsResponse = {
  success: boolean;
  message: string;
  data: PayoutListItem[];
  meta: PaginationMeta;
};

type GetPayoutResponse = {
  success: boolean;
  message: string;
  data: PayoutDetail;
};

export type PayoutFilters = {
  reference?: string;
  status?: string;
  source?: string;
  min_amount?: number | string;
  max_amount?: number | string;
  date_type?: string;
  start_date?: string;
  end_date?: string;
};

type PayoutState = {
  payouts: PayoutListItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  filters: PayoutFilters;

  currentPayout: PayoutDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  fetchPayouts: (
    page?: number,
    businessId?: string | null,
    filters?: PayoutFilters,
  ) => Promise<void>;

  fetchPayoutByReference: (reference: string) => Promise<PayoutDetail | null>;

  setFilters: (filters: PayoutFilters) => void;
  clearFilters: () => void;
  clearPayouts: () => void;
  clearCurrentPayout: () => void;
};

function pruneEmpty(filters: PayoutFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export const usePayoutStore = create<PayoutState>()((set, get) => ({
  payouts: [],
  meta: null,
  isLoading: false,
  error: null,
  filters: {},

  currentPayout: null,
  isLoadingDetail: false,
  detailError: null,

  fetchPayouts: async (page = 1, businessId, filters) => {
    set({ isLoading: true, error: null });

    try {
      const activeFilters = filters ?? get().filters;

      const res = await api.get<GetPayoutsResponse>("/payouts", {
        params: {
          page,
          ...(businessId ? { business_id: businessId } : {}),
          ...pruneEmpty(activeFilters),
        },
      });

      if (res.data.success) {
        set({
          payouts: res.data.data,
          meta: res.data.meta,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch payouts",
        });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message ?? "Failed to load payouts",
        isLoading: false,
      });
    }
  },

  fetchPayoutByReference: async (reference: string) => {
    set({ isLoadingDetail: true, detailError: null });

    try {
      const res = await api.get<GetPayoutResponse>(`/payouts/${reference}`);

      if (res.data.success) {
        set({
          currentPayout: res.data.data,
          isLoadingDetail: false,
        });
        return res.data.data;
      } else {
        set({
          isLoadingDetail: false,
          detailError: "Failed to fetch payout details",
        });
        return null;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ?? "Failed to load payout details";
      set({
        detailError: errorMessage,
        isLoadingDetail: false,
      });
      return null;
    }
  },

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  clearPayouts: () =>
    set({
      payouts: [],
      meta: null,
      error: null,
      filters: {},
    }),

  clearCurrentPayout: () =>
    set({
      currentPayout: null,
      detailError: null,
      isLoadingDetail: false,
    }),
}));