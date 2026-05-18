const defaultBaseUrl = 'https://api.deepseek.com';

export async function createDeepseekChatCompletion(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens: number;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY');
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || defaultBaseUrl;
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: params.messages,
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: params.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== 'string') {
    throw new Error('DeepSeek returned empty content');
  }

  return content;
}
