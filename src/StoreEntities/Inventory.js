import { getDataFromFile, parseDataToObjects } from "../util.js";

class Inventory {
  #inventory;

  async init() {
    const data = await getDataFromFile("./public/products.md");
    this.#inventory = parseDataToObjects(data);
    this.#inventory.forEach((product, index) => {
      if (product.promotion && !this.getGeneralProductInfo(product.name)) {
        const normalNoStockInventory = this.#createNoStockProductInfo(product.name, product.price);
        this.#inventory.splice(index + 1, 0, normalNoStockInventory);
      }
    });
  }

  #createNoStockProductInfo(name, price) {
    return { name, price, quantity: 0, promotion: null };
  }

  getInventoryDetailsString() {
    return this.#inventory
      .map((product) => {
        const priceString = product.price.toLocaleString();
        const quantityString = this.#createQuantityString(product.quantity);
        const promotionString = this.#createPromotionString(product.promotion);
        return `- ${product.name} ${priceString}원 ${quantityString}${promotionString}`;
      })
      .join("\n");
  }

  #createQuantityString(quantity) {
    if (quantity > 0) return `${quantity}개`;
    return "재고 없음";
  }

  #createPromotionString(promotion) {
    if (promotion === null) return "";
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

  getGeneralProductInfo(productName) {
    return this.#inventory.filter(
      (product) => product.name === productName && product.promotion === null,
    )[0];
  }

  getPromoProductInfo(productName) {
    return this.#inventory.filter(
      (product) => product.name === productName && product.promotion !== null,
    )[0];
  }

  reduceStock(name, count, isPromo) {
    this.#inventory.forEach((product) => {
      if (product.name !== name) return;
      if ((isPromo && product.promotion === null) || (!isPromo && product.promotion !== null))
        return;
      product.quantity -= count;
    });
  }

  calculatePrice(name, count) {
    const productInfo = this.getGeneralProductInfo(name);
    const productPrice = productInfo.price;

    return productPrice * count;
  }
}

export default Inventory;
