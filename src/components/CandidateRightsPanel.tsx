import { Badge } from './Badge';

interface CandidateRightsPanelProps {
  onClose?: () => void;
}

const rightsSections = [
  {
    title: '本次会记录',
    items: ['你查看过的岗位真相点', '你在任务沙盘中的选择', '你主动提出的问题', '你主动填写的资料'],
  },
  {
    title: '本次不会记录',
    items: ['外貌', '表情', '声音情绪', '与岗位无关的私人敏感信息'],
  },
  {
    title: 'HR会看到',
    items: ['云试岗完成度', '关注点', '选择路径', '补充资料摘要', 'AI生成的面试前参考建议'],
  },
  {
    title: 'AI不会做',
    items: ['自动决定录用结果', '自动决定不录用结果', '基于外貌、声音、表情判断适配度'],
  },
];

export function CandidateRightsPanel({ onClose }: CandidateRightsPanelProps) {
  return (
    <section className="candidate-rights-panel">
      <div className="truth-contract-head">
        <div>
          <span className="eyebrow">Candidate Rights</span>
          <h2>我的数据与权益</h2>
          <p>这不是普通合规说明，而是让你知道自己在AI招聘流程中拥有哪些选择权。</p>
        </div>
        <Badge tone="green">透明可跳过</Badge>
      </div>

      <div className="rights-grid">
        {rightsSections.map((section) => (
          <div key={section.title} className="rights-card">
            <strong>{section.title}</strong>
            <ul className="clean-list">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="contract-boundary">
        <p>你可以跳过云试岗、直接投递，也可以在后续沟通中申请解释或删除相关记录。</p>
        <p>本演示版本仅展示前端说明，不接入真实后端数据删除流程。</p>
      </div>

      {onClose ? (
        <button className="primary-button full" type="button" onClick={onClose}>
          我知道了
        </button>
      ) : null}
    </section>
  );
}
