import Cashier from "./Cashier.js";
import Store from "./Store.js";
import Customer from "./Customer.js";
import OutputView from "./View/OutputView.js";

class App {
  #store;
  #customer;
  #cashier;

  constructor() {
    this.#store = new Store();
    this.#customer = new Customer();
    this.#cashier = new Cashier();
  }

  async run() {
    await this.#store.init();
    await this.#buyingProcess();
  }

  async #customerBuyProduct() {
    try {
      await this.#customer.buy(this.#store);
    } catch (error) {
      OutputView.printMessage(error.message);
      await this.#customerBuyProduct();
    }
  }

  async #buyingProcess() {
    this.#store.printWelcomeAndInventory();

    await this.#customerBuyProduct();

    this.#customer.buyingProductCount.forEach(async (productCount, productName) => {
      this.#cashier.checkout({
        productName,
        productCount,
        store: this.#store,
      });
    });

    this.#cashier.askMembershipDiscount();

    const receipt = this.#cashier.getReceipt(this.#store);
    OutputView.printMessage(receipt);

    const restart = await this.#store.askRestart();
    if (restart) await this.#buyingProcess();
  }
}

export default App;
