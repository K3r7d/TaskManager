#!/bin/bash

# Monitor SonarQube startup progress
echo "🔍 Monitoring SonarQube startup..."
echo "================================="

MAX_ATTEMPTS=20
ATTEMPT=1
SLEEP_INTERVAL=30

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo ""
    echo "⏰ Attempt $ATTEMPT/$MAX_ATTEMPTS ($(date))"
    
    # Check container status
    CONTAINER_STATUS=$(docker compose --env-file .env -f docker/docker-compose.yml --profile analysis ps sonarqube --format "table {{.Status}}" | tail -n +2)
    echo "📦 Container: $CONTAINER_STATUS"
    
    # Test API endpoint
    if curl -s --connect-timeout 5 --max-time 10 http://localhost:9000/api/system/status > /dev/null 2>&1; then
        echo "✅ SonarQube API is responding!"
        echo ""
        echo "🎉 SonarQube is ready for use!"
        echo "🌐 Web UI: http://localhost:9000"
        echo "🔑 Default credentials: admin/admin"
        echo "🎯 API Status: http://localhost:9000/api/system/status"
        exit 0
    else
        echo "⏳ API not ready yet..."
        
        # Show recent logs every 3 attempts
        if [ $((ATTEMPT % 3)) -eq 0 ]; then
            echo "📋 Recent logs:"
            docker compose --env-file .env -f docker/docker-compose.yml --profile analysis logs --tail=5 sonarqube 2>/dev/null | head -5
        fi
    fi
    
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "😴 Waiting ${SLEEP_INTERVAL}s before next check..."
        sleep $SLEEP_INTERVAL
    fi
    
    ATTEMPT=$((ATTEMPT + 1))
done

echo ""
echo "❌ SonarQube failed to start after $((MAX_ATTEMPTS * SLEEP_INTERVAL / 60)) minutes"
echo "📋 Final logs:"
docker compose --env-file .env -f docker/docker-compose.yml --profile analysis logs --tail=20 sonarqube 2>/dev/null

exit 1