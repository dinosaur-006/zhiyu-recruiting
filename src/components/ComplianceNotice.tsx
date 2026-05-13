interface ComplianceNoticeProps {
  compact?: boolean;
}

export function ComplianceNotice({ compact = false }: ComplianceNoticeProps) {
  return (
    <section className={compact ? 'compliance compact' : 'compliance'}>
      <strong>开始前说明</strong>
      <p>
        本次对话仅用于岗位预体验与HR面试前参考。AI生成内容只作为人工复核辅助，不会单独决定你的招聘结果。
        你可以跳过对话，直接投递简历，也可以申请解释或删除相关数据。
      </p>
    </section>
  );
}
