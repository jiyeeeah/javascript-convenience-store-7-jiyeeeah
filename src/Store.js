import { MissionUtils } from "@woowacourse/mission-utils";
import OutputView from "./View/OutputView.js";
import InputView from "./View/InputView.js";
import Promotion from "./StoreEntities/Promotion.js";
import Inventory from "./StoreEntities/Inventory.js";
import { getPromotionCount } from "./util.js";
import Cashier from "./Cashier.js";

class Store {
  #inventory;
  #promotion;
  #cashier;

  async init() {
    this.#inventory = new Inventory();
    await this.#inventory.init();

    this.#promotion = new Promotion();
    await this.#promotion.init();

    this.#cashier = new Cashier();
  }

  printWelcomeAndInventory() {
    OutputView.printWelcome();
    OutputView.printMessage(this.#inventory.getInventoryDetailsString());
  }

  isExistInInventory(name) {
    return this.#inventory.isExistInInventory(name);
  }

  isInStock(name, count) {
    return this.#inventory.isInStock(name, count);
  }

  compareWithPromoStock(name, count) {
    const productInfo = this.#inventory.getProductInfo(name, true);
    return productInfo.quantity - count;
  }

  #getApplicablePromotion(productName) {
    const promoProductInfo = this.#inventory.getProductInfo(productName, true);
    if (!promoProductInfo) return null;

    const productPromotionName = promoProductInfo.promotion;
    const promotionInfo = this.#promotion.getPromotionByName(productPromotionName);

    const today = MissionUtils.DateTimes.now();
    if (!this.#promotion.isAvailable(productPromotionName, today)) return null;

    return promotionInfo;
  }

  async checkout(buyingProductsCount) {
    // eslint-disable-next-line no-restricted-syntax, no-unused-vars
    for (const [productName, productCount] of buyingProductsCount.entries()) {
      // eslint-disable-next-line no-await-in-loop
      await this.#checkoutOneProduct(productName, productCount);
    }
  }

  async #checkoutOneProduct(productName, productCount) {
    const applicablePromotion = this.#getApplicablePromotion(productName);

    // 적용할 프로모션이 없는 경우
    if (!applicablePromotion) {
      this.#processPaymentWithoutPromo({ productName, productCount });
      return;
    }

    const { buy, get } = applicablePromotion;
    const promoBundleSize = buy + get;

    // 재고에 수량 부족한 경우
    const restCount = this.compareWithPromoStock(productName, productCount);
    if (restCount < 0) {
      const promotionAppliedCount =
        getPromotionCount(productCount, promoBundleSize, restCount) * promoBundleSize;
      const restProductCount = productCount - promotionAppliedCount;

      const ifPayWithoutPromo = await this.#cashier.askPayWithoutPromo(
        productName,
        restProductCount,
      );
      if (ifPayWithoutPromo) {
        // 일부 수량에 대해 정가로 결제
        this.#processPaymentWithoutPromo({ productName, productCount: restProductCount });
        this.#processPaymentWithPromo({
          productName,
          promotionAppliedCount,
          giveAwayCount: getPromotionCount(productCount, promoBundleSize, restCount),
        });
        return;
      }
      // 정가로 결제해야 하는 수량 제외하고 결제
      this.#processPaymentWithPromo({
        productName,
        promotionAppliedCount: productCount - restProductCount,
        giveAwayCount: getPromotionCount(productCount, promoBundleSize, restCount),
      });
      return;
    }

    const promotionCount = getPromotionCount(productCount, promoBundleSize);
    // 프로모션 적용 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우
    if (productCount % promoBundleSize === buy && restCount > get) {
      const addPromoProduct = await this.#cashier.askAddPromoProduct(productName);
      if (addPromoProduct) {
        this.#processPaymentWithPromo({
          productName,
          promotionAppliedCount: productCount + 1,
          giveAwayCount: promotionCount + 1,
        });
        return;
      }
    }

    this.#processPaymentWithPromo({
      productName,
      promotionAppliedCount: productCount,
      giveAwayCount: promotionCount,
    });
  }

  #processPaymentWithoutPromo({ productName, productCount }) {
    this.#inventory.reduceStock(productName, productCount, false); // 재고에서 없애기
    const productTotalPrice = this.#inventory.calculatePrice(productName, productCount);
    this.#cashier.processPayment({ productName, productCount, productTotalPrice });
  }

  #processPaymentWithPromo({ productName, promotionAppliedCount, giveAwayCount }) {
    this.#inventory.reduceStock(productName, promotionAppliedCount, true); // 재고에서 없애기
    const promotionAppliedTotalPrice = this.#inventory.calculatePrice(
      productName,
      promotionAppliedCount,
    );
    const promotionDiscount = this.#inventory.calculatePrice(productName, promotionAppliedCount);
    this.#cashier.processPaymentWithPromo({
      productName,
      promotionAppliedCount,
      giveAwayCount,
      promotionAppliedTotalPrice,
      promotionDiscount,
    });
  }

  async askMembershipDiscount() {
    await this.#cashier.askMembershipDiscount();
  }

  getReceipt() {
    let purchasedProductString = "";
    let purchasedTotalCount = 0;
    const purchasedProducts = this.#cashier.getPurchasedProduct();
    purchasedProducts.forEach((productCount, productName) => {
      purchasedProductString += `${productName}     ${productCount}     ${this.#inventory.calculatePrice(productName, productCount).toLocaleString()}\n`;
      purchasedTotalCount += productCount;
    });

    let promotionProductString = "";
    const giveAwayProducts = this.#cashier.getGiveAwayProduct();
    giveAwayProducts.forEach((productCount, productName) => {
      promotionProductString += `${productName}   ${productCount}\n`;
    });

    const totalPayment = this.#cashier.getTotalPayment();

    const paymentResult = this.#cashier.getPaymentResult();

    return `==============W 편의점================
상품명		수량	금액
${purchasedProductString}
=============증	정===============
${promotionProductString}
====================================
총구매액		${purchasedTotalCount}	${totalPayment.toLocaleString()}
행사할인			-${this.#cashier.getPromotionDiscount().toLocaleString()}
멤버십할인			-${this.#cashier.getMembershipDiscount().toLocaleString()}
내실돈			 ${paymentResult.toLocaleString()}`;
  }

  async askRestart() {
    try {
      const answer = await InputView.askBuyAgain();
      return answer === "Y";
    } catch (error) {
      OutputView.printMessage(error.message);
      return this.askRestart();
    }
  }
}

export default Store;
