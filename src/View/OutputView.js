import { MissionUtils } from "@woowacourse/mission-utils";

const OutputView = {
  printWelcome() {
    MissionUtils.Console.print("안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n");
  },

  printInventory(product) {
    let stockString = "재고 없음";
    if (product.quantity > 0) stockString = `${product.quantity}개`;
    let promotionString = ` ${product.promotion}`;
    if (product.promotion === "null") promotionString = "";
    MissionUtils.Console.print(
      `- ${product.name} ${product.price.toLocaleString()}원 ${stockString}${promotionString}`,
    );
  },

  printMessage(message) {
    MissionUtils.Console.print(message);
  },
};

export default OutputView;
