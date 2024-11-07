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

    try {
      await this.#customer.buy();
    } catch (error) {
      OutputView.printMessage(error.message);
      await this.#customer.buy();
    }
  }
}

export default App;
