import { useEffect, useRef, useState } from "react";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  addToGroup,
  removeFromGroup,
  addGroup,
  deleteGroup,
  updateGroupName,
} from "@utils/dashboardUtils";
import { StockCard, DraggableStock } from "./components/StockCard";
import { BasketPanel } from "./components/BasketPanel";
import { DroppableGroup } from "./components/DroppableGroup";
import useDebouncedEtfSearch from "@hooks/userDebouncedEtfSearch";
import SortControls from "@components/SortControls";
import { useLikeStore } from "@stores/likeStore";
import { useUserStore } from "@stores/userStore";
import { etfApi } from "@api/etfApi";

const useLikeSync = () => {
  const hydrateFromRows = useLikeStore((s) => s.hydrateFromRows);
  const reconcileRows = useLikeStore((s) => s.reconcileRows);
  return { hydrateFromRows, reconcileRows };
};

export default function Dashboard() {
  const [cart, setCart] = useState([]);
  const [groups, setGroups] = useState([
    { id: "1", name: "그룹 1", items: [] },
    { id: "2", name: "그룹 2", items: [] },
  ]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingName, setEditingName] = useState("");

  /* 검색 상태 */
  const [sort, setSort] = useState("ticker,asc");
  const { q, setQ, showSearch, searchResult, loading, error } =
    useDebouncedEtfSearch({ size: 5, sort, debounceMs: 250 });
  const basketList = showSearch ? searchResult : cart;
  /* 드래그 미리보기 */
  const [activeItem, setActiveItem] = useState(null);

  /* DnD 핸들러 */
  const onDragStart = (e) => {
    const it = e.active.data.current?.item;
    setActiveItem(it || null);
  };

  const onDragEnd = (e) => {
    const { active, over } = e;
    setActiveItem(null);
    if (!over) return;

    const item = active.data.current?.item;
    if (!item) return;

    const toId = over.id;
    const [fromContainer] = String(active.id).split(":");
    const isCopy = fromContainer === "cart" || fromContainer === "search";
    const fromId = isCopy ? null : fromContainer;

    if (!toId || fromId === toId) return;

    setGroups((prev) => {
      let updated = prev;
      if (!isCopy && fromId) {
        updated = removeFromGroup(updated, fromId, item.id);
      }
      return addToGroup(updated, toId, item);
    });
  };

  //좋아요 조회 관리
  const userId = useUserStore((s) => s.user?.id);
  const { hydrateFromRows, reconcileRows } = useLikeSync();
  const likeVersion = useLikeStore((s) => s.version);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const REFRESH_DELAY_MS = 500;

  useEffect(() => {
    // 직전 타이머/요청 정리
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort?.();

    // 디바운스 타이머 시작
    timerRef.current = setTimeout(() => {
      const controller = new AbortController();
      abortRef.current = controller;

      (async () => {
        try {
          const res = await etfApi.fetchLikeEtf(
            { page: 0, size: 50, _ts: Date.now() },
            {
              isAuth: true,
              signal: controller.signal,
              headers: { "Cache-Control": "no-cache" },
            }
          );
          const data = res?.data?.data ?? res?.data ?? {};
          const rowsRaw = (data.items ?? data.content ?? []).map((x) => ({
            ...x,
            id: x.id ?? x.ticker,
            ticker: x.ticker,
          }));

          hydrateFromRows(rowsRaw);
          const rows = reconcileRows(rowsRaw);
          setCart(rows);
        } catch (e) {
          if (e?.name === "AbortError" || e?.name === "CanceledError") return;
          console.error("즐겨찾기 로드 실패:", e);
          setCart([]);
        }
      })();
    }, REFRESH_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort?.();
    };
  }, [userId, likeVersion, hydrateFromRows, reconcileRows]);

  /* 그룹 조작 */
  const handleAddGroup = () => {
    setGroups((prev) => addGroup(prev));
  };

  const handleDeleteGroup = (groupId) => {
    if (!confirm("정말 이 그룹을 삭제할까요?")) return;
    setGroups((prev) => deleteGroup(prev, groupId));
    if (editingGroupId === groupId) {
      setEditingGroupId(null);
      setEditingName("");
    }
  };

  const startEditGroupName = (group) => {
    setEditingGroupId(group.id);
    setEditingName(group.name);
  };

  const saveGroupName = () => {
    const name = editingName.trim();
    if (!name) {
      alert("그룹명을 입력해주세요.");
      return;
    }
    setGroups((prev) => updateGroupName(prev, editingGroupId, name));
    setEditingGroupId(null);
    setEditingName("");
  };

  const cancelEditGroupName = () => {
    setEditingGroupId(null);
    setEditingName("");
  };

  const handleViewResult = (group) => {
    alert(`${group.name} 결과 보기 (종목 ${group.items.length}개)`);
  };

  const handleRemoveFromGroup = (groupId, stockId) => {
    setGroups((prev) => removeFromGroup(prev, groupId, stockId));
  };

  return (
    <div className="w-full">
      {/* 상단 */}
      <div className="mb-4">
        <h2 className="text-4xl font-bold mb-4">대시보드</h2>
        <div className="flex items-end justify-between">
          <h4 className="text-lg font-semibold">
            서비스 간략 설명(ex. 종목을 그룹에 추가하고 예상 배당+수익을
            확인해보세요)
          </h4>
          <button
            onClick={handleAddGroup}
            className="px-3 py-1.5 text-sm rounded-md bg-gray-800 text-white hover:bg-black"
          >
            그룹 추가
          </button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-12 gap-12">
          {/* 좌: 검색 + 장바구니 */}
          <div className="col-span-4">
            <div className="flex flex-col bg-gray-0 rounded-xl border border-gray-200">
              <div className="p-4">
                <div className="mb-3">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="종목 검색 (심볼/이름)"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <SortControls sort={sort} onChange={setSort} />
              </div>

              <div className=" border-b" />
              <BasketPanel title={showSearch ? "검색 결과" : "장바구니"}>
                {showSearch && loading && (
                  <div className="text-sm text-gray-500">검색 중…</div>
                )}
                {showSearch && error && (
                  <div className="text-sm text-red-600">
                    검색 실패: {error.message}
                  </div>
                )}
                {basketList.length === 0 ? (
                  <div className="text-sm text-gray-500">비어있습니다.</div>
                ) : (
                  basketList.map((item) => (
                    <DraggableStock
                      key={`${showSearch ? "search" : "cart"}-${item.id}`}
                      draggableId={`${showSearch ? "search" : "cart"}:${
                        item.id
                      }`}
                      item={item}
                      removable={false}
                    />
                  ))
                )}
              </BasketPanel>
            </div>
          </div>

          {/* 우: 그룹들 */}
          <div className="col-span-8 flex flex-col gap-4">
            {groups.map((g) => {
              const isEditing = editingGroupId === g.id;
              const header = (
                <div className="flex items-center justify-between px-4 py-2 border-b bg-white rounded-t-xl">
                  {/* 이름 / 편집 */}
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                          placeholder="그룹 이름"
                          autoFocus
                        />
                        <button
                          onClick={saveGroupName}
                          className="px-2 py-1 text-xs rounded bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          저장
                        </button>
                        <button
                          onClick={cancelEditGroupName}
                          className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                        >
                          취소
                        </button>
                      </>
                    ) : (
                      <>
                        <h3 className="font-semibold">{g.name}</h3>
                        <button
                          onClick={() => startEditGroupName(g)}
                          className="px-2 py-1 text-xs rounded bg-gray-200 hover:bg-gray-300"
                          title="이름 변경"
                        >
                          이름 변경
                        </button>
                      </>
                    )}
                  </div>

                  {/* 오른쪽 버튼 */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewResult(g)}
                      className="px-2 py-1 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                      결과 보기
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(g.id)}
                      className="px-2 py-1 text-xs rounded-md bg-red-600 text-white hover:bg-red-700"
                      title="그룹 삭제"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              );

              return (
                <DroppableGroup key={g.id} id={g.id} header={header}>
                  {g.items.length === 0 ? (
                    <div className="text-sm text-gray-500">
                      이 그룹에 종목을 드래그해서 담아주세요
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {g.items.map((item) => (
                        <DraggableStock
                          key={`${g.id}-${item.id}`}
                          draggableId={`${g.id}:${item.id}`}
                          item={item}
                          removable
                          onRemove={() => handleRemoveFromGroup(g.id, item.id)}
                        />
                      ))}
                    </div>
                  )}
                </DroppableGroup>
              );
            })}
          </div>
        </div>

        <DragOverlay>
          {activeItem ? <StockCard item={activeItem} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
