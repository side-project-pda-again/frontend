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
  addToGroup as addToGroupUtil,
  removeFromGroup as removeFromGroupUtil,
  findContainerOf as findContainerOfUtil,
} from "../../utils/dashboardUtils";

/* ===== UI 조각 ===== */
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

function DraggableStock({ item, draggableId }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: draggableId, data: { type: "stock", item } });
  const style = { transform: CSS.Translate.toString(transform) };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <StockCard {...item} dragging={isDragging} />
    </div>
  );
}

function DroppableGroup({ id, title, headerRight, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "group" } });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-gray-50 rounded-xl border ${
        isOver ? "border-indigo-400" : "border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white rounded-t-xl">
        <h3 className="font-semibold">{title}</h3>
        {headerRight}
      </div>
      <div className="p-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

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

/* ===== 메인 페이지 ===== */
export default function Dashboard() {
  // 장바구니(소스), 전체 종목(검색용)
  const [cart] = useState(cartStocks);
  const [allStocks] = useState(allStocksData);

  // 그룹 상태
  const [groups, setGroups] = useState([
    { id: "group-1", name: "그룹 1", items: [] },
    { id: "group-2", name: "그룹 2", items: [] },
  ]);

  // 검색
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

  // 드래그 미리보기
  const [activeItem, setActiveItem] = useState(null);

  // DnD 핸들러
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

    // ✅ active.id는 'cart:AAPL' 형태이므로, 실제 판별은 item.id로
    const fromId = findContainerOfUtil(groups, cart, item.id); // "cart" | "group-x" | null
    const toId = over.id; // 드롭된 그룹 id

    if (!toId || fromId === toId) return;

    const isCopy = fromId === "cart" || fromId === null; // 장바구니/검색 → 그룹 = 복사
    setGroups((prev) => {
      let updated = prev;
      if (!isCopy) {
        updated = removeFromGroupUtil(updated, fromId, item.id);
      }
      return addToGroupUtil(updated, toId, item);
    });
  };

  // 그룹 추가/결과 버튼
  const addGroup = () => {
    const nextIdx = groups.length + 1;
    setGroups((prev) => [
      ...prev,
      { id: `group-${nextIdx}`, name: `그룹 ${nextIdx}`, items: [] },
    ]);
  };

  const handleViewResult = (group) => {
    alert(`${group.name} 결과 보기 (종목 ${group.items.length}개)`);
  };

  return (
    <div className="w-full">
      {/* 상단 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">대시보드</h2>
        <button
          onClick={addGroup}
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
          {/* 좌: 검색 + 장바구니(소스) */}
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
                    key={`cart-${item.id}`}
                    draggableId={`cart:${item.id}`} // ✅ 장바구니 prefix로 고유화
                    item={item}
                  />
                ))
              )}
            </BasketPanel>
          </div>

          {/* 우: 그룹들(드롭 가능) */}
          <div className="col-span-8 flex flex-col gap-4">
            {groups.map((g) => (
              <DroppableGroup
                key={g.id}
                id={g.id}
                title={g.name}
                headerRight={
                  <button
                    onClick={() => handleViewResult(g)}
                    className="px-2 py-1 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    결과 보기
                  </button>
                }
              >
                {g.items.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    이 그룹에 종목을 드래그해서 담아주세요
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {g.items.map((item) => (
                      <DraggableStock
                        key={`${g.id}-${item.id}`}
                        draggableId={`${g.id}:${item.id}`} // ✅ 그룹 prefix로 고유화
                        item={item}
                      />
                    ))}
                  </div>
                )}
              </DroppableGroup>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeItem ? <StockCard {...activeItem} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
