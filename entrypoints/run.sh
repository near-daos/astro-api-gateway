#!/bin/sh

if [ "$NEST_APP_TYPE" == "aggregator-dao" ]
then
  node dist/apps/aggregator-dao/main.js
elif [ "$NEST_APP_TYPE" == "aggregator" ]
then
  node dist/apps/aggregator/main.js
elif [ $NEST_APP_TYPE == "notifier" ]
then
  node dist/apps/notifier/main.js
else
  sed -i -e "s/host:\ .*$/host: '$DATABASE_HOST',/" \
         -e "s/port:\ .*$/port: '$DATABASE_PORT',/" \
         -e "s/username:\ .*$/username: '$DATABASE_USERNAME',/" \
         -e "s/password:\ .*$/password: '$DATABASE_PASSWORD',/" \
         -e "s/database:\ .*$/database: '$DATABASE_NAME',/" \
         ormconfig.js
  npm link ts-node
  npm link typescript
  npm link decimal.js
  npm link tsconfig-paths
  yarn migration:run

  node dist/apps/api/main.js
fi
