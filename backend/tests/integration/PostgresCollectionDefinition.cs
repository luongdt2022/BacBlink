using NacenTech.TestKit;
using Xunit;

namespace NacenTech.Tests.Integration;

/// <summary>
/// xUnit chỉ tìm `CollectionDefinition` trong cùng assembly với test, nên mỗi assembly test tích hợp
/// phải khai báo lại collection dùng `PostgresFixture` (fixture bản thân nó nằm ở test-kit dùng chung).
/// </summary>
[CollectionDefinition(PostgresCollection.Name)]
public sealed class IntegrationPostgresCollection : ICollectionFixture<PostgresFixture>;
