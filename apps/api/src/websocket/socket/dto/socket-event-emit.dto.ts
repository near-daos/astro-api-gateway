export class SocketEventEmitDTO {
  public readonly event: string;
  public readonly data?: unknown;
  public readonly accountEvents?: {
    accountId: string;
    data: unknown;
  }[];
}
