import axios, { AxiosError } from "axios";
import { UserLogin, UserRegister } from "./api.type";
import { API_URL, API_ENDPOINT } from "./api.endpoint";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface ErrorResponse {
  message?: string;
}

// Add request interceptor for auth token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handler
const handleError = (error: AxiosError<ErrorResponse>) => {
  const errorMessage = error.response?.data?.message || error.message;
  throw new Error(errorMessage);
};

// Add to your existing interfaces
interface RegisterResponse {
  success: boolean;
  data?: {
    user: {
      _id: string;
      username: string;
      email: string;
      avatar?: string;
    };
    token: string;
  };
  message?: string;
}

export const api = {
  login: async (data: UserLogin) => {
    try {
      const response = await axiosInstance.post(API_ENDPOINT.LOGIN, data);
      console.log("*** response ***", response);
      if (response.data?.data?.token) {
        localStorage.setItem("token", response.data?.data?.token);
      }
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  register: async (data: {
    username: string;
    email: string;
    password: string;
    avatar?: string;
  }): Promise<RegisterResponse> => {
    try {
      const response = await axiosInstance.post<RegisterResponse>(
        API_ENDPOINT.REGISTER,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data?.data?.token) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error("Registration failed. Please try again.");
    }
  },
  getAllUsers: async () => {
    try {
      const response = await axiosInstance.get(API_ENDPOINT.USERS);
      console.log("*** response ***", response);
      return response.data;
    } catch (error) {
      return handleError(error as AxiosError<ErrorResponse>);
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
  },
};
