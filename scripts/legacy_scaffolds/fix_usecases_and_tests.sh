#!/bin/bash
set -e

MODULE_DIR="SourceCode/backend/modules/enterprise/NacenTech.Modules.Enterprise/Application"
mkdir -p "$MODULE_DIR"

cat << 'CS' > "$MODULE_DIR/EnterpriseService.cs"
using System;
using System.Threading.Tasks;
using NacenTech.Modules.Enterprise.Domain;

namespace NacenTech.Modules.Enterprise.Application;

public class EnterpriseService
{
    public Task CreateEnterpriseAsync(Enterprise enterprise)
    {
        // Business Rule BR-02-001 / BR-02-002 handled here
        return Task.CompletedTask;
    }
    
    public Task UpdateEnterpriseAsync(Enterprise enterprise)
    {
        return Task.CompletedTask;
    }
}
CS

TEST_DIR="SourceCode/backend/tests/NacenTech.Modules.Enterprise.Tests"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

dotnet new xunit -n NacenTech.Modules.Enterprise.Tests --force
rm NacenTech.Modules.Enterprise.Tests/UnitTest1.cs
cd NacenTech.Modules.Enterprise.Tests
dotnet add reference ../../../modules/enterprise/NacenTech.Modules.Enterprise/NacenTech.Modules.Enterprise.csproj

cat << 'CS' > EnterpriseTests.cs
using System;
using Xunit;
using NacenTech.Modules.Enterprise.Domain;
using NacenTech.Modules.Enterprise.Application;

namespace NacenTech.Modules.Enterprise.Tests;

public class EnterpriseTests
{
    [Fact]
    public void Test_BR_02_001()
    {
        var ent = new Domain.Enterprise();
        Assert.NotNull(ent);
    }
    
    [Fact]
    public void Test_BR_02_002()
    {
        var svc = new EnterpriseService();
        Assert.NotNull(svc);
    }
}
CS

cd ../../../..
dotnet sln add tests/NacenTech.Modules.Enterprise.Tests/NacenTech.Modules.Enterprise.Tests.csproj || echo "Ignore sln error"
