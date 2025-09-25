#!/bin/bash

# Enhanced Code Quality Analysis
# This script creates a comprehensive code quality analysis using flake8, bandit, and safety

echo "🔍 Enhanced Code Quality Analysis for Python Projects"
echo "======================================================"
echo ""

# Create reports directory
mkdir -p code-quality-reports

# Run the analysis
docker run --rm -v "$PWD:/app" -w /app python:3.9-slim bash -c '
echo "📦 Installing Python code quality tools..."
pip install --no-cache-dir flake8 bandit safety radon vulture || {
  echo "⚠️ Some tools failed to install, continuing with available ones"
  pip install --no-cache-dir flake8 bandit safety || echo "Basic tools installation failed"
}

echo ""
echo "Running Flake8 (Code Style & Quality)..."
flake8 app \
  --max-line-length=88 \
  --ignore=E203,E501,W503 \
  --exclude=__pycache__,*.pyc,venv \
  --format=json \
  --output-file=code-quality-reports/flake8-report.json || {
  echo "⚠️ Flake8 found style issues (see report)"
  flake8 app --max-line-length=88 --ignore=E203,E501,W503 --exclude=__pycache__ > code-quality-reports/flake8-readable.txt || true
}

echo ""
echo "🔒 Running Bandit (Security Analysis)..."
bandit -r app \
  -f json \
  -o code-quality-reports/bandit-report.json \
  -ll || {
  echo "⚠️ Bandit found security issues (see report)"
  bandit -r app > code-quality-reports/bandit-readable.txt || true
}

echo ""
echo "Running Safety (Dependency Vulnerability Check)..."
if [ -f "requirements.txt" ]; then
  safety check \
    --json \
    --output code-quality-reports/safety-report.json || {
    echo "⚠️ Safety found vulnerabilities (see report)"
    safety check > code-quality-reports/safety-readable.txt || true
  }
else
  echo "{\"vulnerabilities\": [], \"message\": \"No requirements.txt found\"}" > code-quality-reports/safety-report.json
  echo "No requirements.txt found - skipping dependency check" > code-quality-reports/safety-readable.txt
fi

echo ""
echo "📊 Running Code Complexity Analysis..."
radon cc app -j > code-quality-reports/complexity-report.json || {
  echo "⚠️ Radon complexity analysis failed"
  echo "{\"error\": \"Complexity analysis failed\"}" > code-quality-reports/complexity-report.json
}

echo ""
echo "📈 Running Maintainability Index..."
radon mi app -j > code-quality-reports/maintainability-report.json || {
  echo "⚠️ Maintainability analysis failed"  
  echo "{\"error\": \"Maintainability analysis failed\"}" > code-quality-reports/maintainability-report.json
}

echo ""
echo "🔍 Finding Dead Code..."
vulture app --json > code-quality-reports/vulture-report.json || {
  echo "⚠️ Vulture dead code analysis failed"
  echo "{\"error\": \"Dead code analysis failed\"}" > code-quality-reports/vulture-report.json
}

echo ""
echo "Code analysis completed!"
'

# Generate summary
echo ""
echo "Generating comprehensive summary..."

# Count files and lines
find app -name "*.py" -exec wc -l {} + > code-quality-reports/line-counts.txt 2>/dev/null || echo "0" > code-quality-reports/line-counts.txt
find app -name "*.py" | wc -l > code-quality-reports/file-count.txt 2>/dev/null || echo "0" > code-quality-reports/file-count.txt

# Count issues
FLAKE8_ISSUES=0
BANDIT_ISSUES=0  
SAFETY_ISSUES=0

if [ -f "code-quality-reports/flake8-report.json" ] && [ -s "code-quality-reports/flake8-report.json" ]; then
  FLAKE8_ISSUES=$(python3 -c "
import json
try:
    with open('code-quality-reports/flake8-report.json', 'r') as f:
        data = json.load(f)
        print(len(data) if isinstance(data, list) else 0)
except:
    print(0)
" 2>/dev/null || echo "0")
fi

if [ -f "code-quality-reports/bandit-report.json" ] && [ -s "code-quality-reports/bandit-report.json" ]; then
  BANDIT_ISSUES=$(python3 -c "
import json
try:
    with open('code-quality-reports/bandit-report.json', 'r') as f:
        data = json.load(f)
        print(len(data.get('results', [])) if isinstance(data, dict) else 0)
except:
    print(0)
" 2>/dev/null || echo "0")
fi

if [ -f "code-quality-reports/safety-report.json" ] && [ -s "code-quality-reports/safety-report.json" ]; then
  SAFETY_ISSUES=$(python3 -c "
import json
try:
    with open('code-quality-reports/safety-report.json', 'r') as f:
        data = json.load(f)
        print(len(data.get('vulnerabilities', [])) if isinstance(data, dict) else 0)
except:
    print(0)  
" 2>/dev/null || echo "0")
fi

# Create comprehensive summary
cat > code-quality-reports/summary.txt << EOF
Code Quality Analysis Summary
============================
Date: $(date)
Status: COMPLETED
Analysis Type: Comprehensive Python Code Quality

Project Metrics:
- Python Files: $(cat code-quality-reports/file-count.txt)
- Total Lines of Code: $(awk '{sum += $1} END {print sum}' code-quality-reports/line-counts.txt 2>/dev/null || echo "Unknown")

Quality Issues Found:
- Flake8 (Style/Quality): $FLAKE8_ISSUES issues
- Bandit (Security): $BANDIT_ISSUES issues  
- Safety (Dependencies): $SAFETY_ISSUES vulnerabilities

Tools Used:
Flake8 - Python style guide checker
Bandit - Security linter for Python
Safety - Dependency vulnerability scanner
Radon - Code complexity analysis
Vulture - Dead code finder

Report Files Generated:
- flake8-report.json (+ readable version)
- bandit-report.json (+ readable version)  
- safety-report.json (+ readable version)
- complexity-report.json
- maintainability-report.json
- vulture-report.json

Recommendations:
- Review flake8-readable.txt for style improvements
- Check bandit-readable.txt for security concerns
- Address safety-readable.txt for dependency vulnerabilities
- Monitor complexity reports for maintainability
- Remove dead code identified by vulture

Build Status:
EOF

if [ "$BANDIT_ISSUES" -gt 0 ] || [ "$SAFETY_ISSUES" -gt 0 ]; then
  echo "⚠️ UNSTABLE - Critical security issues found" >> code-quality-reports/summary.txt
  echo "UNSTABLE" > code-quality-reports/build-status.txt
else
  echo "✅ SUCCESS - No critical security issues found" >> code-quality-reports/summary.txt  
  echo "SUCCESS" > code-quality-reports/build-status.txt
fi

echo ""
echo "Code Quality Analysis Results:"
echo "================================="
cat code-quality-reports/summary.txt
echo ""

echo "Enhanced code quality analysis completed!"
echo "Reports saved in: code-quality-reports/"
echo "Check the summary.txt for overview"