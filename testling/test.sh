#!/bin/bash

echo -n "username: "
read user

browsers=""
if test -n "$2"; then
    browsers="browsers=$2"
fi

function testFile {
    tar -cf- index.js "$1" node_modules/traverse/index.js \
    | curl -u "$user" -sSNT- "http://testling.com/?$browsers&main=$1"
}

if test -f "$1"; then
    testFile "$1"
else
    echo not
fi
