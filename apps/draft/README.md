# Astro Draft App

Astro Draft App is responsible for exposing all API endpoints used for managing draft proposal and comments on Astro UI.

## Modules
- **draft-proposal** - API endpoints to create/update/remove draft proposals.
- **draft-comment** - API endpoints to create/update/remove draft comments.

## What Is Draft Proposal
- Draft proposal is an actual clone of real proposal that is stored in the Database and does not affect DAO contract. 
- Draft proposal used to discuss proposal before it is created on chain.
- Draft proposal can be easily updated, removed or converted to a real proposal by draft creator or DAO council.
- Draft proposal has a history of updates that allows users to view old versions of proposal.
- After conversion to real proposal on Near Network, draft proposal is closed and can npt be updated or removed anymore.
- Closed draft proposals is related to the relevant proposal on chain, that allows users to easily view proposal discussion and history.