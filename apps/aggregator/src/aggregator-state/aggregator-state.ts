export class AggregatorState {
  aggregationsInProgress: string[] = [];

  public startAggregation(name: string) {
    if (!this.isInProgress(name)) {
      this.aggregationsInProgress.push(name);
    }
  }

  public startAggregations(names: string[]) {
    names.forEach((name) => this.startAggregation(name));
  }

  public stopAggregation(name: string) {
    this.aggregationsInProgress = this.aggregationsInProgress.filter(
      (n) => n !== name,
    );
  }

  public stopAggregations(names: string[]) {
    this.aggregationsInProgress = this.aggregationsInProgress.filter(
      (name) => !names.includes(name),
    );
  }

  public isInProgress(name: string): boolean {
    return this.aggregationsInProgress.includes(name);
  }
}
