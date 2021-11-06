## Description

Sputnik v2 slim api server

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Websocket

The API also supports connection via Websocket. Websocket clients can receive instant updates from Smart Contract.
  
Entities that currently support subscription for instant updates:
  
- DAO
- Proposal

You can connect to the Websocket [socket.io]([https://link](https://www.npmjs.com/package/socket.io)) lib using the same host as for the REST API.  
  
```javascript
const WEBSOCKET_HOST = 'https://api.dev.app.astrodao.com';

window.s = io(WEBSOCKET_HOST, {});
```
  
Emit the 'heartbeat' event to check liveness of the connection:  
  
```javascript
s.emit('heartbeat', { event: 'heartbeat', data: {} });
```
----------
### DAO    
  
#### Subscribe to DAO updates:
```javascript
s.on('dao-update', ({ daos }) => {})
```  
#### Payload:

Array of [DaoDto](libs/dao/src/dto/dao.dto.ts) objects

----------

### Proposal

#### Subscribe to Proposal updates:

```javascript
s.on('proposal-update', ({ proposals }) => {})
```

#### Payload:

Array of [ProposalDto](libs/proposal/src/dto/proposal.dto.ts) objects

----------

You can find a ready-to-use example in the [Websocket Client](samples/websocket-client.html) file.
