import { ERROR_MESSAGE } from "../src/constant/message.js";
import Customer from "../src/Customer.js";
import Store from "../src/Store.js";
import { mockQuestions } from "../src/testUtil/TestUtil.js";

describe("구매할 상품과 수량 입력 테스트", () => {
  let customer;
  let store;
  beforeEach(() => {
    store = new Store();
    customer = new Customer();
  });

  const errorCase = [
    {
      caseName: "입력값이 공백인 경우",
      inputs: [["   "], [""]],
      errorMessage: ERROR_MESSAGE.wrongInput,
    },
    {
      caseName: "입력값이 올바르지 않은 경우",
      inputs: [
        ["[콜라-3"],
        ["도시락-1"],
        ["도시락-2]"],
        ["[콜라3]"],
        ["[정식도시락-3][오렌지주스-1]"],
      ],
      errorMessage: ERROR_MESSAGE.wrongForm,
    },
    {
      caseName: "재고에 존재하지 않는 제품 입력한 경우",
      inputs: [["[도시락-3]"]],
      errorMessage: ERROR_MESSAGE.productNotExist,
    },
    {
      caseName: "수량이 0개 이하인 경우",
      inputs: [["[콜라-0]"], ["[비타민워터-3],[에너지바--4]"]],
      errorMessage: ERROR_MESSAGE.productCountNotNegative,
    },
    {
      caseName: "재고의 수량이 부족한 경우",
      inputs: [["[콜라-25]"], ["[오렌지주스-10]"], ["[컵라면-1],[탄산수-6]"]],
      errorMessage: ERROR_MESSAGE.productOverStock,
    },
    {
      caseName: "중복되는 상품을 입력한 경우",
      inputs: [["[콜라-3],[콜라-1]"]],
      errorMessage: ERROR_MESSAGE.productNoDuplicate,
    },
  ];

  test.each(errorCase)("예외 케이스 : $caseName", async ({ inputs, errorMessage }) => {
    await store.init();

    inputs.forEach(async (input) => {
      mockQuestions(input);

      await expect(() => customer.buy(store)).rejects.toThrow(errorMessage);
    });
  });

  const validInput = [[["[에너지바-2],[컵라면-1]"], ["[콜라-3]"]]];
  test.each(validInput)("입력값의 형식이 올바른 경우", async (input) => {
    mockQuestions(input);
    await store.init();

    await expect(() => customer.buy(store)).not.toThrow();
  });

  test("고객이 구매하고자하는 제품과 수량을 전달한다.", async () => {
    await store.init();
    mockQuestions(["[콜라-3]"]);

    await customer.buy(store);

    expect(customer.buyingProductsCount).toEqual(new Map([["콜라", 3]]));
  });
});
