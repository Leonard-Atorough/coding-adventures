import LocalStorage from "../services/storage/localStorage";

export default class Store {
  private static instance: Store;
  private state: Record<string, any> = {};

  private constructor() {}

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();

      // Load persisted state from localStorage
    }
    const persistedState = LocalStorage.load<Record<string, any>>("resumeBuilderState");
    if (persistedState) {
      Store.instance.state = persistedState;
    }

    return Store.instance;
  }

  getState(key: string): any {
    return this.state[key];
  }

  setState(key: string, value: any): void {
    this.state[key] = value;
    LocalStorage.save("resumeBuilderState", this.state);
  }

  clearState(): void {
    this.state = {};
    LocalStorage.save("resumeBuilderState", this.state);
  }

  getFullState(): Record<string, any> {
    return this.state;
  }
}

export default interface Store {
  getState(key: string): any;
  setState(key: string, value: any): void;
  clearState(): void;
  getFullState(): Record<string, any>;
}
