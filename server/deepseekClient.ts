const defaultBaseUrl = 'https://api.deepseek.com';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // base delay, doubles each retry

async function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function createDeepseekChatCompletion(params: {
  model: string;
  messages: Array<{ role: string; content: string }>;
  maxTokens: number;
  retries?: number;
}) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('Missing DEEPSEEK_API_KEY');
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || defaultBaseUrl;
  const maxRetries = params.retries ?? MAX_RETRIES;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.warn(`[DeepSeek] Retry attempt ${attempt}/${maxRetries} after ${delay}ms`);
      await sleep(delay);
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 120s timeout for long-running analyses

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
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const status = response.status;
        // Don't retry on 4xx client errors (except 429 rate limit)
        if (status !== 429 && status >= 400 && status < 500) {
          throw new Error(`DeepSeek request failed: ${status}`);
        }
        throw new Error(`DeepSeek request failed: ${status} (retryable)`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error('DeepSeek returned empty content (retryable)');
      }

      return content;
    } catch (err: any) {
      lastError = err;
      // Don't retry on abort/timeout if it's the last attempt
      if (err.name === 'AbortError' && attempt >= maxRetries) {
        throw new Error('DeepSeek request timed out after 30s');
      }
      // Don't retry non-retryable errors
      if (err.message && !err.message.includes('retryable') && !err.message.includes('timed out') && err.name !== 'AbortError') {
        throw err;
      }
    }
  }

  throw lastError || new Error('DeepSeek request failed after retries');
}

export async function* streamDeepSeekChat(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  model: string = process.env.DEEPSEEK_MODEL_FAST || 'deepseek-v4-flash',
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('Missing DEEPSEEK_API_KEY');

  const baseUrl = process.env.DEEPSEEK_BASE_URL || defaultBaseUrl;
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: true,
      temperature: 0.7,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`DeepSeek API Error: ${response.statusText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data: ')) continue;

      const dataStr = trimmed.replace('data: ', '');
      if (dataStr === '[DONE]') return;

      try {
        const parsed = JSON.parse(dataStr);
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) yield token;
      } catch { /* skip parse errors */ }
    }
  }
}
