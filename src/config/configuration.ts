export default () => ({
  port: parseInt(process.env.PORT, 10),
  environment: process.env.NODE_ENV,
});
