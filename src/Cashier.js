import InputView from "./View/InputView.js";
import OutputView from "./View/OutputView.js";
import { getPromotionCount } from "./util.js";

class Cashier {
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

  async checkout(buyingProductsCount, store) {
    // eslint-disable-next-line no-restricted-syntax, no-unused-vars
    for (const [productName, productCount] of buyingProductsCount.entries()) {
      // eslint-disable-next-line no-await-in-loop
      await this.#checkoutOneProduct(productName, productCount, store);
    }
  }

  async #checkoutOneProduct(productName, productCount, store) {
    const applicablePromotion = store.getApplicablePromotion(productName);

    // 적용할 프로모션이 없는 경우
    if (!applicablePromotion) {
      this.#processPaymentWithoutPromo({ productName, productCount, store });
      return;
    }

    const { buy, get } = applicablePromotion;
    const promoBundleSize = buy + get;

    // 재고에 수량 부족한 경우
    const restCount = store.compareWithPromoStock(productName, productCount);
    if (restCount < 0) {
      const promotionAppliedCount =
        getPromotionCount(productCount, promoBundleSize, restCount) * promoBundleSize;
      const restProductCount = productCount - promotionAppliedCount;

      const ifPayWithoutPromo = await this.#askPayWithoutPromo(productName, restProductCount);
      if (ifPayWithoutPromo) {
        // 일부 수량에 대해 정가로 결제
        this.#processPaymentWithoutPromo({ productName, productCount: restProductCount, store });
        this.#processPaymentWithPromo({
          productName,
          promotionAppliedCount,
          giveAwayCount: getPromotionCount(productCount, promoBundleSize, restCount),
          store,
        });
        return;
      }
      // 정가로 결제해야 하는 수량 제외하고 결제
      this.#processPaymentWithPromo({
        productName,
        promotionAppliedCount: productCount - restProductCount,
        giveAwayCount: getPromotionCount(productCount, promoBundleSize, restCount),
        store,
      });
      return;
    }

    const promotionCount = getPromotionCount(productCount, promoBundleSize);
    // 프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우
    if (productCount % promoBundleSize === buy && restCount > get) {
      const addPromoProduct = await this.#askAddPromoProduct(productName);
      if (addPromoProduct) {
        this.#processPaymentWithPromo({
          productName,
          promotionAppliedCount: productCount + 1,
          giveAwayCount: promotionCount + 1,
          store,
        });
        return;
      }
    }

    this.#processPaymentWithPromo({
      productName,
      promotionAppliedCount: productCount,
      giveAwayCount: promotionCount,
      store,
    });
  }

  #processPaymentWithoutPromo({ productName, productCount, store }) {
    store.reduceStock(productName, productCount, false); // 재고에서 없애기
    this.#savePaymentInfoWithoutPromo({ productName, productCount, store });
  }

  #savePaymentInfoWithoutPromo({ productName, productCount, store }) {
    this.#addPurchasedProductCount(productName, productCount);
    const productTotalPrice = store.calculatePrice(productName, productCount);
    this.#paymentTotal.normalPayment += productTotalPrice; // 계산해야 할 total에 저장
  }

  #processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount, store }) {
    store.reduceStock(productName, promotionAppliedCount, true); // 재고에서 없애기
    this.#savePaymentInfoWithPromo({ productName, promotionAppliedCount, giveAwayCount, store });
  }

  #savePaymentInfoWithPromo({ productName, promotionAppliedCount, giveAwayCount, store }) {
    this.#addPurchasedProductCount(productName, promotionAppliedCount);
    if (giveAwayCount > 0) this.#giveAwayProducts.set(productName, giveAwayCount);
    const promotionAppliedTotalPrice = store.calculatePrice(productName, promotionAppliedCount);
    const promotionDiscount = store.calculatePrice(productName, giveAwayCount);
    this.#paymentTotal.promotionAppliedPayment += promotionAppliedTotalPrice; // 계산해야 할 total에 저장
    this.#promotionDiscountTotal += promotionDiscount;
  }

  #addPurchasedProductCount(name, count) {
    this.#purchasedProducts.set(name, (this.#purchasedProducts.get(name) ?? 0) + count);
  }

  getPurchasedProduct() {
    return new Map(this.#purchasedProducts);
  }

  getGiveAwayProduct() {
    return new Map(this.#giveAwayProducts);
  }

  async #askPayWithoutPromo(productName, productCount) {
    try {
      const answer = await InputView.askPromotionStockShortage(productName, productCount);
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.#askPayWithoutPromo(productName, productCount);
    }
  }

  async #askAddPromoProduct(productName) {
    try {
      const answer = await InputView.askAddPromotionProduct(productName);
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.#askAddPromoProduct(productName);
    }
  }

  async askMembershipDiscount() {
    try {
      const answer = await InputView.askMembership();
      if (answer === "Y") {
        this.#membershipDiscount();
      }
    } catch (error) {
      OutputView.printMessage(error.message);
      await this.askMembershipDiscount();
    }
  }

  #membershipDiscount() {
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

    return `==============W 편의점================
상품명		수량	금액
${purchasedProductString}
=============증	정===============
${promotionProductString}
====================================
총구매액		${purchasedTotalCount}	${totalPayment.toLocaleString()}
행사할인			-${this.#promotionDiscountTotal.toLocaleString()}
멤버십할인			-${this.#membershipDiscountTotal.toLocaleString()}
내실돈			 ${paymentResult.toLocaleString()}`;
  }
}

export default Cashier;
