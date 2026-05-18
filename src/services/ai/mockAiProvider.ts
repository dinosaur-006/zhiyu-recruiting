import { parseJobDescription } from '../../mock/ai';
import type { JobInput } from '../../types';

const fallbackInput: JobInput = {
  title: '',
  department: '',
  location: '',
  salaryMin: 0,
  salaryMax: 0,
  education: '',
  experience: '',
  responsibilities: '',
  requirements: '',
  teamInfo: '',
  growthPath: '',
  interviewProcess: '',
  workload: '',
  challenges: '',
};

export const mockAiProvider = {
  async analyzeJob(input: unknown) {
    return parseJobDescription({ ...fallbackInput, ...(input as Partial<JobInput>) });
  },

  async generateHrReport() {
    return {};
  },
};
