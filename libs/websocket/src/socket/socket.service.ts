import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { SocketEventEmitDTO, SocketEventSendDTO } from './dto';
import { AuthenticatedSocket, SocketStateService } from '../socket-state';

@Injectable()
export class SocketService {
  private socketServer: Server;

  public constructor(private readonly socketStateService: SocketStateService) {}

  public sendEvent = (eventInfo: SocketEventSendDTO): void => {
    const { accountId, event, data, socketId } = eventInfo;

    return this.socketStateService
      .get(accountId)
      .filter((socket) => socket.id !== socketId)
      .forEach((socket) => socket.emit(event, data));
  };

  public emitToAllEvent = (eventInfo: SocketEventEmitDTO): void => {
    this.socketServer.emit(eventInfo.event, eventInfo.data);
  };

  public emitToAuthenticatedEvent = (eventInfo: SocketEventEmitDTO): void => {
    const { event, data, accountEvents } = eventInfo;

    return this.socketStateService
      .getAll()
      .forEach((socket: AuthenticatedSocket) => {
        if (!Array.isArray(accountEvents)) {
          socket.emit(event, data);
        } else {
          const accountEvent = accountEvents.find(
            ({ accountId }) => accountId === socket.auth?.accountId,
          );

          if (accountEvent) {
            socket.emit(event, accountEvent.data);
          }
        }
      });
  };

  public injectSocketServer(server: Server): SocketService {
    this.socketServer = server;

    return this;
  }
}
