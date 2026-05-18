import { createServer } from 'node:http';
import { createDeepseekChatCompletion } from './deepseekClient.ts';
import { buildAnalyzeJobPrompt } from './prompts/analyzeJobPrompt.ts';
import { buildGenerateHrReportPrompt } from './prompts/generateHrReportPrompt.ts';
import { parseJsonContent, validateHrReport, validateJobAnalysis } from './schemas.ts';
import { sanitizeAiOutput } from './safety.ts';

const port = Number(process.env.PORT || 8787);
const modelFast = process.env.DEEPSEEK_MODEL_FAST || 'deepseek-v4-flash';
const modelPro = process.env.DEEPSEEK_MODEL_PRO || 'deepseek-v4-pro';

const server = createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(request);

    if (request.url === '/api/ai/analyze-job') {
      const content = await createDeepseekChatCompletion({
        model: modelFast,
        messages: buildAnalyzeJobPrompt(body),
        maxTokens: 3000,
      });
      const parsed = validateJobAnalysis(parseJsonContent(content));
      sendJson(response, 200, sanitizeAiOutput(parsed));
      return;
    }

    if (request.url === '/api/ai/generate-hr-report') {
      const content = await createDeepseekChatCompletion({
        model: modelPro,
        messages: buildGenerateHrReportPrompt(body),
        maxTokens: 4000,
      });
      const parsed = validateHrReport(parseJsonContent(content));
      sendJson(response, 200, sanitizeAiOutput(parsed));
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error('[ai server error]', error);
    sendJson(response, 500, { error: 'AI request failed' });
  }
});

server.listen(port, () => {
  console.log(`AI server running at http://localhost:${port}`);
});

function readJsonBody(request: any): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf8');
      if (raw.length > 2 * 1024 * 1024) {
        reject(new Error('Request body too large'));
      }
    });
    request.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('Invalid request JSON'));
      }
    });
    request.on('error', reject);
  });
}

function sendJson(response: any, status: number, body: unknown) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}
