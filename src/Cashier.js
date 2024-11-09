import InputView from "./View/InputView.js";
import OutputView from "./View/OutputView.js";

class Cashier {
  #purchasedProduct = new Map();
  #promotionProduct = new Map();
  #payment = {
    total: 0,
    promotionDiscount: 0,
    membershipDiscount: 0,
  };

  async checkout({ productName, productCount, convenienceStore }) {
    const applicablePromotion = convenienceStore.getApplicablePromotion(productName);
    const isPromo = applicablePromotion !== undefined;

    // 적용할 프로모션이 없는 경우
    if (!applicablePromotion) {
      convenienceStore.reduceStockBy(productName, productCount, isPromo); // 재고에서 없애기
      const productTotalPrice = convenienceStore.calculatePrice(productName, productCount);
      this.#paymentProcess({ productName, productCount, productTotalPrice });
      return;
    }

    // 재고에 수량 부족한 경우
    if (!convenienceStore.isInPromoStock(productName, productCount)) {
      const ifPayWithoutPromo = await this.#askIfPayWithoutPromo(productName, productCount);
      if (ifPayWithoutPromo) {
        // 일부 수량에 대해 정가로 결제
      }
      // 정가로 결제해야 하는 수량 제외하고 결제
    }

    // 프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우
    const { buy, get } = applicablePromotion;
    const totalPromotionCount = Number(buy) + Number(get);
    if (productCount % totalPromotionCount === Number(buy)) {
      const addPromoProduct = await this.#askIfAddPromoProduct(productName);
      let promotionCount = Math.floor(productCount / totalPromotionCount);
      let totalProductCount = productCount;
      if (addPromoProduct) {
        promotionCount += 1;
        totalProductCount += 1;
      }
      convenienceStore.reduceStockBy(productName, productCount, isPromo); // 재고에서 없애기
      const productTotalPrice = convenienceStore.calculatePrice(productName, totalProductCount);
      const promotionPrice = convenienceStore.calculatePrice(productName, promotionCount);
      this.#paymentProcessPromo({
        productName,
        productCount: totalProductCount,
        promotionCount,
        productTotalPrice,
        promotionPrice,
      });
    }
  }

  #paymentProcess({ productName, productCount, productTotalPrice }) {
    this.#purchasedProduct.set(productName, productCount);
    this.#payment.total += productTotalPrice; // 계산해야 할 total에 저장
  }

  #paymentProcessPromo({
    productName,
    productCount,
    promotionCount,
    productTotalPrice,
    promotionPrice,
  }) {
    this.#purchasedProduct.set(productName, productCount);
    if (promotionCount > 0) this.#promotionProduct.set(productName, promotionCount);
    this.#payment.total += productTotalPrice; // 계산해야 할 total에 저장
    this.#payment.promotionDiscount += promotionPrice;
  }

  getPurchaseProducts() {
    return new Map(this.#purchasedProduct);
  }

  getPromotionProduct() {
    return new Map(this.#promotionProduct);
  }

  getTotalPurchaseAmount() {
    return this.#payment.total;
  }

  getPromotionDiscount() {
    return this.#payment.promotionDiscount;
  }

  async #askIfPayWithoutPromo(productName, productCount) {
    try {
      const answer = await InputView.askPromotionStockShortage(productName, productCount);
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.#askIfPayWithoutPromo();
    }
  }

  async #askIfAddPromoProduct(productName) {
    try {
      const answer = await InputView.askAddPromotionProduct(productName);
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.#askIfAddPromoProduct(productName);
    }
  }
}

export default Cashier;
