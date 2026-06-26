#!/bin/sh
echo "Applying database migrations..."
node ./node_modules/prisma/dist/bin.js migrate deploy
if [ $? -ne 0 ]; then
  echo "WARNING: Migration failed, continuing anyway..."
fi
echo "Starting application server..."
exec node server.js
