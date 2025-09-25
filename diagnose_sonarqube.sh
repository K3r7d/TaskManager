#!/bin/bash

# Quick SonarQube diagnostic script
# Run this to check what's happening with SonarQube

echo "🔍 SonarQube Diagnostic Report"
echo "================================"
echo "Timestamp: $(date)"
echo ""

# Check if SonarQube container exists
echo "📦 Checking SonarQube container status..."
docker compose -f docker/docker-compose.yml --profile analysis ps sonarqube 2>/dev/null || {
    echo "❌ SonarQube container not found or docker-compose failed"
    echo "💡 Try: docker compose -f docker/docker-compose.yml --profile analysis up -d sonarqube"
    exit 1
}

# Check container logs
echo ""
echo "📋 Recent SonarQube logs:"
echo "------------------------"
docker compose -f docker/docker-compose.yml --profile analysis logs --tail=20 sonarqube 2>/dev/null || {
    echo "❌ Cannot fetch SonarQube logs"
}

# Check if port 9000 is accessible
echo ""
echo "🌐 Checking port 9000 accessibility..."
if nc -z localhost 9000 2>/dev/null; then
    echo "✅ Port 9000 is open"
    
    # Try different API endpoints
    echo ""
    echo "🔍 Testing SonarQube API endpoints..."
    
    echo -n "System status: "
    curl -s --connect-timeout 5 --max-time 10 http://localhost:9000/api/system/status 2>/dev/null || echo "FAILED"
    
    echo -n "Health check: "
    curl -s --connect-timeout 5 --max-time 10 http://localhost:9000/api/system/health 2>/dev/null || echo "FAILED"
    
    echo -n "Web interface: "
    curl -s --connect-timeout 5 --max-time 10 -o /dev/null -w "%{http_code}" http://localhost:9000/ 2>/dev/null || echo "FAILED"
    
else
    echo "❌ Port 9000 is not accessible"
    echo "💡 SonarQube might not be running or bound to the wrong interface"
fi

# Check system resources
echo ""
echo "💾 System resources:"
echo "Memory usage: $(free -h 2>/dev/null | grep Mem || echo 'N/A')"
echo "Disk usage: $(df -h . 2>/dev/null | tail -1 || echo 'N/A')"

# Check Docker resources
echo ""
echo "🐳 Docker system info:"
docker system df 2>/dev/null || echo "Docker system info not available"

echo ""
echo "🔧 Recommended actions:"
echo "1. Check SonarQube container logs above for specific errors"
echo "2. Ensure you have enough memory (SonarQube needs ~2GB)"
echo "3. Try restarting the container: docker compose -f docker/docker-compose.yml --profile analysis restart sonarqube"
echo "4. If it keeps failing, try: docker compose -f docker/docker-compose.yml --profile analysis down && docker compose -f docker/docker-compose.yml --profile analysis up -d sonarqube"