import { AppService } from './app-service';
import { NEST_APP_AGGREGATOR } from './common/constants';
import Aggregator from './aggregator.main';
import Api from './api.main';

function createAppService(): AppService {
  switch (process.env.NEST_APP_TYPE) {
    case NEST_APP_AGGREGATOR:
      return new Aggregator();
    default:
      return new Api();
  }
}

createAppService().bootstrap();
