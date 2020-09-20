#!/bin/bash

set -e -u -x

cd "$(dirname "$0")"

rm -rf node_modules
git checkout v3
GIT_EDITOR=true git merge main
sed -i -E -e 's/"version": ".+",/"version": "'"$1"'",/' package.json
git diff --quiet && false
rm -rf node_modules
npm install --production
npm run tsc
git add -f lib node_modules package.json package-lock.json
git diff --quiet
git commit -m "v$1"
git tag "v$1"
echo git push origin main v3 --tags
