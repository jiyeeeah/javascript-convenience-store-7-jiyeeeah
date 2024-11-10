import InputView from "./View/InputView.js";
import OutputView from "./View/OutputView.js";

class Cashier {
  #purchasedProduct;
  #giveAwayProduct;
  #payment;

  constructor() {
    this.#purchasedProduct = new Map();
    this.#giveAwayProduct = new Map();
    this.#payment = {
      normalPaymentTotal: 0,
      promotionAppliedPaymentTotal: 0,
      promotionDiscount: 0,
      membershipDiscount: 0,
    };
  }

  processPayment({ productName, productCount, productTotalPrice }) {
    this.#purchasedProduct.set(productName, productCount);
    this.#payment.normalPaymentTotal += productTotalPrice; // 계산해야 할 total에 저장
  }

  processPaymentWithPromo({
    productName,
    promotionAppliedCount,
    giveAwayCount,
    promotionAppliedTotalPrice,
    promotionDiscount,
  }) {
    this.#purchasedProduct.set(productName, promotionAppliedCount);
    if (giveAwayCount > 0) this.#giveAwayProduct.set(productName, giveAwayCount);
    this.#payment.promotionAppliedPaymentTotal += promotionAppliedTotalPrice; // 계산해야 할 total에 저장
    this.#payment.promotionDiscount += promotionDiscount;
  }

  getPurchasedProduct() {
    return new Map(this.#purchasedProduct);
  }

  getPromotionProduct() {
    return new Map(this.#giveAwayProduct);
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

  async askPayWithoutPromo(productName, productCount) {
    try {
      const answer = await InputView.askPromotionStockShortage(productName, productCount);
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.askPayWithoutPromo(productName, productCount);
    }
  }

  async askAddPromoProduct(productName) {
    try {
      const answer = await InputView.askAddPromotionProduct(productName);
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.askAddPromoProduct(productName);
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
    this.#giveAwayProduct.forEach((productCount, productName) => {
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
