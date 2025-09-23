import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
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
