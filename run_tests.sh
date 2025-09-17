#!/bin/bash

# Script to run tests in Docker environment
echo "🧪 Running tests in Docker environment..."

# Navigate to the docker directory
cd docker

# Start the database service if not running
echo "📦 Starting database service..."
docker compose up -d db

# Wait for database to be healthy
echo "⏳ Waiting for database to be ready..."
docker compose up --wait db

# Run the tests
echo "🚀 Running test suite..."
docker compose --profile test run --rm test

# Optional: Clean up
echo "🧹 Cleaning up..."
docker compose --profile test down

echo "✅ Test run complete!"
