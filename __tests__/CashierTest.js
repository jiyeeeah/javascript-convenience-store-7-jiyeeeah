import { MissionUtils } from "@woowacourse/mission-utils";
import Cashier from "../src/Cashier.js";
import ConvenienceStore from "../src/ConvenienceStore.js";

const mockNowDate = (date = null) => {
  const mockDateTimes = jest.spyOn(MissionUtils.DateTimes, "now");
  mockDateTimes.mockReturnValue(new Date(date));
  return mockDateTimes;
};

const mockQuestions = (inputs) => {
  const messages = [];

  MissionUtils.Console.readLineAsync = jest.fn((prompt) => {
    messages.push(prompt);
    const input = inputs.shift();

    if (input === undefined) {
      throw new Error("NO INPUT");
    }

    return Promise.resolve(input);
  });

  MissionUtils.Console.readLineAsync.messages = messages;
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
    cashier.checkout({ productName: "감자칩", productCount: 3, convenienceStore }); // 4500원, 재고 7개 남음
    cashier.checkout({ productName: "정식도시락", productCount: 1, convenienceStore }); // 6400원, 재고 7개 남음

    // then
    expect(cashier.getPurchaseProducts()).toEqual(
      new Map([
        ["감자칩", 3],
        ["정식도시락", 1],
      ]),
    );
    expect(cashier.getTotalPurchaseAmount()).toBe(10900);
    expect(convenienceStore.isInStock("감자칩", 7)).toBe(true);
    expect(convenienceStore.isInStock("정식도시락", 7)).toBe(true);
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 받을 수 있는 상품 추가", async () => {
    // given
    await convenienceStore.init();

    // when
    mockQuestions(["Y"]); // 증정 상품 추가
    await cashier.checkout({ productName: "오렌지주스", productCount: 1, convenienceStore }); // 1+1인데 한개만 가져옴

    // then
    expect(cashier.getPurchaseProducts()).toEqual(new Map([["오렌지주스", 2]])); // 상품 구매 내역 : 2개
    expect(cashier.getPromotionProduct()).toEqual(new Map([["오렌지주스", 1]])); // 증정 상품 내역 : 1개
    expect(cashier.getTotalPurchaseAmount()).toBe(3600); // 총 구매 액
    expect(cashier.getPromotionDiscount()).toBe(1800); // 할인 금액
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 받을 수 있는 상품 추가하지 않음", async () => {
    // given
    await convenienceStore.init();

    // when
    mockQuestions(["N"]); // 증정 상품 추가 하지 않음
    await cashier.checkout({ productName: "오렌지주스", productCount: 1, convenienceStore }); // 1+1인데 한개만 가져옴

    // then
    expect(cashier.getPurchaseProducts()).toEqual(new Map([["오렌지주스", 1]])); // 상품 구매 내역 : 2개
    expect(cashier.getPromotionProduct()).toEqual(new Map()); // 증정 상품 내역 : 1개
    expect(cashier.getTotalPurchaseAmount()).toBe(1800); // 총 구매 액
    expect(cashier.getPromotionDiscount()).toBe(0); // 할인 금액
  });

  test("프로모션 재고가 부족해서 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우 - 일부 수량에 대해 정가로 결제", async () => {
    // given
    await convenienceStore.init();

    // when
    mockQuestions(["Y"]); // 일부 수량에 대해 정가로 결제
    await cashier.checkout({ productName: "사이다", productCount: 10, convenienceStore }); // 사이다 프로모션 재고 8개밖에 없음

    // then
    expect(cashier.getPurchaseProducts()).toEqual(new Map([["사이다", 10]])); // 상품 구매 내역 : 10개
    expect(cashier.getPromotionProduct()).toEqual(new Map([["사이다", 2]])); // 증정 상품 내역 : 2개
    expect(cashier.getTotalPurchaseAmount()).toBe(10000); // 총 구매 액
    expect(cashier.getPromotionDiscount()).toBe(2000); // 할인 금액
  });

  test("프로모션 재고가 부족해서 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우 - 정가로 결제해야 하는 수량 제외하고 결제", async () => {
    // given
    await convenienceStore.init();

    // when
    mockQuestions(["N"]); // 정가로 결제해야 하는 수량 제외하고 결제
    await cashier.checkout({ productName: "사이다", productCount: 10, convenienceStore }); // 사이다 프로모션 재고 8개밖에 없음

    // then
    expect(cashier.getPurchaseProducts()).toEqual(new Map([["사이다", 8]])); // 상품 구매 내역 : 8개
    expect(cashier.getPromotionProduct()).toEqual(new Map([["사이다", 2]])); // 증정 상품 내역 : 2개
    expect(cashier.getTotalPurchaseAmount()).toBe(8000); // 총 구매 액
    expect(cashier.getPromotionDiscount()).toBe(2000); // 할인 금액
  });
});
