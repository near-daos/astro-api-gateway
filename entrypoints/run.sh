#!/bin/sh

# exit when any command fails
set -e

# run migrations
npm run migration:run

# run app
node dist/apps/$NEST_APP_TYPE/main.js
