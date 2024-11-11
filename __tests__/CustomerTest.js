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

  test("입력값이 공백인 경우 예외가 발생한다.", async () => {
    mockQuestions(["   "]);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.wrongInput);
  });

  test("입력값에 대괄호가 없는 경우 예외가 발생한다.", async () => {
    mockQuestions(["[콜라-3"]);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.wrongForm);
  });

  test("입력값에 하이픈(-)이 없는 경우 예외가 발생한다.", async () => {
    mockQuestions(["[콜라3]"]);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.wrongForm);
  });

  test("재고에 존재하지 않는 제품 입력시 예외가 발생한다.", async () => {
    mockQuestions(["[도시락-3]"]);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.productNotExist);
  });

  const negativeInput = [[["[콜라-0]"], ["[비타민워터-3],[에너지바--4]"]]];
  test.each(negativeInput)("수량이 0개 이하인 경우 예외가 발생한다.", async (input) => {
    mockQuestions(input);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.productCountNotNegative);
  });

  const outOfStockInput = [[["[콜라-25]"], ["[오렌지주스-10]"], ["[컵라면-1],[탄산수-6]"]]];
  test.each(outOfStockInput)("재고의 수량이 부족한 경우 예외가 발생한다.", async (input) => {
    mockQuestions(input);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.productOverStock);
  });

  test("입력값이 올바르지 않은 경우 예외가 발생한다.", async () => {
    mockQuestions(["[정식도시락-3][오렌지주스-1]"]);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.wrongForm);
  });

  test("중복되는 상품을 입력한 경우 예외가 발생한다.", async () => {
    mockQuestions(["[콜라-3],[콜라-1]"]);
    await store.init();

    await expect(() => customer.buy(store)).rejects.toThrow(ERROR_MESSAGE.productNoDuplicate);
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
