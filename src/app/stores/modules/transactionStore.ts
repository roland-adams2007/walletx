import api from "@/app/api/axios";
import { create } from "zustand";

export type TransactionListItem = {
  status: string;
  customer_email: string;
  reference: string;
  channel: string;
  date: string;
};

export type TransactionDetail = {
  reference: string;
  amount: number;
  fee: number;
  net_amount: number;
  channel: string;
  transaction_type: string;
  status: string;
  date: string | null;
  paid_at: string | null;
  narration: string | null;
  customer: {
    name: string;
    email: string;
    cus_id: string;
  } | null;
  authorization: any;
  ip_address: string | null;
  device: string | null;
  user_agent: string | null;
  balance_before: number | null;
  balance_after: number | null;
  gateway_response: string | null;
  meta: any;
};

type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type GetTransactionsResponse = {
  success: boolean;
  message: string;
  data: TransactionListItem[];
  meta: PaginationMeta;
};

type GetTransactionResponse = {
  success: boolean;
  message: string;
  data: TransactionDetail;
};

export type TransactionFilters = {
  cus_id?: string;
  reference?: string;
  customer?: string;
  min_amount?: number | string;
  max_amount?: number | string;
  status?: string;
  channel?: string;
  transaction_type?: string;
  date_type?: string;
  start_date?: string;
  end_date?: string;
};

type TransactionState = {
  // List state
  transactions: TransactionListItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;

  // Detail state
  currentTransaction: TransactionDetail | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Actions
  fetchTransactions: (
    page?: number,
    businessId?: string | null,
    filters?: TransactionFilters,
  ) => Promise<void>;

  fetchTransactionByReference: (
    reference: string,
  ) => Promise<TransactionDetail | null>;

  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  clearTransactions: () => void;
  clearCurrentTransaction: () => void;
};

function pruneEmpty(filters: TransactionFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  // List state
  transactions: [],
  meta: null,
  isLoading: false,
  error: null,
  filters: {},

  // Detail state
  currentTransaction: null,
  isLoadingDetail: false,
  detailError: null,

  fetchTransactions: async (page = 1, businessId, filters) => {
    set({ isLoading: true, error: null });

    try {
      const activeFilters = filters ?? get().filters;

      const res = await api.get<GetTransactionsResponse>("/transactions", {
        params: {
          page,
          ...(businessId ? { business_id: businessId } : {}),
          ...pruneEmpty(activeFilters),
        },
      });

      if (res.data.success) {
        set({
          transactions: res.data.data,
          meta: res.data.meta,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch transactions",
        });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message ?? "Failed to load transactions",
        isLoading: false,
      });
    }
  },

  fetchTransactionByReference: async (reference: string) => {
    set({ isLoadingDetail: true, detailError: null });

    try {
      const res = await api.get<GetTransactionResponse>(
        `/transactions/${reference}`,
      );

      if (res.data.success) {
        set({
          currentTransaction: res.data.data,
          isLoadingDetail: false,
        });
        return res.data.data;
      } else {
        set({
          isLoadingDetail: false,
          detailError: "Failed to fetch transaction details",
        });
        return null;
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ?? "Failed to load transaction details";
      set({
        detailError: errorMessage,
        isLoadingDetail: false,
      });
      return null;
    }
  },

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  clearTransactions: () =>
    set({
      transactions: [],
      meta: null,
      error: null,
      filters: {},
    }),

  clearCurrentTransaction: () =>
    set({
      currentTransaction: null,
      detailError: null,
      isLoadingDetail: false,
    }),
}));
