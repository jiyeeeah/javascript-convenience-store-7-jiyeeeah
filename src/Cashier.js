import POS from "./POS.js";
import InputView from "./View/InputView.js";
import OutputView from "./View/OutputView.js";
import { getPromotionCount, isPromotionShortage } from "./util.js";

class Cashier {
  #POS;

  constructor() {
    this.#POS = new POS();
  }

  async checkout(buyingProductsCount, store) {
    for (const [productName, productCount] of buyingProductsCount.entries()) {
      const isPromoApplicable = store.isPromoApplicable(productName);
      if (!isPromoApplicable) {
        this.#processPaymentWithoutPromo({ productName, productCount, store });
        continue;
      }
      await this.#checkoutWithPromo({ productName, productCount, store });
    }
  }

  async #checkoutWithPromo({ productName, productCount, store }) {
    const restCount = store.compareWithPromoStock(productName, productCount);
    if (restCount < 0) {
      await this.#checkoutStockShortage({ productName, productCount, store, restCount });
      return;
    }
    await this.#checkoutPromotionShortage({ productName, productCount, store });
  }

  async #checkoutStockShortage({ productName, productCount, store, restCount }) {
    const { promoBundleSize } = store.getPromoBundle(productName);
    const giveAwayCount = getPromotionCount(productCount, promoBundleSize, restCount);
    const promoAppliedNum = giveAwayCount * promoBundleSize;

    const promotionDetails = { productName, productCount, promoAppliedNum };
    const promotionAppliedCount = await this.#getPromotionAppliedCount(promotionDetails, store);
    this.#processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount, store });
  }

  async #getPromotionAppliedCount({ productName, productCount, promoAppliedNum }, store) {
    const restProductCount = productCount - promoAppliedNum;
    const ifPayWithoutPromo = await this.#askPayWithoutPromo(productName, restProductCount);

    if (ifPayWithoutPromo) {
      this.#processPaymentWithoutPromo({ productName, productCount: restProductCount, store });
      return promoAppliedNum;
    }
    return productCount - restProductCount;
  }

  async #checkoutPromotionShortage({ productName, productCount, store }) {
    const restCount = store.compareWithPromoStock(productName, productCount);
    const { buy, get, promoBundleSize } = store.getPromoBundle(productName);
    if (isPromotionShortage({ buy, get, promoBundleSize, productCount, restCount })) {
      await this.#checkoutPromoShortage({ productName, productCount, promoBundleSize, store });
      return;
    }
    this.#checkoutPromoNoCondition({ productName, productCount, promoBundleSize, store });
  }

  async #checkoutPromoShortage({ productName, productCount, promoBundleSize, store }) {
    const promotionCount = getPromotionCount(productCount, promoBundleSize);
    const promotionDetails = { productName, productCount, promotionCount };
    const { promotionAppliedCount, giveAwayCount } =
      await this.#getPromotionCount(promotionDetails);
    this.#processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount, store });
  }

  async #getPromotionCount({ productName, productCount, promotionCount }) {
    const addPromoProduct = await this.#askAddPromoProduct(productName);
    if (addPromoProduct) {
      return { promotionAppliedCount: productCount + 1, giveAwayCount: promotionCount + 1 };
    }
    return { promotionAppliedCount: productCount, giveAwayCount: promotionCount };
  }

  #checkoutPromoNoCondition({ productName, productCount, promoBundleSize, store }) {
    const promotionCount = getPromotionCount(productCount, promoBundleSize);
    this.#processPaymentWithPromo({
      productName,
      promotionAppliedCount: productCount,
      giveAwayCount: promotionCount,
      store,
    });
  }

  #processPaymentWithoutPromo({ productName, productCount, store }) {
    store.reduceStock(productName, productCount, false); // 재고에서 없애기
    this.#POS.savePaymentInfoWithoutPromo({ productName, productCount, store });
  }

  #processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount, store }) {
    store.reduceStock(productName, promotionAppliedCount, true); // 재고에서 없애기
    this.#POS.savePaymentInfoWithPromo({
      productName,
      promotionAppliedCount,
      giveAwayCount,
      store,
    });
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
        this.#POS.membershipDiscount();
      }
    } catch (error) {
      OutputView.printMessage(error.message);
      await this.askMembershipDiscount();
    }
  }

  printReceipt(store) {
    const purchasedProductString = this.#POS.getPurchasedProductsReceiptString(store);
    const promotionProductString = this.#POS.getPromotionProductsReceiptString();
    const paymentInfoString = this.#POS.getPaymentInfoReceiptString();
    OutputView.printReceipt({ purchasedProductString, promotionProductString, paymentInfoString });
  }
}

export default Cashier;
