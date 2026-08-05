import api from "@/app/api/axios";
import { create } from "zustand";

export type CustomerListItem = {
  cus_id: string;
  name: string;
  phone: string | null;
  email: string;
  is_blacklist: boolean;
  date_added: string;
};

export type RecentTransaction = {
  amount: number;
  channel: string;
  status: string;
  created_at: string;
};

export type CustomerTransactions = {
  successful_transactions: number;
  total_transactions: number;
  total_spent: number;
  recent_transactions: RecentTransaction[];
};

export type CustomerDetails = {
  cus_id: string;
  name: string;
  email: string;
  phone: string | null;
  is_blacklist: boolean;
  transactions: CustomerTransactions;
};

export type CreateCustomerPayload = {
  business_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
};

export type UpdateCustomerPayload = {
  firstname: string;
  lastname: string;
  phone: string;
};

export type Customer = {
  cus_id: string;
  name: string;
  phone: string | null;
  email: string;
  is_blacklist: boolean;
  created_at: string;
  updated_at: string;
};

type PaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

type GetCustomersResponse = {
  success: boolean;
  message: string;
  data: CustomerListItem[];
  meta: PaginationMeta;
};

type GetCustomerResponse = {
  success: boolean;
  message: string;
  data: CustomerDetails;
};

type CreateCustomerResponse = {
  success: boolean;
  message: string;
  data: Customer;
};

type UpdateCustomerResponse = {
  success: boolean;
  message: string;
  data: {
    cus_id: string;
    name: string;
    email: string;
    phone: string | null;
    is_blacklist: boolean;
  };
};

type UpdateBlacklistResponse = {
  success: boolean;
  message: string;
  data: {
    cus_id: string;
    is_blacklist: boolean;
  };
};

type CustomerState = {
  customers: CustomerListItem[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;

  selectedCustomer: CustomerDetails | null;
  isLoadingDetails: boolean;

  isCreating: boolean;
  isUpdating: boolean;
  isTogglingBlacklist: boolean;

  emailFilter: string;

  fetchCustomers: (
    page?: number,
    email?: string,
    businessId?: string | null,
  ) => Promise<void>;

  fetchCustomer: (
    cusId: string,
  ) => Promise<{ success: boolean; message?: string }>;

  createCustomer: (
    payload: CreateCustomerPayload,
  ) => Promise<{ success: boolean; message?: string; customer?: Customer }>;

  updateCustomer: (
    cusId: string,
    payload: UpdateCustomerPayload,
  ) => Promise<{ success: boolean; message?: string }>;

  toggleBlacklist: (
    cusId: string,
    isBlacklist: boolean,
  ) => Promise<{ success: boolean; message?: string }>;

  setEmailFilter: (email: string) => void;
  clearSelectedCustomer: () => void;
  clearCustomers: () => void;
};

export const useCustomerStore = create<CustomerState>()((set, get) => ({
  customers: [],
  meta: null,
  isLoading: false,
  error: null,

  selectedCustomer: null,
  isLoadingDetails: false,

  isCreating: false,
  isUpdating: false,
  isTogglingBlacklist: false,

  emailFilter: "",

  fetchCustomers: async (page = 1, email, business_id) => {
    set({ isLoading: true, error: null });

    try {
      const emailQuery = email ?? get().emailFilter;

      const res = await api.get<GetCustomersResponse>("/customers", {
        params: {
          page,
          ...(emailQuery ? { email: emailQuery } : {}),
          ...(business_id ? { business_id } : {}),
        },
      });

      if (res.data.success) {
        set({
          customers: res.data.data,
          meta: res.data.meta,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: "Failed to fetch customers",
        });
      }
    } catch (err: any) {
      set({
        error: err.response?.data?.message ?? "Failed to load customers",
        isLoading: false,
      });
    }
  },

  fetchCustomer: async (cusId) => {
    set({ isLoadingDetails: true, error: null });

    try {
      const res = await api.get<GetCustomerResponse>(`/customers/${cusId}`);

      if (res.data.success) {
        set({
          selectedCustomer: res.data.data,
          isLoadingDetails: false,
        });

        return {
          success: true,
          message: res.data.message,
        };
      }

      set({ isLoadingDetails: false });

      return {
        success: false,
        message: res.data.message,
      };
    } catch (err: any) {
      set({
        isLoadingDetails: false,
        error: err.response?.data?.message ?? "Failed to load customer",
      });

      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to load customer",
      };
    }
  },

  createCustomer: async (payload) => {
    set({ isCreating: true, error: null });

    try {
      const res = await api.post<CreateCustomerResponse>("/customers", payload);

      if (res.data.success && res.data.data) {
        const customer = res.data.data;

        set((state) => ({
          isCreating: false,
          customers: [
            {
              cus_id: customer.cus_id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              is_blacklist: customer.is_blacklist,
              date_added: customer.created_at,
            },
            ...state.customers,
          ],
          meta: state.meta
            ? {
                ...state.meta,
                total: state.meta.total + 1,
              }
            : state.meta,
        }));

        return {
          success: true,
          message: res.data.message,
          customer,
        };
      }

      set({ isCreating: false });

      return {
        success: false,
        message: res.data.message,
      };
    } catch (err: any) {
      set({ isCreating: false });

      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to create customer",
      };
    }
  },

  updateCustomer: async (cusId, payload) => {
    set({ isUpdating: true, error: null });

    try {
      const res = await api.put<UpdateCustomerResponse>(
        `/customers/${cusId}`,
        payload,
      );

      if (res.data.success) {
        const updated = res.data.data;

        set((state) => ({
          isUpdating: false,
          selectedCustomer: state.selectedCustomer
            ? {
                ...state.selectedCustomer,
                name: updated.name,
                phone: updated.phone,
              }
            : state.selectedCustomer,
          customers: state.customers.map((customer) =>
            customer.cus_id === cusId
              ? { ...customer, name: updated.name, phone: updated.phone }
              : customer,
          ),
        }));

        return { success: true, message: res.data.message };
      }

      set({ isUpdating: false });

      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({ isUpdating: false });

      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to update customer",
      };
    }
  },

  toggleBlacklist: async (cusId, isBlacklist) => {
    set({ isTogglingBlacklist: true, error: null });

    try {
      const res = await api.patch<UpdateBlacklistResponse>(
        `/customers/${cusId}/blacklist`,
        { is_blacklist: isBlacklist },
      );

      if (res.data.success) {
        const updated = res.data.data;

        set((state) => ({
          isTogglingBlacklist: false,
          selectedCustomer: state.selectedCustomer
            ? { ...state.selectedCustomer, is_blacklist: updated.is_blacklist }
            : state.selectedCustomer,
          customers: state.customers.map((customer) =>
            customer.cus_id === cusId
              ? { ...customer, is_blacklist: updated.is_blacklist }
              : customer,
          ),
        }));

        return { success: true, message: res.data.message };
      }

      set({ isTogglingBlacklist: false });

      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({ isTogglingBlacklist: false });

      return {
        success: false,
        message:
          err.response?.data?.message ?? "Failed to update blacklist status",
      };
    }
  },

  setEmailFilter: (email) => set({ emailFilter: email }),

  clearSelectedCustomer: () => set({ selectedCustomer: null }),

  clearCustomers: () =>
    set({
      customers: [],
      meta: null,
      error: null,
      emailFilter: "",
    }),
}));
