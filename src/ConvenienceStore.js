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
}

export default ConvenienceStore;
