import { resetDemoState, seedRealityDemoCase } from '../../store/demoStore';

export function Settings() {
  const reset = () => {
    resetDemoState();
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
          <h1>重置演示数据</h1>
          <p>多次演示后可恢复初始Mock数据，避免候选人和指标污染。</p>
        </div>
      </div>

      <section className="panel settings-panel">
        <h2>本地数据</h2>
        <p>当前演示数据保存在浏览器localStorage中。点击按钮后会恢复默认职位、候选人、三角色数字人、云试岗报告和漏斗指标。</p>
        <div className="header-actions">
          <button className="danger-button" onClick={reset}>
            重置演示数据 / 恢复初始Mock数据
          </button>
          <button className="primary-button" onClick={seed}>
            一键生成云试岗演示案例
          </button>
        </div>
      </section>
    </main>
  );
}
