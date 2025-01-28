export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export const API_ENDPOINT = {
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
  USERS: "/api/v1/users",
  PROFILE: "/api/v1/users/profile",
  CHAT: "/api/v1/chat",
} as const;
