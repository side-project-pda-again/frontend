export const mapEtfToItem = (x) => ({
  ...x,
  id: x.id ?? x.ticker,
  ticker: x.ticker,
});

// 특정 groupId → portfolioId 찾기
export const portfolioIdOf = (groups, groupId) =>
  groups.find((g) => g.id === groupId)?.portfolioId;
