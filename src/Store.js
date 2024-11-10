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
    return this.#inventory.isExistInInventory(name);
  }

  isInStock(name, count) {
    return this.#inventory.isInStock(name, count);
  }

  compareWithPromoStock(name, count) {
    const productInfo = this.#inventory.getProductInfo(name, true);
    return productInfo.quantity - count;
  }

  getApplicablePromotion(productName) {
    const promoProductInfo = this.#inventory.getProductInfo(productName, true);
    if (!promoProductInfo) return null;

    const productPromotionName = promoProductInfo.promotion;
    const promotionInfo = this.#promotion.getPromotionByName(productPromotionName);

    const today = MissionUtils.DateTimes.now();
    if (!this.#promotion.isAvailable(productPromotionName, today)) return null;

    return promotionInfo;
  }

  reduceStockBy(name, count, isPromo) {
    this.#inventory.reduceStock(name, count, isPromo);
  }

  calculatePrice(name, count) {
    const productInfo = this.#inventory.getProductInfo(name, false);
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
