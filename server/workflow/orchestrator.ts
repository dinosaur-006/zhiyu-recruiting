import { taskRegistry, deadLetterQueue, updateStage } from './engine.ts';
import type { TaskRecord, NodeStage } from './engine.ts';
import { intentExtractionNode, radarCalculationNode, evidenceAssemblyNode, interviewManualNode } from './nodes.ts';

const MAX_RETRIES = 2;

export async function startWorkflow(taskId: string) {
  const task = taskRegistry.get(taskId);
  if (!task) return;

  task.status = 'RUNNING';

  try {
    while (task.currentStage !== 'DONE') {
      switch (task.currentStage) {
        case 'INIT':
          updateStage(taskId, 'INTENT_EXTRACTION');
          break;

        case 'INTENT_EXTRACTION':
          task.context = await intentExtractionNode(task.context);
          updateStage(taskId, 'RADAR_CALCULATION');
          break;

        case 'RADAR_CALCULATION':
          task.context = await radarCalculationNode(task.context);
          updateStage(taskId, 'EVIDENCE_ASSEMBLY');
          break;

        case 'EVIDENCE_ASSEMBLY':
          task.context = await evidenceAssemblyNode(task.context);
          updateStage(taskId, 'MANUAL_GENERATION');
          break;

        case 'MANUAL_GENERATION':
          task.context = await interviewManualNode(task.context);
          updateStage(taskId, 'DONE');
          task.status = 'COMPLETED';
          break;
      }
    }
    console.log(`[Orchestrator] Task ${taskId} completed. Score: ${(task.context.finalReport as any)?.matchScore}`);
  } catch (err: any) {
    console.error(`[Orchestrator] Node error (Task: ${taskId}, Stage: ${task.currentStage})`, err.message);

    if (task.retryCount < MAX_RETRIES) {
      task.retryCount++;
      console.log(`[Orchestrator] Retry ${task.retryCount}/${MAX_RETRIES}...`);
      setTimeout(() => startWorkflow(taskId), 1000);
    } else {
      task.status = 'FAILED';
      task.context.errorLog = err.message;
      deadLetterQueue.push(task);
      console.error(`[Orchestrator] Task exhausted retries, moved to DLQ.`);
    }
  }
}
