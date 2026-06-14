const env = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
const API_BASE_URL = env.env?.VITE_API_BASE_URL || 'http://localhost:8787';

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

export const apiAiProvider = {
  analyzeJob<T = unknown>(input: unknown) {
    return postJson<T>('/api/ai/analyze-job', input);
  },

  generateHrReport<T = unknown>(input: unknown) {
    return postJson<T>('/api/ai/generate-hr-report', input);
  },

  generateScenario<T = unknown>(input: unknown) {
    return postJson<T>('/api/ai/generate-scenario', input);
  },

  workdayInteract<T = unknown>(input: unknown) {
    return postJson<T>('/api/ai/workday-sim/interact', input);
  },
};
