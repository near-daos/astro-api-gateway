export const EXPIRATION_THRESHOLD = 30 * 1000; // 30 seconds

export enum AggregationStatus {
  InProgress = 'InProgress',
  Failed = 'Failed',
  Success = 'Success',
}

export class AggregationState {
  transactionHash: string;
  status: AggregationStatus = AggregationStatus.InProgress;
  timestamp: Date;

  constructor(transactionHash: string) {
    this.transactionHash = transactionHash;
    this.timestamp = new Date();
    this.status = AggregationStatus.InProgress;
  }

  public isExpired(): boolean {
    return (
      !this.timestamp ||
      new Date().getMilliseconds() - this.timestamp.getMilliseconds() >
        EXPIRATION_THRESHOLD
    );
  }
}
