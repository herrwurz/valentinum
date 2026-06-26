#!/bin/sh
set -e
echo "Applying database migrations..."
node ./node_modules/prisma/dist/bin.js migrate deploy
echo "Starting application server..."
exec node server.js
