interface ComplianceNoticeProps {
  compact?: boolean;
}

export function ComplianceNotice({ compact = false }: ComplianceNoticeProps) {
  return (
    <section className={compact ? 'compliance compact' : 'compliance'}>
      <strong>AI身份披露与授权说明</strong>
      <p>
        你即将进入由AI数字人生成的岗位实境舱。数字人不是HR本人，也不代表真人正在与你实时沟通。
        系统不会基于本次体验自动做出招聘决定，不分析你的外貌、表情、声音情绪，只会基于你的主动提问、
        场景选择和填写资料生成云试岗报告，供HR人工参考。你可以跳过云试岗，直接投递简历。
      </p>
    </section>
  );
}
