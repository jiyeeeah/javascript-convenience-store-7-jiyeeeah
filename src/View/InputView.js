import { MissionUtils } from "@woowacourse/mission-utils";
import { ERROR_MESSAGE } from "../constant/message.js";

const InputView = {
  async readItem() {
    const input = await MissionUtils.Console.readLineAsync(
      "\n구매하실 상품명과 수량을 입력해 주세요. (예: [사이다-2],[감자칩-1])\n",
    );

    return input;
  },

  async askPromotionStockShortage() {
    const input = await MissionUtils.Console.readLineAsync(
      "현재 {상품명} {수량}개는 프로모션 할인이 적용되지 않습니다. 그래도 구매하시겠습니까? (Y/N)",
    );
    if (input !== "Y" && input !== "N") throw new Error(ERROR_MESSAGE.wrongInput);
    return input;
  },
};

export default InputView;
