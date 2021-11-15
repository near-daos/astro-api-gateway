import { registerAs } from '@nestjs/config';
import { credential, initializeApp } from 'firebase-admin';

export default registerAs('firebase', () => {
  return initializeApp({
    credential: credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
});
