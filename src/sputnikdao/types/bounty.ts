export type Bounty = {
  description: string;
  /// Token the bounty will be paid out.
  token: string;
  /// Amount to be paid out.
  amount: string;
  /// How many times this bounty can be done.
  times: string;
  /// Max deadline from claim that can be spend on this bounty.
  maxDeadline: string;
};
