/* eslint-disable react/prop-types */
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { useUserStore } from "@stores/userStore";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// 데모용: 메모리 “유저 DB”
const seedUsers = [
  { id: 1, name: "홍길동", email: "email@email.com", password: "123456" },
];

export default function AuthProvider({ children }) {
  const [users, setUsers] = useState(seedUsers);
  const nextIdRef = useRef(2);

  // ✅ 단일 진실 소스: Zustand
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const logoutStore = useUserStore((s) => s.logout);

  const signup = ({ name, email, password }) => {
    if (users.some((u) => u.email === email)) {
      throw new Error("이미 존재하는 이메일입니다.");
    }
    const newUser = { id: nextIdRef.current++, name, email, password };
    setUsers((prev) => [...prev, newUser]);
    setUser({ id: newUser.id, name, email }); // 스토어에 민감정보 제외하고 저장
  };

  const login = ({ email, password }) => {
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    setUser({ id: found.id, name: found.name, email: found.email });
  };

  const logout = () => {
    logoutStore();
  };

  const value = useMemo(
    () => ({
      // 외부 API
      users, // (옵션) 데모 DB가 필요하면 노출
      currentUser: user, // 기존 컴포넌트 호환
      signup,
      login,
      logout,
    }),
    [users, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
