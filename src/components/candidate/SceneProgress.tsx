import { motion } from 'framer-motion';

interface SceneProgressProps {
  current: number;
  total: number;
  labels?: string[];
}

const defaultLabels = ['了解岗位', '实境体验', '构建选择'];

export function SceneProgress({ current, total, labels = defaultLabels }: SceneProgressProps) {
  return (
    <div className="cr-progress" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total} aria-label={`第 ${current + 1} 步，共 ${total} 步`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--cr-space-sm)' }}>
          <motion.div
            className={`cr-progress-step ${i < current ? 'completed' : i === current ? 'active' : ''}`}
            initial={false}
            animate={{
              scale: i === current ? 1.3 : 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          />
          {i < total - 1 && (
            <div className={`cr-progress-connector ${i < current ? 'completed' : ''}`} />
          )}
        </div>
      ))}
      <span style={{ marginLeft: 'var(--cr-space-md)', fontSize: 13, color: 'var(--cr-ink-dim)', fontWeight: 500 }}>
        {labels[current] ?? `步骤 ${current + 1}`}
      </span>
    </div>
  );
}
