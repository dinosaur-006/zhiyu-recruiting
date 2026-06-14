/**
 * 浏览器原生 TTS 引擎 — 零外部依赖
 * 为三角色配置不同语速/音调，受 timePressure 驱动
 */

type RoleType = 'hr' | 'teammate' | 'manager';
type TimePressure = 'none' | 'moderate' | 'urgent';

const ROLE_VOICE_CONFIG: Record<RoleType, { rate: number; pitch: number }> = {
  hr: { rate: 1.0, pitch: 1.0 },
  teammate: { rate: 0.95, pitch: 1.1 },
  manager: { rate: 0.9, pitch: 0.9 },
};

// 高压下语速倍率
const PRESSURE_RATE_MULT: Record<TimePressure, number> = {
  none: 1.0,
  moderate: 1.2,
  urgent: 1.5,
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(
  text: string,
  role: RoleType,
  timePressure: TimePressure = 'none',
  onEnd?: () => void,
) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

  // 停止当前语音
  stop();

  const config = ROLE_VOICE_CONFIG[role];
  const rateMult = PRESSURE_RATE_MULT[timePressure];

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = config.rate * rateMult;
  utterance.pitch = config.pitch;

  // 尝试匹配中文语音
  const voices = window.speechSynthesis.getVoices();
  const zhVoice = voices.find((v) => v.lang.startsWith('zh'));
  if (zhVoice) utterance.voice = zhVoice;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stop() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking(): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}
