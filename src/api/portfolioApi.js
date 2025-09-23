import api, { cleanParams } from "./axiosInstance";

export const portfolioApi = {
  /**
   * 포트폴리오 내 종목 조회
   * TODO: userId 전달 방식 수정
   */
  fetchEtfInPortfolio: ({ portfolioId, userId } = {}) =>
    api.get(`/portfolio/${portfolioId}/items`, {
      params: cleanParams({ userId }),
      isAuth: true,
    }),

  /**
   * 포트폴리오 내 종목 추가
   * TODO: userId 전달 방식 수정
   */
  addEtfInPortfolio: ({ ticker, userId, portfolioId }) =>
    api.post(`/portfolio/${portfolioId}/items`, null, {
      params: cleanParams({ userId, ticker }),
      isAuth: true,
    }),

  /**
   * 포트폴리오 내 종목 삭제
   * TODO: userId 전달 방식 수정
   */
  removeEtfInPortfolio: ({ ticker, userId, portfolioId }) =>
    api.delete(`/portfolio/${portfolioId}/items`, {
      params: cleanParams({ userId, ticker }),
      isAuth: true,
    }),
};
