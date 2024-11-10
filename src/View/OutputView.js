import { MissionUtils } from "@woowacourse/mission-utils";

const OutputView = {
  printWelcome() {
    MissionUtils.Console.print("안녕하세요. W편의점입니다.\n현재 보유하고 있는 상품입니다.\n");
  },

  printMessage(message) {
    MissionUtils.Console.print(message);
  },
};

export default OutputView;
