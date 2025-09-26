// src/hooks/useLikeEtf.js
import { useCallback, useMemo, useRef, useState } from "react";
import { etfApi } from "@api/etfApi";
import { useUserStore } from "@stores/userStore";
import { useLikeStore } from "@stores/likeStore";

export default function useLikeEtf({
  ticker,
  initialLiked = false,
  onAuthRequired,
}) {
  const user = useUserStore((s) => s.user);
  const { byTicker, optimisticToggle, rollback } = useLikeStore();
  const inFlight = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 렌더 시: 스토어 값을 우선, 없으면 초기값
  const { liked } = useMemo(() => {
    const s = byTicker[ticker];
    return {
      liked: s?.liked ?? initialLiked,
    };
  }, [byTicker, ticker, initialLiked]);

  const toggle = useCallback(async () => {
    if (!ticker) return;
    if (!user?.id) {
      onAuthRequired?.();
      return;
    }
    if (inFlight.current) return;

    inFlight.current = true;
    setIsLoading(true);
    setError(null);

    // 낙관적 적용 + 롤백 스냅샷
    const prev = { liked };
    const nextLiked = !liked;
    optimisticToggle(ticker, nextLiked);

    try {
      if (nextLiked) {
        await etfApi.addLikeEtf({ ticker });
      } else {
        await etfApi.removeLikeEtf({ ticker });
      }
    } catch (e) {
      rollback(ticker, prev);
      setError(e);
      if (e?.response?.status === 401) onAuthRequired?.(e);
    } finally {
      inFlight.current = false;
      setIsLoading(false);
    }
  }, [ticker, user?.id, liked, optimisticToggle, rollback, onAuthRequired]);

  return { liked, toggle, isLoading, error };
}
