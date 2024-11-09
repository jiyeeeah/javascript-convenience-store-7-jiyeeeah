import { MissionUtils } from "@woowacourse/mission-utils";
import Cashier from "../src/Cashier.js";
import ConvenienceStore from "../src/ConvenienceStore.js";

const mockNowDate = (date = null) => {
  const mockDateTimes = jest.spyOn(MissionUtils.DateTimes, "now");
  mockDateTimes.mockReturnValue(new Date(date));
  return mockDateTimes;
};

describe("Cashier 클래스 테스트", () => {
  let convenienceStore;
  let cashier;
  beforeEach(() => {
    convenienceStore = new ConvenienceStore();
    cashier = new Cashier();
  });

  test("에너지바 2개 결제", async () => {
    // given
    await convenienceStore.init();

    // when
    cashier.checkout({ productName: "에너지바", productCount: 2, convenienceStore }); // 에너지바 재고 3개 남음

    // then
    expect(convenienceStore.isInStock("에너지바", 3)).toBe(true);
    expect(convenienceStore.isInStock("에너지바", 5)).toBe(false);
  });

  test("프로모션 해당 없는 경우", async () => {
    // given
    await convenienceStore.init();
    mockNowDate("2024-02-01"); // 반짝할인은 적용 안됨. 나머지는 적용됨

    // when
    cashier.checkout({ productName: "감자칩", productCount: 3, convenienceStore }); // 4500원
    cashier.checkout({ productName: "정식도시락", productCount: 1, convenienceStore }); // 6400원

    // then
    expect(cashier.getPurchaseProducts()).toEqual(
      new Map([
        ["감자칩", 3],
        ["정식도시락", 1],
      ]),
    );
    expect(cashier.getTotalPurchaseAmount()).toBe(10900);
  });
});
