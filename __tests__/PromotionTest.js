import Promotion from "../src/StoreEntities/Promotion.js";

describe("프로모션 클래스 테스트", () => {
  let promotion;
  beforeEach(() => {
    promotion = new Promotion();
  });

  test("프로모션 정보를 알맞게 가져온다.", async () => {
    await promotion.init();

    expect(promotion.getPromotionByName("탄산2+1")).toEqual({
      name: "탄산2+1",
      buy: 2,
      get: 1,
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    });
    expect(promotion.getPromotionByName("MD추천상품")).toEqual({
      name: "MD추천상품",
      buy: 1,
      get: 1,
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    });
    expect(promotion.getPromotionByName("반짝할인")).toEqual({
      name: "반짝할인",
      buy: 1,
      get: 1,
      start_date: "2024-11-01",
      end_date: "2024-11-30",
    });
  });
});
