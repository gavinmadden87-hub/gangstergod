#!/bin/bash

curl -X 'GET' \
  'https://fastapi-python-boilerplate-rouge-alpha.vercel.app/api/data' \
  -H 'accept: application/json'chmod +x get-data.sh#!/bin/bash
# get-data.sh - Fetch data from the FastAPI boilerplate

echo "Fetching data from API..."

curl -X GET \
  "https://fastapi-python-boilerplate-rouge-alpha.vercel.app/api/data" \
  -H "accept: application/json" \
  | jq . || cat   # pretty print if jq is installed, otherwise just show raw

