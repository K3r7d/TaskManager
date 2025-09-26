# Deployment Guide for TaskManager

This document outlines the steps required to deploy the TaskManager application to various cloud platforms.

## Prerequisites

- Docker and Docker Compose installed locally
- Git repository with your code
- Account on your chosen cloud platform (Heroku, Render, DigitalOcean, AWS, etc.)
- Database service (MySQL compatible)

## Environment Variables

Ensure these environment variables are configured in your cloud platform:

```
DATABASE_URL=mysql+mysqlconnector://user:password@hostname:3306/dbname
MYSQL_DATABASE=TASKMANAGER
MYSQL_USER=your_database_user
MYSQL_PASSWORD=your_secure_password
MYSQL_ROOT_PASSWORD=your_secure_root_password
SECRET_KEY=your_secret_key_here
```

## Deployment Options

### 1. Heroku Deployment

1. **Install the Heroku CLI**:
   ```bash
   brew install heroku/brew/heroku
   ```

2. **Log in to Heroku**:
   ```bash
   heroku login
   ```

3. **Create a Heroku app**:
   ```bash
   heroku create task-manager-app
   ```

4. **Add a MySQL database**:
   ```bash
   heroku addons:create jawsdb:kitefin
   ```

5. **Set environment variables**:
   ```bash
   heroku config:set SECRET_KEY=your_secure_key
   # Other environment variables will be automatically set by JawsDB
   ```

6. **Deploy your application**:
   ```bash
   git push heroku main
   ```

7. **Run migrations**:
   ```bash
   heroku run python -m app.init_db
   ```

### 2. Render Deployment

1. **Create a new Web Service** in the Render dashboard

2. **Connect your GitHub repository**

3. **Configure the service**:
   - Name: `task-manager-app`
   - Environment: `Docker`
   - Build Command: (leave default)
   - Start Command: (leave default)

4. **Add environment variables** in the Render dashboard:
   - Add all required environment variables listed above
   - Connect to a Render MySQL database or external MySQL service

5. **Create and deploy** the service

### 3. DigitalOcean App Platform

1. **Create a new app** in the DigitalOcean dashboard

2. **Connect your GitHub repository**

3. **Configure the app**:
   - Select the Dockerfile for deployment
   - Configure resources according to your needs

4. **Add a database component**:
   - Select MySQL managed database

5. **Set environment variables**:
   - Add all required environment variables listed above
   - DigitalOcean will automatically connect the database

6. **Deploy the app**

## CI/CD Setup with Jenkins

Your Jenkins pipeline is already configured to:
1. Build the Docker images
2. Run tests
3. Perform code quality analysis

To extend it for deployment:

1. Add a deployment stage to your Jenkinsfile:
   ```groovy
   stage('Deploy') {
       when {
           branch 'main'
       }
       steps {
           // Deploy to your chosen platform
           // For example, with Heroku:
           sh 'heroku container:push web -a your-app-name'
           sh 'heroku container:release web -a your-app-name'
       }
   }
   ```

2. Add necessary credentials to Jenkins for your deployment platform

## Database Migrations

For any platform, ensure database migrations are run after deployment:

```bash
# For Heroku
heroku run python -m app.init_db

# For other platforms, use their respective CLI or run commands feature
```

## SSL/TLS Configuration

For production deployments, ensure:

1. SSL/TLS certificates are configured (most platforms handle this automatically)
2. Set up proper CORS headers in your application
3. Configure any necessary proxy settings

## Monitoring and Logging

1. Set up application monitoring using the built-in Prometheus/Grafana stack
2. Configure log aggregation appropriate for your platform
3. Set up alerting for critical service disruptions

## Backup Strategy

1. Schedule regular database backups
2. Implement a retention policy for backups
3. Test backup restoration periodically

Remember to update your documentation as your deployment process evolves.