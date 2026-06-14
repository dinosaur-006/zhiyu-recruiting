import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useReportGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState('');
  const navigate = useNavigate();

  const startGeneration = useCallback(async (candidateId: string, rawData: unknown) => {
    setIsGenerating(true);
    setProgressText('正在上传试岗数据...');

    try {
      const res = await fetch('/api/ai/submit-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawData),
      });
      const { taskId } = await res.json();

      const interval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/ai/task/${taskId}`);
          const status = await statusRes.json();

          if (status.stage) setProgressText(status.stage);

          if (status.status === 'COMPLETED') {
            clearInterval(interval);
            setIsGenerating(false);
            navigate(`/candidate/story/${candidateId}`);
          } else if (status.status === 'FAILED') {
            clearInterval(interval);
            setIsGenerating(false);
            setProgressText('生成失败，请重试');
          }
        } catch { /* network retry next tick */ }
      }, 2000);
    } catch (err) {
      console.error('Submit failed:', err);
      setIsGenerating(false);
      setProgressText('提交失败，请检查网络后重试');
    }
  }, [navigate]);

  return { isGenerating, progressText, startGeneration };
}
