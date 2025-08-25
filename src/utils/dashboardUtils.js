// 종목이 그룹에 이미 있는지
export const isInGroup = (group, stock) =>
  group.items.some((i) => i.id === stock.id);

// 그룹에 종목 추가 (중복 방지)
export const addToGroup = (groups, groupId, stock) =>
  groups.map((g) =>
    g.id === groupId
      ? {
          ...g,
          items: isInGroup(g, stock) ? g.items : [...g.items, stock],
        }
      : g
  );

// 그룹에서 종목 제거
export const removeFromGroup = (groups, groupId, stockId) =>
  groups.map((g) =>
    g.id === groupId
      ? { ...g, items: g.items.filter((i) => i.id !== stockId) }
      : g
  );

// 종목이 어느 컨테이너에 있는지(cart/group/null)
export const findContainerOf = (groups, cart, stockId) => {
  for (const g of groups) {
    if (g.items.some((i) => i.id === stockId)) return g.id;
  }
  if (cart.some((i) => i.id === stockId)) return "cart";
  return null;
};
