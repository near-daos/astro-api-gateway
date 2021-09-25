import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketStateService {
  private socketState = new Map<string, Socket[]>();

  public get(accountId: string): Socket[] {
    return this.socketState.get(accountId) || [];
  }

  public getAll(): Socket[] {
    const all = [];

    this.socketState.forEach((sockets) => all.push(sockets));

    return all;
  }

  public add(accountId: string, socket: Socket): boolean {
    const existingSockets = this.socketState.get(accountId) || [];

    const sockets = [...existingSockets, socket];

    this.socketState.set(accountId, sockets);

    return true;
  }

  public remove(accountId: string, socket: Socket): boolean {
    const existingSockets = this.socketState.get(accountId);

    if (!existingSockets) {
      return true;
    }

    const sockets = existingSockets.filter((s) => s.id !== socket.id);

    if (!sockets.length) {
      this.socketState.delete(accountId);
    } else {
      this.socketState.set(accountId, sockets);
    }

    return true;
  }
}
