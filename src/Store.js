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
    const productInfo = this.#inventory.getPromoProductInfo(name);
    return productInfo.quantity - count;
  }

  calculatePrice(name, count) {
    return this.#inventory.calculatePrice(name, count);
  }

  reduceGeneralStock(name, count) {
    this.#inventory.reduceGeneralStock(name, count);
  }

  reducePromoStock(name, count) {
    const productInfo = this.#inventory.getPromoProductInfo(name);
    const restStock = count - productInfo.quantity;

    this.#inventory.reducePromoStock(name, productInfo.quantity);
    this.#inventory.reduceGeneralStock(name, restStock);

    const { promoBundleSize } = this.getPromoBundle(name);
    const stockRestCount = productInfo.quantity;
    if (stockRestCount < promoBundleSize) this.#reallocateRemainingPromoStock(name, stockRestCount);
  }

  // 남는 재고가 promoBundleSize보다 작은 경우 남은 프로모션 재고를 일반 재고로 이동
  #reallocateRemainingPromoStock(name, stockRestCount) {
    this.#inventory.reducePromoStock(name, stockRestCount);
    this.#inventory.reduceGeneralStock(name, -stockRestCount);
  }

  isPromoApplicable(productName) {
    const promoProductInfo = this.#inventory.getPromoProductInfo(productName);
    if (!promoProductInfo) return false;

    const productPromotionName = promoProductInfo.promotion;
    const today = MissionUtils.DateTimes.now();
    if (!this.#promotion.isAvailable(productPromotionName, today)) return false;

    return true;
  }

  getPromoBundle(productName) {
    const promoProductInfo = this.#inventory.getPromoProductInfo(productName);
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
