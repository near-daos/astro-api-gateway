import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import LaunchDarkly, { LDClient } from 'launchdarkly-node-server-sdk';
import { FeatureFlags } from './types';

@Injectable()
export class FeatureFlagsService implements OnApplicationShutdown {
  private ldClient: LDClient;

  constructor(private readonly configService: ConfigService) {
    const { sdkKey } = configService.get('launchdarkly');
    this.ldClient = LaunchDarkly.init(sdkKey);
  }

  onApplicationShutdown() {
    this.ldClient.close();
  }

  public async check(
    key: FeatureFlags,
    accountId = 'astro-backend',
    defaultValue = false,
  ): Promise<boolean> {
    return await this.ldClient.variation(
      key,
      {
        key: accountId,
      },
      defaultValue,
    );
  }
}
