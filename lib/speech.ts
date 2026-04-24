// Web Speech API のラッパー。
// 5 歳児は字が読めないので、ほとんどの UI メッセージを音声でも伝える。

const SOUND_KEY = "machigai:soundEnabled";

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const raw = localStorage.getItem(SOUND_KEY);
  return raw === null ? true : raw === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_KEY, String(enabled));
  if (!enabled) window.speechSynthesis?.cancel();
}

let jaVoice: SpeechSynthesisVoice | null = null;

function pickJaVoice(): SpeechSynthesisVoice | null {
  if (jaVoice) return jaVoice;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  // 日本語音声を探す。女性声優先（"Kyoko" "Otoya" "Google 日本語" 等）。
  jaVoice =
    voices.find((v) => v.lang === "ja-JP" && /kyoko|otoya|google/i.test(v.name)) ||
    voices.find((v) => v.lang === "ja-JP") ||
    null;
  return jaVoice;
}

/**
 * テキストを音声で読み上げる。
 * @param text 読み上げる文字列
 * @param options rate: 話速 (0.1-10, デフォルト 1.0)
 */
export function speak(text: string, options?: { rate?: number; pitch?: number; interrupt?: boolean }): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (!isSoundEnabled()) return;
  const { rate = 1.0, pitch = 1.2, interrupt = true } = options ?? {};

  if (interrupt) window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "ja-JP";
  utter.rate = rate;
  utter.pitch = pitch; // やや高め = 子供向け

  const voice = pickJaVoice();
  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);
}

/** 音声合成が利用可能かどうか */
export function isSpeechAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** 音声読み上げを停止 */
export function stopSpeech(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}

/** voices の初期化。Chrome 等で voices が非同期ロードされるため呼び出す */
export function primeVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  // ロードを促す
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    jaVoice = null; // 再選択させる
    pickJaVoice();
  };
}
