import { useMemo, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { cartStocks, allStocks as allStocksData } from "./dummyData";
import {
  addToGroup,
  removeFromGroup,
  addGroup,
  deleteGroup,
  updateGroupName,
} from "../../utils/dashboardUtils";

/* ===== 종목 카드 ===== */
function StockCard({ symbol, name, dragging }) {
  return (
    <div
      className={`border rounded-lg px-3 py-2 text-sm bg-white ${
        dragging ? "opacity-70 ring-2 ring-indigo-400" : ""
      }`}
    >
      <div className="font-semibold">{symbol}</div>
      <div className="text-gray-500">{name}</div>
    </div>
  );
}

/* ===== 드래그 가능한 종목 ===== */
function DraggableStock({ item, draggableId, removable, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: draggableId, data: { type: "stock", item } });

  const style = { transform: CSS.Translate.toString(transform) };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* 드래그 핸들은 카드 본문에만 부착 */}
      <div {...listeners} {...attributes}>
        <StockCard {...item} dragging={isDragging} />
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
          aria-label={`${item.symbol} 삭제`}
          title="삭제"
        >
          ✕
        </button>
      )}
    </div>
  );
}

/* ===== 그룹(드롭 가능) ===== */
function DroppableGroup({ id, header, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "group" } });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-gray-50 rounded-xl border ${
        isOver ? "border-indigo-400" : "border-gray-200"
      }`}
    >
      {header}
      <div className="p-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

/* ===== 장바구니/검색 패널 ===== */
function BasketPanel({ title, hint, children }) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white rounded-t-xl">
        <h3 className="font-semibold">{title}</h3>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </div>
      <div className="p-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  /* 소스 데이터 */
  const [cart] = useState(cartStocks);
  const [allStocks] = useState(allStocksData);

  /* 그룹 상태 */
  const [groups, setGroups] = useState([
    { id: "group-1", name: "그룹 1", items: [] },
    { id: "group-2", name: "그룹 2", items: [] },
  ]);

  /* 그룹명 편집 상태 */
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editingName, setEditingName] = useState("");

  /* 검색 */
  const [q, setQ] = useState("");
  const showSearch = q.trim().length > 0;
  const basketList = useMemo(() => {
    if (!showSearch) return cart;
    const kw = q.trim().toLowerCase();
    return allStocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(kw) || s.name.toLowerCase().includes(kw)
    );
  }, [showSearch, q, cart, allStocks]);

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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">대시보드</h2>
        <button
          onClick={handleAddGroup}
          className="px-3 py-1.5 text-sm rounded-md bg-gray-800 text-white hover:bg-black"
        >
          그룹 추가
        </button>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-12 gap-4">
          {/* 좌: 검색 + 장바구니 */}
          <div className="col-span-4">
            <div className="mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="종목 검색 (심볼/이름)"
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <BasketPanel
              title={showSearch ? "검색 결과" : "장바구니"}
              hint={!showSearch ? "드래그해서 그룹에 담기" : undefined}
            >
              {basketList.length === 0 ? (
                <div className="text-sm text-gray-500">비어있습니다.</div>
              ) : (
                basketList.map((item) => (
                  <DraggableStock
                    key={`${showSearch ? "search" : "cart"}-${item.id}`}
                    draggableId={`${showSearch ? "search" : "cart"}:${item.id}`}
                    item={item}
                    removable={false}
                  />
                ))
              )}
            </BasketPanel>
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
          {activeItem ? <StockCard {...activeItem} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
