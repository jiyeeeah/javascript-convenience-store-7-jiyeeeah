import { MissionUtils } from "@woowacourse/mission-utils";
import { ERROR_MESSAGE } from "../src/constant/message.js";
import Customer from "../src/Customer.js";
import ConvenienceStore from "../src/ConvenienceStore.js";

const mockQuestions = (inputs) => {
  MissionUtils.Console.readLineAsync = jest.fn();

  MissionUtils.Console.readLineAsync.mockImplementation(() => {
    const input = inputs.shift();

    return Promise.resolve(input);
  });
};

describe("구매할 상품과 수량 입력 테스트", () => {
  let customer;
  let convenienceStore;
  beforeEach(() => {
    convenienceStore = new ConvenienceStore();
    customer = new Customer();
  });

  test("입력값이 공백인 경우 예외가 발생한다.", async () => {
    mockQuestions(["   "]);
    await convenienceStore.init();

    await expect(() => customer.buy(convenienceStore)).rejects.toThrow(ERROR_MESSAGE.wrongInput);
  });

  test("입력값에 대괄호가 없는 경우 예외가 발생한다.", async () => {
    mockQuestions(["[콜라-3"]);
    await convenienceStore.init();

    await expect(() => customer.buy(convenienceStore)).rejects.toThrow(ERROR_MESSAGE.wrongForm);
  });

  test("입력값에 하이픈(-)이 없는 경우 예외가 발생한다.", async () => {
    mockQuestions(["[콜라3]"]);
    await convenienceStore.init();

    await expect(() => customer.buy(convenienceStore)).rejects.toThrow(ERROR_MESSAGE.wrongForm);
  });

  test("재고에 존재하지 않는 제품 입력시 예외가 발생한다.", async () => {
    mockQuestions(["[도시락-3]"]);
    await convenienceStore.init();

    await expect(() => customer.buy(convenienceStore)).rejects.toThrow(
      ERROR_MESSAGE.productNotExist,
    );
  });

  const negativeInput = [[["[콜라-0]"], ["[비타민워터-3],[에너지바--4]"]]];
  test.each(negativeInput)("수량이 0개 이하인 경우 예외가 발생한다.", async (input) => {
    mockQuestions(input);
    await convenienceStore.init();

    await expect(() => customer.buy(convenienceStore)).rejects.toThrow(
      ERROR_MESSAGE.productCountNotNegative,
    );
  });

  const validInput = [[["[에너지바-2],[컵라면-1]"], ["[콜라-3]"]]];
  test.each(validInput)("입력값의 형식이 올바른 경우", async (input) => {
    mockQuestions(input);
    await convenienceStore.init();

    await expect(() => customer.buy(convenienceStore)).not.toThrow();
  });
});
