import * as Joi from '@hapi/joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .required(),
  PORT: Joi.number().required(),

  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_HOST: Joi.string().hostname().required(),
  DATABASE_PORT: Joi.number().required(),

  RABBITMQ_URL: Joi.string().required(),

  REDIS_URL: Joi.string().required(),
  REDIS_HTTP_CACHE_TTL: Joi.number().required(),
});
