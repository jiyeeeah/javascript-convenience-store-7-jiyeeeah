import ConvenienceStore from "./ConvenienceStore.js";

class App {
  #convenienceStore;
  constructor() {
    this.#convenienceStore = new ConvenienceStore();
  }

  async run() {
    await this.#convenienceStore.init();
  }
}

export default App;
