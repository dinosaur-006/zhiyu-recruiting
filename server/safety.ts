const bannedPhrases = [
  '推荐录用',
  '建议录用',
  '自动录用',
  '建议淘汰',
  '自动淘汰',
  '自动筛掉',
  '候选人评分',
  '能力分',
  '录用概率',
  '稳定性分',
  '性格判断',
  '情绪判断',
  '外貌',
  '表情',
  '声音情绪',
  '颜值',
  '年龄偏好',
  '性别偏好',
  '婚育',
];

const replacement = '需人工复核';

export interface SafetyResult<T> {
  data: T;
  safetyHits: string[];
  needsHumanReview: boolean;
}

export function sanitizeAiOutput<T>(data: T): SafetyResult<T> {
  const safetyHits: string[] = [];
  let cleaned = JSON.stringify(data);

  for (const phrase of bannedPhrases) {
    if (cleaned.includes(phrase)) {
      safetyHits.push(phrase);
      cleaned = cleaned.split(phrase).join(replacement);
    }
  }

  return {
    data: JSON.parse(cleaned) as T,
    safetyHits,
    needsHumanReview: safetyHits.length > 0,
  };
}

export function containsUnsafeExpression(value: unknown) {
  const text = JSON.stringify(value);
  return bannedPhrases.some((phrase) => text.includes(phrase));
}
