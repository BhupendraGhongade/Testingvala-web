#!/bin/bash

echo "🧪 Testing Magic Link API with cURL"
echo "=================================="

# Test 1: OPTIONS request (CORS preflight)
echo "📡 Test 1: OPTIONS request (CORS preflight)"
curl -X OPTIONS \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v \
  http://localhost:5173/api/send-magic-link

echo -e "\n\n"

# Test 2: POST request with valid data
echo "📡 Test 2: POST request with valid email"
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@testingvala.com","deviceId":"test-device-123"}' \
  -v \
  http://localhost:5173/api/send-magic-link

echo -e "\n\n"

# Test 3: POST request with invalid email
echo "📡 Test 3: POST request with invalid email"
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"invalid-email","deviceId":"test-device-123"}' \
  -v \
  http://localhost:5173/api/send-magic-link

echo -e "\n\n"

# Test 4: POST request with missing email
echo "📡 Test 4: POST request with missing email"
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"deviceId":"test-device-123"}' \
  -v \
  http://localhost:5173/api/send-magic-link

echo -e "\n\nTest completed! Check the responses above."