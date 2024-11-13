import Store from "../src/Store.js";
import { getLogSpy, mockNowDate } from "../src/testUtil/TestUtil.js";

describe("Store 테스트", () => {
  let store;
  beforeEach(() => {
    store = new Store();
  });

  test("환영인사와 함께 최초의 상품명, 가격, 프로모션 이름, 재고 출력하기", async () => {
    // given
    const logSpy = getLogSpy();
    await store.init();

    // when
    store.printWelcomeAndInventory();

    const printMessage = [
      "안녕하세요. W편의점입니다.",
      "현재 보유하고 있는 상품입니다.",
      "- 콜라 1,000원 10개 탄산2+1",
      "- 콜라 1,000원 10개",
      "- 사이다 1,000원 8개 탄산2+1",
      "- 사이다 1,000원 7개",
      "- 오렌지주스 1,800원 9개 MD추천상품",
      "- 오렌지주스 1,800원 재고 없음",
      "- 탄산수 1,200원 5개 탄산2+1",
      "- 탄산수 1,200원 재고 없음",
      "- 물 500원 10개",
      "- 비타민워터 1,500원 6개",
      "- 감자칩 1,500원 5개 반짝할인",
      "- 감자칩 1,500원 5개",
      "- 초코바 1,200원 5개 MD추천상품",
      "- 초코바 1,200원 5개",
      "- 에너지바 2,000원 5개",
      "- 정식도시락 6,400원 8개",
      "- 컵라면 1,700원 1개 MD추천상품",
      "- 컵라면 1,700원 10개",
    ];

    // then
    printMessage.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(log));
    });
  });

  test("상품 수량 프로모션 재고랑 비교", async () => {
    await store.init();

    expect(store.compareWithPromoStock("오렌지주스", 1)).toBe(8);
  });

  const isPromotionAvailableCase = [
    {
      name: "감자칩",
      testDate: "2024-10-10", // 반짝할인(감자칩) 적용 안되는 날
      result: false,
    },
    {
      name: "콜라", // 탄산2+1
      testDate: "2024-10-10",
      result: true,
    },
    {
      name: "컵라면", // MD추천상품
      testDate: "2024-10-10",
      result: true,
    },
    {
      name: "정식도시락", // 프로모션 없는 제품
      testDate: "2024-10-10",
      result: false,
    },
  ];
  test.each(isPromotionAvailableCase)(
    "$name 프로모션 $testDate에 적용되는지 확인",
    async ({ name, testDate, result }) => {
      await store.init();
      mockNowDate(testDate); // 반짝 할인 적용 안됨 딴건 적용 됨

      expect(store.isPromoApplicable(name)).toBe(result);
    },
  );
});
