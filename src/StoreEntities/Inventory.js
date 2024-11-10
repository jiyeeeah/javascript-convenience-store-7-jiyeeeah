import { getDataFromFile, parseDataToObjects } from "../util.js";

class Inventory {
  #inventory;

  async init() {
    const data = await getDataFromFile("./public/products.md");
    this.#inventory = parseDataToObjects(data);
  }

  getInventoryDetailsString() {
    return this.#inventory
      .map((product) => {
        let stockString = "재고 없음";
        if (product.quantity > 0) stockString = `${product.quantity}개`;

        let promotionString = "";
        if (product.promotion !== "null") promotionString = ` ${product.promotion}`;

        return `- ${product.name} ${product.price.toLocaleString()}원 ${stockString}${promotionString}`;
      })
      .join("\n");
  }
}

export default Inventory;
