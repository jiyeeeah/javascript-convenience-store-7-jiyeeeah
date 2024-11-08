import ConvenienceStore from "./ConvenienceStore.js";
import Customer from "./Customer.js";
import OutputView from "./View/OutputView.js";

class App {
  #convenienceStore;
  #customer;

  constructor() {
    this.#convenienceStore = new ConvenienceStore();
    this.#customer = new Customer();
  }

  async run() {
    await this.#convenienceStore.init();
    this.#convenienceStore.printWelcomeAndInventory();

    await this.#customerBuyProduct();
  }

  async #customerBuyProduct() {
    try {
      await this.#customer.buy(this.#convenienceStore);
    } catch (error) {
      OutputView.printMessage(error.message);
      await this.#customerBuyProduct();
    }
  }
}

export default App;
