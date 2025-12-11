#!/bin/bash

# Generate new JWT token for testing
# This uses the NEXTAUTH_SECRET from .env

USER_ID="cmib9dijn0000ic04g9ys79rh"
USER_EMAIL="summit_kw@hotmail.com"
USER_ROLE="marshal"
USER_NAME="Ahmad"

# Load NEXTAUTH_SECRET from .env
NEXTAUTH_SECRET=$(grep "^NEXTAUTH_SECRET" .env | cut -d= -f2 | tr -d '"')

if [ -z "$NEXTAUTH_SECRET" ]; then
  echo "❌ Error: NEXTAUTH_SECRET not found in .env"
  exit 1
fi

echo "🔐 Generating JWT Token..."
echo "Secret: ${NEXTAUTH_SECRET:0:20}..."
echo ""

# Use Node.js to generate token
node -e "
const jwt = require('jsonwebtoken');
const secret = '$NEXTAUTH_SECRET';
const payload = {
  id: '$USER_ID',
  email: '$USER_EMAIL',
  role: '$USER_ROLE',
  name: '$USER_NAME',
  iat: Math.floor(Date.now() / 1000)
};

const token = jwt.sign(payload, secret, { expiresIn: '7d' });

console.log('✅ New JWT Token generated:');
console.log('');
console.log(token);
console.log('');
console.log('📋 Test Command:');
console.log('curl https://www.kmtsys.com/api/notifications \\\\');
console.log('  -H \"Authorization: Bearer ' + token + '\"');
"

echo ""
echo "💡 Use this token in your mobile app!"
