import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import socketio from 'socket.io';
import { RedisPropagatorService } from '../redis-propagator/redis-propagator.service';

import { SocketStateService } from './socket-state.service';

interface TokenPayload {
  readonly accountId: string;
}

export interface AuthenticatedSocket extends socketio.Socket {
  auth: TokenPayload;
}

export class SocketStateAdapter extends IoAdapter implements WebSocketAdapter {
  public constructor(
    private readonly app: INestApplicationContext,
    private readonly socketStateService: SocketStateService,
    private readonly redisPropagatorService: RedisPropagatorService,
  ) {
    super(app);
  }

  public create(
    port: number,
    options: socketio.ServerOptions,
  ): socketio.Server {
    const server = super.createIOServer(port, options);
    this.redisPropagatorService.injectSocketServer(server);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const token =
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization;

      if (!token) {
        socket.auth = null;

        // It's okay to have unauthenticaed connections for now
        return next();
      }

      try {
        //TODO: authenticate here...

        return next();
      } catch (e) {
        return next(e);
      }
    });

    return server;
  }

  public bindClientConnect(server: socketio.Server, callback: Function): void {
    server.on('connection', (socket: AuthenticatedSocket) => {
      if (socket.auth) {
        this.socketStateService.add(socket.auth.accountId, socket);

        socket.on('disconnect', () => {
          this.socketStateService.remove(socket.auth.accountId, socket);

          socket.removeAllListeners('disconnect');
        });
      }

      callback(socket);
    });
  }
}
