import { MissionUtils } from "@woowacourse/mission-utils";

const OutputView = {
  printWelcome() {
    MissionUtils.Console.print("안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n");
  },

  printMessage(message) {
    MissionUtils.Console.print(message);
  },

  printReceipt({ purchasedProductString, promotionProductString, paymentInfoString }) {
    this.printPurchasedReceipt(purchasedProductString);
    this.printPromotionReceipt(promotionProductString);
    this.printPaymentInfoReceipt(paymentInfoString);
  },

  printPurchasedReceipt(purchasedProductString) {
    MissionUtils.Console.print("==============W 편의점================");
    MissionUtils.Console.print("상품명		수량	금액");
    MissionUtils.Console.print(purchasedProductString);
  },

  printPromotionReceipt(promotionProductString) {
    if (promotionProductString === "") return;
    MissionUtils.Console.print("=============증	정===============");
    MissionUtils.Console.print(promotionProductString);
  },

  printPaymentInfoReceipt(paymentInfoString) {
    MissionUtils.Console.print("====================================");
    MissionUtils.Console.print(paymentInfoString);
  },
};

export default OutputView;
