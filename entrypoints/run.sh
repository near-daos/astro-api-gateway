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
elif [ $NEST_APP_TYPE == "draft" ]
then
  node dist/apps/draft/main.js
else
  node dist/apps/api/main.js
fi
