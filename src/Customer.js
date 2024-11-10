import { ERROR_MESSAGE } from "./constant/message.js";
import InputView from "./View/InputView.js";

class Customer {
  #buyingProductCount = new Map();

  async buy(store) {
    const customerInput = await InputView.readItem();

    this.#validateInput(customerInput);
    const products = customerInput.split(",");
    products.forEach((product) => {
      this.#validateEachInput(product.trim());
      const [name, count] = product.slice(1, -1).split("-");
      this.#validateProduct(name.trim(), Number(count.trim()), store);
      this.#buyingProductCount.set(name, Number(count.trim()));
    });
  }

  // 입력값 그대로의 유효성 검사
  #validateInput(input) {
    if (input.trim() === "") throw new Error(ERROR_MESSAGE.wrongInput);
  }

  // 쉼표로 자른 후 대괄호로 감싸진 입력값의 유효성 검사
  #validateEachInput(input) {
    if (input[0] !== "[" || input[input.length - 1] !== "]" || !input.includes("-"))
      throw new Error(ERROR_MESSAGE.wrongForm);
  }

  // 대괄호 내의 내용 name과 count로 나눴을 때의 유효성 검사
  #validateProduct(name, count, store) {
    if (!store.isExistInInventory(name)) throw new Error(ERROR_MESSAGE.productNotExist);
    if (count <= 0) throw new Error(ERROR_MESSAGE.productCountNotNegative);
    if (!store.isInStock(name, count)) throw new Error(ERROR_MESSAGE.productOverStock);
  }

  get buyingProductCount() {
    return new Map(this.#buyingProductCount);
  }
}

export default Customer;
