import stagesData from "../public/kids/stages.generated.json";

// 子供向けに見つけやすく作り直したステージデータ。
// 座標 (x, y) は間違いの中心点、w/h はホットスポットの幅・高さ。
// すべて画像全体に対するパーセンテージ (%)。

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
  title: string;
  readAloud: string;
  leftImg: string;
  rightImg: string;
  mistakes: Mistake[];
};

export const MIN_HOTSPOT_SIZE = 12;

export const STAGES = stagesData as Stage[];

export function getStage(level: number): Stage {
  const clamped = Math.min(Math.max(level, 1), STAGES.length);
  return STAGES[clamped - 1];
}
