import { create } from "zustand";

export const useLikeStore = create((set, get) => ({
  byTicker: {},
  version: 0,

  // 서버에서 받은 목록을 스토어에 흡수(최신값 우선)
  hydrateFromRows: (rows = []) =>
    set((state) => {
      const next = { ...state.byTicker };
      for (const r of rows) {
        const t = r.ticker;
        if (!t) continue;
        const prev = next[t];
        const incoming = {
          liked: !!(r.isLiked ?? r.liked),
          updatedAt: Date.now(),
        };
        // 기존값이 더 최신이면 유지
        if (!prev || (prev && prev.updatedAt <= incoming.updatedAt)) {
          next[t] = { ...prev, ...incoming };
        }
      }
      return { byTicker: next };
    }),

  // 리스트에 뿌리기 전에 스토어 값으로 덮어쓰기
  reconcileRows: (rows = []) => {
    const map = get().byTicker;
    return rows.map((r) => {
      const o = map[r.ticker];
      return o ? { ...r, isLiked: o.liked } : r;
    });
  },

  // 낙관적 토글 (필요 시 count도 업데이트)
  optimisticToggle: (ticker, nextLiked) =>
    set((state) => {
      return {
        byTicker: {
          ...state.byTicker,
          [ticker]: {
            liked: nextLiked,
            updatedAt: Date.now(),
          },
        },
        version: state.version + 1,
      };
    }),

  // 실패 시 롤백
  rollback: (ticker, prev) =>
    set((state) => ({
      byTicker: {
        ...state.byTicker,
        [ticker]: { ...prev, updatedAt: Date.now() },
      },
      version: state.version + 1,
    })),
}));
