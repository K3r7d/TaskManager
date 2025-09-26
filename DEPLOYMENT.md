# 🚀 Render.com Deployment Guide for TaskManager

Deploy your TaskManager application to Render.com for **FREE** - no payment verification required!

## ✨ Why Render.com?

- ✅ **No payment verification required**
- ✅ Free PostgreSQL database included
- ✅ Automatic HTTPS and SSL certificates
- ✅ GitHub integration for auto-deployment
- ✅ 750 free hours per month
- ✅ Zero-downtime deployments

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Make sure all your changes are committed:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Sign Up on Render

1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with your **GitHub account** (recommended)

### 3. Create Web Service

1. In Render dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already connected
3. Select your repository: `TaskManager`
4. Configure the service:
   - **Name**: `taskmanager-app` (or your preferred name)
   - **Environment**: `Docker`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Dockerfile Path**: `./docker/Dockerfile.backend`
   - **Docker Context**: `.` (root directory)

### 4. Add PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure database:
   - **Name**: `taskmanager-db`
   - **Database**: `taskmanager`
   - **User**: `taskmanager_user`
   - **Region**: Same as your web service
   - **Plan**: **Free** (automatically selected)

3. Click **"Create Database"**

### 5. Configure Environment Variables

In your **Web Service** settings, add these environment variables:

1. Go to your web service → **"Environment"** tab
2. Add these variables:

| Variable Name | Value | Notes |
|---------------|-------|--------|
| `DATABASE_URL` | Connect to database | Click "Add" → "Add from database" → Select your PostgreSQL database |
| `SECRET_KEY` | Generate | Click "Generate" for a secure random key |
| `PYTHONPATH` | `/code` | Manual entry |

### 6. Deploy!

1. Click **"Create Web Service"**
2. Render will automatically:
   - Build your Docker container
   - Deploy your application
   - Initialize your database
   - Provide HTTPS endpoint

### 7. Monitor Deployment

1. Watch the build logs in real-time
2. Wait for "Build successful" and "Deploy live" messages
3. Your app will be available at: `https://your-app-name.onrender.com`

## 📋 Configuration Files

Your project includes these Render-specific files:

### `render.yaml` (Blueprint Configuration)
```yaml
services:
  - type: web
    name: taskmanager-backend
    env: docker
    dockerfilePath: ./docker/Dockerfile.backend
    plan: free
    healthCheckPath: /health

databases:
  - name: taskmanager-db
    databaseName: taskmanager
    user: taskmanager_user
    plan: free
```

### `requirements.txt` (Updated for PostgreSQL)
- Replaced `mysql-connector-python` with `psycopg2-binary`
- All other dependencies remain the same

## 🔧 Post-Deployment

### Verify Your Deployment

1. **Check Health Endpoint**: Visit `https://your-app-name.onrender.com/health`
2. **Test API**: Try creating a task or user
3. **Check Logs**: Monitor logs in Render dashboard

### Database Initialization

Your database will be automatically initialized on first deployment through the Docker container's startup process.

### Monitor Performance

- **Dashboard**: Monitor CPU, memory, and requests in Render dashboard
- **Logs**: Real-time logs available in the service overview
- **Alerts**: Set up email notifications for service issues

## 🛠️ Troubleshooting

### Common Issues:

**Build Failures:**
- Check build logs in Render dashboard
- Verify Dockerfile path: `./docker/Dockerfile.backend`
- Ensure all dependencies are in `requirements.txt`

**Database Connection Issues:**
- Verify DATABASE_URL environment variable is set
- Check that both services are in the same region
- Review connection logs in the service dashboard

**Service Won't Start:**
- Check if port is correctly exposed in Dockerfile
- Verify health check endpoint responds at `/health`
- Review application logs for startup errors

### Debug Commands:

Access your service shell (if needed):
- Go to your service dashboard
- Click "Shell" tab to access container terminal

## 🔄 Continuous Deployment

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Your app will rebuild and redeploy automatically!

## 💰 Scaling & Upgrades

### Free Tier Limits:
- 750 hours/month compute time
- Services sleep after 15 minutes of inactivity
- Wake up automatically on first request (~30 seconds)

### Upgrade Options:
- **Starter Plan** ($7/month): No sleeping, faster builds
- **Standard Plan** ($25/month): More resources, custom domains
- **Pro Plan** ($85/month): High availability, priority support

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)
- [Docker Deployments](https://render.com/docs/docker)
- [Environment Variables](https://render.com/docs/environment-variables)

## 🎉 Success!

Your TaskManager app is now live on Render.com with:
- ✅ Automatic HTTPS
- ✅ Free PostgreSQL database
- ✅ Auto-deployment from Git
- ✅ Built-in monitoring and logs
- ✅ Zero configuration scaling

**Your app URL**: `https://your-app-name.onrender.com`

Happy coding! 🚀

### 1. Prerequisites

- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Git repository initialized and code committed
- Heroku account created

### 2. Install Heroku CLI

**macOS:**
```bash
brew tap heroku/brew && brew install heroku
```

**Ubuntu/Debian:**
```bash
sudo snap install heroku --classic
```

**Windows:**
Download from [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)

### 3. Login and Create App

```bash
# Login to Heroku
heroku login

# Create a new Heroku app (replace 'your-app-name' with your desired name)
heroku create your-app-name

# Set stack to container for Docker deployment
heroku stack:set container -a your-app-name
```

### 4. Add Database

```bash
# Add JawsDB MySQL database (free tier)
heroku addons:create jawsdb:kitefin -a your-app-name

# Get database URL (for verification)
heroku config:get JAWSDB_URL -a your-app-name
```

### 5. Configure Environment Variables

```bash
# Generate a secure secret key
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")

# Set environment variables
heroku config:set \
  SECRET_KEY="$SECRET_KEY" \
  PYTHONPATH="/code" \
  -a your-app-name
```

The DATABASE_URL and MySQL connection details will be automatically set by the JawsDB add-on.

### 6. Deploy the Application

```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Heroku deployment"

# Deploy to Heroku
git push heroku main
```

### 7. Initialize Database

```bash
# Run database initialization
heroku run python -m app.init_db -a your-app-name
```

### 8. Open Your App

```bash
# Open the app in your browser
heroku open -a your-app-name

# Or visit: https://your-app-name.herokuapp.com
```

## Files Created for Heroku Deployment

### `heroku.yml` (Container Deployment)
Configures Heroku to use Docker containers and includes:
- Build configuration
- Database add-on setup
- Release commands (database initialization)
- Web process command

### `Procfile` (Buildpack Deployment - Backup)
Defines processes for buildpack deployment:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
release: python -m app.init_db
```

### `runtime.txt`
Specifies Python version:
```
python-3.9.19
```

## Post-Deployment Verification

Use the provided script to verify your deployment:

```bash
./post-deploy.sh your-app-name
```

Or manually check:

```bash
# Check app status
heroku ps -a your-app-name

# View logs
heroku logs --tail -a your-app-name

# Test database connection
heroku run python -c "from app.database import engine; print('DB Connected!')" -a your-app-name
```

## Environment Variables

The following environment variables are automatically configured:

| Variable | Source | Description |
|----------|--------|-------------|
| `JAWSDB_URL` | JawsDB Add-on | Raw MySQL connection URL |
| `DATABASE_URL` | Auto-generated | SQLAlchemy-compatible connection string |
| `MYSQL_DATABASE` | Parsed from JAWSDB_URL | Database name |
| `MYSQL_USER` | Parsed from JAWSDB_URL | Database username |
| `MYSQL_PASSWORD` | Parsed from JAWSDB_URL | Database password |
| `MYSQL_HOST` | Parsed from JAWSDB_URL | Database host |
| `SECRET_KEY` | User-set | Application secret key |

## Troubleshooting

### Common Issues:

1. **Build Failures:**
   ```bash
   # Check build logs
   heroku logs --tail -a your-app-name
   ```

2. **Database Connection Issues:**
   ```bash
   # Verify database add-on
   heroku addons -a your-app-name
   
   # Check database URL
   heroku config -a your-app-name | grep DATABASE
   ```

3. **Application Crashes:**
   ```bash
   # Restart the application
   heroku restart -a your-app-name
   
   # Scale up if needed
   heroku ps:scale web=1 -a your-app-name
   ```

### Debug Commands:

```bash
# Access app shell
heroku run bash -a your-app-name

# Check Python packages
heroku run pip list -a your-app-name

# Test database connectivity
heroku run python -c "import mysql.connector; print('MySQL connector available')" -a your-app-name
```

## Monitoring and Maintenance

### View Application Metrics:
```bash
# Open Heroku dashboard
heroku dashboard -a your-app-name

# Monitor resource usage
heroku ps -a your-app-name
```

### Database Management:
```bash
# Access database
heroku run mysql -h hostname -u username -p database_name -a your-app-name

# Backup database (upgrade to paid plan for automated backups)
```

### Scaling:
```bash
# Scale web dynos
heroku ps:scale web=2 -a your-app-name

# Upgrade database (if needed)
heroku addons:upgrade jawsdb:leopard -a your-app-name
```

## Additional Resources

- [Heroku Container Registry & Runtime](https://devcenter.heroku.com/articles/container-registry-and-runtime)
- [JawsDB MySQL Add-on](https://elements.heroku.com/addons/jawsdb)
- [Heroku Python Support](https://devcenter.heroku.com/articles/python-support)

## Support

If you encounter issues:
1. Check the logs: `heroku logs --tail -a your-app-name`
2. Verify your environment variables: `heroku config -a your-app-name`
3. Test locally first: `docker-compose up`
4. Consult Heroku documentation or support

---

**Happy Deploying! 🚀**

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