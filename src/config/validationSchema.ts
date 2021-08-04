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
  // DATABASE_RUN_MIGRATIONS: Joi.bool().required(),
  // ORM_MIGRATIONS_DIR: Joi.string(),

  NEAR_INDEXER_DATABASE_USERNAME: Joi.string().required(),
  NEAR_INDEXER_DATABASE_PASSWORD: Joi.string().required(),
  NEAR_INDEXER_DATABASE_NAME: Joi.string().required(),
  NEAR_INDEXER_DATABASE_HOST: Joi.string().hostname().required(),
  NEAR_INDEXER_DATABASE_PORT: Joi.number().required(),

  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),
});
