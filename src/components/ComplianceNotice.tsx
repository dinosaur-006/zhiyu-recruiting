import { useState } from 'react';
import { Shield, X } from 'lucide-react';

interface ComplianceNoticeProps {
  compact?: boolean;
}

export function ComplianceNotice({ compact = false }: ComplianceNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <section className={compact ? 'compliance-notice compact animate-in' : 'compliance-notice animate-in'}>
      <Shield size={14} strokeWidth={1.5} />
      <div>
        <strong>AI身份披露与授权说明</strong>
        <p>
          你即将进入由AI数字人生成的岗位实境舱。数字人不是HR本人，也不代表真人正在与你实时沟通。
          系统不会基于本次体验自动做出招聘决定，不分析你的外观特征、面部状态、音色情绪，只会基于你的主动提问、
          场景选择和填写资料生成云试岗报告，供HR人工参考。你可以跳过云试岗，直接投递简历。
        </p>
      </div>
      <button
        className="compliance-notice-close"
        onClick={() => setDismissed(true)}
        aria-label="关闭通知"
        title="关闭"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </section>
  );
}
