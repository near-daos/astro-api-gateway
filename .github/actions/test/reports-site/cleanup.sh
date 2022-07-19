#!/bin/bash
for d in $(ls -t1 /app/test | tail -n +12 | grep -v -e history -e HEADER.html)
do
  rm -rf /app/test/$d
done
