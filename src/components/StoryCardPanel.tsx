import { FileText, Tag, AlertTriangle } from 'lucide-react';
import { Badge } from './Badge';
import type { HRStoryCard } from '../types';

interface StoryCardPanelProps {
  card: HRStoryCard;
  mode?: 'hr' | 'candidate';
}

export function StoryCardPanel({ card, mode = 'hr' }: StoryCardPanelProps) {
  if (mode === 'candidate') {
    return (
      <section className="story-panel panel-gradient">
        <div className="section-heading">
          <span>候选人预览</span>
          <h2>你的云试岗摘要</h2>
        </div>
        <StoryBlock title="我的岗位理解" content={card.jobUnderstanding} />
        <div className="section-accent-bar" />
        <StoryList title="我的技能标签" items={card.skillTags} tone="green" />
        <div className="section-accent-bar" />
        <StoryList title="我的关注点" items={card.riskFlags.filter((flag) => flag.includes('关注点'))} tone="amber" />
        <div className="section-accent-bar" />
        <StoryBlock
          title="投递建议"
          content={
            card.recommendation === '强推荐面试'
              ? '你的经历和岗位有较多可对齐点，建议进入后续沟通。'
              : '建议在后续沟通中补充项目证据、岗位理解和关键关注点。'
          }
        />
      </section>
    );
  }

  return (
    <section className="story-panel">
      <div className="story-hero">
        <div>
          <span className="eyebrow">HR面试前情报卡</span>
          <h2>候选人云试岗线索卡</h2>
        </div>
        <Badge tone={card.recommendation === '强推荐面试' ? 'green' : card.recommendation === '暂缓邀约' ? 'amber' : 'blue'}>
          AI辅助建议：{card.recommendation}
        </Badge>
      </div>

      <StoryBlock title="候选人自述" content={card.selfIntro} />
      <StoryBlock title="岗位理解" content={card.jobUnderstanding} />
      <StoryList title="技能标签" items={card.skillTags} tone="blue" />
      <StoryList title="项目证据" items={card.projectEvidence} tone="purple" />
      <StoryList title="意愿信号" items={card.intentionSignals} tone="green" />
      <StoryList title="风险提示" items={card.riskFlags} tone="amber" />
      <StoryList title="建议追问" items={card.interviewQuestions} tone="gray" ordered />
      <div className="story-compliance">{card.complianceStatement}</div>
    </section>
  );
}

function StoryBlock({ title, content }: { title: string; content: string }) {
  return (
    <div className="story-block card-lift">
      <h3><FileText size={14} /> {title}</h3>
      <p>{content}</p>
    </div>
  );
}

function StoryList({
  title,
  items,
  tone,
  ordered = false,
}: {
  title: string;
  items: string[];
  tone: 'blue' | 'purple' | 'green' | 'amber' | 'gray';
  ordered?: boolean;
}) {
  if (items.length === 0) return null;

  const titleIcon = tone === 'amber' ? <AlertTriangle size={14} /> : <Tag size={14} />;

  return (
    <div className="story-block card-lift">
      <h3>{titleIcon} {title}</h3>
      {ordered ? (
        <ol className="story-list ordered">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      ) : (
        <div className="tag-row">
          {items.map((item) => (
            <Badge key={item} tone={tone} dot>
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
