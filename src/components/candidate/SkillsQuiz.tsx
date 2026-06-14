import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Check, Brain, Code, Users, Lightbulb, Zap, TrendingUp } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; icon?: React.ComponentType<{ size?: number; strokeWidth?: number }> }[];
}

const QUESTIONS: Question[] = [
  {
    id: 'skill',
    text: '你最擅长的技术方向是？',
    options: [
      { label: '前端开发', value: 'frontend', icon: Code },
      { label: '后端架构', value: 'backend', icon: Brain },
      { label: '全栈', value: 'fullstack', icon: Zap },
      { label: '技术管理', value: 'management', icon: Users },
    ],
  },
  {
    id: 'priority',
    text: '找工作时，你最看重什么？',
    options: [
      { label: '技术成长', value: 'growth', icon: TrendingUp },
      { label: '薪资福利', value: 'salary', icon: Sparkles },
      { label: '团队氛围', value: 'culture', icon: Users },
      { label: '工作节奏', value: 'pace', icon: Brain },
    ],
  },
  {
    id: 'experience',
    text: '你的工作经验是？',
    options: [
      { label: '1-3年', value: 'junior' },
      { label: '3-5年', value: 'mid' },
      { label: '5-8年', value: 'senior' },
      { label: '8年以上', value: 'lead' },
    ],
  },
];

interface SkillsQuizProps {
  onComplete: (answers: Record<string, string>) => void;
}

export function SkillsQuiz({ onComplete }: SkillsQuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (qId: string, value: string) => {
    const newAnswers = { ...answers, [qId]: value };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    } else {
      setIsComplete(true);
      setTimeout(() => onComplete(newAnswers), 1000);
    }
  };

  return (
    <section style={{ padding: 'var(--cr-space-4xl) 0', maxWidth: 'var(--cr-content-xl)', margin: '0 auto', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--cr-space-2xl)' }}>
        <span className="cr-eyebrow" style={{ textAlign: 'center' }}>快速匹配</span>
        <h2 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 700, color: 'var(--cr-ink)', margin: '8px 0 12px' }}>
          回答3个问题，发现最适合你的岗位
        </h2>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            width: i <= currentQ ? 32 : 8, height: 8, borderRadius: 4,
            background: i < currentQ ? 'var(--cr-accent)' : i === currentQ ? 'var(--cr-accent)' : 'var(--cr-border)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Question */}
      <div style={{ maxWidth: 500, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 20, fontWeight: 600, color: 'var(--cr-ink)', textAlign: 'center', marginBottom: 24 }}>
                {QUESTIONS[currentQ].text}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {QUESTIONS[currentQ].options.map((opt) => {
                  const OptIcon = opt.icon;
                  const isSelected = answers[QUESTIONS[currentQ].id] === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(QUESTIONS[currentQ].id, opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px 20px', borderRadius: 'var(--cr-radius-lg)',
                        border: isSelected ? '2px solid var(--cr-accent)' : '1px solid var(--cr-border)',
                        background: isSelected ? 'var(--cr-accent-subtle)' : 'var(--cr-surface)',
                        cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'var(--cr-font-sans)', fontSize: 15, fontWeight: 500,
                        color: isSelected ? 'var(--cr-accent)' : 'var(--cr-ink)',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {OptIcon && <OptIcon size={20} strokeWidth={1.5} />}
                      {opt.label}
                      {isSelected && <Check size={16} style={{ marginLeft: 'auto', color: 'var(--cr-accent)' }} />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} style={{ textAlign: 'center', padding: 'var(--cr-space-3xl)' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--cr-accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={32} style={{ color: 'var(--cr-accent)' }} />
              </div>
              <h3 style={{ fontFamily: 'var(--cr-font-display)', fontSize: 22, fontWeight: 700, color: 'var(--cr-ink)', marginBottom: 8 }}>正在为你匹配...</h3>
              <p style={{ fontSize: 14, color: 'var(--cr-ink-dim)' }}>基于你的偏好，找到最合适的岗位</p>
              <div className="cr-loading-spinner" style={{ margin: '16px auto 0' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
