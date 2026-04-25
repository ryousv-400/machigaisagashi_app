# Codex への依頼文（リアル差分版ステージ生成）

このファイルは、Codex（並行開発エージェント）に「リアル差分版ステージ」の
生成を依頼するためのテンプレートです。コピペしてそのまま渡せます。

---

## 現状（2026-04-25 時点）

- S01〜S03（level 101〜103）は完成済み
  - `public/kids/subtle/stage0{1,2,3}_{left,right}.png`
  - `public/kids/subtle/stages.generated.json` に 3 件登録済み
  - `scripts/generate_subtle_stages.mjs` で SVG + sharp ベースのプログラム描画
  - `scripts/find_diffs.mjs` で差分検証

次の発注は **残り 7 ステージ（S04〜S10、level 104〜110）** の連続生成。

---

## ⏯ 依頼文（コピペ用）

```
@docs/asset_spec.md セクション 1B「リアル差分版（むずかしいモード専用ステージ）」
@scripts/generate_subtle_stages.mjs 既存の生成スクリプト（S01〜S03 実装済）

【依頼】
リアル差分版の残り 7 ステージ（S04〜S10、level 104〜110）を 連続して 生成してください。
途中で確認は不要です。完成したらまとめて報告してください。

## 生成対象
- docs/asset_spec.md セクション 1B「全 10 ステージのテーマと差分指示」の
  S04〜S10（level 104〜110）すべて
- 各ステージにつき以下を生成:
  - `public/kids/subtle/stage{NN}_left.png` （ベース、1024x1024 PNG）
  - `public/kids/subtle/stage{NN}_right.png` （差分適用後、1024x1024 PNG）
- `public/kids/subtle/stages.generated.json` に 7 件 追記（既存 3 件は維持）

## 進め方（既存実装の踏襲を推奨）
- S01〜S03 は `scripts/generate_subtle_stages.mjs` で SVG プログラム描画 →
  sharp で PNG 化する手法を採用済み。
  S04〜S10 も 同じスクリプトを拡張 して同手法で生成するのが自然。
- 各ステージ用の `renderXxxx(...)` 関数を SVG で書き起こし、
  左右で差分の出る要素だけ条件分岐させる作りでよい。
- JSON の追記は既存配列の末尾に push、`level` は 104〜110 を割り当てる。
- 別アプローチ（OpenAI gpt-image-1 + inpainting）を採用したい場合は、
  生成後の左右ピクセル一致が崩れない手段を取ること。

## メタデータ仕様
- `level`: 104〜110
- `tier: "subtle"` 必須
- 各 mistake の w/h は 6% 以上、5歳児がタップしやすいよう周辺込みで広めに
- `id` は 1 から連番
- `label` は子供向けひらがな短文（既存 S01〜S03 のスタイル踏襲）
- `readAloud` は「{タイトル}！ ちっちゃな ちがいを みつけてね！」形式

## 仕様の核（必読）
- 画風: 既存 S01〜S03 と統一感を保つ（同じ絵本シリーズの別シーンに見える）
- 差分は「ぱっと見では気づかないが、よく見ると分かる」程度の微妙さ
- 左右画像は差分以外ピクセル一致（プログラム描画なら本質的に保証される）
- ホットスポット最小 6% 四方、互いに 12% 以上離す、画面端 5% 以内は避ける

## 検証（生成後に各ステージで実施）
- `node scripts/find_diffs.mjs` を実行し、差分が 3〜5 クラスタに収まり、
  それ以外がピクセル一致（許容 ±2 階調）であることを確認
- メタデータの座標が実際の差分と一致しているか目視確認

## 報告事項
全 7 ステージの生成が完了したら、以下を簡単にまとめて報告ください:
- 生成にかかった所要時間
- 各ステージの差分検出クラスタ数（find_diffs.mjs の出力サマリ）
- 既存 S01〜S03 と画風の統一感が取れているかの自己評価
- 特に難航したステージや、品質が他と比べて落ちる懸念のあるステージ
```

---

## 補足: アプリ側のフック

`public/kids/subtle/stages.generated.json` に項目が増えれば、アプリ側は
ビルドし直すだけで自動的に subtle ステージを認識します。

- `lib/stages.ts` が両ファイル（normal + subtle）を結合
- `lib/modes.ts` `buildLevelSequence` が `STAGES_SUBTLE.length > 0` で分岐し、
  「むずかしい」モードでは subtle ステージを優先採用
- `tier: "subtle"` のステージはホットスポット倍率を 1.0 で表示（縮小しない）

10 ステージそろえば、`buildLevelSequence` のロジックにより
「10もん モード × むずかしい」ですべてのリアル差分版を体験できる構成になります
（`Math.min(targetCount, subtleLevels.length)`）。
