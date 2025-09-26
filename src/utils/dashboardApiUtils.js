import { mapEtfToItem, portfolioIdOf } from "./dashboardHelperUtils";
import { addToGroup, removeFromGroup } from "./dashboardUtils";

export function createGroupActions({ api, getGroups, setGroups }) {
  // 전체 그룹 내 아이템 조회
  const hydrateAll = async ({ signal } = {}) => {
    const current = getGroups();
    const results = await Promise.allSettled(
      current.map(async (g) => {
        if (!g.portfolioId) return { gid: g.id, items: g.items };
        const res = await api.fetchEtfInPortfolio(
          { portfolioId: g.portfolioId },
          { signal }
        );
        const data = res?.data?.data ?? res?.data ?? {};
        const items = (data.items ?? data.content ?? []).map(mapEtfToItem);
        return { gid: g.id, items };
      })
    );

    const byId = new Map();
    for (const r of results) {
      if (r.status === "fulfilled") byId.set(r.value.gid, r.value.items);
    }

    setGroups((prev) => {
      const next = prev.map((g) =>
        byId.has(g.id) ? { ...g, items: byId.get(g.id) } : g
      );
      // 변경 없으면 원본 반환(리렌더/후속 effect 방지)
      const changed =
        next.length !== prev.length ||
        next.some(
          (g, i) => g.items !== prev[i].items || g.name !== prev[i].name
        );
      return changed ? next : prev;
    });
  };

  // 추가/복사
  const add = async ({ toGroupId, stock }) => {
    const before = getGroups();
    setGroups((prev) => addToGroup(prev, toGroupId, stock));

    try {
      const pid = portfolioIdOf(before, toGroupId);
      if (pid)
        await api.addEtfInPortfolio({ portfolioId: pid, ticker: stock.ticker });
    } catch (e) {
      // 롤백
      setGroups((prev) => removeFromGroup(prev, toGroupId, stock.id));
      throw e;
    }
  };

  // 삭제
  const remove = async ({ fromGroupId, stock }) => {
    const before = getGroups();
    setGroups((prev) => removeFromGroup(prev, fromGroupId, stock.id));

    try {
      const pid = portfolioIdOf(before, fromGroupId);
      if (pid)
        await api.removeEtfInPortfolio({
          portfolioId: pid,
          ticker: stock.ticker,
        });
    } catch (e) {
      // 롤백
      setGroups((prev) => addToGroup(prev, fromGroupId, stock));
      throw e;
    }
  };

  // 이동(한 그룹 → 다른 그룹)
  const move = async ({ fromGroupId, toGroupId, stock }) => {
    if (fromGroupId === toGroupId) return;

    const before = getGroups();
    setGroups((prev) =>
      addToGroup(removeFromGroup(prev, fromGroupId, stock.id), toGroupId, stock)
    );

    try {
      const fromPid = portfolioIdOf(before, fromGroupId);
      const toPid = portfolioIdOf(before, toGroupId);
      if (toPid)
        await api.addEtfInPortfolio({
          portfolioId: toPid,
          ticker: stock.ticker,
        });
      if (fromPid)
        await api.removeEtfInPortfolio({
          portfolioId: fromPid,
          ticker: stock.ticker,
        });
    } catch (e) {
      // 롤백
      setGroups((prev) =>
        addToGroup(
          removeFromGroup(prev, toGroupId, stock.id),
          fromGroupId,
          stock
        )
      );
      throw e;
    }
  };

  return { hydrateAll, add, remove, move };
}
