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

  calculatePrice(name, count) {
    return this.#inventory.calculatePrice(name, count);
  }

  reduceStock(name, count, isPromo) {
    this.#inventory.reduceStock(name, count, isPromo);
  }

  isPromoApplicable(productName) {
    const promoProductInfo = this.#inventory.getProductInfo(productName, true);
    if (!promoProductInfo) return false;
    const productPromotionName = promoProductInfo.promotion;
    const today = MissionUtils.DateTimes.now();
    if (!this.#promotion.isAvailable(productPromotionName, today)) return false;

    return true;
  }

  getPromoBundle(productName) {
    const promoProductInfo = this.#inventory.getProductInfo(productName, true);
    const productPromotionName = promoProductInfo.promotion;
    const promotionInfo = this.#promotion.getPromotionByName(productPromotionName);
    const { buy, get } = promotionInfo;

    return { buy, get, promoBundleSize: buy + get };
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
