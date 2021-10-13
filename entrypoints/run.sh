#!/bin/sh

if [ "$NEST_APP_TYPE" == "aggregator-gross" ]
then
  node dist/aggregator-gross
elif [ "$NEST_APP_TYPE" == "aggregator" ]
then
  node dist/aggregator
elif [ $NEST_APP_TYPE == "notifier" ]
then
  node dist/notifier
else
  node dist/api
fi
