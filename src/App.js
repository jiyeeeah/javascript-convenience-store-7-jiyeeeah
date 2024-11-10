import Store from "./Store.js";
import Customer from "./Customer.js";
import OutputView from "./View/OutputView.js";

class App {
  #store;
  #customer;

  async run() {
    this.#store = new Store();
    this.#customer = new Customer();

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

    await this.#store.checkout(this.#customer.buyingProductsCount);

    await this.#store.askMembershipDiscount();

    const receipt = this.#store.getReceipt(this.#store);
    OutputView.printMessage(receipt);

    const restart = await this.#store.askRestart();
    if (restart) await this.run();
  }
}

export default App;
