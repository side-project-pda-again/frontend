import axios from "axios";
import { useUserStore } from "@stores/userStore";

const api = axios.create({
  baseURL: "/api",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const userId = useUserStore.getState().user?.id;
  if (config.isAuth && userId != null) {
    config.params = {
      ...(config.params || {}),
      userId,
    };
  }
  return config;
});

// 빈값/null/undefined/빈 문자열 제거
export const cleanParams = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && String(v).trim() !== ""
    )
  );

export default api;
