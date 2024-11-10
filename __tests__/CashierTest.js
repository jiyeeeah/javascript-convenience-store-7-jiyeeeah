import { MissionUtils } from "@woowacourse/mission-utils";
import Cashier from "../src/Cashier.js";
import Store from "../src/Store.js";

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
  let store;
  let cashier;
  beforeEach(() => {
    store = new Store();
    cashier = new Cashier();
  });

  test("에너지바 2개 결제", async () => {
    // given
    const paymentTarget = { productName: "에너지바", productCount: 2, productTotalPrice: 4000 };

    // when
    cashier.processPayment(paymentTarget);

    // then
    expect(cashier.getPurchasedProduct()).toEqual(new Map([["에너지바", 2]]));
    expect(cashier.getTotalPayment()).toBe(4000);
  });

  test("프로모션 해당 없는 경우", async () => {
    // given
    const paymentTargets = [
      { productName: "감자칩", productCount: 3, productTotalPrice: 4500 },
      { productName: "정식도시락", productCount: 1, productTotalPrice: 6400 },
    ];
    mockNowDate("2024-02-01"); // 반짝할인(감자칩)은 적용 안됨. 나머지는 적용됨

    // when
    paymentTargets.forEach((target) => {
      cashier.processPayment(target);
    });

    // then
    expect(cashier.getPurchasedProduct()).toEqual(
      new Map([
        ["감자칩", 3],
        ["정식도시락", 1],
      ]),
    );
    expect(cashier.getTotalPayment()).toBe(10900);
  });

  test("프로모션 1 + 1 상품 구매", async () => {
    // given
    const paymentTarget = {
      productName: "오렌지주스",
      promotionAppliedCount: 2,
      giveAwayCount: 1,
      promotionAppliedTotalPrice: 3600,
      promotionDiscount: 1800,
    };

    // when
    cashier.processPaymentWithPromo(paymentTarget);

    // then
    expect(cashier.getPurchasedProduct()).toEqual(new Map([["오렌지주스", 2]])); // 상품 구매 내역 : 2개
    expect(cashier.getGiveAwayProduct()).toEqual(new Map([["오렌지주스", 1]])); // 증정 상품 내역 : 1개
    expect(cashier.getTotalPayment()).toBe(3600); // 총 구매 액
    expect(cashier.getPromotionDiscount()).toBe(1800); // 할인 금액
  });

  test("멤버십 할인 적용 여부 테스트 - 적용하는 경우", async () => {
    // given
    await store.init();
    const normalPurchase = {
      productName: "에너지바",
      productCount: 5,
      productTotalPrice: 10000,
    };
    const promotionPurchase = {
      productName: "콜라",
      promotionAppliedCount: 3,
      giveAwayCount: 1,
      promotionAppliedTotalPrice: 3000,
      promotionDiscount: 1000,
    };
    cashier.processPayment(normalPurchase);
    cashier.processPaymentWithPromo(promotionPurchase);

    // when
    mockQuestions(["Y"]); // 멤버십 적용
    await cashier.askMembershipDiscount();

    // then
    expect(cashier.getPurchasedProduct()).toEqual(
      new Map([
        ["에너지바", 5],
        ["콜라", 3],
      ]),
    );
    expect(cashier.getGiveAwayProduct()).toEqual(new Map([["콜라", 1]])); // 증정 상품 내역 : 1개
    expect(cashier.getTotalPayment()).toBe(13000); // 총 구매 액
    expect(cashier.getPromotionDiscount()).toBe(1000); // 할인 금액
    expect(cashier.getMembershipDiscount()).toBe(3000);
  });
});
