import POS from "./POS.js";
import InputView from "./View/InputView.js";
import OutputView from "./View/OutputView.js";
import { getPromotionCount } from "./util.js";

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
    const { buy, get, promoBundleSize } = store.getPromoBundle(productName);

    // 재고에 수량 부족한 경우
    const restCount = store.compareWithPromoStock(productName, productCount);
    if (restCount < 0) {
      await this.#checkoutStockShortage({
        productName,
        productCount,
        store,
        promoBundleSize,
        restCount,
      });
      return;
    }

    const promotionCount = getPromotionCount(productCount, promoBundleSize);
    // 프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우 / TODO: restCount가 1개(get) 이상이어야함
    if (productCount % promoBundleSize === buy && restCount > get) {
      await this.#checkoutPromoShortage({ productName, productCount, promotionCount, store });
      return;
    }

    this.#processPaymentWithPromo({
      productName,
      promotionAppliedCount: productCount,
      giveAwayCount: promotionCount,
      store,
    });
  }

  async #checkoutStockShortage({ productName, productCount, store, promoBundleSize, restCount }) {
    const giveAwayCount = getPromotionCount(productCount, promoBundleSize, restCount);
    let promotionAppliedCount = giveAwayCount * promoBundleSize;
    const restProductCount = productCount - promotionAppliedCount;

    const ifPayWithoutPromo = await this.#askPayWithoutPromo(productName, restProductCount);
    if (ifPayWithoutPromo) {
      // 일부 수량에 대해 정가로 결제
      this.#processPaymentWithoutPromo({ productName, productCount: restProductCount, store });
      this.#processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount, store });
      return;
    }
    // 정가로 결제해야 하는 수량 제외하고 결제
    promotionAppliedCount = productCount - restProductCount;
    this.#processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount, store });
  }

  async #checkoutPromoShortage({ productName, productCount, promotionCount, store }) {
    let promotionAppliedCount = productCount;
    let giveAwayCount = promotionCount;

    const addPromoProduct = await this.#askAddPromoProduct(productName);
    if (addPromoProduct) {
      promotionAppliedCount += 1;
      giveAwayCount += 1;
    }
    this.#processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount, store });
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

  getReceipt(store) {
    return this.#POS.getReceipt(store);
  }
}

export default Cashier;
