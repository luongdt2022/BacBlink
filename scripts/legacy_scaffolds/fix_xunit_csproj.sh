#!/bin/bash
set -e
CSPROJ="SourceCode/backend/tests/NacenTech.Modules.Enterprise.Tests/NacenTech.Modules.Enterprise.Tests/NacenTech.Modules.Enterprise.Tests.csproj"
sed -i '' 's/Version="[^"]*"//g' "$CSPROJ"
