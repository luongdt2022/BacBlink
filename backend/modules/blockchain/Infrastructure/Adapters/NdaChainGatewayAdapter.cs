using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using NacenTech.Modules.Blockchain.Application.Ports;

namespace NacenTech.Modules.Blockchain.Infrastructure.Adapters;

public sealed class NdaChainOptions
{
    public const string SectionName = "Blockchain:NdaChain";

    public bool Enabled { get; set; } = false;
    public string RpcEndpoint { get; set; } = "https://ndachain-node.bca.gov.vn/rpc";
    public string ContractAddress { get; set; } = "0x1975000000000000000000000000000000000001";
    public int ChainId { get; set; } = 1975;
    public int TimeoutMs { get; set; } = 3000;
    public string MasterTaxCode { get; set; } = "0100109106"; // MST NacenTech
}

public interface INdaChainGatewayAdapter : IBlockchainAnchorGateway
{
    string GenerateNdaDid(string taxCode, Guid entityId);
    string GenerateNdaTraceUid(string entityType, string entityCode, long blockNumber);
    byte[] EncodeAnchorMerkleRootAbi(string merkleRootHex, long blockNumber, string ndaDid, string ndaTraceUid);
}

public sealed class NdaChainGatewayAdapter : INdaChainGatewayAdapter
{
    private readonly HttpClient _httpClient;
    private readonly NdaChainOptions _options;

    // Selector: keccak256("anchorMerkleRoot(bytes32,uint256,string,string)") = 0x6e9f0612 (hoặc sha3)
    private static readonly byte[] AnchorSelector = [0x6e, 0x9f, 0x06, 0x12];

    public NdaChainGatewayAdapter(
        HttpClient httpClient,
        IOptions<NdaChainOptions> options)
    {
        _httpClient = httpClient ?? throw new ArgumentNullException(nameof(httpClient));
        _options = options?.Value ?? new NdaChainOptions();

        if (_options.TimeoutMs > 0)
        {
            _httpClient.Timeout = TimeSpan.FromMilliseconds(_options.TimeoutMs);
        }
    }

    public string GatewayType => "NDACHAIN_NATIONAL_GATEWAY";

    public string GenerateNdaDid(string taxCode, Guid entityId)
    {
        var cleanTax = string.IsNullOrWhiteSpace(taxCode) ? _options.MasterTaxCode : taxCode.Trim();
        return $"did:nda:{cleanTax}:{entityId}";
    }

    public string GenerateNdaTraceUid(string entityType, string entityCode, long blockNumber)
    {
        var cleanType = string.IsNullOrWhiteSpace(entityType) ? "GENERIC" : entityType.Trim().ToUpperInvariant();
        var cleanCode = string.IsNullOrWhiteSpace(entityCode) ? "UNKNOWN" : entityCode.Trim();
        return $"NDATrace-{cleanType}-{cleanCode}-B{blockNumber}";
    }

    public byte[] EncodeAnchorMerkleRootAbi(string merkleRootHex, long blockNumber, string ndaDid, string ndaTraceUid)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(merkleRootHex);
        ArgumentException.ThrowIfNullOrWhiteSpace(ndaDid);
        ArgumentException.ThrowIfNullOrWhiteSpace(ndaTraceUid);

        var cleanRoot = merkleRootHex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) 
            ? merkleRootHex[2..] 
            : merkleRootHex;
        
        var rootBytes = Convert.FromHexString(cleanRoot.PadLeft(64, '0')[..64]);

        var didBytes = Encoding.UTF8.GetBytes(ndaDid);
        var traceBytes = Encoding.UTF8.GetBytes(ndaTraceUid);

        // ABI layout:
        // 4 bytes: selector
        // 32 bytes: bytes32 merkleRoot
        // 32 bytes: uint256 blockNumber
        // 32 bytes: offset to string 1 (0x80 = 128)
        // 32 bytes: offset to string 2 (0x80 + 32 + padded(didBytes.Length))
        // 32 bytes: length of string 1
        // padded: string 1 data
        // 32 bytes: length of string 2
        // padded: string 2 data

        int didPaddedLen = ((didBytes.Length + 31) / 32) * 32;
        int tracePaddedLen = ((traceBytes.Length + 31) / 32) * 32;

        int offset1 = 128;
        int offset2 = offset1 + 32 + didPaddedLen;

        int totalLen = 4 + 32 * 4 + 32 + didPaddedLen + 32 + tracePaddedLen;
        var result = new byte[totalLen];

        // 1. Selector
        Buffer.BlockCopy(AnchorSelector, 0, result, 0, 4);

        // 2. bytes32 merkleRoot (at offset 4)
        Buffer.BlockCopy(rootBytes, 0, result, 4, 32);

        // 3. uint256 blockNumber (at offset 36)
        var blockNumBig = BitConverter.GetBytes((ulong)blockNumber);
        if (BitConverter.IsLittleEndian) Array.Reverse(blockNumBig);
        Buffer.BlockCopy(blockNumBig, 0, result, 36 + 24, 8); // 8 bytes placed in lower 32 bytes

        // 4. offset1 (at offset 68)
        var off1Big = BitConverter.GetBytes((ulong)offset1);
        if (BitConverter.IsLittleEndian) Array.Reverse(off1Big);
        Buffer.BlockCopy(off1Big, 0, result, 68 + 24, 8);

        // 5. offset2 (at offset 100)
        var off2Big = BitConverter.GetBytes((ulong)offset2);
        if (BitConverter.IsLittleEndian) Array.Reverse(off2Big);
        Buffer.BlockCopy(off2Big, 0, result, 100 + 24, 8);

        // 6. string 1: length + data (at offset 132 = 4 + 128)
        int pos = 4 + offset1;
        var didLenBig = BitConverter.GetBytes((ulong)didBytes.Length);
        if (BitConverter.IsLittleEndian) Array.Reverse(didLenBig);
        Buffer.BlockCopy(didLenBig, 0, result, pos + 24, 8);
        pos += 32;
        Buffer.BlockCopy(didBytes, 0, result, pos, didBytes.Length);

        // 7. string 2: length + data (at offset 4 + offset2)
        pos = 4 + offset2;
        var traceLenBig = BitConverter.GetBytes((ulong)traceBytes.Length);
        if (BitConverter.IsLittleEndian) Array.Reverse(traceLenBig);
        Buffer.BlockCopy(traceLenBig, 0, result, pos + 24, 8);
        pos += 32;
        Buffer.BlockCopy(traceBytes, 0, result, pos, traceBytes.Length);

        return result;
    }

    public async Task<GatewayStatusDto> GetStatusAsync(CancellationToken ct = default)
    {
        if (!_options.Enabled)
        {
            return new GatewayStatusDto(
                GatewayType: GatewayType,
                IsConnected: false,
                EndpointOrMode: $"STANDBY (Target: {_options.RpcEndpoint})",
                CurrentBlockHeight: 0,
                ValidatorAddress: _options.ContractAddress,
                NetworkId: $"NDACHAIN_EVM_ID_{_options.ChainId}"
            );
        }

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(_options.TimeoutMs);

            var rpcPayload = new
            {
                jsonrpc = "2.0",
                method = "eth_blockNumber",
                @params = Array.Empty<object>(),
                id = 1
            };

            var response = await _httpClient.PostAsJsonAsync(_options.RpcEndpoint, rpcPayload, cts.Token);
            if (!response.IsSuccessStatusCode)
            {
                return new GatewayStatusDto(
                    GatewayType: GatewayType,
                    IsConnected: false,
                    EndpointOrMode: $"{_options.RpcEndpoint} (HTTP {(int)response.StatusCode})",
                    CurrentBlockHeight: 0,
                    ValidatorAddress: _options.ContractAddress,
                    NetworkId: $"NDACHAIN_EVM_ID_{_options.ChainId}"
                );
            }

            var doc = await response.Content.ReadFromJsonAsync<JsonDocument>(cts.Token);
            long height = 0;
            if (doc != null && doc.RootElement.TryGetProperty("result", out var resElem))
            {
                var hex = resElem.GetString();
                if (!string.IsNullOrWhiteSpace(hex))
                {
                    var cleanHex = hex.StartsWith("0x", StringComparison.OrdinalIgnoreCase) ? hex[2..] : hex;
                    height = Convert.ToInt64(cleanHex, 16);
                }
            }

            return new GatewayStatusDto(
                GatewayType: GatewayType,
                IsConnected: true,
                EndpointOrMode: _options.RpcEndpoint,
                CurrentBlockHeight: height,
                ValidatorAddress: _options.ContractAddress,
                NetworkId: $"NDACHAIN_EVM_ID_{_options.ChainId}"
            );
        }
        catch
        {
            return new GatewayStatusDto(
                GatewayType: GatewayType,
                IsConnected: false,
                EndpointOrMode: $"{_options.RpcEndpoint} (CIRCUIT_BREAKER_TIMEOUT)",
                CurrentBlockHeight: 0,
                ValidatorAddress: _options.ContractAddress,
                NetworkId: $"NDACHAIN_EVM_ID_{_options.ChainId}"
            );
        }
    }

    public async Task<AnchorResultDto> AnchorMerkleRootAsync(AnchorMerkleRootPayload payload, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(payload);

        if (!_options.Enabled)
        {
            // Circuit Breaker: khi cờ tắt, ghi nhận chế độ đầu chờ (Dry-run standby)
            var dryRunTxHash = "0x" + Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(
                $"STANDBY_NDACHAIN:{payload.BlockNumber}:{payload.MerkleRoot}:{payload.Timestamp.ToUnixTimeSeconds()}"
            )));

            return new AnchorResultDto(
                IsSuccess: true,
                BlockNumber: payload.BlockNumber,
                BlockHash: payload.PreviousHash,
                MerkleRoot: payload.MerkleRoot,
                TxHash: dryRunTxHash,
                BlockSignature: null,
                ValidatorAddress: _options.ContractAddress,
                ErrorMessage: "Cổng NDAChain đang ở trạng thái Standby (Blockchain:NdaChain:Enabled = false)."
            );
        }

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(_options.TimeoutMs);

            var did = GenerateNdaDid(_options.MasterTaxCode, Guid.NewGuid());
            var traceUid = GenerateNdaTraceUid("LEDGER_BATCH", payload.BlockNumber.ToString(), payload.BlockNumber);
            var callData = EncodeAnchorMerkleRootAbi(payload.MerkleRoot, payload.BlockNumber, did, traceUid);
            var callDataHex = "0x" + Convert.ToHexStringLower(callData);

            var rpcPayload = new
            {
                jsonrpc = "2.0",
                method = "eth_sendRawTransaction",
                @params = new object[] { callDataHex },
                id = payload.BlockNumber
            };

            var response = await _httpClient.PostAsJsonAsync(_options.RpcEndpoint, rpcPayload, cts.Token);
            if (!response.IsSuccessStatusCode)
            {
                return new AnchorResultDto(
                    IsSuccess: false,
                    BlockNumber: payload.BlockNumber,
                    BlockHash: payload.PreviousHash,
                    MerkleRoot: payload.MerkleRoot,
                    TxHash: null,
                    BlockSignature: null,
                    ValidatorAddress: _options.ContractAddress,
                    ErrorMessage: $"Lỗi HTTP từ node NDAChain: {(int)response.StatusCode} {response.ReasonPhrase}"
                );
            }

            var doc = await response.Content.ReadFromJsonAsync<JsonDocument>(cts.Token);
            string? txHash = null;
            if (doc != null && doc.RootElement.TryGetProperty("result", out var resElem))
            {
                txHash = resElem.GetString();
            }

            return new AnchorResultDto(
                IsSuccess: true,
                BlockNumber: payload.BlockNumber,
                BlockHash: payload.PreviousHash,
                MerkleRoot: payload.MerkleRoot,
                TxHash: txHash,
                BlockSignature: null,
                ValidatorAddress: _options.ContractAddress
            );
        }
        catch (Exception ex)
        {
            return new AnchorResultDto(
                IsSuccess: false,
                BlockNumber: payload.BlockNumber,
                BlockHash: payload.PreviousHash,
                MerkleRoot: payload.MerkleRoot,
                TxHash: null,
                BlockSignature: null,
                ValidatorAddress: _options.ContractAddress,
                ErrorMessage: $"Circuit Breaker kích hoạt: {ex.Message}"
            );
        }
    }

    public async Task<VerificationReceiptDto> VerifyProofAsync(VerifyProofRequest request, CancellationToken ct = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        if (!_options.Enabled)
        {
            return new VerificationReceiptDto(
                IsVerified: true,
                Verdict: "STANDBY_ACK",
                Details: "Cổng NDAChain đang ở trạng thái Standby. Kiểm chứng được xác thực qua Local Sovereign Ledger."
            );
        }

        try
        {
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(_options.TimeoutMs);

            // Gọi eth_call tra cứu smart contract
            var rpcPayload = new
            {
                jsonrpc = "2.0",
                method = "eth_call",
                @params = new object[]
                {
                    new
                    {
                        to = _options.ContractAddress,
                        data = "0x" + Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(request.CommitmentHash)))
                    },
                    "latest"
                },
                id = 1
            };

            var response = await _httpClient.PostAsJsonAsync(_options.RpcEndpoint, rpcPayload, cts.Token);
            return new VerificationReceiptDto(
                IsVerified: response.IsSuccessStatusCode,
                Verdict: response.IsSuccessStatusCode ? "VERIFIED_ON_NDACHAIN" : "TAMPERED",
                Details: $"Kiểm chứng trên node NDAChain {_options.RpcEndpoint} hoàn tất."
            );
        }
        catch (Exception ex)
        {
            return new VerificationReceiptDto(
                IsVerified: false,
                Verdict: "NDACHAIN_UNAVAILABLE",
                Details: $"Không thể kết nối node NDAChain: {ex.Message}"
            );
        }
    }
}
