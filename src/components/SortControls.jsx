const SORT_FIELDS = [
  { value: "ticker", label: "종목코드" },
  { value: "krIsnm", label: "종목명" },
  { value: "market", label: "시장" },
  { value: "stndDate", label: "기준일" },
  { value: "latestPrice", label: "현재가" },
  { value: "change", label: "전일대비" },
  { value: "volume", label: "거래량" },
  { value: "latestDividendDate", label: "배당 기준일" },
  { value: "latestDividendAmount", label: "배당 금액" },
];

const SORT_DIRS = [
  { value: "asc", label: "오름차순" },
  { value: "desc", label: "내림차순" },
];

const parseSort = (s) => {
  if (!s) return { field: "ticker", dir: "asc" };
  const [field, dir] = s.split(",");
  return {
    field: SORT_FIELDS.some((f) => f.value === field) ? field : "ticker",
    dir: dir === "desc" ? "desc" : "asc",
  };
};

export default function SortControls({ sort, onChange }) {
  const { field, dir } = parseSort(sort);

  const handleField = (e) => onChange(`${e.target.value},${dir}`);
  const handleDir = (e) => onChange(`${field},${e.target.value}`);

  return (
    <div className="flex items-center justify-end gap-2">
      <select
        value={field}
        onChange={handleField}
        className="border rounded px-2 py-1 text-sm"
      >
        {SORT_FIELDS.map((f) => (
          <option key={f.value} value={f.value}>
            {f.label}
          </option>
        ))}
      </select>

      <select
        value={dir}
        onChange={handleDir}
        className="border rounded px-2 py-1 text-sm"
      >
        {SORT_DIRS.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}
