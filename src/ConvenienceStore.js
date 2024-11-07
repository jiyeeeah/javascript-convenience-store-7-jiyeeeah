import { getDataFromFile } from "./util.js";

class ConvenienceStore {
  #inventory;
  #promotion;

  async init() {
    this.#inventory = await getDataFromFile("./public/products.md");
    this.#promotion = await getDataFromFile("./public/promotions.md");
  }
}

export default ConvenienceStore;
