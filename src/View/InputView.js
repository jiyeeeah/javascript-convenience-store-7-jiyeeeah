import { MissionUtils } from "@woowacourse/mission-utils";
import { ERROR_MESSAGE } from "../constant/message.js";

const InputView = {
  async readItem() {
    const input = await MissionUtils.Console.readLineAsync(
      "\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n",
    );

    return input;
  },

  async askPromotionStockShortage(productName, productCount) {
    const input = await MissionUtils.Console.readLineAsync(
      `현재 ${productName} ${productCount}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)\n`,
    );
    if (input !== "Y" && input !== "N") throw new Error(ERROR_MESSAGE.wrongInput);
    return input;
  },

  async askAddPromotionProduct(productName) {
    const input = await MissionUtils.Console.readLineAsync(
      `현재 ${productName}은(는) 1개를 무료로 더 받을 수 있습니다. 추가하시겠습니까? (Y/N)\n`,
    );
    if (input !== "Y" && input !== "N") throw new Error(ERROR_MESSAGE.wrongInput);
    return input;
  },

  async askMembership() {
    const input = await MissionUtils.Console.readLineAsync("멤버십 할인을 받으시겠습니까? (Y/N)\n");
    if (input !== "Y" && input !== "N") throw new Error(ERROR_MESSAGE.wrongInput);
    return input;
  },

  async askBuyAgain() {
    const input = await MissionUtils.Console.readLineAsync(
      "감사합니다. 구매하고 싶은 다른 상품이 있나요? (Y/N)\n",
    );
    if (input !== "Y" && input !== "N") throw new Error(ERROR_MESSAGE.wrongInput);
    return input;
  },
};

export default InputView;
