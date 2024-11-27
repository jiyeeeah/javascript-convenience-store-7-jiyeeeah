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

  const existCase = [
    { name: "콜라", result: true },
    { name: "사이다", result: true },
    { name: "도시락", result: false },
    { name: "환타", result: false },
  ];
  test.each(existCase)("재고에 $name 존재하는지 확인한다.", async ({ name, result }) => {
    // given
    await inventory.init();
    // then
    expect(inventory.isExistInInventory(name)).toBe(result);
  });

  const stockCase = [
    { name: "콜라", count: 2, result: true },
    { name: "사이다", count: 10, result: true },
    { name: "감자칩", count: 12, result: false },
    { name: "비타민워터", count: 30, result: false },
  ];
  test.each(stockCase)(
    "$name 제품의 수량 $count개가 재고에서 부족한지 확인한다.",
    async ({ name, count, result }) => {
      // given
      await inventory.init();

      // then
      expect(inventory.isInStock(name, count)).toBe(result);
    },
  );

  const generalProductInfoCase = [
    {
      name: "콜라",
      result: { name: "콜라", price: 1000, quantity: 10, promotion: null },
    },
    {
      name: "오렌지주스",
      result: { name: "오렌지주스", price: 1800, quantity: 0, promotion: null },
    },
  ];
  test.each(generalProductInfoCase)(
    "$name의 일반 재고 정보 가져오는 메서드 테스트",
    async ({ name, result }) => {
      // given
      await inventory.init();

      // then
      expect(inventory.getGeneralProductInfo(name)).toEqual(result);
    },
  );

  const promoProductInfoCase = [
    {
      name: "콜라",
      result: { name: "콜라", price: 1000, quantity: 10, promotion: "탄산2+1" },
    },
    {
      name: "오렌지주스",
      result: { name: "오렌지주스", price: 1800, quantity: 9, promotion: "MD추천상품" },
    },
  ];
  test.each(promoProductInfoCase)(
    "$name의 프로모션 재고 정보 가져오는 메서드 테스트",
    async ({ name, result }) => {
      // given
      await inventory.init();

      // then
      expect(inventory.getPromoProductInfo(name)).toEqual(result);
    },
  );

  test("일반 제품 수량 줄이기 테스트", async () => {
    // given
    await inventory.init();

    // when
    inventory.reduceGeneralStock("콜라", 3); // 총 수량 17개 남음

    // then
    expect(inventory.isInStock("콜라", 17)).toBe(true);
    expect(inventory.isInStock("콜라", 18)).toBe(false);
  });

  test("프로모션 제품 수량 줄이기 테스트", async () => {
    // given
    await inventory.init();

    // when
    inventory.reducePromoStock("콜라", 5); // 총 수량 15개 남음

    // then
    expect(inventory.isInStock("콜라", 15)).toBe(true);
    expect(inventory.isInStock("콜라", 16)).toBe(false);
  });

  test("제품 가격 계산 테스트", async () => {
    // given
    await inventory.init();

    expect(inventory.calculatePrice("컵라면", 2)).toBe(3400);
    expect(inventory.calculatePrice("초코바", 5)).toBe(6000);
  });
});
