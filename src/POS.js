class POS {
  #purchasedProducts;
  #giveAwayProducts;

  #paymentTotal;
  #promotionDiscountTotal;
  #membershipDiscountTotal;

  constructor() {
    this.#purchasedProducts = new Map();
    this.#giveAwayProducts = new Map();
    this.#paymentTotal = {
      normalPayment: 0,
      promotionAppliedPayment: 0,
    };
    this.#promotionDiscountTotal = 0;
    this.#membershipDiscountTotal = 0;
  }

  #addPurchasedProductCount(name, count) {
    this.#purchasedProducts.set(name, (this.#purchasedProducts.get(name) ?? 0) + count);
  }

  savePaymentInfoWithoutPromo({ productName, productCount, store }) {
    this.#addPurchasedProductCount(productName, productCount);
    const productTotalPrice = store.calculatePrice(productName, productCount);
    this.#paymentTotal.normalPayment += productTotalPrice; // 계산해야 할 total에 저장
  }

  savePaymentInfoWithPromo({ productName, promotionAppliedCount, giveAwayCount, store }) {
    this.#addPurchasedProductCount(productName, promotionAppliedCount);
    if (giveAwayCount > 0) this.#giveAwayProducts.set(productName, giveAwayCount);
    const promotionAppliedTotalPrice = store.calculatePrice(productName, promotionAppliedCount);
    const promotionDiscount = store.calculatePrice(productName, giveAwayCount);
    this.#paymentTotal.promotionAppliedPayment += promotionAppliedTotalPrice; // 계산해야 할 total에 저장
    this.#promotionDiscountTotal += promotionDiscount;
  }

  membershipDiscount() {
    this.#membershipDiscountTotal += this.#paymentTotal.normalPayment * 0.3;
  }

  getReceipt(store) {
    let purchasedProductString = "";
    let purchasedTotalCount = 0;
    this.#purchasedProducts.forEach((productCount, productName) => {
      purchasedProductString += `${productName}     ${productCount}     ${store.calculatePrice(productName, productCount).toLocaleString()}\n`;
      purchasedTotalCount += productCount;
    });

    let promotionProductString = "";
    this.#giveAwayProducts.forEach((productCount, productName) => {
      promotionProductString += `${productName}   ${productCount}\n`;
    });

    const totalPayment =
      this.#paymentTotal.normalPayment + this.#paymentTotal.promotionAppliedPayment;
    const paymentResult =
      totalPayment - this.#promotionDiscountTotal - this.#membershipDiscountTotal;

    return {
      purchasedProductString,
      promotionProductString,
      purchasedTotalCount,
      totalPayment,
      promoTotal: this.#promotionDiscountTotal,
      membershipTotal: this.#membershipDiscountTotal,
      paymentResult,
    };
  }
}

export default POS;
