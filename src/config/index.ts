import { default as configuration } from './configuration';
import { default as database } from './database';
import { default as firebase } from './firebase';

export { default as validationSchema } from './validationSchema';
export { TypeOrmConfigService } from './typeorm-config.service';

export default [configuration, database, firebase];
