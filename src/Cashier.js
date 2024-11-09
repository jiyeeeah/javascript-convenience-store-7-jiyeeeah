import InputView from "./View/InputView.js";

class Cashier {
  #purchasedProduct = new Map();
  #promotionProduct = [];
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
      this.#purchasedProduct.set(productName, productCount);
      this.#payment.total += convenienceStore.calculatePrice(productName, productCount); // 계산해야 할 total에 저장
      return;
    }

    // 재고에 수량 부족한 경우
    if (convenienceStore.isInPromoStock({ productName, productCount })) {
      if (this.#askIfPayWithoutPromo()) {
        // 일부 수량에 대해 정가로 결제
      }
      // 정가로 결제해야 하는 수량 제외하고 결제
    }

    // 프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우
    const { buy, get } = applicablePromotion;
    if (productCount % (Number(buy) + Number(get)) !== 0) {
      if (this.#askIfAddPromoProduct()) {
        // 증정 받을 수 있는 상품 추가
      }
      // 증정 받을 수 있는 상품 추가하지 않음
    }
  }

  #askIfPayWithoutPromo() {
    const answer = InputView.askPromotionStockShortage();
    return answer === "Y";
  }

  #askIfAddPromoProduct() {
    const answer = InputView.askAddPromotionProduct();
    return answer === "Y";
  }

  getPurchaseProducts() {
    return new Map(this.#purchasedProduct);
  }

  getTotalPurchaseAmount() {
    return this.#payment.total;
  }
}

export default Cashier;
