import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DUMMY = { id: 1, email: "email@email.com", pw: "123456" };

export const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      hydrated: false,

      setUser: (u) => set({ user: u }),
      logout: () => set({ user: null }),
      markHydrated: () => set({ hydrated: true }),

      // 필요 시 언제든 호출 가능한 강제 세팅
      setDummyUser: () => set({ user: DUMMY }),
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user }), // 비번까지 저장됨(개발용)
      onRehydrateStorage: () => (state) => {
        if (!state?.user) state?.setUser?.(DUMMY); // ← 개발용
        state?.markHydrated?.();
      },
    }
  )
);
