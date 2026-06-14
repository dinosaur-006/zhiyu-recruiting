import { apiAiProvider } from './apiAiProvider';
import { mockAiProvider } from './mockAiProvider';

export type AiSource = 'deepseek' | 'mock';

export interface AiGenerationMeta {
  provider?: AiSource;
  model?: string;
  requestId?: string;
  latencyMs?: number;
  safetyHits?: string[];
  needsHumanReview?: boolean;
  createdAt: string;
  fallback?: boolean;
  errorMessage?: string;
}

export interface AiResult<T> {
  data: T;
  source: AiSource;
  fallback: boolean;
  errorMessage?: string;
  meta?: AiGenerationMeta;
}

interface ApiResponse<T> {
  data: T;
  meta?: AiGenerationMeta;
}

const env = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
const useApi = env.env?.VITE_AI_MODE === 'api';

export function unwrapApiResponse<T>(response: ApiResponse<T> | T): { data: T; meta?: AiGenerationMeta } {
  if (response && typeof response === 'object' && 'data' in response) {
    const wrapped = response as ApiResponse<T>;
    return {
      data: wrapped.data,
      meta: wrapped.meta,
    };
  }

  return { data: response as T };
}

export function createMockMeta(fallback: boolean, errorMessage?: string): AiGenerationMeta {
  return {
    provider: 'mock',
    fallback,
    errorMessage,
    createdAt: new Date().toISOString(),
  };
}

export const aiProvider = {
  async analyzeJob<T = unknown>(input: unknown): Promise<AiResult<T>> {
    if (!useApi) {
      const data = await mockAiProvider.analyzeJob(input);
      return { data: data as T, source: 'mock', fallback: false, meta: createMockMeta(false) };
    }

    try {
      const response = await apiAiProvider.analyzeJob<ApiResponse<T>>(input);
      const { data, meta } = unwrapApiResponse<T>(response);
      return {
        data,
        source: 'deepseek',
        fallback: false,
        meta: {
          ...meta,
          provider: 'deepseek',
          fallback: false,
          createdAt: meta?.createdAt ?? new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn('[AI fallback] analyzeJob fallback to mock:', error);
      const data = await mockAiProvider.analyzeJob(input);
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      return {
        data: data as T,
        source: 'mock',
        fallback: true,
        errorMessage,
        meta: createMockMeta(true, errorMessage),
      };
    }
  },

  async generateHrReport<T = unknown>(input: unknown): Promise<AiResult<T>> {
    if (!useApi) {
      const data = await mockAiProvider.generateHrReport();
      return { data: data as T, source: 'mock', fallback: false, meta: createMockMeta(false) };
    }

    try {
      const response = await apiAiProvider.generateHrReport<ApiResponse<T>>(input);
      const { data, meta } = unwrapApiResponse<T>(response);
      return {
        data,
        source: 'deepseek',
        fallback: false,
        meta: {
          ...meta,
          provider: 'deepseek',
          fallback: false,
          createdAt: meta?.createdAt ?? new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn('[AI fallback] generateHrReport fallback to mock:', error);
      const data = await mockAiProvider.generateHrReport();
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      return {
        data: data as T,
        source: 'mock',
        fallback: true,
        errorMessage,
        meta: createMockMeta(true, errorMessage),
      };
    }
  },

  async generateScenario<T = unknown>(input: unknown): Promise<AiResult<T>> {
    if (!useApi) {
      const data = await mockAiProvider.generateScenario();
      return { data: data as T, source: 'mock', fallback: false, meta: createMockMeta(false) };
    }

    try {
      const response = await apiAiProvider.generateScenario<ApiResponse<T>>(input);
      const { data, meta } = unwrapApiResponse<T>(response);
      return {
        data,
        source: 'deepseek',
        fallback: false,
        meta: {
          ...meta,
          provider: 'deepseek',
          fallback: false,
          createdAt: meta?.createdAt ?? new Date().toISOString(),
        },
      };
    } catch (error) {
      console.warn('[AI fallback] generateScenario fallback to mock:', error);
      const data = await mockAiProvider.generateScenario();
      const errorMessage = error instanceof Error ? error.message : 'unknown error';
      return {
        data: data as T,
        source: 'mock',
        fallback: true,
        errorMessage,
        meta: createMockMeta(true, errorMessage),
      };
    }
  },
};
