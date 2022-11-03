import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import LaunchDarkly, { LDClient } from 'launchdarkly-node-server-sdk';
import { FeatureFlags } from './types';

@Injectable()
export class FeatureFlagsService {
  private ldClient: LDClient;

  constructor(private readonly configService: ConfigService) {
    const { sdkKey } = configService.get('launchdarkly');
    this.ldClient = LaunchDarkly.init(sdkKey);
  }

  public async check(
    key: FeatureFlags,
    accountId = '',
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
