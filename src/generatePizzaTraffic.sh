#!/bin/bash

# Check if host is provided
if [ -z "$1" ]; then
  echo "Please provide a host URL (e.g., http://localhost:3000 or https://pizza-service.yourdomainname.click)"
  exit 1
fi

host=$1

# Function to kill background processes on Ctrl+C
cleanup() {
  echo "Stopping all traffic simulation..."
  kill $(jobs -p)
  exit 0
}
trap cleanup INT

# Simulate menu requests every 3 seconds
while true; do
  curl -s $host/api/order/menu
  echo "Requesting menu..."
  sleep 3
done &

# Simulate invalid login every 25 seconds
while true; do
  curl -s -X PUT $host/api/auth -d '{"email":"unknown@jwt.com", "password":"bad"}' -H 'Content-Type: application/json'
  echo "Logging in with invalid credentials..."
  sleep 25
done &

# Simulate franchisee login/logout every 2 minutes
while true; do
  response=$(curl -s -X PUT $host/api/auth -d '{"email":"f@jwt.com", "password":"franchisee"}' -H 'Content-Type: application/json')
  token=$(echo $response | jq -r '.token')
  echo "Login franchisee..."
  sleep 110
  curl -X DELETE $host/api/auth -H "Authorization: Bearer $token"
  echo "Logging out franchisee..."
  sleep 10
done &

# Simulate diner ordering a pizza
while true; do
  response=$(curl -s -X PUT $host/api/auth -d '{"email":"d@jwt.com", "password":"diner"}' -H 'Content-Type: application/json')
  token=$(echo $response | jq -r '.token')
  echo "Login diner..."
  curl -s -X POST $host/api/order -H 'Content-Type: application/json' -d '{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}' -H "Authorization: Bearer $token"
  echo "Bought a pizza..."
  sleep 20
  curl -X DELETE $host/api/auth -H "Authorization: Bearer $token"
  echo "Logging out diner..."
  sleep 30
done &

# Wait for all background processes
wait