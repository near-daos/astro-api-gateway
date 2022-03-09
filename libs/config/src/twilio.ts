import { registerAs } from '@nestjs/config';
import twilio from 'twilio';

export default registerAs('twilio', () => {
  return {
    client: twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    ),
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  };
});
