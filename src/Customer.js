import { ERROR_MESSAGE } from "./constant/message.js";
import InputView from "./View/InputView.js";
import { isInputWrappedWith, isNumber, splitString } from "./util.js";

class Customer {
  #buyingProductsCount = new Map();

  async buy(store) {
    const customerInput = await InputView.readItem();

    const products = splitString(customerInput, ",");

    products.forEach((product) => {
      const { name, count } = this.#getValidatedProductInfo(product, store);
      this.#buyingProductsCount.set(name, count);
    });
  }

  #getValidatedProductInfo(product, store) {
    const productInfo = product.trim();
    if (!isInputWrappedWith(productInfo, "[]") || !productInfo.includes("-"))
      throw new Error(ERROR_MESSAGE.wrongForm);

    const [productName, productCount] = productInfo.slice(1, -1).split("-");
    this.#validateProduct(productName, productCount, store);

    return { name: productName.trim(), count: Number(productCount.trim()) };
  }

  #validateProduct(name, count, store) {
    if (!isNumber(count)) throw new Error(ERROR_MESSAGE.wrongForm);
    if (!store.isExistInInventory(name)) throw new Error(ERROR_MESSAGE.productNotExist);
    if (count <= 0) throw new Error(ERROR_MESSAGE.productCountNotNegative);
    if (!store.isInStock(name, count)) throw new Error(ERROR_MESSAGE.productOverStock);
    if (this.#buyingProductsCount.has(name)) throw new Error(ERROR_MESSAGE.productNoDuplicate);
  }

  get buyingProductsCount() {
    return new Map(this.#buyingProductsCount);
  }
}

export default Customer;
