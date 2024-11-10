import Inventory from "../src/StoreEntities/Inventory.js";

describe("재고(Inventory) 클래스 테스트", () => {
  let inventory;
  beforeEach(() => {
    inventory = new Inventory();
  });

  test("재고 리스트 출력 테스트", async () => {
    // given
    await inventory.init();

    // when, then
    expect(inventory.getInventoryDetailsString()).toBe(`- 콜라 1,000원 10개 탄산2+1
- 콜라 1,000원 10개
- 사이다 1,000원 8개 탄산2+1
- 사이다 1,000원 7개
- 오렌지주스 1,800원 9개 MD추천상품
- 오렌지주스 1,800원 재고 없음
- 탄산수 1,200원 5개 탄산2+1
- 탄산수 1,200원 재고 없음
- 물 500원 10개
- 비타민워터 1,500원 6개
- 감자칩 1,500원 5개 반짝할인
- 감자칩 1,500원 5개
- 초코바 1,200원 5개 MD추천상품
- 초코바 1,200원 5개
- 에너지바 2,000원 5개
- 정식도시락 6,400원 8개
- 컵라면 1,700원 1개 MD추천상품
- 컵라면 1,700원 10개`);
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

  test("제품 수량 줄이기 테스트", async () => {
    // given
    await inventory.init();

    // when
    inventory.reduceStock("콜라", 3, false); // 총 수량 17개 남음

    // then
    expect(inventory.isInStock("콜라", 17)).toBe(true);
    expect(inventory.isInStock("콜라", 18)).toBe(false);
  });

  test("제품 가격 계산 테스트", async () => {
    // given
    await inventory.init();

    expect(inventory.calculatePrice("컵라면", 2)).toBe(3400);
    expect(inventory.calculatePrice("초코바", 5)).toBe(6000);
  });
});
