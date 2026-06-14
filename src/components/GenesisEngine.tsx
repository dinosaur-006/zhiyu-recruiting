import { useState, useCallback } from 'react';
import type { SituationalParams } from '../types';

interface GenesisEngineProps {
  jobTitle: string;
  jobDepartment: string;
  existingJD: string; // from existing textareas
  onParamsChange: (params: SituationalParams) => void;
}

interface SliderDef {
  key: keyof Omit<SituationalParams, 'derivedAtmosphere'>;
  label: string;
  leftLabel: string;
  rightLabel: string;
  reference: string;
  /** 根据参数值生成预演台词 */
  preview: (val: number) => string;
}

const SLIDERS: SliderDef[] = [
  {
    key: 'paceThreshold',
    label: '节奏阈值',
    leftLabel: '极客慢跑',
    rightLabel: '生死时速',
    reference: '参考：设计师≈40 · 架构师≈75 · 销售≈95',
    preview: (v) => v > 80 ? 'AI 预演："这个需求今晚必须上线，没时间解释了。"'
      : v > 60 ? 'AI 预演："迭代节奏比较快，节点前需要集中冲刺。"'
      : v > 40 ? 'AI 预演："节奏平稳，有足够时间做技术方案评审。"'
      : 'AI 预演："不急，慢慢来，代码写优雅了再上线。"',
  },
  {
    key: 'collaborationDensity',
    label: '协作密度',
    leftLabel: '孤狼作战',
    rightLabel: '高频开会',
    reference: '参考：设计师≈90 · 销售≈70 · 架构师≈60',
    preview: (v) => v > 80 ? 'AI 预演："你今天有4个跨部门对齐会，记得带咖啡。"'
      : v > 60 ? 'AI 预演："需要和产品、后端、设计频繁同步，沟通成本不低。"'
      : v > 40 ? 'AI 预演："大部分时间独立编码，关键节点需要协作。"'
      : 'AI 预演："戴上降噪耳机，一周可能只说三句话。"',
  },
  {
    key: 'codeHygiene',
    label: '规范洁癖',
    leftLabel: '先上再说',
    rightLabel: '绝对规范',
    reference: '参考：架构师≈90 · 设计师≈70 · 销售≈20',
    preview: (v) => v > 80 ? 'AI 预演："这段代码没有单元测试，直接阻断 CI，拒绝 CR。"'
      : v > 60 ? 'AI 预演："团队有严格的 Code Review 流程，核心模块必须有测试覆盖。"'
      : v > 40 ? 'AI 预演："能跑就行，但核心逻辑最好还是补个单测。"'
      : 'AI 预演："别管什么设计模式了，功能通了就发版，后面再重构。"',
  },
  {
    key: 'ambiguityTolerance',
    label: '模糊容忍度',
    leftLabel: '需求必须明确',
    rightLabel: '拥抱变化',
    reference: '参考：销售≈85 · 设计师≈70 · 架构师≈20',
    preview: (v) => v > 80 ? 'AI 预演："需求文档？那是什么？方向大概对就开干吧。"'
      : v > 60 ? 'AI 预演："需求经常调整，需要在混沌中找到确定性。"'
      : v > 40 ? 'AI 预演："大部分需求有明确的PRD，偶尔有模糊地带需要自行判断。"'
      : 'AI 预演："没有完整PRD和交互稿之前，一行代码都不会写。"',
  },
  {
    key: 'autonomyLevel',
    label: '自主程度',
    leftLabel: '严格执行',
    rightLabel: '完全Owner',
    reference: '参考：销售≈90 · 架构师≈70 · 设计师≈60',
    preview: (v) => v > 80 ? 'AI 预演："这个模块你全权负责，出了问题你扛，做成了你升。"'
      : v > 60 ? 'AI 预演："有较大的自主决策空间，关键节点需要和主管同步。"'
      : v > 40 ? 'AI 预演："按Sprint计划执行，遇到阻塞及时上报。"'
      : 'AI 预演："严格按照技术负责人的方案执行，不要自己发挥。"',
  },
];

const DEFAULT_PARAMS: SituationalParams = {
  paceThreshold: 50,
  collaborationDensity: 50,
  codeHygiene: 50,
  ambiguityTolerance: 50,
  autonomyLevel: 50,
  derivedAtmosphere: '',
};

export function GenesisEngine({ jobTitle, jobDepartment, existingJD, onParamsChange }: GenesisEngineProps) {
  const [params, setParams] = useState<SituationalParams>(DEFAULT_PARAMS);
  const [jdInput, setJdInput] = useState(existingJD || '');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [activeSlider, setActiveSlider] = useState<string | null>(null);

  const handleExtract = useCallback(async () => {
    if (!jdInput.trim()) return;
    setIsExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch('/api/ai/extract-job-params', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jdText: jdInput, jobTitle, jobDepartment }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = await res.json();
      const newParams: SituationalParams = {
        paceThreshold: data.paceThreshold ?? 50,
        collaborationDensity: data.collaborationDensity ?? 50,
        codeHygiene: data.codeHygiene ?? 50,
        ambiguityTolerance: data.ambiguityTolerance ?? 50,
        autonomyLevel: data.autonomyLevel ?? 50,
        derivedAtmosphere: data.derivedAtmosphere || '',
      };
      setParams(newParams);
      onParamsChange(newParams);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : '提取失败');
    } finally {
      setIsExtracting(false);
    }
  }, [jdInput, jobTitle, jobDepartment, onParamsChange]);

  const handleSliderChange = (key: keyof Omit<SituationalParams, 'derivedAtmosphere'>, val: number) => {
    const next = { ...params, [key]: val };
    setParams(next);
    onParamsChange(next);
  };

  return (
    <div style={{ fontFamily: 'inherit' }}>
      {/* JD 输入区 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 8,
        }}>
          <span style={{
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: '0.08em', color: 'var(--color-accent)',
          }}>
            [ DNA_EXTRACTION_INPUT ]
          </span>
          <button
            onClick={handleExtract}
            disabled={isExtracting || !jdInput.trim()}
            style={{
              padding: '6px 16px', fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600, letterSpacing: '0.06em',
              background: 'transparent',
              border: '1px solid var(--color-accent)',
              color: 'var(--color-accent)',
              cursor: (isExtracting || !jdInput.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isExtracting || !jdInput.trim()) ? 0.4 : 1,
              transition: 'background 0.2s, border-color 0.2s, opacity 0.2s',
            }}
          >
            {isExtracting ? '[ EXTRACTING... ]' : '[ EXTRACT_DNA ]'}
          </button>
        </div>
        <textarea
          value={jdInput}
          onChange={(e) => setJdInput(e.target.value)}
          placeholder="在此粘贴原始 JD 文本，系统将自动逆向提取情景参数..."
          rows={5}
          style={{
            width: '100%', padding: '12px 14px',
            background: '#0F1115', border: '1px solid var(--color-border)',
            borderRadius: 2, color: 'var(--color-ink-soft)',
            fontSize: 12, lineHeight: 1.6, fontFamily: 'inherit',
            resize: 'vertical', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {extractError && (
          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--color-warning)', fontFamily: "'JetBrains Mono', monospace" }}>
            {extractError} — 使用默认参数
          </div>
        )}
        {params.derivedAtmosphere && (
          <div style={{
            marginTop: 8, padding: '8px 12px',
            background: 'var(--color-accent-subtle)',
            borderLeft: '2px solid var(--color-accent)',
            fontSize: 11, color: 'var(--color-ink-soft)',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.5,
          }}>
            ▸ DNA_ANALYSIS: {params.derivedAtmosphere}
          </div>
        )}
      </div>

      {/* 滑块面板 */}
      <div style={{
        borderTop: '1px solid var(--color-border)',
        paddingTop: 16,
      }}>
        <div style={{
          fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: '0.08em', color: 'var(--color-accent)',
          marginBottom: 14,
        }}>
          [ PARAMETER_MIXING_CONSOLE ]
        </div>

        {SLIDERS.map((slider) => {
          const val = params[slider.key] as number;
          const isActive = activeSlider === slider.key;
          const previewText = slider.preview(val);

          return (
            <div key={slider.key} style={{ marginBottom: 20 }}>
              {/* 标签行 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 6,
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-ink)',
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: '0.04em',
                }}>
                  {slider.label}
                </span>
                <span style={{
                  fontSize: 10, color: 'var(--color-accent)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                }}>
                  {val}
                </span>
              </div>

              {/* 滑块轨道 */}
              <div style={{ position: 'relative' }}>
                <input
                  type="range"
                  min={0} max={100} value={val}
                  onChange={(e) => handleSliderChange(slider.key, Number(e.target.value))}
                  onFocus={() => setActiveSlider(slider.key)}
                  onBlur={() => setActiveSlider(null)}
                  onMouseDown={() => setActiveSlider(slider.key)}
                  onMouseUp={() => setActiveSlider(null)}
                  style={{
                    width: '100%', height: 4,
                    appearance: 'none',
                    background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${val}%, var(--color-border) ${val}%, var(--color-border) 100%)`,
                    borderRadius: 2, outline: 'none', cursor: 'pointer',
                  }}
                />
                {/* 滑块端点标签 */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginTop: 3,
                }}>
                  <span style={{ fontSize: 9, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>
                    {slider.leftLabel}
                  </span>
                  <span style={{ fontSize: 9, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>
                    {slider.rightLabel}
                  </span>
                </div>
              </div>

              {/* Mini-Console 预演台词 */}
              <div style={{
                marginTop: 6,
                padding: '6px 10px',
                background: isActive ? 'rgba(201,169,110,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                fontSize: 10, color: isActive ? 'var(--color-accent)' : '#4A5568',
                fontFamily: "'JetBrains Mono', monospace",
                fontStyle: 'italic',
                transition: 'background 0.3s, border-color 0.3s, color 0.3s, opacity 0.3s',
                minHeight: 20,
              }}>
                {`> ${previewText}`}
              </div>
              <div style={{ fontSize: 9, color: 'var(--color-muted)', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {slider.reference}
              </div>
            </div>
          );
        })}
      </div>

      {/* 参数摘要 */}
      <div style={{
        marginTop: 16, padding: '10px 14px',
        background: '#0F1115', border: '1px solid var(--color-border)',
        borderRadius: 2,
        display: 'flex', gap: 16, flexWrap: 'wrap',
      }}>
        {SLIDERS.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 9, color: '#4A5568', fontFamily: "'JetBrains Mono', monospace" }}>
              {s.label}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-accent)', fontFamily: "'JetBrains Mono', monospace" }}>
              {params[s.key] as number}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
