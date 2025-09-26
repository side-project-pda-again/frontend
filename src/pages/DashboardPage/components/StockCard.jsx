/* eslint-disable react/prop-types */
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import EtfLikeButton from "@components/EtfLikeButton";

export function StockCard({ item, dragging = false }) {
  const {
    ticker,
    krIsnm,
    market,
    stndDate,
    latestPrice,
    prevClose,
    change,
    changePct,
    volume,
    latestDividendDate,
    latestDividendAmount,
    liked, // 서버가 준 초기값
  } = item ?? {};

  const fmtMoney = (n) =>
    n == null
      ? "-"
      : new Intl.NumberFormat("ko-KR", {
          maximumFractionDigits: 2,
        }).format(n);
  const fmtPct = (n) =>
    n == null
      ? "-"
      : `${n > 0 ? "+" : n < 0 ? "" : ""}${Number(n).toFixed(2)}%`;
  const fmtCompact = (n) =>
    n == null
      ? "-"
      : new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(n);

  const sign = change == null ? 0 : change > 0 ? 1 : change < 0 ? -1 : 0;
  const changeColor =
    sign > 0 ? "text-red-600" : sign < 0 ? "text-blue-600" : "text-gray-600";
  const chipColor =
    sign > 0
      ? "bg-red-50 text-red-700 border-red-200"
      : sign < 0
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div
      className={[
        "w-full rounded-xl border bg-white p-3 shadow-sm",
        "transition-transform",
        dragging ? "opacity-70 ring-2 ring-indigo-400" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        {/* 좌측: 이름/티커/마켓/기준일 */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-semibold">{krIsnm ?? "-"}</h4>
            <span className="shrink-0 rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">
              {ticker}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            <span className="rounded bg-gray-50 px-1.5 py-0.5">
              {market ?? "-"}
            </span>
            <span className="text-gray-400">•</span>
            <span>기준일 {stndDate ?? "-"}</span>
          </div>
        </div>

        {/* 우측 상단: 즐겨찾기 */}
        <EtfLikeButton
          ticker={ticker}
          initialLiked={liked ?? false}
          onAuthRequired={() => alert("로그인이 필요합니다.")}
        />
      </div>

      {/* 가격/변동 */}
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-xs text-gray-400">현재가</div>
          <div className="text-lg font-bold tracking-tight">
            {fmtMoney(latestPrice)}원
          </div>
        </div>

        <div className="text-right">
          <div
            className={[
              "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs",
              chipColor,
            ].join(" ")}
          >
            <span className={changeColor}>
              {sign > 0 ? "▲" : sign < 0 ? "▼" : "—"}
            </span>
            <span className={changeColor}>{fmtMoney(change)} </span>
            <span className={changeColor}>/</span>
            <span className={changeColor}>{fmtPct(changePct)}</span>
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            전일 {fmtMoney(prevClose)}
          </div>
        </div>
      </div>

      {/* 하단: 거래량 / 배당 */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-gray-50 px-1.5 py-0.5 text-gray-700">
          거래량 {fmtCompact(volume)}
        </span>
        {latestDividendDate && (
          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
            최근 배당 {latestDividendDate}
            {latestDividendAmount != null &&
              ` · ${fmtMoney(latestDividendAmount)}`}
            원
          </span>
        )}
      </div>
    </div>
  );
}

/* ===== 드래그 가능한 종목 ===== */
export function DraggableStock({ item, draggableId, removable, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: draggableId, data: { type: "stock", item } });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* 드래그 핸들은 카드 본문에만 부착 */}
      <div {...listeners} {...attributes}>
        <StockCard item={item} dragging={isDragging} />
      </div>

      {/* 그룹 내 삭제 버튼 */}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove?.(item);
          }}
          className="absolute top-1 right-1 inline-flex items-center justify-center
                     w-6 h-6 rounded-full bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white
                     text-xs"
          title="삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
}
