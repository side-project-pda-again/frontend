// Header.jsx
import React, { useCallback } from "react";
import { useUserStore } from "@stores/userStore";
import { useNavigate } from "react-router-dom";
// import { shallow } from "zustand/shallow"; // 한 번에 묶고 싶으면 사용

export default function Header() {
  // ✅ 개별 selector로 구독(가장 안전)
  const user = useUserStore((s) => s.user);
  const hydrated = useUserStore((s) => s.hydrated);
  const logout = useUserStore((s) => s.logout);

  // // 또는 이렇게 (shallow 사용)
  // const { user, hydrated, logout } = useUserStore(
  //   (s) => ({ user: s.user, hydrated: s.hydrated, logout: s.logout }),
  //   shallow
  // );

  const nav = useNavigate();

  const handleClick = useCallback(() => {
    if (user) {
      logout(); // 상태 업데이트 1회
      nav("/login", { replace: true }); // 라우팅(상태 변경 아님)
    } else {
      nav("/login");
    }
  }, [user, logout, nav]);

  return (
    <header className="w-full flex bg-white p-4 justify-between items-center shadow-[0_8px_16px_-8px_rgba(0,0,0,0.1)]">
      <div>LogoOrName</div>
      {hydrated ? (
        <button
          onClick={handleClick}
          className="px-3 py-1.5 rounded-md border border-border hover:bg-surface"
        >
          {user ? "로그아웃" : "로그인"}
        </button>
      ) : (
        <div className="w-20 h-8 rounded bg-gray-100 animate-pulse" />
      )}
    </header>
  );
}
