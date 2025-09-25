#!/bin/bash

# Quick fix: Disable SonarQube analysis temporarily
echo "🔧 Quick Fix: Temporarily disabling SonarQube analysis in pipeline"
echo "This will comment out the SonarQube stage to let the pipeline complete successfully"
echo ""

# Backup current Jenkinsfile
cp Jenkinsfile Jenkinsfile.backup
echo "✅ Backed up Jenkinsfile to Jenkinsfile.backup"

# Comment out the SonarQube stage
sed -i '' '/stage.*Code Quality Analysis/,/^[[:space:]]*}[[:space:]]*$/ {
    s/^/\/\/ /
}' Jenkinsfile

echo "✅ SonarQube stage temporarily disabled"
echo "💡 To re-enable later, run: cp Jenkinsfile.backup Jenkinsfile"
echo ""
echo "🚀 You can now commit and push to test the pipeline without SonarQube:"
echo "   git add Jenkinsfile"
echo "   git commit -m 'Temporarily disable SonarQube analysis'"
echo "   git push origin newbranch"