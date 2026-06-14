import { Video } from 'lucide-react';
import { Badge } from './Badge';
import type { TruthVideoScript } from '../types';

interface TruthVideoPreviewProps {
  script: TruthVideoScript;
}

export function TruthVideoPreview({ script }: TruthVideoPreviewProps) {
  const copy = async () => {
    await navigator.clipboard?.writeText(script.fullScript);
  };

  return (
    <section className="panel truth-video panel-gradient">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Truth Video Preview</span>
          <h2>{script.title}</h2>
        </div>
        <button className="ghost-button" type="button" onClick={copy}>
          复制短片文案
        </button>
      </div>
      <div className="truth-video-stage">
        <div className="digital-human" aria-hidden="true">
          <Video size={24} strokeWidth={1.5} />
        </div>
        <div>
          <Badge tone="blue">60秒岗位真相短片</Badge>
          <p>比赛版使用CSS数字人动效和分镜脚本预览，不依赖真实视频生成API。</p>
          <div className="trial-progress"><span style={{ width: '62%' }} /></div>
        </div>
      </div>
      <div className="video-segments">
        {script.segments.map((segment) => (
          <article key={segment.timeRange} className="card-lift">
            <strong>{segment.timeRange}</strong>
            <span>{segment.title}</span>
            <p>{segment.script}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
