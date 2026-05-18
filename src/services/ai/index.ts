import { apiAiProvider } from './apiAiProvider';
import { mockAiProvider } from './mockAiProvider';

export type AiSource = 'deepseek' | 'mock';

export interface AiResult<T> {
  data: T;
  source: AiSource;
  fallback: boolean;
  errorMessage?: string;
}

const env = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
const useApi = env.env?.VITE_AI_MODE === 'api';

export const aiProvider = {
  async analyzeJob<T = unknown>(input: unknown): Promise<AiResult<T>> {
    if (!useApi) {
      const data = await mockAiProvider.analyzeJob(input);
      return { data: data as T, source: 'mock', fallback: false };
    }

    try {
      const data = await apiAiProvider.analyzeJob<T>(input);
      return { data, source: 'deepseek', fallback: false };
    } catch (error) {
      console.warn('[AI fallback] analyzeJob fallback to mock:', error);
      const data = await mockAiProvider.analyzeJob(input);
      return {
        data: data as T,
        source: 'mock',
        fallback: true,
        errorMessage: error instanceof Error ? error.message : 'unknown error',
      };
    }
  },

  async generateHrReport<T = unknown>(input: unknown): Promise<AiResult<T>> {
    if (!useApi) {
      const data = await mockAiProvider.generateHrReport();
      return { data: data as T, source: 'mock', fallback: false };
    }

    try {
      const data = await apiAiProvider.generateHrReport<T>(input);
      return { data, source: 'deepseek', fallback: false };
    } catch (error) {
      console.warn('[AI fallback] generateHrReport fallback to mock:', error);
      const data = await mockAiProvider.generateHrReport();
      return {
        data: data as T,
        source: 'mock',
        fallback: true,
        errorMessage: error instanceof Error ? error.message : 'unknown error',
      };
    }
  },
};
