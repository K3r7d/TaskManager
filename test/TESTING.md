# Testing Guide

This project includes a comprehensive test suite that runs in Docker to ensure proper database connectivity and environment isolation.

## Prerequisites

1. **Docker and Docker Compose** installed on your system
2. **Environment Variables** - Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

## Test Structure

Our test suite includes:

- **`test_auth.py`** - Authentication tests (registration, login)
- **`test_crud.py`** - CRUD operation tests for:
  - Users (create, get, fetch by username/email)
  - Tasks (create, get, update, delete) 
  - Files (add, get files for tasks)
  - Notifications (create, get, mark as read)
- **`conftest.py`** - Shared fixtures and test configuration
- **`pytest.ini`** - Pytest configuration

## Running Tests

### Method 1: Using the Test Script (Recommended)

```bash
# Run the automated test script
./run_tests.sh
```

This script will:
1. Start the database service
2. Wait for it to be healthy
3. Run the complete test suite
4. Clean up afterward

### Method 2: Manual Docker Commands

```bash
# Navigate to docker directory
cd docker

# Start database service
docker compose up -d db

# Run tests
docker compose --profile test run --rm test

# Clean up when done
docker compose --profile test down
```

### Method 3: Running Specific Tests

```bash
cd docker

# Run specific test file
docker compose --profile test run --rm test python -m pytest test/test_auth.py -v

# Run specific test function
docker compose --profile test run --rm test python -m pytest test/test_crud.py::test_create_and_get_user -v

# Run with different output formats
docker compose --profile test run --rm test python -m pytest test/ -v --tb=long
```

## Test Environment

Tests run in an isolated Docker environment with:

- **Python 3.12** runtime
- **MySQL 8.0** database (same as production)
- **All dependencies** from `requirements.txt`
- **Network isolation** ensuring tests don't affect other services

## Test Database

The tests use the same MySQL database as your development environment but run in isolation:

- Database: `taskdb`
- Host: `mysql-db` (Docker network)
- Port: `3306` (internal Docker network)

## Continuous Integration

To run tests in CI/CD pipelines:

```yaml
# Example GitHub Actions or Jenkins pipeline
steps:
  - name: Run Tests
    run: |
      cd docker
      docker compose --profile test run --rm test
```

## Debugging Tests

### View detailed test output:
```bash
docker compose --profile test run --rm test python -m pytest test/ -v -s
```

### Run tests with pdb debugger:
```bash
docker compose --profile test run --rm test python -m pytest test/ --pdb
```

### Check test coverage:
```bash
docker compose --profile test run --rm test python -m pytest test/ --cov=app --cov-report=html
```

## Common Issues

### Database Connection Issues
If tests fail with database connection errors:
1. Ensure `.env` file exists with correct `DATABASE_URL`
2. Make sure database service is healthy: `docker compose ps db`
3. Check database logs: `docker compose logs db`

### Import Errors
If tests fail with import errors:
1. Verify `PYTHONPATH=/code` is set in the test environment
2. Check that all files are copied correctly in `Dockerfile.test`

## Adding New Tests

1. Create test files in the `test/` directory following the naming pattern `test_*.py`
2. Use the fixtures defined in `conftest.py`
3. Follow the existing test patterns for database interactions
4. Tests automatically run in Docker when you use the above commands

## Test Data

Tests use unique identifiers (UUID) to avoid conflicts:
- Each test creates its own users with unique emails/usernames
- Database cleanup happens automatically between test runs
- No shared state between tests
