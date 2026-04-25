# subtle 版ステージ（むずかしいモード専用）

このディレクトリは「リアル差分版」の試作ステージを格納します。
仕様は [docs/asset_spec.md](../../../docs/asset_spec.md) のセクション 1B、
プロンプトは [docs/codex_prompts.md](../../../docs/codex_prompts.md) のセクション 1B。

## ファイル構成（Codex 生成）

```
stage{NN}_left.png         # ベース画像（左版）
stage{NN}_right.png        # 差分適用後（右版、edit API で生成）
stages.generated.json      # メタデータ（ホットスポット座標）
```

- `NN` は 01〜10 のゼロパディング2桁
- `level` は 101 から振る（通常ステージ 1-30 と衝突しないため）
- `tier` は必ず `"subtle"` を指定

## 動作

`public/kids/subtle/stages.generated.json` が空配列のとき:
- むずかしいモードは従来どおり通常ステージをシャッフル + 左右反転で再利用

ステージが追加されたとき:
- むずかしいモードは subtle ステージを優先で使用
- ホットスポット倍率は 1.0 固定（すでに難しい設計のため通常版のような縮小はしない）
