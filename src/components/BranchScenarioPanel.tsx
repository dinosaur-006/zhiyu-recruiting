import { Check } from 'lucide-react';
import { Badge } from './Badge';
import type { BranchChoice, BranchScenario } from '../types';

interface BranchScenarioPanelProps {
  scenario: BranchScenario;
  selectedChoiceId?: string;
  onSelect: (choice: BranchChoice) => void;
}

export function BranchScenarioPanel({ scenario, selectedChoiceId, onSelect }: BranchScenarioPanelProps) {
  const selectedChoice = scenario.choices.find((choice) => choice.id === selectedChoiceId);

  return (
    <section className="branch-scenario-card">
      <div className="branch-head">
        <Badge tone="purple">真实任务沙盘 第{scenario.round}轮</Badge>
        <h2>{scenario.title}</h2>
        <p>{scenario.description}</p>
      </div>

      <div className="branch-choices-grid">
        {scenario.choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={choice.id === selectedChoiceId ? 'branch-choice-btn card-lift panel-tinted tint-green' : 'branch-choice-btn card-lift'}
            onClick={() => onSelect(choice)}
          >
            <span className="choice-label">
              {choice.id === selectedChoiceId ? (
                <Check size={14} strokeWidth={2.5} style={{ animation: 'scaleIn 0.3s ease both' }} />
              ) : (
                choice.label
              )}
            </span>
            <span>{choice.text}</span>
          </button>
        ))}
      </div>

      {selectedChoice ? (
        <section className="scenario-feedback animate-in">
          <span className="eyebrow">倾向分析</span>
          <h2>{selectedChoice.analysis.collaboration}</h2>
          <div className="report-summary-grid compact">
            <SummaryCell label="风险意识" value={selectedChoice.analysis.riskAwareness} />
            <SummaryCell label="沟通意识" value={selectedChoice.analysis.communication} />
            <SummaryCell label="技术判断" value={selectedChoice.analysis.technicalJudgment} />
          </div>
          <p>推进方式：{selectedChoice.analysis.executionStyle}</p>
        </section>
      ) : null}
    </section>
  );
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-cell">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
