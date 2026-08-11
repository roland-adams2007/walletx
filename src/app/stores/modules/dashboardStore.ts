import api from "@/app/api/axios";
import { create } from "zustand";

export type DashboardDateType =
  | "all"
  | "today"
  | "this_week"
  | "this_month"
  | "this_year";

export type RevenueData = {
  revenue: number;
};

export type RateData = {
  total: number;
  success_count: number;
  failed_count: number;
  success_rate: number;
  failed_rate: number;
};

type GetRevenueResponse = {
  success: boolean;
  message?: string;
  data: RevenueData;
};

type GetRateResponse = {
  success: boolean;
  message?: string;
  data: RateData;
};

type DashboardState = {
  revenue: RevenueData | null;
  isLoadingRevenue: boolean;
  revenueError: string | null;

  rate: RateData | null;
  isLoadingRate: boolean;
  rateError: string | null;

  fetchRevenue: (
    businessId: string,
    dateType?: DashboardDateType,
  ) => Promise<void>;

  fetchRate: (businessId: string) => Promise<void>;

  clearDashboard: () => void;
};

export const useDashboardStore = create<DashboardState>()((set) => ({
  revenue: null,
  isLoadingRevenue: false,
  revenueError: null,

  rate: null,
  isLoadingRate: false,
  rateError: null,

  fetchRevenue: async (businessId, dateType) => {
    set({ isLoadingRevenue: true, revenueError: null });

    try {
      const res = await api.get<GetRevenueResponse>("/dashboard/revenue", {
        params: {
          business_id: businessId,
          ...(dateType ? { date_type: dateType } : {}),
        },
      });

      if (res.data.success) {
        set({ revenue: res.data.data, isLoadingRevenue: false });
      } else {
        set({
          isLoadingRevenue: false,
          revenueError: "Failed to fetch revenue",
        });
      }
    } catch (err: any) {
      set({
        revenueError: err.response?.data?.message ?? "Failed to load revenue",
        isLoadingRevenue: false,
      });
    }
  },

  fetchRate: async (businessId) => {
    set({ isLoadingRate: true, rateError: null });

    try {
      const res = await api.get<GetRateResponse>("/dashboard/rate", {
        params: { business_id: businessId },
      });

      if (res.data.success) {
        set({ rate: res.data.data, isLoadingRate: false });
      } else {
        set({
          isLoadingRate: false,
          rateError: "Failed to fetch rate",
        });
      }
    } catch (err: any) {
      set({
        rateError: err.response?.data?.message ?? "Failed to load rate",
        isLoadingRate: false,
      });
    }
  },

  clearDashboard: () =>
    set({
      revenue: null,
      revenueError: null,
      rate: null,
      rateError: null,
    }),
}));
