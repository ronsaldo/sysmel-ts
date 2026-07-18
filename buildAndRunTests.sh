#!/bin/sh
set -ex

npx tsc
node dist/sysmelbc/tests.js
