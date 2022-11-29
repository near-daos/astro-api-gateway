import { getBlockTimestamp } from '@sputnik-v2/utils';

export class AggregatorState {
  aggregations: Record<string, { timestamp: string; isInProgress: boolean }> =
    {};

  public startAggregation(name: string) {
    if (!this.isInProgress(name)) {
      this.aggregations[name] = {
        timestamp: getBlockTimestamp(),
        isInProgress: true,
      };
    }
  }

  public startAggregations(names: string[]) {
    names.forEach((name) => this.startAggregation(name));
  }

  public stopAggregation(name: string) {
    if (this.aggregations[name]) {
      this.aggregations[name].isInProgress = false;
    }
  }

  public stopAggregations(names: string[]) {
    names.forEach((name) => this.stopAggregation(name));
  }

  public isInProgress(name: string): boolean {
    return !!this.aggregations[name] && this.aggregations[name].isInProgress;
  }

  public getAggregationTimestamp(name: string): string | null {
    return this.aggregations[name] ? this.aggregations[name].timestamp : null;
  }
}
