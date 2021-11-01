#!/bin/sh

if [ "$NEST_APP_TYPE" == "aggregator-dao" ]
then
  node dist/aggregator-dao
elif [ "$NEST_APP_TYPE" == "aggregator" ]
then
  node dist/aggregator
elif [ $NEST_APP_TYPE == "notifier" ]
then
  node dist/notifier
else
  node dist/api
fi
