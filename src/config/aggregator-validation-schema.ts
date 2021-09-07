import * as Joi from '@hapi/joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .required(),

  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_HOST: Joi.string().hostname().required(),
  DATABASE_PORT: Joi.number().required(),
  // DATABASE_RUN_MIGRATIONS: Joi.bool().required(),
  // ORM_MIGRATIONS_DIR: Joi.string(),

  NEAR_INDEXER_DATABASE_USERNAME: Joi.string().required(),
  NEAR_INDEXER_DATABASE_PASSWORD: Joi.string().required(),
  NEAR_INDEXER_DATABASE_NAME: Joi.string().required(),
  NEAR_INDEXER_DATABASE_HOST: Joi.string().hostname().required(),
  NEAR_INDEXER_DATABASE_PORT: Joi.number().required(),

  RABBITMQ_URL: Joi.string().required(),

  NEAR_CREDENTIALS_DIR: Joi.string().required(),
});
