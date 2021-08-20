import { AppService } from './app-service';
import {
  NEST_APP_AGGREGATOR,
  NEST_APP_API,
  NEST_APP_NOTIFIER,
} from './common/constants';
import Aggregator from './aggregator.main';
import Notifier from './notifier.main';
import Api from './api.main';

function createAppService(): AppService {
  switch (process.env.NEST_APP_TYPE) {
    case NEST_APP_AGGREGATOR:
      return new Aggregator();
    case NEST_APP_NOTIFIER:
      return new Notifier();
    case NEST_APP_API:
    default:
      return new Api();
  }
}

createAppService().bootstrap();
