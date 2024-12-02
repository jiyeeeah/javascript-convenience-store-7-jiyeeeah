import Promotion from "../src/StoreEntities/Promotion.js";

describe("프로모션 클래스 테스트", () => {
  let promotion;
  beforeEach(() => {
    promotion = new Promotion();
  });

  const promotionInfoCase = [
    {
      name: "탄산2+1",
      result: {
        name: "탄산2+1",
        buy: 2,
        get: 1,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
      },
    },
    {
      name: "MD추천상품",
      result: {
        name: "MD추천상품",
        buy: 1,
        get: 1,
        start_date: "2024-01-01",
        end_date: "2024-12-31",
      },
    },
    {
      name: "반짝할인",
      result: {
        name: "반짝할인",
        buy: 1,
        get: 1,
        start_date: "2024-11-01",
        end_date: "2024-11-30",
      },
    },
  ];

  test.each(promotionInfoCase)(
    "$name 프로모션 정보를 알맞게 가져온다.",
    async ({ name, result }) => {
      await promotion.init();

      expect(promotion.getPromotionByName(name)).toEqual(result);
    },
  );

  const promotionAvailableCase = [
    {
      name: "탄산2+1",
      testDate: "2024-10-10",
      result: true,
    },
    {
      name: "탄산2+1",
      testDate: "2025-10-10",
      result: false,
    },
    {
      name: "반짝할인",
      testDate: "2024-10-10",
      result: false,
    },
  ];
  test.each(promotionAvailableCase)(
    "$name 프로모션이 $testDate에 유효한지 확인한다.",
    async ({ name, testDate, result }) => {
      await promotion.init();
      const date = new Date(testDate);

      expect(promotion.isAvailable(name, date)).toEqual(result);
    },
  );
});
