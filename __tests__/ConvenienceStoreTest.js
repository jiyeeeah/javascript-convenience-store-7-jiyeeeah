import { MissionUtils } from "@woowacourse/mission-utils";
import ConvenienceStore from "../src/ConvenienceStore.js";

const getLogSpy = () => {
  const logSpy = jest.spyOn(MissionUtils.Console, "print");
  logSpy.mockClear();
  return logSpy;
};

const mockNowDate = (date = null) => {
  const mockDateTimes = jest.spyOn(MissionUtils.DateTimes, "now");
  mockDateTimes.mockReturnValue(new Date(date));
  return mockDateTimes;
};

describe("ConvenienceStore 테스트", () => {
  let convenienceStore;
  beforeEach(() => {
    convenienceStore = new ConvenienceStore();
  });

  test("환영인사와 함께 최초의 상품명, 가격, 프로모션 이름, 재고 출력하기", async () => {
    // given
    const logSpy = getLogSpy();
    await convenienceStore.init();

    // when
    convenienceStore.printWelcomeAndInventory();

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

  test("재고에 제품이 존재하는지 확인한다.", async () => {
    // given
    await convenienceStore.init();

    // then
    expect(convenienceStore.isExistInInventory("콜라")).toBe(true);
    expect(convenienceStore.isExistInInventory("비타민워터")).toBe(true);
    expect(convenienceStore.isExistInInventory("도시락")).toBe(false);
  });

  test("제품 수량이 재고에서 부족한지 확인한다.", async () => {
    // given
    await convenienceStore.init();

    // then
    expect(convenienceStore.isInStock("콜라", 2)).toBe(true);
    expect(convenienceStore.isInStock("사이다", 10)).toBe(true);
    expect(convenienceStore.isInStock("비타민워터", 30)).toBe(false);
  });

  test("제품에 적용될 프로모션 정보를 가져온다.", async () => {
    // given
    await convenienceStore.init();
    mockNowDate("2024-02-01"); // 반짝할인은 적용 안됨. 나머지는 적용됨

    // then
    expect(convenienceStore.getApplicablePromotion("콜라")).toEqual({
      name: "탄산2+1",
      buy: "2",
      get: "1",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    });
    expect(convenienceStore.getApplicablePromotion("오렌지주스")).toEqual({
      name: "MD추천상품",
      buy: "1",
      get: "1",
      start_date: "2024-01-01",
      end_date: "2024-12-31",
    });
    expect(convenienceStore.getApplicablePromotion("감자칩")).toBeUndefined();
    expect(convenienceStore.getApplicablePromotion("에너지바")).toBeUndefined();
  });

  test("제품 수량 줄이는 메서드 테스트", async () => {
    // given
    await convenienceStore.init();

    // when
    convenienceStore.reduceStockBy("콜라", 3, true); // 콜라의 프로모션 재고 7 남음

    // then
    expect(convenienceStore.isInPromoStock("콜라", 7)).toBe(true);
    expect(convenienceStore.isInPromoStock("콜라", 9)).toBe(false);

    // when
    convenienceStore.reduceStockBy("컵라면", 5, false); // 컵라면의 전체 재고 6 남음

    // then
    expect(convenienceStore.isInStock("컵라면", 5)).toBe(true);
    expect(convenienceStore.isInStock("컵라면", 9)).toBe(false);
  });

  test("제품 가격 계산", async () => {
    // given
    await convenienceStore.init();

    // when, then
    expect(convenienceStore.calculatePrice("에너지바", 3)).toBe(6000);
    expect(convenienceStore.calculatePrice("콜라", 5)).toBe(5000);
  });
});
