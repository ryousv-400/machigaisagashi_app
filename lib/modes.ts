// ゲームモード定義。
// 内部名は既存ストア互換のため ten / thirty のまま残す。
// 表示上は、生成し直した子供向けステージを 10 問 / 30 問で遊ぶ。

export type GameMode = "ten" | "thirty";

export const MODE_10_LEVELS: number[] = Array.from({ length: 10 }, (_, i) => i + 1);

export const MODE_30_LEVELS: number[] = Array.from({ length: 30 }, (_, i) => i + 1);

export function getLevelsForMode(mode: GameMode): number[] {
  return mode === "ten" ? MODE_10_LEVELS : MODE_30_LEVELS;
}

export const MODE_LABELS: Record<GameMode, string> = {
  ten: "１０もん",
  thirty: "３０もん",
};

export const MODE_READ_ALOUD: Record<GameMode, string> = {
  ten: "じゅうもん もーどで あそぶよ！",
  thirty: "さんじゅうもん もーどで あそぶよ！",
};

// ============ むずかしさ（難易度モード） ============

export type Difficulty = "easy" | "normal" | "hard";

export const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "かんたん",
  normal: "ふつう",
  hard: "むずかしい",
};

export const DIFFICULTY_HINT_LABELS: Record<Difficulty, string> = {
  easy: "おっきい あたり",
  normal: "ちょうどいい",
  hard: "ちっちゃい あたり",
};

export const DIFFICULTY_READ_ALOUD: Record<Difficulty, string> = {
  easy: "かんたんで あそぶよ！",
  normal: "ふつうで あそぶよ！",
  hard: "むずかしいで あそぶよ！ がんばって！",
};

// ホットスポットの当たり判定スケール（CSS で transform: scale に渡す）
export const DIFFICULTY_HOTSPOT_SCALE: Record<Difficulty, number> = {
  easy: 1.35,
  normal: 1.0,
  hard: 0.7,
};

// むずかしいモードではステージ順をシャッフル & 左右ランダム入れ替え
export function shouldShuffleStages(difficulty: Difficulty): boolean {
  return difficulty === "hard";
}

export function shouldMirrorPanels(difficulty: Difficulty): boolean {
  return difficulty === "hard";
}

// ステージ順を必要に応じてシャッフル
export function buildLevelSequence(mode: GameMode, difficulty: Difficulty): number[] {
  const base = getLevelsForMode(mode);
  if (!shouldShuffleStages(difficulty)) return base;
  const arr = [...base];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
