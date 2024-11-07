import { MissionUtils } from "@woowacourse/mission-utils";
import { ERROR_MESSAGE } from "../src/constant/message.js";
import Customer from "../src/Customer.js";

const mockQuestions = (inputs) => {
  MissionUtils.Console.readLineAsync = jest.fn();

  MissionUtils.Console.readLineAsync.mockImplementation(() => {
    const input = inputs.shift();

    return Promise.resolve(input);
  });
};

describe("구매할 상품과 수량 입력 테스트", () => {
  let customer;
  beforeEach(() => {
    customer = new Customer();
  });

  test("입력값이 공백인 경우 예외가 발생한다.", async () => {
    mockQuestions(["   "]);

    await expect(() => customer.buy()).rejects.toThrow(ERROR_MESSAGE.wrongInput);
  });

  test("입력값에 대괄호가 없는 경우 예외가 발생한다.", async () => {
    mockQuestions(["[콜라-3"]);

    await expect(() => customer.buy()).rejects.toThrow(ERROR_MESSAGE.wrongForm);
  });

  test("입력값에 하이픈(-)이 없는 경우 예외가 발생한다.", async () => {
    mockQuestions(["[콜라3]"]);

    await expect(() => customer.buy()).rejects.toThrow(ERROR_MESSAGE.wrongForm);
  });

  const validInput = [["[에너지바-2],[컵라면-1]", "[콜라-3]"]];
  test.each(validInput)("입력값의 형식이 올바른 경우", async (input) => {
    mockQuestions([input]);

    await expect(() => customer.buy()).not.toThrow();
  });
});
