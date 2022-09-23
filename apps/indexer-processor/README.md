# Astro Indexer Processor App

Astro Indexer Processor App is responsible for synchronization real time data from DAO Contracts with the Database. Service depends on [Astro Lake Framework](https://github.com/near-daos/astro-lake-indexer).

## Sync Algorithm

#### DAO Updates Sync

1. Receive receipt from [Astro Lake Framework](https://github.com/near-daos/astro-lake-indexer) Redis stream.
2. For each receipt call Transaction Handler to update service Database depending on method name and arguments (If needed sync required data with Near RPC).
3. If receipt handling failed, store it in the Database and move to next one.

#### Resolving failed receipts
After starting microservice runs failed receipts resolving:
1. Get list of failed receipts.
2. For each receipt call Transaction Handler to update service Database depending on method name and arguments (If needed sync required data with Near RPC).
3. Mark failed receipts as resolved.

### Contracts Sync Flow (includes Indexer Processor App)
![Sputnik V2 Aggregation](../../docs/Astro_Contracts_Sync_Flow.png);