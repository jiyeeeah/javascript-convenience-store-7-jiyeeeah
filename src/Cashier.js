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

    // 적용할 프로모션이 없는 경우
    if (!applicablePromotion) {
      convenienceStore.reduceStockBy(productName, productCount, isPromo); // 재고에서 없애기
      this.#payment.total += convenienceStore.calculatePrice(productName, productCount); // 계산해야할 total에 저장
      return;
    }

    if (convenienceStore.isInPromoStock({ productName, productCount })) {
      if (this.#askIfPayWithoutPromo()) {
        // 일부 수량에 대해 정가로 결제
      }
      // 정가로 결제해야 하는 수량 제외하고 결제
    }
    convenienceStore.reduceStockBy(productName, productCount, isPromo);
  }

  #askIfPayWithoutPromo() {
    const answer = InputView.askPromotionStockShortage();
    return answer === "Y";
  }

  getTotalPurchaseAmount() {
    return this.#payment.total;
  }
}

export default Cashier;
