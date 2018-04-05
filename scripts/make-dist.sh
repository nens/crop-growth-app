#!/bin/sh
set +x

DIRECTORY=`pwd`

mkdir -p /tmp/dist
cp -r $DIRECTORY/build/* /tmp/dist/
cd /tmp/dist
mkdir -p $DIRECTORY/dist
zip -r $DIRECTORY/dist/crop-growth-app.zip .
cd /
rm -r /tmp/dist
ls -l $DIRECTORY/dist/crop-growth-app.zip