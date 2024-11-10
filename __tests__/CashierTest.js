import { MissionUtils } from "@woowacourse/mission-utils";
import Cashier from "../src/StoreEntities/Cashier.js";
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
    await store.init();
    const purchaseProduct = [["에너지바", 2]];

    // when
    await cashier.checkout(new Map(purchaseProduct), store);

    // then
    expect(cashier.getPurchasedProduct()).toEqual(new Map([["에너지바", 2]]));
    const receipt = cashier.getReceipt(store);
    expect(receipt).toMatch(/에너지바\s+2\s+4,000/);
    expect(receipt).toMatch(/총구매액\s+2\s+4,000/);
    expect(receipt).toMatch(/행사할인\s+-0/);
    expect(receipt).toMatch(/멤버십할인\s+-0/);
    expect(receipt).toMatch(/내실돈\s+4,000/);
  });

  test("프로모션 해당 없는 경우", async () => {
    // given
    await store.init();
    const purchaseProduct = [
      ["감자칩", 3],
      ["정식도시락", 1],
    ];

    // when
    mockNowDate("2024-02-01"); // 반짝할인(감자칩)은 적용 안됨. 나머지는 적용됨
    await cashier.checkout(new Map(purchaseProduct), store);

    // then
    expect(cashier.getPurchasedProduct()).toEqual(
      new Map([
        ["감자칩", 3],
        ["정식도시락", 1],
      ]),
    );
    const receipt = cashier.getReceipt(store);
    expect(receipt).toMatch(/감자칩\s+3\s+4,500/);
    expect(receipt).toMatch(/정식도시락\s+1\s+6,400/);
    expect(receipt).toMatch(/총구매액\s+4\s+10,900/);
    expect(receipt).toMatch(/행사할인\s+-0/);
    expect(receipt).toMatch(/멤버십할인\s+-0/);
    expect(receipt).toMatch(/내실돈\s+10,900/);
  });

  test("프로모션 재고가 부족한 경우 - 일부 수량에 대해 정가로 결제", async () => {
    // given
    await store.init();
    const purchaseProduct = [["사이다", 10]]; // 사이다 프로모션 재고 8개밖에 없음

    // when
    mockQuestions(["Y"]); // 일부 수량(4)에 대해 정가로 결제 => 일반 재고 3개 남고, 프로모션 재고 2개 남음
    await cashier.checkout(new Map(purchaseProduct), store);

    // then
    expect(store.isInStock("사이다", 5)).toBe(true);
    expect(store.isInStock("사이다", 6)).toBe(false);
    expect(store.compareWithPromoStock("사이다", 2)).toBe(0);

    expect(cashier.getPurchasedProduct()).toEqual(new Map([["사이다", 10]])); // 상품 구매 내역 : 3개
    expect(cashier.getGiveAwayProduct()).toEqual(new Map([["사이다", 2]])); // 증정 상품 내역 : 1개
    const receipt = cashier.getReceipt(store);
    expect(receipt).toMatch(/사이다\s+10\s+10,000/);
    expect(receipt).toMatch(/사이다\s+2/);
    expect(receipt).toMatch(/총구매액\s+10\s+10,000/);
    expect(receipt).toMatch(/행사할인\s+-2,000/);
    expect(receipt).toMatch(/멤버십할인\s+-0/);
    expect(receipt).toMatch(/내실돈\s+8,000/);
  });

  test("프로모션 재고가 부족한 경우 - 정가로 결제해야 하는 수량 제외하고 결제", async () => {
    // given
    await store.init();
    const purchaseProduct = [["사이다", 10]]; // 사이다 프로모션 재고 8개밖에 없음

    // when
    mockQuestions(["N"]); // 정가로 결제해야 하는 수량 제외하고 결제 => 일반 재고 7개 남고, 프로모션 재고 2개 남음
    await cashier.checkout(new Map(purchaseProduct), store);

    // then
    expect(store.isInStock("사이다", 9)).toBe(true);
    expect(store.isInStock("사이다", 10)).toBe(false);
    expect(store.compareWithPromoStock("사이다", 2)).toBe(0);

    expect(cashier.getPurchasedProduct()).toEqual(new Map([["사이다", 6]])); // 상품 구매 내역 : 3개
    expect(cashier.getGiveAwayProduct()).toEqual(new Map([["사이다", 2]])); // 증정 상품 내역 : 1개
    const receipt = cashier.getReceipt(store);
    expect(receipt).toMatch(/사이다\s+6\s+6,000/);
    expect(receipt).toMatch(/사이다\s+2/);
    expect(receipt).toMatch(/총구매액\s+6\s+6,000/);
    expect(receipt).toMatch(/행사할인\s+-2,000/);
    expect(receipt).toMatch(/멤버십할인\s+-0/);
    expect(receipt).toMatch(/내실돈\s+4,000/);
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 받을 수 있는 상품 추가", async () => {
    // given
    await store.init();
    const purchaseProduct = [["오렌지주스", 1]]; // 1+1인데 한개만 가져옴

    // when
    mockQuestions(["Y"]); // 증정 상품 추가 => 재고 7 남음
    await cashier.checkout(new Map(purchaseProduct), store);

    // then
    expect(store.isInStock("오렌지주스", 7)).toBe(true);
    expect(store.isInStock("오렌지주스", 8)).toBe(false);

    const receipt = cashier.getReceipt(store);
    expect(receipt).toMatch(/오렌지주스\s+2\s+3,600/);
    expect(receipt).toMatch(/오렌지주스\s+1/);
    expect(receipt).toMatch(/총구매액\s+2\s+3,600/);
    expect(receipt).toMatch(/행사할인\s+-1,800/);
    expect(receipt).toMatch(/멤버십할인\s+-0/);
    expect(receipt).toMatch(/내실돈\s+1,800/);
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 더 안받음", async () => {
    // given
    await store.init();
    const purchaseProduct = [["오렌지주스", 3]];

    // when
    mockQuestions(["N"]); // 증정 더 안받음
    await cashier.checkout(new Map(purchaseProduct), store);

    // then
    expect(cashier.getPurchasedProduct()).toEqual(new Map([["오렌지주스", 3]])); // 상품 구매 내역 : 3개
    expect(cashier.getGiveAwayProduct()).toEqual(new Map([["오렌지주스", 1]])); // 증정 상품 내역 : 1개
    const receipt = cashier.getReceipt(store);
    expect(receipt).toMatch(/오렌지주스\s+3\s+5,400/);
    expect(receipt).toMatch(/오렌지주스\s+1/);
    expect(receipt).toMatch(/총구매액\s+3\s+5,400/);
    expect(receipt).toMatch(/행사할인\s+-1,800/);
    expect(receipt).toMatch(/멤버십할인\s+-0/);
    expect(receipt).toMatch(/내실돈\s+3,600/);
  });

  test("멤버십 할인 적용 여부 테스트 - 적용하는 경우", async () => {
    // given
    await store.init();
    const purchaseProduct = [
      ["콜라", 3],
      ["에너지바", 5],
    ];
    mockQuestions(["Y"]); // 멤버십 적용

    // when
    await cashier.checkout(new Map(purchaseProduct), store);

    // then
    expect(cashier.getPurchasedProduct()).toEqual(
      new Map([
        ["에너지바", 5],
        ["콜라", 3],
      ]),
    );
    expect(cashier.getGiveAwayProduct()).toEqual(new Map([["콜라", 1]])); // 증정 상품 내역 : 1개
  });

  test("영수증 출력 테스트", async () => {
    // given
    await store.init();
    const purchaseProduct = [
      ["콜라", 3],
      ["에너지바", 5],
    ];
    await cashier.checkout(new Map(purchaseProduct), store);

    // when
    mockQuestions(["Y"]); // 멤버십 적용
    await cashier.askMembershipDiscount();

    // then
    const receipt = cashier.getReceipt(store);
    expect(receipt).toMatch(/콜라\s+3\s+3,000/);
    expect(receipt).toMatch(/에너지바\s+5\s+10,000/);
    expect(receipt).toMatch(/콜라\s+1/);
    expect(receipt).toMatch(/총구매액\s+8\s+13,000/);
    expect(receipt).toMatch(/행사할인\s+-1,000/);
    expect(receipt).toMatch(/멤버십할인\s+-3,000/);
    expect(receipt).toMatch(/내실돈\s+9,000/);
  });
});
