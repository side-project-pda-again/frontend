/* eslint-disable react/prop-types */
import { useCallback } from "react";
import useLikeEtf from "@/hooks/useLike";

export default function EtfLikeButton({
  ticker,
  initialLiked,
  onAuthRequired, // 선택: 로그인 유도 콜백
}) {
  const { liked, toggle, isLoading } = useLikeEtf({
    ticker,
    initialLiked,
    onAuthRequired,
  });
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log("clicked like", ticker); // ✅ 클릭할 때만 찍힘
      toggle();
    },
    [ticker, toggle]
  );
  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      disabled={isLoading}
      aria-pressed={liked}
      title={liked ? "즐겨찾기 취소" : "즐겨찾기 추가"}
      style={{
        cursor: isLoading ? "not-allowed" : "pointer",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "6px 10px",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: liked ? "#fff7ed" : "#ffffff",
      }}
    >
      <span>{liked ? "★" : "☆"}</span>
    </button>
  );
}
