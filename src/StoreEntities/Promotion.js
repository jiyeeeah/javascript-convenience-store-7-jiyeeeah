import { getDataFromFile, parseDataToObjects } from "../util.js";

class Promotion {
  #promotionInfo;

  async init() {
    const data = await getDataFromFile("./public/promotions.md");
    this.#promotionInfo = parseDataToObjects(data);
  }

  getPromotionByName(promotionName) {
    return this.#promotionInfo.filter((promo) => promotionName === promo.name)[0];
  }
}

export default Promotion;
