import { registerAs } from '@nestjs/config';

export default registerAs('notifi', () => {
  return {
    env: process.env.NOTIFI_ENV,
    prefix: process.env.NOTIFI_PREFIX,
    sid: process.env.NOTIFI_SID,
    secret: process.env.NOTIFI_SECRET,
  };
});
