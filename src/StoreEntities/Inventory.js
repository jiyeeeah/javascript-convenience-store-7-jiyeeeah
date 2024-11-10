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

  isExistInInventory(name) {
    return this.#inventory.some((product) => product.name === name);
  }

  isInStock(name, count) {
    const filteredProducts = this.#inventory.filter((product) => product.name === name);
    const totalQuantity = filteredProducts.reduce((acc, product) => acc + product.quantity, 0);
    return totalQuantity >= count;
  }

  getProductInfo(productName, isPromo) {
    return this.#inventory.filter(
      (product) =>
        product.name === productName &&
        ((!isPromo && product.promotion === "null") || (isPromo && product.promotion !== "null")),
    )[0];
  }

  reduceStock(name, count, isPromo) {
    this.#inventory.forEach((product) => {
      if (product.name !== name) return;
      if ((isPromo && product.promotion === "null") || (!isPromo && product.promotion !== "null"))
        return;
      product.quantity -= count;
    });
  }

  calculatePrice(name, count) {
    const productInfo = this.getProductInfo(name, false);
    const productPrice = productInfo.price;

    return productPrice * count;
  }
}

export default Inventory;
