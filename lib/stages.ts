import normalData from "../public/kids/stages.generated.json";
import subtleData from "../public/kids/subtle/stages.generated.json";

// 子供向けに見つけやすく作り直したステージデータ。
// 座標 (x, y) は間違いの中心点、w/h はホットスポットの幅・高さ。
// すべて画像全体に対するパーセンテージ (%)。

export type StageTier = "normal" | "subtle";

export type Mistake = {
  id: number;
  label?: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type Stage = {
  level: number;
  tier: StageTier;
  title: string;
  readAloud: string;
  leftImg: string;
  rightImg: string;
  mistakes: Mistake[];
};

// 通常版（5歳児入門用、差分が大きく分かりやすい）。
export const MIN_HOTSPOT_SIZE_NORMAL = 12;
// リアル差分版（むずかしいモード用、差分が小さい）。
export const MIN_HOTSPOT_SIZE_SUBTLE = 6;
// 互換: 既存コードが参照している場合用
export const MIN_HOTSPOT_SIZE = MIN_HOTSPOT_SIZE_NORMAL;

// JSON データに tier が無い場合は normal を補う
type RawStage = Omit<Stage, "tier"> & { tier?: StageTier };

const tag = (raw: RawStage[], tier: StageTier): Stage[] =>
  raw.map((s) => ({ ...s, tier: s.tier ?? tier }));

export const STAGES_NORMAL: Stage[] = tag(normalData as RawStage[], "normal");
export const STAGES_SUBTLE: Stage[] = tag(subtleData as RawStage[], "subtle");

// 通常版 + サブトル版を結合した全ステージ
export const STAGES: Stage[] = [...STAGES_NORMAL, ...STAGES_SUBTLE];

export function getStage(level: number): Stage | undefined {
  return STAGES.find((s) => s.level === level);
}

export function getStageOrFallback(level: number): Stage {
  return getStage(level) ?? STAGES_NORMAL[0];
}

export function hasSubtleStages(): boolean {
  return STAGES_SUBTLE.length > 0;
}
