import { registerAs } from '@nestjs/config';

export default registerAs('launchdarkly', () => ({
  sdkKey: process.env.LAUNCHDARKLY_SDK_KEY,
}));
