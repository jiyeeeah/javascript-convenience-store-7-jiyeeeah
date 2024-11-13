import { getDataFromFile, parseDataToObjects } from "../util.js";

class Inventory {
  #inventory;

  async init() {
    const data = await getDataFromFile("./public/products.md");
    this.#inventory = parseDataToObjects(data);
    this.#inventory.forEach((product, index) => {
      if (product.promotion !== null && !this.getProductInfo(product.name, false)) {
        const normalNoStockInventory = Inventory.#createOneProductInfo(product.name, product.price);
        this.#inventory.splice(index + 1, 0, normalNoStockInventory);
      }
    });
  }

  static #createOneProductInfo(name, price) {
    return { name, price, quantity: 0, promotion: "null" };
  }

  getInventoryDetailsString() {
    return this.#inventory
      .map((product) => {
        const stockString = Inventory.#createStockString(product.quantity);
        const promotionString = Inventory.#createPromotionString(product.promotion);
        return `- ${product.name} ${product.price.toLocaleString()}원 ${stockString}${promotionString}`;
      })
      .join("\n");
  }

  static #createStockString(quantity) {
    if (quantity > 0) return `${quantity}개`;
    return "재고 없음";
  }

  static #createPromotionString(promotion) {
    if (promotion === "null") return "";
    return ` ${promotion}`;
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
