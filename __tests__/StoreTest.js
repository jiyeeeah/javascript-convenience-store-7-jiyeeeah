import { MissionUtils } from "@woowacourse/mission-utils";
import Store from "../src/Store.js";

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

  test("재고에 제품이 존재하는지 확인한다.", async () => {
    // given
    await store.init();

    // then
    expect(store.isExistInInventory("콜라")).toBe(true);
    expect(store.isExistInInventory("비타민워터")).toBe(true);
    expect(store.isExistInInventory("도시락")).toBe(false);
  });

  test("제품 수량이 재고에서 부족한지 확인한다.", async () => {
    // given
    await store.init();

    // then
    expect(store.isInStock("콜라", 2)).toBe(true);
    expect(store.isInStock("사이다", 10)).toBe(true);
    expect(store.isInStock("비타민워터", 30)).toBe(false);
  });

  test("상품 수량 프로모션 재고랑 비교", async () => {
    await store.init();

    expect(store.compareWithPromoStock("오렌지주스", 1)).toBe(8);
  });

  test("에너지바 2개 결제", async () => {
    // given
    await store.init();
    const purchaseProduct = [["에너지바", 2]];

    // when
    await store.checkout(new Map(purchaseProduct)); // 에너지바 재고 3개 남음

    // then
    expect(store.isInStock("에너지바", 3)).toBe(true);
    expect(store.isInStock("에너지바", 5)).toBe(false);
  });

  test("프로모션 해당 없는 경우", async () => {
    // given
    await store.init();
    const purchaseProduct = [
      ["감자칩", 3],
      ["정식도시락", 1],
    ];
    mockNowDate("2024-02-01"); // 반짝할인은 적용 안됨. 나머지는 적용됨

    // when
    await store.checkout(new Map(purchaseProduct)); // 감자칩: 재고 7개 남음, 정식도시락: 재고 7개 남음

    // then
    expect(store.isInStock("감자칩", 7)).toBe(true);
    expect(store.isInStock("정식도시락", 7)).toBe(true);
  });

  test("프로모션 재고가 부족해서 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우 - 일부 수량에 대해 정가로 결제", async () => {
    // given
    await store.init();
    const purchaseProduct = [["사이다", 10]]; // 사이다 프로모션 재고 8개밖에 없음

    // when
    mockQuestions(["Y"]); // 일부 수량(4)에 대해 정가로 결제 => 일반 재고 3개 남고, 프로모션 재고 2개 남음
    await store.checkout(new Map(purchaseProduct));

    // then
    expect(store.isInStock("사이다", 5)).toBe(true);
    expect(store.isInStock("사이다", 6)).toBe(false);
    expect(store.compareWithPromoStock("사이다", 2)).toBe(0);
  });

  test("프로모션 재고가 부족해서 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우 - 정가로 결제해야 하는 수량 제외하고 결제", async () => {
    // given
    await store.init();
    const purchaseProduct = [["사이다", 10]]; // 사이다 프로모션 재고 8개밖에 없음

    // when
    mockQuestions(["N"]); // 정가로 결제해야 하는 수량 제외하고 결제 => 일반 재고 7개 남고, 프로모션 재고 2개 남음
    await store.checkout(new Map(purchaseProduct));

    // then
    expect(store.isInStock("사이다", 9)).toBe(true);
    expect(store.isInStock("사이다", 10)).toBe(false);
    expect(store.compareWithPromoStock("사이다", 2)).toBe(0);
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 받을 수 있는 상품 추가", async () => {
    // given
    await store.init();
    const purchaseProduct = [["오렌지주스", 1]]; // 1+1인데 한개만 가져옴

    // when
    mockQuestions(["Y"]); // 증정 상품 추가 => 재고 7 남음
    await store.checkout(new Map(purchaseProduct));

    // then
    expect(store.isInStock("오렌지주스", 7)).toBe(true);
    expect(store.isInStock("오렌지주스", 8)).toBe(false);
  });

  test("프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 - 증정 받을 수 있는 상품 추가하지 않음", async () => {
    // given
    await store.init();
    const purchaseProduct = [["오렌지주스", 1]]; // 1+1인데 한개만 가져옴

    // when
    mockQuestions(["N"]); // 증정 상품 추가 하지 않음 => 재고 8개 남음
    await store.checkout(new Map(purchaseProduct));

    // then
    expect(store.isInStock("오렌지주스", 8)).toBe(true);
    expect(store.isInStock("오렌지주스", 9)).toBe(false);
  });
});
