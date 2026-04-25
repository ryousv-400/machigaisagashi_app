# Codex への依頼文（リアル差分版ステージ生成）

このファイルは、Codex（並行開発エージェント）に「リアル差分版ステージ」の
生成を依頼するためのテンプレートです。コピペしてそのまま渡せます。

---

## 現状（2026-04-25 時点）

**全 10 ステージ（level 101〜110）は SVG プログラム描画版が完成済み**

- `public/kids/subtle/stage{01..10}_{left,right}.png`（SVG → sharp 出力）
- `public/kids/subtle/stages.generated.json`（差分メタデータ）
- `scripts/generate_subtle_stages.mjs`（生成スクリプト）
- `scripts/find_diffs.mjs`（差分検証）

**次のフェーズ: gpt-image-2 で本物の絵本タッチに差し替え**

ユーザーは ChatGPT Plus 加入済みで、**Codex 経由なら月額範囲内で `gpt-image-2`
が利用可能**。前回 Codex は API キー無しと判断して SVG にフォールバックしたが、
今回はストレートに gpt-image-2 + `images.edit` (inpainting) で本生成して OK。

---

## ⏯ 依頼文（コピペ用）

```
@docs/asset_spec.md セクション 1B「リアル差分版（むずかしいモード専用ステージ）」
@public/kids/subtle/stages.generated.json 既存の差分メタデータ（10 ステージ分）
@scripts/generate_subtle_stages.mjs 既存の SVG 試作版スクリプト（テーマ確認用）

【依頼】
リアル差分版の全 10 ステージ（level 101〜110）を、
**gpt-image-2 + images.edit (inpainting)** で本生成してください。

私（ユーザー）は ChatGPT Plus 加入なので、Codex 経由なら gpt-image-2 を
月額範囲内で使えます。前回 SVG にフォールバックしたのは API キー判定の
誤りなので、今回は素直に gpt-image-2 を呼んで本物の絵本タッチで作って OK。

## 生成対象
- `public/kids/subtle/stage{01..10}_left.png` （ベース、1024x1024 PNG）
- `public/kids/subtle/stage{01..10}_right.png` （差分適用後、1024x1024 PNG）
- 既存ファイルを **上書き** で OK

## 既存資産の活用方針
- **メタデータ JSON はそのまま流用**: 差分位置 (x/y/w/h) とラベルは確定済み
- 既存 SVG 版でテーマ・差分構成は確認できるので、画像生成のリファレンスに
- ただし画風は SVG ではなく **水彩タッチ絵本イラスト** で全面的に作り直し

## 生成ワークフロー（各ステージ共通）
1. ベース画像 1 枚を `gpt-image-2` で生成
   - quality: medium で開始、見栄えが弱ければ high に上げる
   - サイズ: 1024x1024
   - プロンプト: docs/codex_prompts.md セクション 1B のテンプレ + 各ステージのテーマ
2. 出来栄えが基準を満たしたら `_left.png` として確定
3. 各差分について **マスク画像** を作成（変更したい領域を白、それ以外を黒）
4. `gpt-image-2` の `images.edit` API（inpainting）にベース + マスク + 差分プロンプトを渡し、
   その領域だけ書き換えた画像を取得
5. 4〜5 箇所すべての差分を順に edit で重ねて `_right.png` を保存

## 仕様の核（必読）
- 画風: **水彩タッチの絵本イラスト**（参考: ノンタン、パンどろぼう、こどもちゃれんじよりお姉さん向け）
- 色数 8〜12 色、彩度中庸（パステル + やや渋め）、太い輪郭線は控えめ
- シーンは賑やかだが整理されており、複数のキャラ／小物が同居
- 差分は「ぱっと見では気づかないが、よく見ると分かる」程度の微妙さ
- 左右画像は差分以外ピクセル一致（必ず inpainting 経由、同プロンプト 2 回流しは NG）

## メタデータの再確認
既存 JSON の差分位置を尊重しつつ、生成された画像と座標がズレている
場合のみ JSON 側を微調整（基本は画像を JSON に合わせて生成する）。

## 検証
- `node scripts/find_diffs.mjs` で差分が 3〜5 クラスタに収まり、
  それ以外がピクセル一致（許容 ±2 階調）であることを確認
- メタデータの座標が実際の差分と一致しているか目視確認

## 進め方
- まず S01 を gpt-image-2 で生成して品質を固める（1 枚で OK と判断できるレベルか確認）
- S01 が合格ラインなら同じ基準で S02〜S10 をテンポよく
- ChatGPT Plus 月額枠内に収めるため、quality は medium 中心、
  出来が弱いステージのみ high に上げる方針

## 報告事項
全 10 ステージの生成が完了したら以下を簡単にまとめて報告ください:
- 使用した quality（medium / high の内訳）
- 月額利用枠への影響感（残り使用量、生成枚数）
- 各ステージの差分検出クラスタ数
- 既存 SVG 版との比較で見栄え差が大きく改善した点
- 特に難航したステージや、追加チューニング推奨のステージ
```

---

## 補足: アプリ側のフック

`public/kids/subtle/stages.generated.json` に項目があれば、アプリ側はビルドし直す
だけで自動的に subtle ステージを認識します。

- `lib/stages.ts` が両ファイル（normal + subtle）を結合
- `lib/modes.ts` `buildLevelSequence` が `STAGES_SUBTLE.length > 0` で分岐し、
  「むずかしい」モードでは subtle ステージを優先採用
- `tier: "subtle"` のステージはホットスポット倍率を 1.0 で表示（縮小しない）

画像が差し替わるだけで、メタデータ・コード変更は不要（座標がズレた場合のみ JSON 修正）。

## 既存 SVG 版の扱い

- gpt-image-2 版が完成して娘さんの反応が良ければ、`scripts/generate_subtle_stages.mjs`
  は役目を終えるので削除候補（コミット履歴には残る）
- gpt-image-2 版の出来が今ひとつなら、SVG 版に巻き戻して併用も可能
