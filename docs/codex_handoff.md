# Codex への依頼文（リアル差分版ステージ生成）

このファイルは、Codex（並行開発エージェント）に「リアル差分版ステージ」の
生成を依頼するためのテンプレートです。コピペしてそのまま渡せます。

---

## 現状（2026-04-25 時点）

**全 10 ステージ（level 101〜110）は SVG プログラム描画版が完成済み**

- `public/kids/subtle/stage{01..10}_{left,right}.png`（SVG → sharp 出力）
- `public/kids/subtle/stages.generated.json`（差分メタデータ）

**過去の試行で判明したこと**
- gpt-image-2 の `images.edit` (mask 付き inpainting) は **マスク領域だけの局所書き換え
  ができない**。マスクを渡しても画像全体を再生成してしまうため、左右ピクセル一致が
  崩れる。マスク方式は不採用。
- 試作物は `public/kids/subtle/gpt-image2/` に隔離済み（本番ファイルは未上書き）

**今回の方針: reference image + 2 枚生成路線**

ピクセル完全一致を諦め、**「視覚的に差分箇所だけ違って見える」** を達成基準にする。
gpt-image-2 の reference image 機能と agentic な領域指示の正確さを使い、

1. 左版を素直に生成
2. 左版を **reference image として渡し**、「○○を消した／増やした／変えた版を作って」
   と指示して右版を生成

差分以外の領域も多少は揺らぐ可能性があるが、それは検証側を緩めて吸収する。

---

## ⏯ 依頼文（コピペ用）

```
@docs/asset_spec.md セクション 1B「リアル差分版（むずかしいモード専用ステージ）」
@public/kids/subtle/stages.generated.json 既存の差分メタデータ（10 ステージ分）

【依頼】
リアル差分版を **gpt-image-2 + reference image 路線** で本生成してください。
images.edit のマスク方式は前回不適合だったので使わない。

## 路線（重要）
1. ベース画像（左版）を `gpt-image-2` で 1 枚生成
2. **その左版を reference image として渡し**、「○○を消した／増やした／微妙に変えた
   版を作って」と agentic に指示して右版を生成
3. 各ステージの差分は asset_spec.md セクション 1B「全 10 ステージのテーマと差分指示」
   の S01〜S10 を参照（4〜5 箇所、消しゴムマジック的に局所だけ変更）
4. ピクセル完全一致は不要。「差分箇所だけが視覚的に違って見える」を目標に。

## まず S01 で実証
- S01「まほうの もり」を gpt-image-2 で生成
- 差分仕様（4 箇所）:
  1. 川辺のきのこが 1本 増えている
  2. 左端の木の葉が 少し黄色寄り
  3. 飛んでいる青い小鳥が 2羽 → 1羽
  4. こぎつねのしっぽの曲がり方が 少し違う
- 左版を生成 → reference として右版を生成
- `node scripts/find_diffs.mjs <left> <right> --tolerance 8 --min-pixels 200 --merge-distance 48`
  で検証（パラメータは緩めに調整して、意図した 4 箇所が大きなクラスタとして検出される
  か確認）
- 差分以外の小ノイズはあって OK。**意図した 4 箇所の差分が 4 つの大きなクラスタとして
  検出されれば合格**
- 左版・右版を見比べて、5 歳児が「ちっちゃな違い」として気づける程度になっているか
  目視確認

## S01 が合格なら S02〜S10 を連続生成
- 同じ路線で S02〜S10 を回す
- ChatGPT Plus 月額枠を意識し、quality は medium 中心、必要なら high

## 保存先
- 本番: `public/kids/subtle/stage{NN}_{left,right}.png` を **gpt-image-2 版で上書き**
- 既存の SVG 版が消えるが、git 履歴に残るので問題ない
- 旧試作 `public/kids/subtle/gpt-image2/` ディレクトリは削除して OK（リファレンス不要）

## メタデータ JSON
- `public/kids/subtle/stages.generated.json` の差分位置 (x/y/w/h) を生成画像と
  一致させたい
- 推奨手順: 既存 JSON の座標を **生成プロンプトに含めて誘導** する
  （例: "place the extra mushroom near the lower-left of the image around (25%, 72%)"）
- 生成後、座標がズレている場合のみ JSON 側を実態に合わせて微調整

## 仕様の核（必読）
- 画風: **水彩タッチの絵本イラスト**（参考: ノンタン、パンどろぼう、こどもちゃれんじ
  よりお姉さん向け）
- 色数 8〜12 色、彩度中庸（パステル + やや渋め）
- シーンは賑やかだが整理されており、複数キャラ／小物が同居
- 差分は「ぱっと見では気づかないが、よく見ると分かる」レベル
- 5 歳児がタップしやすいよう、差分箇所は画像全体の 6% 四方以上のサイズ感

## 報告事項
- 使用した quality（medium / high の内訳）
- 月額利用枠への影響感
- 各ステージの差分検出クラスタ数（緩め設定）と意図差分との対応
- 既存 SVG 版との比較で見栄え差が大きく改善した点
- 特に難航したステージ
```

---

## 補足: 検証ロジックの緩和

`scripts/find_diffs.mjs` はパラメータ調整で AI 生成 2 枚版に対応できる:

```bash
# 厳格（SVG 版用）: ピクセル一致前提
node scripts/find_diffs.mjs left.png right.png --tolerance 2 --min-pixels 16

# 緩い（AI 生成 2 枚版用）: 小ノイズは無視、大きな差分のみ検出
node scripts/find_diffs.mjs left.png right.png --tolerance 8 --min-pixels 200 --merge-distance 48
```

意図した差分が「4〜5 個の大きなクラスタ」として検出され、各クラスタの中心が
メタデータの (x, y) と概ね一致していれば合格判定。

## アプリ側のフック（変更なし）

- `lib/stages.ts` が `public/kids/subtle/stages.generated.json` を自動読み込み
- 「むずかしい」モードで subtle ステージを優先採用
- 画像が差し替わるだけでコード変更は不要

## 既存試作物の扱い

- `public/kids/subtle/gpt-image2/` (mask 方式の失敗試作): 削除して OK
- `scripts/generate_subtle_stages.mjs` (SVG 版): 役目を終えたら削除候補
- 念のため commit 履歴は残す
