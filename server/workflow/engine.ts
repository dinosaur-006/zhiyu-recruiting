import { randomUUID } from 'node:crypto';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
export type NodeStage = 'INIT' | 'INTENT_EXTRACTION' | 'RADAR_CALCULATION' | 'EVIDENCE_ASSEMBLY' | 'MANUAL_GENERATION' | 'DONE';

export interface WorkflowContext {
  jobId: string;
  candidateId: string;
  sessionData: unknown;
  extractedIntent?: unknown;
  radarScores?: unknown;
  evidenceAnchors?: unknown;
  finalReport?: unknown;
  interviewManual?: unknown;
  errorLog?: string;
}

export interface TaskRecord {
  taskId: string;
  status: TaskStatus;
  currentStage: NodeStage;
  stageLabel: string;
  context: WorkflowContext;
  retryCount: number;
  createdAt: number;
}

export const taskRegistry = new Map<string, TaskRecord>();
export const deadLetterQueue: TaskRecord[] = [];

const stageLabels: Record<NodeStage, string> = {
  INIT: '正在初始化 AI 评测链路...',
  INTENT_EXTRACTION: '正在清洗对话切片与探索轨迹...',
  RADAR_CALCULATION: '正在驱动大模型提取 6 维能力雷达...',
  EVIDENCE_ASSEMBLY: '正在生成高光时刻与证据锚点...',
  MANUAL_GENERATION: '正在生成面试追问手册...',
  DONE: '报告生成完毕',
};

export function createTask(jobId: string, candidateId: string, sessionData: unknown): TaskRecord {
  const taskId = randomUUID();
  const record: TaskRecord = {
    taskId,
    status: 'PENDING',
    currentStage: 'INIT',
    stageLabel: stageLabels.INIT,
    context: { jobId, candidateId, sessionData },
    retryCount: 0,
    createdAt: Date.now(),
  };
  taskRegistry.set(taskId, record);
  return record;
}

export function updateStage(taskId: string, stage: NodeStage) {
  const task = taskRegistry.get(taskId);
  if (task) {
    task.currentStage = stage;
    task.stageLabel = stageLabels[stage];
  }
}
