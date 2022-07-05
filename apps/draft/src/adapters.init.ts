import { INestApplication } from '@nestjs/common';
import {
  SocketService,
  SocketStateAdapter,
  SocketStateService,
} from '@sputnik-v2/websocket';

export const initAdapters = (app: INestApplication): INestApplication => {
  const socketStateService = app.get(SocketStateService);
  const socketService = app.get(SocketService);

  app.useWebSocketAdapter(
    new SocketStateAdapter(app, socketStateService, socketService),
  );

  return app;
};
