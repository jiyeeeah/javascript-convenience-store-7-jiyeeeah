class POS {
  #purchasedProducts;
  #giveAwayProducts;
  #paymentTotal;

  constructor() {
    this.#purchasedProducts = new Map();
    this.#giveAwayProducts = new Map();
    this.#paymentTotal = {
      normalPayment: 0,
      promotionAppliedPayment: 0,
      promotionDiscount: 0,
      membershipDiscount: 0,
    };
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
    this.#paymentTotal.promotionDiscount += promotionDiscount;
  }

  membershipDiscount() {
    this.#paymentTotal.membershipDiscount += this.#paymentTotal.normalPayment * 0.3;
  }

  getPurchasedProductsReceiptString(store) {
    let purchasedProductString = "";
    this.#purchasedProducts.forEach((productCount, productName) => {
      purchasedProductString += `${productName}     ${productCount}     ${store.calculatePrice(productName, productCount).toLocaleString()}\n`;
    });
    return purchasedProductString;
  }

  #getPurchasedProductsTotalCount() {
    return Array.from(this.#purchasedProducts.values()).reduce((total, count) => total + count, 0);
  }

  getPromotionProductsReceiptString() {
    let promotionProductString = "";
    this.#giveAwayProducts.forEach((productCount, productName) => {
      promotionProductString += `${productName}   ${productCount}\n`;
    });
    return promotionProductString;
  }

  getPaymentInfoReceiptString() {
    const purchasedTotalCount = this.#getPurchasedProductsTotalCount();
    const totalPayment =
      this.#paymentTotal.normalPayment + this.#paymentTotal.promotionAppliedPayment;
    const promoTotal = this.#paymentTotal.promotionDiscount;
    const membershipTotal = this.#paymentTotal.membershipDiscount;
    const paymentResult = totalPayment - promoTotal - membershipTotal;

    return `총구매액		${purchasedTotalCount}	${totalPayment.toLocaleString()}\n행사할인			-${promoTotal.toLocaleString()}\n멤버십할인			-${membershipTotal.toLocaleString()}\n내실돈			 ${paymentResult.toLocaleString()}`;
  }
}

export default POS;
