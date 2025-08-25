/* ===== 그룹/종목 유틸 ===== */

// 종목이 그룹에 이미 있는지 확인
export const isInGroup = (group, stock) =>
  group.items.some((i) => i.id === stock.id);

// 그룹에 종목 추가 (한 그룹 내 중복 방지)
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

// 그룹 추가
export const addGroup = (groups) => {
  const nextIdx = groups.length + 1;
  return [
    ...groups,
    { id: `group-${nextIdx}`, name: `그룹 ${nextIdx}`, items: [] },
  ];
};

// 그룹 삭제
export const deleteGroup = (groups, groupId) =>
  groups.filter((g) => g.id !== groupId);

// 그룹명 변경
export const updateGroupName = (groups, groupId, newName) =>
  groups.map((g) => (g.id === groupId ? { ...g, name: newName } : g));

/* ===== API 연동 포인트 =====
나중에 실제 API 붙일 땐 여기 함수 안에서
- axios/fetch로 서버 호출
- 성공 시 setGroups 업데이트
로 바꿔주면 됩니다.
*/
