import Store from "./Store.js";
import Customer from "./Customer.js";
import OutputView from "./View/OutputView.js";
import Cashier from "./Cashier.js";

class App {
  #store;
  #customer;
  #cashier;

  constructor() {
    this.#store = new Store();
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
    this.#customer = new Customer();
    this.#cashier = new Cashier();

    this.#store.printWelcomeAndInventory();
    await this.#customerBuyProduct();
    await this.#cashier.checkout(this.#customer.buyingProductsCount, this.#store);
    await this.#cashier.askMembershipDiscount();
    this.#cashier.printReceipt(this.#store);

    const restart = await this.#store.askRestart();
    if (restart) await this.#buyingProcess();
  }
}

export default App;
