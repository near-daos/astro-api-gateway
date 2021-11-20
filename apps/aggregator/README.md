# Astro Aggregator App

Astro Aggregator App is responsible for synchronization data from DAO Contracts with the Database.

## Aggregation Algorithm

After starting microservice runs initial aggregation for all DAOs:
1. Get list of all DAOs.
2. For each DAO run aggregation that sync DAO data from NEAR RPC with the Database.
3. Save all transactions that has been aggregated.

When initial aggregation finished, schedule aggregation with interval defined in `AGGREGATOR_POLLING_INTERVAL` env variable in milliseconds (2 seconds by default):

1. Get last saved transaction.
2. Get list of all updates from Near Indexer DB by Contract name including arguments.
3. For each update call Transaction Handler to update service Database depending on method name and arguments (If needed sync required data with Near RPC). 

![Sputnik V2 Aggregation](../../docs/Astro.agregator.v2.png);