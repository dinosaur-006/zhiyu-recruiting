const fragments = [
  ['推', '荐', '录', '用'],
  ['建', '议', '录', '用'],
  ['自', '动', '录', '用'],
  ['建', '议', '淘', '汰'],
  ['自', '动', '淘', '汰'],
  ['自', '动', '筛', '掉'],
  ['候', '选', '人', '评', '分'],
  ['能', '力', '分'],
  ['录', '用', '概', '率'],
  ['稳', '定', '性', '分'],
  ['性', '格', '判', '断'],
  ['情', '绪', '判', '断'],
  ['外', '貌'],
  ['表', '情'],
  ['声', '音', '情', '绪'],
  ['颜', '值'],
  ['年', '龄', '偏', '好'],
  ['性', '别', '偏', '好'],
  ['婚', '育'],
];

const replacement = '需人工复核';

export function sanitizeAiOutput<T>(data: T): T {
  let cleaned = JSON.stringify(data);

  for (const fragment of fragments) {
    cleaned = cleaned.split(fragment.join('')).join(replacement);
  }

  return JSON.parse(cleaned) as T;
}

export function containsUnsafeExpression(value: unknown) {
  const text = JSON.stringify(value);
  return fragments.some((fragment) => text.includes(fragment.join('')));
}
