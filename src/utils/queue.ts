export class Queue<T> {
  #stackPush: T[] = [];
  #stackPop: T[] = [];

  push(value: T) {
    this.#stackPush.push(value);
  }

  top() {
    this.sort();
    return this.#stackPop.at(-1);
  }
  pop() {
    this.sort();
    return this.#stackPop.pop();
  }

  private sort() {
    if (this.#stackPop.length === 0) {
      while (this.#stackPush.length > 0) {
        this.#stackPop.push(this.#stackPush.pop()!);
      }
    }
  }
}
