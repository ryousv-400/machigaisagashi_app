# Codex への依頼文（リアル差分版ステージ生成）

このファイルは、Codex（並行開発エージェント）に「リアル差分版ステージ」の
生成を依頼するためのテンプレートです。コピペしてそのまま渡せます。

---

## 現状（2026-04-25 時点）

**S01 の reference image 路線が品質合格**

- `public/kids/subtle/gpt-image2-reference/stage01_left.png` / `stage01_right.png`
- 水彩タッチ絵本イラストとして高品質、意図した 4 差分（鳥減・葉色・きのこ追加・しっぽ変更）も明確
- ピクセル単位では水彩テクスチャの再描画が入るため `find_diffs.mjs` の自動検証は不適合
  だが、**人間目視では 5 歳児プレイ体験として十分成立**

**判定**: 自動検証を通すのは AI 生成では原理的に困難。目視合格を採用基準とする。

**次のアクション**: 同じ路線で S02〜S10 を連続生成し、本番ファイルに上書き反映する。

---

## ⏯ 依頼文（コピペ用）

```
@docs/asset_spec.md セクション 1B「全 10 ステージのテーマと差分指示」（S01〜S10）
@public/kids/subtle/stages.generated.json 既存の差分メタデータ
@public/kids/subtle/gpt-image2-reference/stage01_left.png 品質基準（合格済み）
@public/kids/subtle/gpt-image2-reference/stage01_right.png 品質基準（合格済み）

【依頼】
S01 の reference image 路線が品質合格判定（目視で意図差分が明確、水彩タッチも高品質）
となったので、本番ファイルへの反映と S02〜S10 の連続生成をお願いします。

## やってほしいこと（順番に）

### 1. S01 を本番ファイルに反映
- `public/kids/subtle/gpt-image2-reference/stage01_left.png` を
  `public/kids/subtle/stage01_left.png` に **上書きコピー**
- right も同様に上書き
- メタデータ JSON の S01 座標 (x, y, w, h) を **生成された画像の実差分位置** に
  合わせて調整（生成画像と既存座標がズレている場合のみ修正）

### 2. S02〜S10 を同じ reference image 路線で連続生成
- asset_spec.md セクション 1B の S02〜S10 仕様に沿って、各ステージで:
  - 左版を `gpt-image-2` で生成
  - 左版を reference image として、差分指定で右版を生成
- 出来た画像を **直接** `public/kids/subtle/stage{NN}_{left,right}.png` に保存
  （中間ディレクトリは不要）
- 各ステージのメタデータ JSON 座標を、実際の生成画像の差分位置に合わせて記録

### 3. 検証は目視ベース
- find_diffs.mjs はパラメータを緩めても 1 巨大クラスタになるが、それで OK
- 各ステージで以下を目視チェック:
  - 意図した 4〜5 箇所の差分が **見つけて達成感のあるレベル** で出ている
  - 水彩タッチが S01 と統一感ある（色味・輪郭・テクスチャ）
  - 5 歳児が「ここ違うね！」と指で指せる広さの差分

### 4. クリーンアップ
- 旧マスク試作 `public/kids/subtle/gpt-image2/` ディレクトリは **削除**
- 旧 reference 試作 `public/kids/subtle/gpt-image2-reference/` ディレクトリも
  本番反映後に **削除**
- SVG 版生成スクリプト `scripts/generate_subtle_stages.mjs` は git 履歴に残るので
  リポジトリからは **削除** して OK

## 仕様（再掲）
- 1024x1024 PNG、水彩タッチ絵本イラスト
- S01 と画風統一（同じ絵本シリーズの別シーンに見える）
- 各ステージ 4〜5 箇所の差分（asset_spec.md 1B 参照）
- メタデータ: level 101〜110、tier "subtle"、ホットスポット 6% 四方以上
- ChatGPT Plus 月額枠内、quality medium 中心

## 報告事項
- 月額利用枠への影響感
- 各ステージの差分構成（意図通り全部出たか、難航箇所はあるか）
- S01 と比較した画風統一感の自己評価
- 座標調整した箇所のサマリ
```

---

## アプリ側のフック（変更なし）

- `lib/stages.ts` が `public/kids/subtle/stages.generated.json` を自動読み込み
- 「むずかしい」モードで subtle ステージを優先採用
- 画像とメタデータが差し替わるだけでコード変更は不要
