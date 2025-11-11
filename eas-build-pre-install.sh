#!/bin/bash
set -e

echo "Configuring npm for @rork private registry..."
npm config set @rork:registry https://registry.rork.com/
npm config set //registry.rork.com/:_authToken "${RORK_AUTH_TOKEN}"
echo "NPM configuration complete"
