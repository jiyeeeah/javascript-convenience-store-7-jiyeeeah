import { MissionUtils } from "@woowacourse/mission-utils";
import OutputView from "./View/OutputView.js";
import InputView from "./View/InputView.js";
import Promotion from "./StoreEntities/Promotion.js";
import Inventory from "./StoreEntities/Inventory.js";

class Store {
  #inventory;
  #promotion;

  async init() {
    this.#inventory = new Inventory();
    await this.#inventory.init();

    this.#promotion = new Promotion();
    await this.#promotion.init();
  }

  printWelcomeAndInventory() {
    OutputView.printWelcome();
    OutputView.printMessage(this.#inventory.getInventoryDetailsString());
  }

  isExistInInventory(name) {
    return this.#inventory.some((product) => product.name === name);
  }

  isInStock(name, count) {
    const filteredProducts = this.#inventory.filter((product) => product.name === name);
    const totalQuantity = filteredProducts.reduce((acc, product) => acc + product.quantity, 0);
    return totalQuantity >= count;
  }

  compareWithPromoStock(name, count) {
    const productInfo = this.#getProductInfoFromInventory(name, true);
    return productInfo.quantity - count;
  }

  #getProductInfoFromInventory(productName, isPromo) {
    return this.#inventory.filter(
      (product) =>
        product.name === productName &&
        ((!isPromo && product.promotion === "null") || (isPromo && product.promotion !== "null")),
    )[0];
  }

  getApplicablePromotion(productName) {
    const promoProductInfo = this.#getProductInfoFromInventory(productName, true);
    if (!promoProductInfo) return null;

    const productPromotionName = promoProductInfo.promotion;
    const promotionInfo = this.#promotion.getPromotionByName(productPromotionName);

    const today = MissionUtils.DateTimes.now();
    if (!this.#promotion.isAvailable(productPromotionName, today)) return null;

    return promotionInfo;
  }

  reduceStockBy(name, count, isPromo) {
    this.#inventory.forEach((product) => {
      if (product.name !== name) return;
      if ((isPromo && product.promotion === "null") || (!isPromo && product.promotion !== "null"))
        return;
      product.quantity -= count;
    });
  }

  calculatePrice(name, count) {
    const productInfo = this.#getProductInfoFromInventory(name, false);
    const productPrice = productInfo.price;

    return productPrice * count;
  }

  async askRestart() {
    try {
      const answer = await InputView.askBuyAgain();
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.askRestart();
    }
  }
}

export default Store;
