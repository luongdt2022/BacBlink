using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using NacenTech.Kernel.Application;
using NacenTech.Modules.Integration.Application;

namespace NacenTech.Modules.Integration.Infrastructure;

/// <summary>
/// Provider abstraction theo D2-112/D2-14: allowlist provider, không business logic trong adapter.
/// Dùng giao thức OpenAI chat/completions (OpenAI và OpenRouter dùng chung shape).
/// </summary>
public sealed class OpenAiCompatibleCompletionClient(HttpClient http, IOptions<AiProviderOptions> options) : ICompletionClient
{
    private readonly AiProviderOptions _options = options.Value;

    public Task<CompletionResult> CompleteAsync(string prompt, string? provider, string? model, double? temperature, int? maxTokens, CancellationToken ct)
        => ChatAsync([new ChatMessage("user", prompt)], provider, model, temperature, maxTokens, ct);

    public async Task<CompletionResult> ChatAsync(IReadOnlyList<ChatMessage> messages, string? provider, string? model, double? temperature, int? maxTokens, CancellationToken ct)
    {
        var name = (provider ?? _options.DefaultProvider).ToLowerInvariant();
        var endpoint = name switch
        {
            "openai" => _options.OpenAi,
            "openrouter" => _options.OpenRouter,
            _ => throw new InvalidOperationException($"AI provider không nằm trong allowlist: {name}"),
        };
        if (string.IsNullOrWhiteSpace(endpoint.ApiKey))
            throw new InvalidOperationException($"AI provider {name} chưa cấu hình ApiKey");

        var request = new HttpRequestMessage(HttpMethod.Post, $"{endpoint.BaseUrl.TrimEnd('/')}/chat/completions")
        {
            Content = JsonContent.Create(new
            {
                model = model ?? endpoint.DefaultModel,
                messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray(),
                temperature,
                max_tokens = maxTokens,
            }),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", endpoint.ApiKey);

        using var response = await http.SendAsync(request, ct);
        var body = await response.Content.ReadAsStringAsync(ct);
        if (!response.IsSuccessStatusCode)
            throw new InvalidOperationException($"AI provider {name} HTTP {(int)response.StatusCode}: {body}");

        var parsed = JsonSerializer.Deserialize<ChatCompletionResponse>(body, JsonOptions)
                     ?? throw new InvalidOperationException($"AI provider {name} trả về body rỗng");
        var text = parsed.Choices.FirstOrDefault()?.Message?.Content ?? string.Empty;
        return new CompletionResult(text, parsed.Model ?? model ?? endpoint.DefaultModel, name,
            parsed.Usage?.PromptTokens, parsed.Usage?.CompletionTokens, parsed.Usage?.TotalTokens);
    }

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    private sealed record ChatCompletionResponse(
        [property: JsonPropertyName("model")] string? Model,
        [property: JsonPropertyName("choices")] List<Choice> Choices,
        [property: JsonPropertyName("usage")] Usage? Usage);

    private sealed record Choice([property: JsonPropertyName("message")] ChoiceMessage? Message);

    private sealed record ChoiceMessage([property: JsonPropertyName("content")] string? Content);

    private sealed record Usage(
        [property: JsonPropertyName("prompt_tokens")] int? PromptTokens,
        [property: JsonPropertyName("completion_tokens")] int? CompletionTokens,
        [property: JsonPropertyName("total_tokens")] int? TotalTokens);
}
