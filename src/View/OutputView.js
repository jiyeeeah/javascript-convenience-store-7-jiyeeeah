import { MissionUtils } from "@woowacourse/mission-utils";

const OutputView = {
  printWelcome() {
    MissionUtils.Console.print("안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n");
  },

  printMessage(message) {
    MissionUtils.Console.print(message);
  },

  printReceipt({
    purchasedProductString,
    promotionProductString,
    purchasedTotalCount,
    totalPayment,
    promoTotal,
    membershipTotal,
    paymentResult,
  }) {
    MissionUtils.Console.print("==============W 편의점================");
    MissionUtils.Console.print("상품명		수량	금액");
    MissionUtils.Console.print(purchasedProductString);
    MissionUtils.Console.print("=============증	정===============");
    MissionUtils.Console.print(promotionProductString);
    MissionUtils.Console.print("====================================");
    MissionUtils.Console.print(`총구매액		${purchasedTotalCount}	${totalPayment.toLocaleString()}`);
    MissionUtils.Console.print(`행사할인			-${promoTotal.toLocaleString()}`);
    MissionUtils.Console.print(`멤버십할인			-${membershipTotal.toLocaleString()}`);
    MissionUtils.Console.print(`내실돈			 ${paymentResult.toLocaleString()}`);
  },
};

export default OutputView;
