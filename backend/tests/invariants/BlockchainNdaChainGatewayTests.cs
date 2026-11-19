using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Options;
using NacenTech.Modules.Blockchain.Application.Ports;
using NacenTech.Modules.Blockchain.Infrastructure.Adapters;
using Shouldly;
using Xunit;

namespace NacenTech.Tests.Invariants;

public class BlockchainNdaChainGatewayTests
{
    private sealed class MockHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(handler(request));
        }
    }

    [Fact]
    public void GenerateNdaDid_Returns_Compliant_Did_Format()
    {
        var options = Options.Create(new NdaChainOptions { MasterTaxCode = "0100109106" });
        var adapter = new NdaChainGatewayAdapter(new HttpClient(), options);

        var entityId = Guid.Parse("01934336-1234-7890-abcd-ef0123456789");
        var did = adapter.GenerateNdaDid("0100109106", entityId);

        did.ShouldBe("did:nda:0100109106:01934336-1234-7890-abcd-ef0123456789");
    }

    [Fact]
    public void GenerateNdaTraceUid_Returns_Correct_Identifier()
    {
        var options = Options.Create(new NdaChainOptions());
        var adapter = new NdaChainGatewayAdapter(new HttpClient(), options);

        var uid = adapter.GenerateNdaTraceUid("SELLER_OFFER", "TECH-2026-001", 42);
        uid.ShouldBe("NDATrace-SELLER_OFFER-TECH-2026-001-B42");
    }

    [Fact]
    public void EncodeAnchorMerkleRootAbi_Encodes_Valid_EVM_Payload()
    {
        var options = Options.Create(new NdaChainOptions());
        var adapter = new NdaChainGatewayAdapter(new HttpClient(), options);

        var merkleRoot = "0x" + new string('a', 64);
        var did = "did:nda:0100109106:test-guid";
        var traceUid = "NDATrace-TEST-01-B1";

        var encoded = adapter.EncodeAnchorMerkleRootAbi(merkleRoot, 1, did, traceUid);

        // Selector là 4 bytes đầu
        encoded.Length.ShouldBeGreaterThan(100);
        encoded[0].ShouldBe((byte)0x6e);
        encoded[1].ShouldBe((byte)0x9f);
        encoded[2].ShouldBe((byte)0x06);
        encoded[3].ShouldBe((byte)0x12);
    }

    [Fact]
    public async Task GetStatusAsync_WhenDisabled_Returns_Standby_Status()
    {
        var options = Options.Create(new NdaChainOptions { Enabled = false });
        var adapter = new NdaChainGatewayAdapter(new HttpClient(), options);

        var status = await adapter.GetStatusAsync();
        status.GatewayType.ShouldBe("NDACHAIN_NATIONAL_GATEWAY");
        status.IsConnected.ShouldBeFalse();
        status.EndpointOrMode.ShouldContain("STANDBY");
    }

    [Fact]
    public async Task AnchorMerkleRootAsync_WhenEnabled_Sends_Valid_JsonRpc_Request()
    {
        bool requestReceived = false;
        var handler = new MockHttpMessageHandler(req =>
        {
            requestReceived = true;
            req.Method.ShouldBe(HttpMethod.Post);
            
            var responseJson = JsonSerializer.Serialize(new
            {
                jsonrpc = "2.0",
                id = 1,
                result = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
            });

            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(responseJson, System.Text.Encoding.UTF8, "application/json")
            };
        });

        var client = new HttpClient(handler);
        var options = Options.Create(new NdaChainOptions
        {
            Enabled = true,
            RpcEndpoint = "https://mock-ndachain.gov.vn/rpc",
            TimeoutMs = 3000
        });

        var adapter = new NdaChainGatewayAdapter(client, options);

        var payload = new AnchorMerkleRootPayload(
            BlockNumber: 1,
            MerkleRoot: "0x" + new string('e', 64),
            TxCount: 5,
            PreviousHash: "0x" + new string('0', 64),
            Timestamp: DateTimeOffset.UtcNow
        );

        var result = await adapter.AnchorMerkleRootAsync(payload);

        requestReceived.ShouldBeTrue();
        result.IsSuccess.ShouldBeTrue();
        result.TxHash.ShouldBe("0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef");
    }
}
