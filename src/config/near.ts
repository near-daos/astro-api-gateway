import { ConfigService } from "@nestjs/config";
import { connect } from "near-api-js";
import { UnencryptedFileSystemKeyStore } from "near-api-js/lib/key_stores";
import path from "path";
import os from "os";

import { NEAR_PROVIDER } from "src/common/constants";

export const nearProvider = {
  provide: NEAR_PROVIDER,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const config = configService.get('near');

    const keyDir = path.join(os.homedir(), process.env.NEAR_CREDENTIALS_DIR || ".near-credentials");

    const near = await connect({
      deps: { 
        keyStore: new UnencryptedFileSystemKeyStore(keyDir)
      },
      ...config,
    });

    return near;
  }
};
