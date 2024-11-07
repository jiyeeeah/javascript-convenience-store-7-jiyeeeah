import ConvenienceStore from "../src/ConvenienceStore.js";

describe("ConvenienceStore 테스트", async () => {
  let convenienceStore;
  beforeEach(() => {
    convenienceStore = new ConvenienceStore();
  });

  describe("파일 입출력을 통해 필요한 상품 목록 불러오기", async () => {
    await convenienceStore.init();
  });
});
