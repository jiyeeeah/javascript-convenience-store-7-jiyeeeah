import Cashier from "../src/Cashier.js";
import Store from "../src/Store.js";
import { mockNowDate, mockQuestions, getLogSpy } from "../src/testUtil/TestUtil.js";

describe("Cashier 클래스 테스트", () => {
  let store;
  let cashier;
  beforeEach(() => {
    store = new Store();
    cashier = new Cashier();
  });

  const checkoutCase = [
    {
      caseName: "에너지바 2개 결제 (프로모션 없음)",
      purchaseProduct: [["에너지바", 2]],
      logsMatch: [
        /에너지바\s+2\s+4,000/,
        /총구매액\s+2\s+4,000/,
        /행사할인\s+-0/,
        /멤버십할인\s+-0/,
        /내실돈\s+4,000/,
      ],
    },
    {
      caseName: "날짜상 프로모션 해당 안되는 경우",
      purchaseProduct: [
        ["감자칩", 3],
        ["정식도시락", 1],
      ],
      logsMatch: [
        /감자칩\s+3\s+4,500/,
        /정식도시락\s+1\s+6,400/,
        /총구매액\s+4\s+10,900/,
        /행사할인\s+-0/,
        /멤버십할인\s+-0/,
        /내실돈\s+10,900/,
      ],
      mockingDate: "2024-02-01",
    },
    {
      caseName: "프로모션 재고가 부족한 경우 - 일부 수량에 대해 정가로 결제",
      purchaseProduct: [["사이다", 10]], // 사이다 프로모션 재고 8개밖에 없음
      logsMatch: [
        /사이다\s+10\s+10,000/,
        /사이다\s+2/,
        /총구매액\s+10\s+10,000/,
        /행사할인\s+-2,000/,
        /멤버십할인\s+-0/,
        /내실돈\s+8,000/,
      ],
      mockingInput: ["Y"],
    },
    {
      caseName: "프로모션 재고가 부족한 경우 - 정가로 결제해야 하는 수량 제외하고 결제",
      purchaseProduct: [["사이다", 10]], // 사이다 프로모션 재고 8개밖에 없음
      logsMatch: [
        /사이다\s+6\s+6,000/,
        /사이다\s+2/,
        /총구매액\s+6\s+6,000/,
        /행사할인\s+-2,000/,
        /멤버십할인\s+-0/,
        /내실돈\s+4,000/,
      ],
      mockingInput: ["N"],
    },
    {
      caseName: "프로모션 적용 가능한 상품 적게 가져온 경우 - 증정 받을 수 있는 상품 추가",
      purchaseProduct: [["오렌지주스", 1]], // 1+1인데 한개만 가져옴
      logsMatch: [
        /오렌지주스\s+2\s+3,600/,
        /오렌지주스\s+1/,
        /총구매액\s+2\s+3,600/,
        /행사할인\s+-1,800/,
        /멤버십할인\s+-0/,
        /내실돈\s+1,800/,
      ],
      mockingInput: ["Y"],
    },
    {
      caseName: "프로모션 적용 가능한 상품 적게 가져온 경우 - 증정 더 안받음",
      purchaseProduct: [["오렌지주스", 3]], // 1+1인데 한개만 가져옴
      logsMatch: [
        /오렌지주스\s+3\s+5,400/,
        /오렌지주스\s+1/,
        /총구매액\s+3\s+5,400/,
        /행사할인\s+-1,800/,
        /멤버십할인\s+-0/,
        /내실돈\s+3,600/,
      ],
      mockingInput: ["N"],
    },
    {
      caseName: "멤버십 할인 적용 여부 테스트 - 적용하는 경우",
      purchaseProduct: [
        ["콜라", 3],
        ["에너지바", 5],
      ],
      logsMatch: [
        /콜라\s+3\s+3,000/,
        /에너지바\s+5\s+10,000/,
        /콜라\s+1/,
        /총구매액\s+8\s+13,000/,
        /행사할인\s+-1,000/,
        /멤버십할인\s+-3,000/,
        /내실돈\s+9,000/,
      ],
      membershipInput: ["Y"],
    },
  ];

  test.each(checkoutCase)(
    "$caseName",
    async ({ purchaseProduct, logsMatch, mockingDate, mockingInput, membershipInput }) => {
      // given
      await store.init();
      const logSpy = getLogSpy();

      // when
      if (mockingDate) mockNowDate(mockingDate);
      if (mockingInput) mockQuestions(mockingInput);

      await cashier.checkout(new Map(purchaseProduct), store);

      if (membershipInput) {
        mockQuestions(membershipInput);
        await cashier.askMembershipDiscount();
      }
      cashier.printReceipt(store);

      // then
      logsMatch.forEach((log) => {
        expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(log));
      });
    },
  );
});
