export default () => ({
  environment: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,
  logLevel: process.env.LOG_LEVEL,
});
