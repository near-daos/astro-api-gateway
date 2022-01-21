import { INestApplication } from '@nestjs/common';
import { SocketStateAdapter } from './websocket/socket-state/socket-state.adapter';
import { SocketStateService } from './websocket/socket-state/socket-state.service';
import { SocketService } from './websocket/socket/socket.service';

export const initAdapters = (app: INestApplication): INestApplication => {
  const socketStateService = app.get(SocketStateService);
  const socketService = app.get(SocketService);

  app.useWebSocketAdapter(
    new SocketStateAdapter(app, socketStateService, socketService),
  );

  return app;
};
