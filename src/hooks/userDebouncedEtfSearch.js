import { useEffect, useRef, useState } from "react";
import { etfApi } from "../api/etfApi";

export default function useDebouncedEtfSearch({
  size = 20,
  sort,
  debounceMs = 250,
} = {}) {
  const [q, setQ] = useState("");
  const showSearch = q.trim().length > 0;

  const [searchResult, setSearchResult] = useState([]);
  const [searchMeta, setSearchMeta] = useState({
    page: 0,
    size,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceRef = useRef(null);
  const cancelRef = useRef(null);

  useEffect(() => {
    const query = q.trim();

    // 검색어 없으면 초기화
    if (!query) {
      setSearchResult([]);
      setSearchMeta((prev) => ({ ...prev, page: 0, total: 0 }));
      setLoading(false);
      setError(null);
      if (cancelRef.current) {
        cancelRef.current.abort?.();
        cancelRef.current = null;
      }
      return;
    }

    // 디바운스
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      // 이전 요청 취소
      if (cancelRef.current) cancelRef.current.abort?.();
      const controller = new AbortController();
      cancelRef.current = controller;

      setLoading(true);
      setError(null);
      try {
        const params = {
          query,
          page: 0,
          size: searchMeta.size,
          sort,
        };
        const res = await etfApi.fetchEtf(params, {
          signal: controller.signal,
        });

        const data = res?.data?.data ?? res?.data ?? {};
        const rows = (data?.content ?? []).map((x) => ({ ...x, id: x.ticker }));

        setSearchResult(rows);
        setSearchMeta({
          page: data?.page ?? 0,
          size: data?.size ?? params.size,
          total: data?.totalElements ?? rows.length,
        });
      } catch (e) {
        if (e.name !== "CanceledError" && e.message !== "canceled") setError(e);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, searchMeta.size, sort, debounceMs]);

  // 페이지/정렬 변경 헬퍼
  const setPage = (page) => setSearchMeta((p) => ({ ...p, page }));

  return {
    q,
    setQ,
    showSearch,
    searchResult,
    searchMeta,
    setPage,
    loading,
    error,
  };
}
