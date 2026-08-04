import api from "@/app/api/axios";
import { create } from "zustand";

export type Upload = {
  id: number;
  url: string;
};

type UploadResponse = {
  success: boolean;
  message: string;
  data: Upload;
};

type UploadState = {
  isUploading: boolean;
  error: string | null;

  uploadFile: (
    file: File,
  ) => Promise<{ success: boolean; message?: string; upload?: Upload }>;
};

export const useUploadStore = create<UploadState>()((set) => ({
  isUploading: false,
  error: null,

  uploadFile: async (file) => {
    set({ isUploading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post<UploadResponse>("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      set({ isUploading: false });

      if (res.data.success) {
        return {
          success: true,
          message: res.data.message,
          upload: res.data.data,
        };
      }

      return { success: false, message: res.data.message };
    } catch (err: any) {
      set({
        isUploading: false,
        error: err.response?.data?.message ?? "Failed to upload file",
      });
      return {
        success: false,
        message: err.response?.data?.message ?? "Failed to upload file",
      };
    }
  },
}));
