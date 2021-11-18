# DB Migrations

Custom DB Migrations Framework based on NestJS dependency injection mechanism.

## Create DB Migration

Create your own migration script and put it into the migration [scripts](src/scripts) folder. Inherit the [Migration](src/interfaces/migration.interface.ts) interface to make sure you're compatible with the migration API. Leverage the power of NestJS dependency injection to make use of the existing components.

**Migration name is in fact the class name of the script you're adding:**

```typescript
@Injectable()
export class ProposalActionsMigration implements Migration {
  constructor() {}

  public async migrate(): Promise<void> {}
}
```
The above example will create **ProposalActionsMigration** script.

## Run migrations

Use the following env variable to run particular migration:

```javascript
export DATABASE_MIGRATIONS_LIST=ProposalActionsMigration
```

Or enumerate the list if you want to run multiple ones:

```javascript
export DATABASE_MIGRATIONS_LIST=ProposalActionsMigration,ProposalPurgeMigration
```

You can put the **DATABASE_MIGRATIONS_LIST** into the **.env.local** variables file as well.

## DB Configuration

DB configuration is actually following common NestJS standards.
