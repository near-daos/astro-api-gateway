# Astro API App

Astro API App is responsible for exposing all API endpoints used on Astro DAO application.

## Modules
- **account** - create/remove/configure user account API endpoints.
- **bounty** - get bounties, bounty by id API endpoints.
- **comment** - API endpoints to manage proposal comments.
- **dao** - get list of DAOs, DAOs feed, account DAOs API endpoints.
- **dao-settings** - get/set DAO settings API endpoints.
- **near** - simple module with near providers.
- **proposal** - get proposals, proposal by id, proposals by account API endpoints.
- **proposal-template** - get/create/update/remove DAO proposal templates API endpoints.
- **search** - universal API endpoint to search by all DAOs and Proposals.
- **stats** - get DAO historical statistics API endpoints.
- **subscription** - API endpoints to create/remove subscriptions for DAO updates notifications.
- **token** - get DAO NEAR/Tokens/NFTs balance API endpoints.
- **transaction** - get transactions, transfers and receipts API endpoints.
- **websocket** - DAO and Proposal subscription for instant updates.

## Websocket

The API also supports connection via Websocket. Websocket clients can receive instant updates from Smart Contract.

Entities that currently support subscription for instant updates:

- DAO
- Proposal

You can connect to the Websocket [socket.io]([https://link](https://www.npmjs.com/package/socket.io)) lib using the same host as for the REST API.

```javascript
const WEBSOCKET_HOST = 'https://api.dev.app.astrodao.com';

window.s = io(WEBSOCKET_HOST, {
  query: {
    accountId: "accountId",
    publicKey: "publicKey",
    signature: "signature",
  }
});
```

Emit the 'heartbeat' event to check liveness of the connection:

```javascript
s.emit('heartbeat', { event: 'heartbeat', data: {} });
```
----------
### Notification

#### Subscribe to All Astro notifications:
```javascript
s.on('notification', ({ notification }) => {})
```  
#### Payload:

Array of [DaoDto](libs/dao/src/dto/dao.dto.ts) objects

----------

### Account Notification

#### Subscribe to Account Notification updates:

```javascript
s.on('account-notification', (accountNotification) => {})
```

#### Payload:

Array of [ProposalDto](libs/proposal/src/dto/proposal.dto.ts) objects

----------

You can find a ready-to-use example in the [Websocket Client](samples/websocket-client.html) file.