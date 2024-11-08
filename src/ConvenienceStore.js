import { MissionUtils } from "@woowacourse/mission-utils";
import { getDataFromFile } from "./util.js";
import OutputView from "./View/OutputView.js";

class ConvenienceStore {
  #inventory;
  #promotion;

  async init() {
    this.#inventory = await getDataFromFile("./public/products.md");
    this.#promotion = await getDataFromFile("./public/promotions.md");
  }

  printWelcomeAndInventory() {
    OutputView.printWelcome();
    this.#inventory.forEach((product) => {
      OutputView.printInventory(product);
    });
  }

  isExistInInventory(name) {
    return this.#inventory.some((product) => product.name === name);
  }

  isInStock(name, count) {
    const filteredProducts = this.#inventory.filter((product) => product.name === name);
    const totalQuantity = filteredProducts.reduce(
      (acc, product) => acc + Number(product.quantity),
      0,
    );
    return totalQuantity >= count;
  }

  isInPromoStock({ productName, productCount }) {
    const productInfo = this.getProductInfoFromInventory(productName, true);
    return productInfo.quantity >= productCount;
  }

  getProductInfoFromInventory(productName, isPromo) {
    return this.#inventory.filter(
      (product) =>
        product.name === productName &&
        ((!isPromo && product.promotion === "null") || (isPromo && product.promotion !== "null")),
    )[0];
  }

  getApplicablePromotion(productName) {
    const today = MissionUtils.DateTimes.now();

    const productPromotionName = this.getProductInfoFromInventory(productName, true).promotion;

    return this.#promotion.filter(
      (promo) =>
        productPromotionName === promo.name &&
        today >= new Date(promo.start_date) &&
        today <= new Date(promo.end_date),
    )[0];
  }

  reduceStockBy(name, count, isPromo) {
    this.#inventory.forEach((product) => {
      if (product.name !== name) return;
      if ((isPromo && product.promotion === "null") || (!isPromo && product.promotion !== "null"))
        return;
      // eslint-disable-next-line no-param-reassign
      product.quantity -= count;
    });
  }
}

export default ConvenienceStore;
