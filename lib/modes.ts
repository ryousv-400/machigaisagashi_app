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
