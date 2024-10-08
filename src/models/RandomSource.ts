export interface RandomSource {
  /**
   * Returns a random number between 0 and 1
   */
  getRandomNumber(): number;
}

export default class DefaultRandomSource implements RandomSource {
  public getRandomNumber(): number {
    return Math.random();
  }
}
