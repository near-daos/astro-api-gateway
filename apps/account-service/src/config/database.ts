import * as fs from 'fs';

import { registerAs } from '@nestjs/config';

import { Account } from '../account/entities';
import { DB_CONNECTION } from '../common/constants';
import { KYCToken } from '../kyc/entities/kyc-token.entity';

export default registerAs(`db_${DB_CONNECTION}`, () => {
  const certPath = process.env.ACCOUNT_SERVICE_DATABASE_CERT_PATH;

  return {
    type: 'mongodb',
    host: process.env.ACCOUNT_SERVICE_DATABASE_HOST,
    port: parseInt(process.env.ACCOUNT_SERVICE_DATABASE_PORT, 10),
    username: process.env.ACCOUNT_SERVICE_DATABASE_USERNAME,
    password: process.env.ACCOUNT_SERVICE_DATABASE_PASSWORD,
    database: process.env.ACCOUNT_SERVICE_DATABASE_NAME,
    ssl: !!certPath,
    sslValidate: false,
    sslCert: certPath ? fs.readFileSync(certPath).toString() : undefined,
    entities: [Account, KYCToken],
    synchronize: true,
  };
});
