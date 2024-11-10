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

  isAvailable(promotionName, date) {
    const promotionInfo = this.getPromotionByName(promotionName);
    return date >= new Date(promotionInfo.start_date) && date <= new Date(promotionInfo.end_date);
  }
}

export default Promotion;
