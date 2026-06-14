const STAGES = [
  { id: 0, label: '情报', sub: '情报档案' },
  { id: 1, label: '侦察', sub: '环境蓝图' },
  { id: 2, label: '行动', sub: '战术指挥台' },
];

export function PenetrationTracker({ currentScene }: { currentScene: number }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: '100%', padding: '10px 0',
      borderBottom: '1px solid var(--color-border)',
      background: 'rgba(11,13,17,0.8)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      userSelect: 'none', zIndex: 20,
    }}>
      {STAGES.map((stage, idx) => {
        const isCompleted = currentScene > stage.id;
        const isActive = currentScene === stage.id;

        return (
          <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              opacity: isActive ? 1 : 0.4,
              transition: 'opacity 0.4s',
            }}>
              <div style={{
                fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6,
                color: isCompleted ? 'var(--color-positive)' : isActive ? 'var(--color-accent)' : '#718096',
              }}>
                {isActive && (
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--color-accent)',
                    animation: 'pulseGlow 2s ease infinite',
                    display: 'inline-block',
                  }} />
                )}
                [{stage.label}]
              </div>
              <div style={{
                fontSize: 11, color: '#E2E8F0', fontWeight: 500,
                marginTop: 2, letterSpacing: '0.04em',
                fontFamily: 'var(--font-display)',
              }}>
                {stage.sub}
              </div>
            </div>

            {idx < STAGES.length - 1 && (
              <div style={{ width: 48, margin: '0 12px', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  height: 1, width: '100%',
                  background: isCompleted ? 'rgba(39,201,63,0.4)' : '#2D3748',
                  transition: 'background 0.5s',
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
