import { Badge } from './Badge';
import { Panel } from './Panel';
import { buildTrustDimContext } from '../mock/ai';
import type { CandidateTrustIndex } from '../types';

const LABELS: Record<keyof CandidateTrustIndex['dimensions'], string> = {
  jobInfoClarity: '岗位信息清晰度', salaryCertainty: '薪资沟通确定性', teamTrust: '团队信任感',
  growthCredibility: '成长路径可信度', rhythmAcceptance: '工作节奏接受度', aiTransparency: 'AI流程透明度',
  interviewWillingness: '面试投入意愿',
};

export function CandidateTrustIndexPanel({ trustIndex }: { trustIndex: CandidateTrustIndex }) {
  return (
    <Panel eyebrow="Candidate Trust Index" title="候选人信任指数" subtitle={trustIndex.explanation}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {Object.entries(trustIndex.dimensions).map(([k, v]) => {
          const color = v < 40 ? 'var(--color-accent)' : v <= 70 ? 'var(--color-warning)' : 'var(--color-negative)';
          return (
            <div key={k}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--color-ink-soft)' }}>{LABELS[k as keyof CandidateTrustIndex['dimensions']]}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700, color }}>{v}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'var(--color-border)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: color, width: `${v}%`, transition: 'width 0.5s' }} />
              </div>
              <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-muted)', marginTop: 2, lineHeight: 'var(--leading-body)' }}>{buildTrustDimContext(k, v)}</div>
            </div>
          );
        })}
      </div>
      <div className="trust-gap-row">
        <div style={{ flex: 1, minWidth: 200 }}><strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', display: 'block', marginBottom: 'var(--space-2)' }}>当前信任缺口</strong><div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>{trustIndex.gapReasons.map((r) => <Badge key={r} tone="amber">{r}</Badge>)}</div></div>
        <div style={{ flex: 1, minWidth: 200 }}><strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', display: 'block', marginBottom: 'var(--space-2)' }}>邀约前修复建议</strong><ul className="clean-list">{trustIndex.repairSuggestions.map((r) => <li key={r}>{r}</li>)}</ul></div>
      </div>
    </Panel>
  );
}
