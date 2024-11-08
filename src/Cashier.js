import InputView from "./View/InputView.js";

class Cashier {
  #payment = {
    total: 0,
    promotionDiscount: 0,
    membershipDiscount: 0,
  };

  checkout({ productName, productCount, convenienceStore }) {
    const applicablePromotion = convenienceStore.getApplicablePromotion(productName);
    const isPromo = !!applicablePromotion;
    const buyingProducts = convenienceStore.getProductInfoFromInventory(productName, isPromo);

    if (!applicablePromotion) {
      convenienceStore.reduceStockBy(productName, productCount, isPromo);
      return;
    }

    const promoProduct = buyingProducts.filter(
      (product) => product.promotion === applicablePromotion.name,
    )[0];
    if (promoProduct.quantity < productCount) {
      if (this.#askIfPayWithoutPromo()) {
        // 일부 수량에 대해 정가로 결제
      }
      // 정가로 결제해야 하는 수량 제외하고 결제
    }
    promoProduct.quantity -= productCount;
  }

  #askIfPayWithoutPromo() {
    const answer = InputView.askPromotionStockShortage();
    return answer === "Y";
  }
}

export default Cashier;
