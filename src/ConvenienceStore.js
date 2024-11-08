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

  getProductFromInventory(productName) {
    return this.#inventory.filter((product) => product.name === productName);
  }

  getApplicablePromotion(productName) {
    const today = MissionUtils.DateTimes.now();

    const productPromotion = this.getProductFromInventory(productName).map(
      (item) => item.promotion,
    );

    return this.#promotion.filter(
      (promo) =>
        productPromotion.includes(promo.name) &&
        today >= new Date(promo.start_date) &&
        today <= new Date(promo.end_date),
    )[0];
  }
}

export default ConvenienceStore;
