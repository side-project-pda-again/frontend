import { useDroppable } from "@dnd-kit/core";

/* ===== 그룹(드롭 가능) ===== */
export function DroppableGroup({ id, header, children }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: "group" } });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-gray-50 rounded-xl border ${
        isOver ? "border-indigo-500" : "border-gray-200"
      }`}
    >
      {header}
      <div className="p-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}
