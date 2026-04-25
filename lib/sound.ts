// 効果音（Web Audio API で生成）。素材ファイル不要で軽量。
// 既存アプリの playSound ロジックを踏襲しつつ、かわいい系に調整。

import { isSoundEnabled } from "./speech";

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    } catch {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundType = "correct" | "wrong" | "clear" | "tap" | "sparkle";

export function playSound(type: SoundType): void {
  // 「おんせい おふ」のときは効果音も鳴らさない（アイコン的に「音全体OFF」の期待に合わせる）
  if (!isSoundEnabled()) return;
  const ctx = getCtx();
  if (!ctx) return;

  const now = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (type === "correct") {
    // ピコン♪キラーン♪ 上昇音
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.connect(gain);
    osc.frequency.setValueAtTime(523.25, now);        // C5
    osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
    osc.frequency.setValueAtTime(1046.5, now + 0.24); // C6
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
    return;
  }

  if (type === "wrong") {
    // ぶーっ（やさしめ）
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.connect(gain);
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.2);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.3);
    return;
  }

  if (type === "clear") {
    // ファンファーレ
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      osc.connect(g);
      g.connect(ctx.destination);
      const t = now + i * 0.12;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    });
    return;
  }

  if (type === "tap") {
    // ピコッ♪（ボタンタップ） — 失敗音と区別するため上昇するきれいなトーンに
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.connect(gain);
    osc.frequency.setValueAtTime(880, now);                    // A5
    osc.frequency.linearRampToValueAtTime(1318.51, now + 0.06); // E6 まで上昇
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);
    osc.start(now);
    osc.stop(now + 0.15);
    return;
  }

  if (type === "sparkle") {
    // きらーん（ヒント時）
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.connect(gain);
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.exponentialRampToValueAtTime(3520, now + 0.3);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
    return;
  }
}
