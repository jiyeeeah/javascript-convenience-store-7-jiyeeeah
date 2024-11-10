import Inventory from "../src/StoreEntities/Inventory.js";

describe("재고(Inventory) 클래스 테스트", () => {
  let inventory;
  beforeEach(() => {
    inventory = new Inventory();
  });

  test("재고에 제품이 존재하는지 확인한다.", async () => {
    // given
    await inventory.init();

    // then
    expect(inventory.isExistInInventory("콜라")).toBe(true);
    expect(inventory.isExistInInventory("비타민워터")).toBe(true);
    expect(inventory.isExistInInventory("도시락")).toBe(false);
  });

  test("제품 수량이 재고에서 부족한지 확인한다.", async () => {
    // given
    await inventory.init();

    // then
    expect(inventory.isInStock("콜라", 2)).toBe(true);
    expect(inventory.isInStock("사이다", 10)).toBe(true);
    expect(inventory.isInStock("비타민워터", 30)).toBe(false);
  });

  test("제품 정보 가져오는 메서드 테스트", async () => {
    // given
    await inventory.init();

    // then
    expect(inventory.getProductInfo("콜라", false)).toEqual({
      name: "콜라",
      price: 1000,
      promotion: "null",
      quantity: 10,
    });
    expect(inventory.getProductInfo("오렌지주스", true)).toEqual({
      name: "오렌지주스",
      price: 1800,
      quantity: 9,
      promotion: "MD추천상품",
    });
  });
});