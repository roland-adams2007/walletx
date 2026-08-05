import api from "@/app/api/axios";
import { create } from "zustand";

export type TransactionListItem = {
  status: string;
  customer_email: string;
  reference: string;
  channel: string;
  date: string;
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
  transactions: TransactionListItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  filters: TransactionFilters;

  fetchTransactions: (
    page?: number,
    businessId?: string | null,
    filters?: TransactionFilters,
  ) => Promise<void>;

  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;
  clearTransactions: () => void;
};

function pruneEmpty(filters: TransactionFilters) {
  return Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  meta: null,
  isLoading: false,
  error: null,

  filters: {},

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

  setFilters: (filters) => set({ filters }),

  clearFilters: () => set({ filters: {} }),

  clearTransactions: () =>
    set({
      transactions: [],
      meta: null,
      error: null,
      filters: {},
    }),
}));