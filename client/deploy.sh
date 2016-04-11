#!/usr/bin/env bash

set -e # halt script on error
set -x

npm run build
cd static/
git init
git add .
git commit -S -m "deploy"
git push git@github.com:hotosm/osm-dat-frontend.git master:gh-pages --force
rm -rf .git
cd ..
