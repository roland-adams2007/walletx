import api from "@/app/api/axios";
import { clearSession } from "@/app/api/axios";
import { create } from "zustand";

export type Business = {
  name: string;
  alt_id: string;
};

export type User = {
  firstname: string;
  lastname: string;
  middlename: string | null;
  email: string;
  phone: string;
  business: Business[];
};

type UserResponse = {
  success: boolean;
  data: User;
};

type UpdateProfileResponse = {
  success: boolean;
  message: string;
  data: Pick<User, "firstname" | "lastname" | "middlename" | "phone">;
};

type UpdatePasswordResponse = {
  success: boolean;
  message: string;
};

type UpdateProfilePayload = {
  firstname?: string;
  lastname?: string;
  middlename?: string | null;
  phone?: string;
};

type UpdatePasswordPayload = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

type UserState = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User) => void;
  updateProfile: (
    payload: UpdateProfilePayload,
  ) => Promise<{ success: boolean; message?: string }>;
  updatePassword: (
    payload: UpdatePasswordPayload,
  ) => Promise<{ success: boolean; message?: string }>;
  clearUser: () => void;
  logout: () => Promise<void>;
};

export const useUserStore = create<UserState>()((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  hasFetched: false,

  fetchUser: async () => {
    if (get().hasFetched || get().isLoading) return;
    set({ isLoading: true, error: null });
    try {
      const res = await api.get<UserResponse>("/user");
      set({ user: res.data.data, isLoading: false, hasFetched: true });
    } catch (err) {
      set({ error: "Failed to load user", isLoading: false });
    }
  },

  setUser: (user) => set({ user, hasFetched: true, error: null }),

  updateProfile: async (payload) => {
    try {
      const res = await api.patch<UpdateProfileResponse>(
        "/user/profile",
        payload,
      );

      if (res.data.success) {
        set((state) => ({
          user: state.user ? { ...state.user, ...res.data.data } : state.user,
        }));
      }

      return { success: res.data.success, message: res.data.message };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to update profile",
      };
    }
  },

  updatePassword: async (payload) => {
    try {
      const res = await api.put<UpdatePasswordResponse>(
        "/user/password",
        payload,
      );
      return { success: res.data.success, message: res.data.message };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to update password",
      };
    }
  },

  clearUser: () => set({ user: null, hasFetched: false, error: null }),

  logout: async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
    } finally {
      clearSession();
      set({ user: null, hasFetched: false, error: null });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
}));
