import { INestApplicationContext, WebSocketAdapter } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import socketio from 'socket.io';
import { AccountAccessGuard } from '@sputnik-v2/common';

import { SocketStateService } from './socket-state.service';
import { SocketService } from '../socket/socket.service';

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
    private readonly socketService: SocketService,
  ) {
    super(app);
  }

  public create(
    port: number,
    options: socketio.ServerOptions,
  ): socketio.Server {
    const server = super.createIOServer(port, options);
    const accountAccessGuard = this.app.get(AccountAccessGuard);
    this.socketService.injectSocketServer(server);

    server.use(async (socket: AuthenticatedSocket, next) => {
      const { accountId, publicKey, signature } = socket.handshake.query || {};

      try {
        const isAuthenticated =
          !!accountId &&
          (await accountAccessGuard.verifyAccount(
            String(accountId),
            String(publicKey.toString()),
            String(signature.toString()),
          ));

        if (isAuthenticated) {
          socket.auth = { accountId: String(accountId) };
        } else {
          socket.auth = null;
        }

        return next();
      } catch (e) {
        return next(e);
      }
    });

    return server;
  }

  public bindClientConnect(
    server: socketio.Server,
    callback: (socket: AuthenticatedSocket) => void,
  ): void {
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
