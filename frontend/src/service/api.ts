import axios, { AxiosResponse } from "axios";
import { API_URL, API_ENDPOINT } from "./api.endpoint";
export const api = {
  login: async (data: { email: string; password: string }) => {
    try {
      const res: AxiosResponse = await axios.post(
        `${API_URL}${API_ENDPOINT.LOGIN}`,
        data
      );
      if (res?.data?.data?.token) {
        localStorage.setItem("token", res?.data?.data?.token);
      }
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  register: async (data: {
    username: string;
    email: string;
    password: string;
    avatar?: string;
  }) => {
    try {
      console.log("((()()()()()()()()()", data);

      const res: AxiosResponse = await axios.post(
        `${API_URL}${API_ENDPOINT.REGISTER}`,
        data
      );
      console.log("*** res ***", res);
      return res.data;
    } catch (error) {
      throw error;
    }
  },
  upload: async (data: { file: File }) => {
    try {
      const formData = new FormData();
      formData.append("avatar", data.file);

      const res: AxiosResponse = await axios.post(
        `${API_URL}${API_ENDPOINT.UPLOAD}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Upload failed");
      }

      return res.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const res: AxiosResponse = await axios.post(
        `${API_URL}${API_ENDPOINT.LOGOUT}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
  message: async () => {
    try {
    } catch (error) {
      throw error;
    }
  },
  getAllUsers: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token");
      }

      const res: AxiosResponse = await axios.get(
        `${API_URL}${API_ENDPOINT.USERS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return res.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },
};
