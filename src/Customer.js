import { ERROR_MESSAGE } from "./constant/message.js";
import InputView from "./View/InputView.js";
import { isInputWrappedWith, splitString } from "./util.js";

class Customer {
  #buyingProductCount = new Map();

  async buy(store) {
    const customerInput = await InputView.readItem();

    const products = splitString(customerInput, ",");

    products.forEach((product) => {
      const { name, count } = this.#getValidatedProductInfo(product);
      this.#validateProduct(name, count, store);
      this.#buyingProductCount.set(name, count);
    });
  }

  #getValidatedProductInfo(product) {
    const productInfo = product.trim();

    if (!isInputWrappedWith(productInfo, "[]") || !productInfo.includes("-"))
      throw new Error(ERROR_MESSAGE.wrongForm);
    const [productName, productCount] = productInfo.slice(1, -1).split("-");

    return { name: productName.trim(), count: Number(productCount.trim()) };
  }

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
