import { useState } from 'react';
import { resetDemoState, seedRealityDemoCase, useDemoState } from '../../store/demoStore';

export function Settings() {
  const state = useDemoState();
  const [confirmReset, setConfirmReset] = useState(false);

  const jobCount = state.jobs.length;
  const candidateCount = state.candidates.length;
  const reportCount = state.realityReports.length;

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    resetDemoState();
    setConfirmReset(false);
  };

  const seed = () => {
    seedRealityDemoCase();
    window.location.href = '/hr/candidates';
  };

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">演示设置</span>
          <h1>控制台</h1>
          <p>管理演示数据、AI 配置与危险操作。</p>
        </div>
      </div>

      {/* 1) Data Overview */}
      <section className="panel">
        <h2>数据概览</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-4)' }}>
          当前演示环境中存储的职位、候选人及云试岗报告数量。
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{jobCount}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>职位数</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{candidateCount}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>候选人</div>
          </div>
          <div className="card" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{reportCount}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>云试岗报告</div>
          </div>
        </div>
      </section>

      {/* 2) AI Configuration */}
      <section className="panel" style={{ marginTop: 'var(--space-5)' }}>
        <h2>AI 配置</h2>
        <p style={{ color: 'var(--color-muted)' }}>
          AI 模型与策略配置功能将在后续版本上线。当前演示环境使用 mock AI 服务，所有评估结果均为模拟数据。
        </p>
        <div style={{
          padding: 'var(--space-4)',
          background: 'var(--color-surface-raised)',
          borderRadius: 'var(--radius-md)',
          border: '1px dashed var(--color-border)',
          textAlign: 'center',
          color: 'var(--color-muted)',
          fontSize: '0.875rem',
        }}>
          暂无可用配置项 — 占位区域
        </div>
      </section>

      {/* 3) Danger Zone */}
      <section className="panel panel-tinted tint-red" style={{ marginTop: 'var(--space-5)' }}>
        <h2>危险操作</h2>
        <p>以下操作会清空当前所有演示数据并恢复至初始状态，请谨慎执行。</p>
        <div className="header-actions">
          <button
            className="danger-button"
            onClick={handleReset}
          >
            {confirmReset ? '确认重置？再次点击执行' : '重置演示数据 / 恢复初始Mock数据'}
          </button>
          {confirmReset && (
            <button
              className="primary-button"
              onClick={() => setConfirmReset(false)}
            >
              取消重置
            </button>
          )}
        </div>
        <div className="header-actions" style={{ marginTop: 'var(--space-3)' }}>
          <button className="primary-button" onClick={seed}>
            一键生成云试岗演示案例
          </button>
        </div>
      </section>
    </main>
  );
}
