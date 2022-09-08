# Astro API Gateway

[![Release version](https://img.shields.io/github/v/release/near-daos/astro-api-gateway)](https://github.com/near-daos/astro-api-gateway/releases/)
[![Build](https://github.com/near-daos/astro-api-gateway/actions/workflows/build-deploy.yaml/badge.svg)](https://github.com/near-daos/astro-api-gateway/actions/workflows/build-deploy.yaml)
[![Launch API Autotests On Schedule](https://github.com/near-daos/astro-api-gateway/actions/workflows/launch-autotests-on-schedule.yaml/badge.svg)](https://github.com/near-daos/astro-api-gateway/actions/workflows/launch-autotests-on-schedule.yaml)
[![Telegram group](https://img.shields.io/badge/-Telegram%20group-blue)](https://t.me/astro_near)

Astro API Gateway contains list of services used by DAO applications based on [Sputnik DAO Contracts](https://github.com/near-daos/sputnik-dao-contract) version 2 on [NEAR Protocol](https://near.org/).

Main features:

- Sync DAO Contracts data with the Database.
- Provide API endpoints to interact with DAOs.
- Produce DAO updates notifications.

## Tech Stack

- Blockchain: **[NEAR](https://near.org/)**
- Smart Contracts: **[Sputnik DAO Factory V2](https://github.com/near-daos/sputnik-dao-contract/tree/main/sputnikdao-factory2), [Sputnik DAO V2](https://github.com/near-daos/sputnik-dao-contract/tree/main/sputnikdao2)**
- Server Environment:  **[NodeJS](https://nodejs.org/)**
- Package manager: **[Yarn](https://yarnpkg.com/)**
- Core programming language: **[TypeScript](https://www.typescriptlang.org/)**
- Application framework: **[NestJS](https://nestjs.com/)**
- Database: **[PostgreSQL](https://www.postgresql.org/), [MongoDB](https://www.mongodb.com/), [TypeORM](https://typeorm.io/)**
- Near API: **[near-api-js](https://docs.near.org/docs/api/naj-quick-reference)**
- Indexer: **[Astro Lake Framework](https://github.com/near-daos/astro-lake-indexer)**
- Caching/Events/Streams: **[Redis](https://redis.io/)**
- Notifications: **[Notifi](https://notifi.network/)**
- Monitoring: **[Datadog](https://www.datadoghq.com/)**
- Code quality: **[Eslint](https://eslint.org/), [Prettier](https://prettier.io/)**
- Build: **[Docker](https://www.docker.com/)**

## Services

- [Aggregator](./apps/aggregator) - sync blockchain historical data with the Database.
- [Indexer Processor](./apps/indexer-processor) - sync blockchain real-time data with the Database.
- [API](./apps/api) - provides a set of API endpoints to view, filter, search, sync etc.
- [Draft](./apps/draft) - provides a set of API endpoints to manage draft proposals and comments.
- [Notifier](./apps/notifier) - simple notification service for sending / subscribing on service events.

![Services](./docs/Astro_Architechure.png)


## Project Structure

Project has standard [NestJS monorepo](https://docs.nestjs.com/cli/monorepo#monorepo-mode) structure, where all services (aggregator, api, etc.) are separated on apps.
All reusable modules separated on libs by domains and could be shared between different apps and libs itself.

![Project Structure](./docs/Astro_Basic_Project_Structure.png)

### Apps
```
/apps
  /aggregator
  /api
  /draft
  /indexer-processor
  /notifier
```

### Libs
```
/libs
  /account
  /bounty
  /cache
  /comment
  /common
  /config
  /dao
  /dao-api
  /dao-settings
  /draft-comment
  /draft-proposal
  /error-tracker
  /event
  /migrations
  /near-api
  /near-indexer
  /notifi-client
  /notification
  /orm-migrations
  /otp
  /proposal
  /proposal-template
  /sputnikdao
  /stats
  /subscription
  /token
  /transaction
  /transaction-handler
  /utils
  /websocket
```

## Config

Main config properties could be specified by environment variables defined in [.env](./.env) file.

All the configs are managed by [config lib](./libs/config/src) and shared between apps and libs.
```
/libs/config/src
  /aggregator-config.ts
  /api-config.ts
  /cache.ts
  /configuration.ts
  /dao-api.ts
  /database.ts
  /database-draft.ts
  /database-near-indexer.ts
  /draft-config.ts
  /indexer-processor-config.ts
  /near.ts
  /near-api.ts
  /near-config.ts
  /near-token-factory.ts
  /notifi.ts
  /notifier-config.ts
  /redis.ts
  /typeorm-config.service.ts
```

---

## Getting Started

### Local Development

1. Clone the repo:
```
git clone git@github.com:near-daos/astro-api-gateway.git
```

2. Open the repo folder:
```
cd astro-api-gateway
```

3. Install dependencies:
```
yarn
```

4. Add `.env.local` to the root folder with required environment variables described in `.env`.

5. Run dev docker compose:
```
docker-compose -f docker-compose-dev.yml up
```
Please make sure that Docker has been installed on your local machine.

6. Run all services in dev mode:
```
yarn start-dev
```

Or run specific service you need:

- Aggregator: `yarn start-aggregator:dev`
- API: `yarn start-api:dev`
- Notifier: `yarn start-notifier:dev`

## Migrations

### Database migration workflow

1. Change entity definition

- If creating new entity, make sure it's specified in `ormconfig.js`

2. Generate migration via:

- `yarn migration:generate`
- `node -r ts-node/register -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -n <MigrationName>`

3. Review generated migration & fix migration code style & lint warnings
4. Run new migrations via: `yarn migration:run`
5. If something went wrong, revert the last migration via: `yarn migration:revert`
6. Commit changes

### OR

You can sync database manually without running migration (NOT RECOMMENDED):

`yarn schema:sync`

Before syncing schema, a review of SQL queries to be executed is highly RECOMMENDED:

`yarn schema:log`
