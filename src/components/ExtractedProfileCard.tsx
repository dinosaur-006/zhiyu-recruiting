import { useState } from 'react';
import { CheckCircle2, Edit3, Quote, AlertTriangle, ChevronDown, ChevronUp, Wrench, Brain, Target, FileText } from 'lucide-react';
import { Badge } from './Badge';

interface ExtractedItem {
  name?: string;
  label?: string;
  concern?: string;
  trait?: string;
  confidence: 'high' | 'medium' | 'low';
  quoteText: string;
  quoteVerified: boolean;
  quoteMatchDetail?: string;
  reasoning: string;
}

interface ExtractedProfile {
  skills: ExtractedItem[];
  inferredTraits: ExtractedItem[];
  concerns: ExtractedItem[];
  selfReportedProfile: {
    rawSkills: string[];
    yearsOfExperience: string | null;
    currentRole: string | null;
  };
  extractionMetadata: {
    totalDialogueTurns: number;
    extractableTurns: number;
    lowConfidenceNote: string | null;
  };
  _meta?: {
    quoteViolations: string[];
    quoteVerificationRate: string;
  };
}

interface EditableField {
  key: string;
  value: string;
  original: string;
}

interface ExtractedProfileCardProps {
  profile: ExtractedProfile;
  onConfirm: (edits: EditableField[]) => void;
  isConfirming?: boolean;
}

const confidenceConfig: Record<string, { tone: 'green' | 'amber' | 'gray'; label: string }> = {
  high: { tone: 'green', label: '高置信度 · 多段对话佐证' },
  medium: { tone: 'amber', label: '中置信度 · 单次行为观察' },
  low: { tone: 'gray', label: '低置信度 · 间接信号推断' },
};

function getItemDisplayName(item: ExtractedItem): string {
  return item.name ?? item.label ?? item.concern ?? item.trait ?? '';
}

function getItemTypeLabel(item: ExtractedItem, section: 'skills' | 'traits' | 'concerns'): string {
  if (section === 'skills') return '技能锚点';
  if (section === 'traits') return '行为特征';
  return '关注点';
}

function ExtractedItemCard({
  item,
  section,
  isEditing,
  editValue,
  onEditChange,
  onToggleEdit,
}: {
  item: ExtractedItem;
  section: 'skills' | 'traits' | 'concerns';
  isEditing: boolean;
  editValue: string;
  onEditChange: (val: string) => void;
  onToggleEdit: () => void;
}) {
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const displayName = getItemDisplayName(item);
  const typeLabel = getItemTypeLabel(item, section);
  const conf = confidenceConfig[item.confidence] ?? confidenceConfig.medium;

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '18px 20px',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {isEditing ? (
            <input
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--color-ink)',
                background: 'var(--color-accent-subtle)',
                border: '1px solid var(--color-accent)',
                borderRadius: 6,
                padding: '4px 10px',
                fontFamily: 'inherit',
                outline: 'none',
                minWidth: 200,
              }}
              autoFocus
            />
          ) : (
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', fontFamily: 'var(--font-display)' }}>
              {displayName}
            </span>
          )}
          <Badge tone={conf.tone} dot>{typeLabel}</Badge>
          <span
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 9999,
              fontWeight: 500,
              background:
                item.confidence === 'high' ? 'var(--color-positive-bg)' :
                item.confidence === 'medium' ? 'var(--color-warning-bg)' :
                'var(--color-subtle)',
              color:
                item.confidence === 'high' ? 'var(--color-positive)' :
                item.confidence === 'medium' ? 'var(--color-warning)' :
                'var(--color-muted)',
            }}
          >
            {conf.label}
          </span>
        </div>
        <button
          onClick={onToggleEdit}
          aria-label={isEditing ? '确认修改' : '编辑此项'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 12px',
            borderRadius: 9999,
            border: '1px solid var(--color-border)',
            background: isEditing ? 'var(--color-accent-subtle)' : 'transparent',
            color: isEditing ? 'var(--color-accent)' : 'var(--color-muted)',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 500,
            transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
          }}
        >
          <Edit3 size={12} />
          {isEditing ? '确认' : '修改'}
        </button>
        {!isEditing && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleEdit(); }}
            aria-label="标记为不准确"
            title="如果这条分析不准确，点击标记——你的纠正会帮助 AI 更精准"
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '4px 10px', borderRadius: 9999,
              border: '1px solid var(--color-border)',
              background: 'transparent', color: 'var(--color-muted)',
              fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: 500, transition: 'background-color 0.15s, color 0.15s, border-color 0.15s',
            }}
          >
            这不是我
          </button>
        )}
      </div>

      {/* Quote section — the core trust signal */}
      <div style={{ marginBottom: 8 }}>
        {item.quoteVerified ? (
          <div
            onClick={() => setQuoteExpanded(!quoteExpanded)}
            style={{
              borderLeft: '3px solid var(--color-accent)',
              padding: '10px 14px',
              background: 'var(--color-accent-subtle)',
              borderRadius: '0 8px 8px 0',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: quoteExpanded ? 6 : 0 }}>
              <Quote size={14} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--color-ink-soft)', fontStyle: 'italic', lineHeight: 1.6, flex: 1 }}>
                {quoteExpanded ? item.quoteText : `"${item.quoteText.slice(0, 80)}${item.quoteText.length > 80 ? '...' : ''}"`}
              </span>
              {item.quoteText.length > 80 && (
                <span style={{ flexShrink: 0, color: 'var(--color-muted)' }}>
                  {quoteExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              )}
            </div>
            {quoteExpanded && item.quoteMatchDetail && (
              <div style={{ fontSize: 11, color: 'var(--color-positive)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} />
                {item.quoteMatchDetail}
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              borderLeft: '3px solid var(--color-warning)',
              padding: '10px 14px',
              background: 'var(--color-warning-bg)',
              borderRadius: '0 8px 8px 0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}
          >
            <AlertTriangle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 1 }} />
            <div>
              <span style={{ fontSize: 13, color: 'var(--color-ink-soft)', fontWeight: 500 }}>
                AI 推断锚点漂移
              </span>
              <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: '2px 0 0', lineHeight: 1.5 }}>
                该结论基于沙盘行为上下文自动萃取，缺乏直白语料支撑。建议你手动修改或删除此项。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Reasoning */}
      <p style={{ fontSize: 12, color: 'var(--color-muted)', margin: 0, lineHeight: 1.5 }}>
        分析依据：{item.reasoning}
      </p>
    </div>
  );
}

export function ExtractedProfileCard({ profile, onConfirm, isConfirming }: ExtractedProfileCardProps) {
  const [edits, setEdits] = useState<Record<string, string>>({});

  const handleEditChange = (key: string, value: string) => {
    setEdits((prev) => ({ ...prev, [key]: value }));
  };

  const buildEditsPayload = (): EditableField[] => {
    return Object.entries(edits).map(([key, value]) => {
      // key format: "skills-0" or "traits-2" or "concerns-1"
      const [section, indexStr] = key.split('-');
      const idx = Number(indexStr);
      const sectionData = section === 'skills' ? profile.skills :
        section === 'traits' ? profile.inferredTraits :
        profile.concerns;
      const item = sectionData[idx];
      return {
        key,
        value,
        original: getItemDisplayName(item),
      };
    });
  };

  const hasEdits = Object.keys(edits).length > 0;

  return (
    <article
      style={{
        maxWidth: 720,
        margin: '0 auto',
        background: 'var(--color-surface)',
        borderRadius: 20,
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span className="eyebrow">Quantum Snapshot</span>
          <h2 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-ink)', margin: '4px 0 0' }}>
            量子档案卡
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '4px 0 0', maxWidth: 480 }}>
            系统基于沙盘推演中的对话和行为，自动萃取以下画像。每条结论都标明了对话原文出处。
            你可以直接修改或删除不准确的条目。
          </p>
        </div>
        {profile._meta && (
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'var(--color-positive-bg)',
              border: '1px solid rgba(34,197,94,0.2)',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--color-positive)',
              fontFamily: 'var(--font-display)',
              whiteSpace: 'nowrap',
            }}
          >
            {profile._meta.quoteVerificationRate}
          </div>
        )}
      </header>

      <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Skills */}
        {profile.skills.length > 0 && (
          <Section title="技术与协作锚点" icon={Wrench}>
            {profile.skills.map((item, i) => (
              <ExtractedItemCard
                key={`skill-${i}`}
                item={item}
                section="skills"
                isEditing={edits[`skills-${i}`] !== undefined}
                editValue={edits[`skills-${i}`] ?? getItemDisplayName(item)}
                onEditChange={(v) => handleEditChange(`skills-${i}`, v)}
                onToggleEdit={() => {
                  if (edits[`skills-${i}`] !== undefined) {
                    setEdits((prev) => {
                      const next = { ...prev };
                      delete next[`skills-${i}`];
                      return next;
                    });
                  } else {
                    handleEditChange(`skills-${i}`, getItemDisplayName(item));
                  }
                }}
              />
            ))}
          </Section>
        )}

        {/* Inferred Traits */}
        {profile.inferredTraits.length > 0 && (
          <Section title="潜意识行为特征" icon={Brain}>
            {profile.inferredTraits.map((item, i) => (
              <ExtractedItemCard
                key={`trait-${i}`}
                item={item}
                section="traits"
                isEditing={edits[`traits-${i}`] !== undefined}
                editValue={edits[`traits-${i}`] ?? getItemDisplayName(item)}
                onEditChange={(v) => handleEditChange(`traits-${i}`, v)}
                onToggleEdit={() => {
                  if (edits[`traits-${i}`] !== undefined) {
                    setEdits((prev) => {
                      const next = { ...prev };
                      delete next[`traits-${i}`];
                      return next;
                    });
                  } else {
                    handleEditChange(`traits-${i}`, getItemDisplayName(item));
                  }
                }}
              />
            ))}
          </Section>
        )}

        {/* Concerns */}
        {profile.concerns.length > 0 && (
          <Section title="核心诉求与顾虑" icon={Target}>
            {profile.concerns.map((item, i) => (
              <ExtractedItemCard
                key={`concern-${i}`}
                item={item}
                section="concerns"
                isEditing={edits[`concerns-${i}`] !== undefined}
                editValue={edits[`concerns-${i}`] ?? getItemDisplayName(item)}
                onEditChange={(v) => handleEditChange(`concerns-${i}`, v)}
                onToggleEdit={() => {
                  if (edits[`concerns-${i}`] !== undefined) {
                    setEdits((prev) => {
                      const next = { ...prev };
                      delete next[`concerns-${i}`];
                      return next;
                    });
                  } else {
                    handleEditChange(`concerns-${i}`, getItemDisplayName(item));
                  }
                }}
              />
            ))}
          </Section>
        )}

        {/* Self-reported profile */}
        {profile.selfReportedProfile && (
          (profile.selfReportedProfile.rawSkills.length > 0 ||
           profile.selfReportedProfile.currentRole ||
           profile.selfReportedProfile.yearsOfExperience) && (
            <Section title="自我报告信息" icon={FileText}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.selfReportedProfile.rawSkills.map((s, i) => (
                  <span key={i} style={{
                    padding: '4px 14px',
                    background: 'var(--color-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-ink-soft)',
                  }}>{s}</span>
                ))}
              </div>
              {(profile.selfReportedProfile.currentRole || profile.selfReportedProfile.yearsOfExperience) && (
                <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 13, color: 'var(--color-muted)' }}>
                  {profile.selfReportedProfile.currentRole && (
                    <span>当前职位：<strong style={{ color: 'var(--color-ink-soft)' }}>{profile.selfReportedProfile.currentRole}</strong></span>
                  )}
                  {profile.selfReportedProfile.yearsOfExperience && (
                    <span>工作年限：<strong style={{ color: 'var(--color-ink-soft)' }}>{profile.selfReportedProfile.yearsOfExperience}</strong></span>
                  )}
                </div>
              )}
            </Section>
          )
        )}

        {/* Low confidence note */}
        {profile.extractionMetadata?.lowConfidenceNote && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--color-warning-bg)',
            border: '1px solid rgba(255,189,46,0.2)',
            borderRadius: 10,
            fontSize: 13,
            color: 'var(--color-ink-soft)',
            lineHeight: 1.6,
          }}>
            <AlertTriangle size={14} style={{ color: 'var(--color-warning)', display: 'inline', marginRight: 6, verticalAlign: -2 }} />
            {profile.extractionMetadata.lowConfidenceNote}
          </div>
        )}

        {/* Quote violations — only show in dev or when there are issues */}
        {profile._meta && profile._meta.quoteViolations.length > 0 && (
          <details style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 500, color: 'var(--color-warning)' }}>
              ⚠️ {profile._meta.quoteViolations.length} 条引用未通过原文校验（点击展开）
            </summary>
            <ul style={{ marginTop: 8, paddingLeft: 18 }}>
              {profile._meta.quoteViolations.map((v, i) => (
                <li key={i} style={{ marginBottom: 4 }}>{v}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      {/* Footer CTA */}
      <footer
        style={{
          padding: '20px 28px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0, textAlign: 'center' }}>
          {hasEdits
            ? `你修改了 ${Object.keys(edits).length} 项内容。确认后将以此版本为准，同步给HR。`
            : '确认无误后，系统将封存此档案为最终投递数据，同步至HR观测站。'}
        </p>
        <button
          className="primary-button full"
          onClick={() => onConfirm(buildEditsPayload())}
          disabled={isConfirming}
          style={{ width: '100%' }}
          aria-label={isConfirming ? '正在封存档案...' : '确认萃取数据，封存并投递'}
        >
          {isConfirming ? '⏳ 正在封存档案...' : '确认萃取数据，封存并投递'}
        </button>
      </footer>
    </article>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{size?:number}>; children: React.ReactNode }) {
  return (
    <section>
      <h3 style={{
        fontSize: 14,
        fontWeight: 700,
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-display)',
        margin: '0 0 14px 0',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 10,
        borderBottom: '1px solid var(--color-border)',
      }}>
        <Icon size={16} />
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </section>
  );
}
