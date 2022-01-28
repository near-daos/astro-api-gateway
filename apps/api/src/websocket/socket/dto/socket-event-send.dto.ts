import { SocketEventEmitDTO } from './socket-event-emit.dto';

export class SocketEventSendDTO extends SocketEventEmitDTO {
  public readonly accountId: string;
  public readonly socketId: string;
}
