/**
 * 로그인 및 회원가입 임시 저장소
 */
import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  // 메모리 상의 “DB” 흉내: 새로고침하면 사라짐
  const [users, setUsers] = useState([
    { name: "홍길동", email: "email@email.com", password: "123456" },
  ]); // [{name,email,password}]
  const [currentUser, setCurrentUser] = useState(null);

  const signup = ({ name, email, password }) => {
    if (users.some((u) => u.email === email)) {
      throw new Error("이미 존재하는 이메일입니다.");
    }
    const newUser = { name, email, password };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser({ name, email }); // 가입 후 자동 로그인
  };

  const login = ({ email, password }) => {
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    setCurrentUser({ name: user.name, email: user.email });
  };

  const logout = () => setCurrentUser(null);

  const value = useMemo(
    () => ({
      users,
      currentUser,
      signup,
      login,
      logout,
    }),
    [users, currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
