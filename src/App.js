import Cashier from "./Cashier.js";
import ConvenienceStore from "./ConvenienceStore.js";
import Customer from "./Customer.js";
import OutputView from "./View/OutputView.js";

class App {
  #convenienceStore;
  #customer;
  #cashier;

  constructor() {
    this.#convenienceStore = new ConvenienceStore();
    this.#customer = new Customer();
    this.#cashier = new Cashier();
  }

  async run() {
    await this.#convenienceStore.init();
    await this.#buyingProcess();
  }

  async #customerBuyProduct() {
    try {
      await this.#customer.buy(this.#convenienceStore);
    } catch (error) {
      OutputView.printMessage(error.message);
      await this.#customerBuyProduct();
    }
  }

  async #buyingProcess() {
    this.#convenienceStore.printWelcomeAndInventory();

    await this.#customerBuyProduct();

    this.#customer.buyingProductCount.forEach(async (productCount, productName) => {
      this.#cashier.checkout({
        productName,
        productCount,
        convenienceStore: this.#convenienceStore,
      });
    });

    this.#cashier.askMembershipDiscount();

    const receipt = this.#cashier.getReceipt(this.#convenienceStore);
    OutputView.printMessage(receipt);

    const restart = await this.#convenienceStore.askRestart();
    if (restart) await this.#buyingProcess();
  }
}

export default App;
