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

const getLogSpy = () => {
  const logSpy = jest.spyOn(MissionUtils.Console, "print");
  logSpy.mockClear();
  return logSpy;
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
    const logsMatch = [
      /에너지바\s+2\s+4,000/,
      /총구매액\s+2\s+4,000/,
      /행사할인\s+-0/,
      /멤버십할인\s+-0/,
      /내실돈\s+4,000/,
    ];
    const logSpy = getLogSpy();

    // when
    await cashier.checkout(new Map(purchaseProduct), store);
    cashier.printReceipt(store);

    // then
    logsMatch.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
    });
  });

  test("프로모션 해당 없는 경우", async () => {
    // given
    await store.init();
    const purchaseProduct = [
      ["감자칩", 3],
      ["정식도시락", 1],
    ];
    const logsMatch = [
      /감자칩\s+3\s+4,500/,
      /정식도시락\s+1\s+6,400/,
      /총구매액\s+4\s+10,900/,
      /행사할인\s+-0/,
      /멤버십할인\s+-0/,
      /내실돈\s+10,900/,
    ];
    const logSpy = getLogSpy();

    // when
    mockNowDate("2024-02-01"); // 반짝할인(감자칩)은 적용 안됨. 나머지는 적용됨
    await cashier.checkout(new Map(purchaseProduct), store);
    cashier.printReceipt(store);

    // then
    logsMatch.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
    });
  });

  test("프로모션 재고가 부족한 경우 - 일부 수량에 대해 정가로 결제", async () => {
    // given
    await store.init();
    const purchaseProduct = [["사이다", 10]]; // 사이다 프로모션 재고 8개밖에 없음
    const logsMatch = [
      /사이다\s+10\s+10,000/,
      /사이다\s+2/,
      /총구매액\s+10\s+10,000/,
      /행사할인\s+-2,000/,
      /멤버십할인\s+-0/,
      /내실돈\s+8,000/,
    ];
    const logSpy = getLogSpy();

    // when
    mockQuestions(["Y"]); // 일부 수량(4)에 대해 정가로 결제 => 일반 재고 3개 남고, 프로모션 재고 2개 남음
    await cashier.checkout(new Map(purchaseProduct), store);
    cashier.printReceipt(store);

    // then
    expect(store.isInStock("사이다", 5)).toBe(true);
    expect(store.isInStock("사이다", 6)).toBe(false);
    expect(store.compareWithPromoStock("사이다", 2)).toBe(0);
    logsMatch.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
    });
  });

  test("프로모션 재고가 부족한 경우 - 정가로 결제해야 하는 수량 제외하고 결제", async () => {
    // given
    await store.init();
    const purchaseProduct = [["사이다", 10]]; // 사이다 프로모션 재고 8개밖에 없음
    const logsMatch = [
      /사이다\s+6\s+6,000/,
      /사이다\s+2/,
      /총구매액\s+6\s+6,000/,
      /행사할인\s+-2,000/,
      /멤버십할인\s+-0/,
      /내실돈\s+4,000/,
    ];
    const logSpy = getLogSpy();

    // when
    mockQuestions(["N"]); // 정가로 결제해야 하는 수량 제외하고 결제 => 일반 재고 7개 남고, 프로모션 재고 2개 남음
    await cashier.checkout(new Map(purchaseProduct), store);
    cashier.printReceipt(store);

    // then
    expect(store.isInStock("사이다", 9)).toBe(true);
    expect(store.isInStock("사이다", 10)).toBe(false);
    expect(store.compareWithPromoStock("사이다", 2)).toBe(0);
    logsMatch.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
    });
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 받을 수 있는 상품 추가", async () => {
    // given
    await store.init();
    const purchaseProduct = [["오렌지주스", 1]]; // 1+1인데 한개만 가져옴
    const logsMatch = [
      /오렌지주스\s+2\s+3,600/,
      /오렌지주스\s+1/,
      /총구매액\s+2\s+3,600/,
      /행사할인\s+-1,800/,
      /멤버십할인\s+-0/,
      /내실돈\s+1,800/,
    ];
    const logSpy = getLogSpy();

    // when
    mockQuestions(["Y"]); // 증정 상품 추가 => 재고 7 남음
    await cashier.checkout(new Map(purchaseProduct), store);
    cashier.printReceipt(store);

    // then
    expect(store.isInStock("오렌지주스", 7)).toBe(true);
    expect(store.isInStock("오렌지주스", 8)).toBe(false);
    logsMatch.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
    });
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 더 안받음", async () => {
    // given
    await store.init();
    const purchaseProduct = [["오렌지주스", 3]];
    const logsMatch = [
      /오렌지주스\s+3\s+5,400/,
      /오렌지주스\s+1/,
      /총구매액\s+3\s+5,400/,
      /행사할인\s+-1,800/,
      /멤버십할인\s+-0/,
      /내실돈\s+3,600/,
    ];
    const logSpy = getLogSpy();

    // when
    mockQuestions(["N"]); // 증정 더 안받음
    await cashier.checkout(new Map(purchaseProduct), store);
    cashier.printReceipt(store);

    // then
    logsMatch.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
    });
  });

  test("멤버십 할인 적용 여부 테스트 - 적용하는 경우", async () => {
    // given
    await store.init();
    const purchaseProduct = [
      ["콜라", 3],
      ["에너지바", 5],
    ];
    const logsMatch = [
      /콜라\s+3\s+3,000/,
      /에너지바\s+5\s+10,000/,
      /콜라\s+1/,
      /총구매액\s+8\s+13,000/,
      /행사할인\s+-1,000/,
      /멤버십할인\s+-3,000/,
      /내실돈\s+9,000/,
    ];
    const logSpy = getLogSpy();
    mockQuestions(["Y"]); // 멤버십 적용

    // when
    await cashier.checkout(new Map(purchaseProduct), store);
    await cashier.askMembershipDiscount();
    cashier.printReceipt(store);

    // then
    logsMatch.forEach((log) => {
      expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
    });
  });
});
