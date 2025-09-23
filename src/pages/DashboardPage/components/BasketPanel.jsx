export function BasketPanel({ title, hint, children }) {
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
