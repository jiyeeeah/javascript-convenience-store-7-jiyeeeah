import InputView from "./View/InputView.js";
import OutputView from "./View/OutputView.js";

class Cashier {
  #purchasedProduct = new Map();
  #promotionProduct = new Map();
  #payment = {
    normalPaymentTotal: 0,
    promotionAppliedPaymentTotal: 0,
    promotionDiscount: 0,
    membershipDiscount: 0,
  };

  async checkout({ productName, productCount, store }) {
    const applicablePromotion = store.getApplicablePromotion(productName);

    // 적용할 프로모션이 없는 경우
    if (!applicablePromotion) {
      store.reduceStockBy(productName, productCount, false); // 재고에서 없애기
      const productTotalPrice = store.calculatePrice(productName, productCount);
      this.#paymentProcess({ productName, productCount, productTotalPrice });
      return;
    }

    const { buy, get } = applicablePromotion;
    const totalPromotionCount = buy + get;
    let totalProductCount = productCount;
    let promotionAppliedCount = productCount;

    // 재고에 수량 부족한 경우
    const restCount = store.compareWithPromoStock(productName, productCount);
    if (restCount < 0) {
      promotionAppliedCount =
        Math.floor((productCount + restCount) / totalPromotionCount) * totalPromotionCount;
      const restProductCount = productCount - promotionAppliedCount;

      const ifPayWithoutPromo = await this.#askIfPayWithoutPromo(productName, restProductCount);
      if (ifPayWithoutPromo) {
        // 일부 수량에 대해 정가로 결제
        store.reduceStockBy(productName, restProductCount, false); // 일반 재고에서 없애기
        const productTotalPrice = store.calculatePrice(productName, restProductCount);
        this.#paymentProcess({ productName, productCount: restProductCount, productTotalPrice });
      } else {
        // 정가로 결제해야 하는 수량 제외하고 결제
        totalProductCount += restCount;
        promotionAppliedCount = productCount + restCount;
      }
    }

    let promotionCount = Math.floor(promotionAppliedCount / totalPromotionCount);
    // 프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우
    if (productCount % totalPromotionCount === buy && restCount > 0) {
      const addPromoProduct = await this.#askIfAddPromoProduct(productName);
      if (addPromoProduct) {
        promotionCount += 1;
        totalProductCount += 1;
        promotionAppliedCount += 1;
      }
    }

    store.reduceStockBy(productName, totalProductCount, true); // 재고에서 없애기
    const productTotalPrice = store.calculatePrice(productName, promotionAppliedCount);
    const promotionPrice = store.calculatePrice(productName, promotionCount);
    this.#paymentProcessPromo({
      productName,
      productCount: totalProductCount,
      promotionCount,
      productTotalPrice,
      promotionPrice,
    });
  }

  #paymentProcess({ productName, productCount, productTotalPrice }) {
    this.#purchasedProduct.set(productName, productCount);
    this.#payment.normalPaymentTotal += productTotalPrice; // 계산해야 할 total에 저장
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
    this.#payment.promotionAppliedPaymentTotal += productTotalPrice; // 계산해야 할 total에 저장
    this.#payment.promotionDiscount += promotionPrice;
  }

  getPurchaseProducts() {
    return new Map(this.#purchasedProduct);
  }

  getPromotionProduct() {
    return new Map(this.#promotionProduct);
  }

  getTotalPurchaseAmount() {
    return this.#payment.normalPaymentTotal;
  }

  getPromotionAppliedAmount() {
    return this.#payment.promotionAppliedPaymentTotal;
  }

  getPromotionDiscount() {
    return this.#payment.promotionDiscount;
  }

  getMembershipDiscount() {
    return this.#payment.membershipDiscount;
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

  async askMembershipDiscount() {
    try {
      const answer = await InputView.askMembership();
      if (answer === "Y") {
        this.#membershipDiscount();
      }
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.askMembershipDiscount();
    }
  }

  #membershipDiscount() {
    this.#payment.membershipDiscount += this.#payment.normalPaymentTotal * 0.3;
  }

  getReceipt(store) {
    let purchasedProductString = "";
    let purchasedTotalCount = 0;
    this.#purchasedProduct.forEach((productCount, productName) => {
      purchasedProductString += `${productName}     ${productCount}     ${store.calculatePrice(productName, productCount).toLocaleString()}\n`;
      purchasedTotalCount += productCount;
    });

    let promotionProductString = "";
    this.#promotionProduct.forEach((productCount, productName) => {
      promotionProductString += `${productName}   ${productCount}\n`;
    });

    const totalPayment =
      this.#payment.normalPaymentTotal + this.#payment.promotionAppliedPaymentTotal;
    const paymentResult =
      totalPayment - this.#payment.promotionDiscount - this.#payment.membershipDiscount;

    return `==============W 편의점================
상품명		수량	금액
${purchasedProductString}
=============증	정===============
${promotionProductString}
====================================
총구매액		${purchasedTotalCount}	${totalPayment.toLocaleString()}
행사할인			-${this.#payment.promotionDiscount.toLocaleString()}
멤버십할인			-${this.#payment.membershipDiscount.toLocaleString()}
내실돈			 ${paymentResult.toLocaleString()}`;
  }
}

export default Cashier;
