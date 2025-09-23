export function BasketPanel({ title, children }) {
  return (
    <div className="bg-gray-50">
      <div className="mb-2 mt-2 px-4 flex items-end justify-between">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-gray-500">
          드래그해서 그룹에 담아보세요
        </span>
      </div>

      <div className="flex flex-col">
        <div
          className="p-4 flex flex-col gap-2 overflow-y-auto overscroll-contain"
          style={{ height: "70vh" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
