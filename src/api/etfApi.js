import api, { cleanParams } from "./axiosInstance";

export const etfApi = {
  /**
   * 종목 검색
   */
  fetchEtf: (params, { signal } = {}) =>
    api.get("/etfs", {
      params: cleanParams(params),
      signal,
      isAuth: true,
    }),

  /**
   * 즐겨찾기한 종목 조회
   * TODO: userId 전달 방식 수정
   */
  fetchLikeEtf: ({ query, page = 0, size = 20 } = {}) =>
    api.get("/favorites", {
      params: cleanParams({ query, page, size }),
      isAuth: true,
    }),

  /**
   * 즐겨찾기 종목 추가
   * TODO: userId 전달 방식 수정
   */
  addLikeEtf: ({ ticker }) =>
    api.post(`/favorites/${ticker}`, null, { isAuth: true }),

  /**
   * 즐겨찾기 종목 삭제
   * TODO: userId 전달 방식 수정
   */
  removeLikeEtf: ({ ticker }) =>
    api.delete(`/favorites/${ticker}`, { isAuth: true }),
};
