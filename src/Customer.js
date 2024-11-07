import { ERROR_MESSAGE } from "./constant/message.js";
import InputView from "./View/InputView.js";

class Customer {
  #buyingProductCount = {};

  async buy() {
    const customerInput = await InputView.readItem();

    this.#validateInput(customerInput);
    const products = customerInput.split(",");
    products.forEach((product) => {
      this.#validateProducts(product);
      const [name, count] = product.slice(1, -1).split("-");
      this.#buyingProductCount[name] = count;
    });
  }

  // 입력값 그대로의 유효성 검사
  #validateInput(input) {
    if (input.trim() === "") throw new Error(ERROR_MESSAGE.wrongInput);
  }

  // 쉼표로 자른 후 대괄호로 감싸진 입력값의 유효성 검사
  #validateProducts(input) {
    if (input[0] !== "[" || input[input.length - 1] !== "]" || !input.includes("-"))
      throw new Error(ERROR_MESSAGE.wrongForm);
  }
}

export default Customer;
