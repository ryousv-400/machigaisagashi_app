# まちがいさがし（5さいから）

5歳児がかわいい絵本の世界でのんびり遊べる、まちがいさがしスマホ PWA。

## 特徴

- **のんびりモード**: 時間制限なし。失敗画面なし。
- **完全ひらがな + 音声読み上げ**: 字が読めなくても遊べる（Web Speech API）。
- **１０もん / ３０もん モード**: 集中力に合わせて遊ぶ量を選べる。
- **やさしい難易度**: ホットスポット 12% 以上 & 差分は「大きな色違い・有無・大きさ」中心。
- **PWA対応**: スマホのホーム画面に追加して、アプリのように全画面で起動できる（オフライン配信は今後対応予定）。

## 動かし方（開発）

必要なもの：Node.js 18 以上（推奨 20 以上）

```bash
# 1回だけ：依存パッケージをインストール
npm install

# 開発サーバー起動（ブラウザで即遊べる）
npm run dev
# → http://localhost:3000 をブラウザで開く
```

スマホから動作確認するときは、同じ Wi-Fi 上で以下にアクセス：

```
http://<PCのIPアドレス>:3000
```

## 配布用ビルド

`npm run build` で純粋な HTML/CSS/JS の束が `out/` ディレクトリに書き出されます。

```bash
npm run build
# out/ ディレクトリが生成される

# 配信例（PythonでもOK）
cd out
python3 -m http.server 8080
# → http://localhost:8080 で遊べる
```

`out/` ごと Vercel / Netlify / GitHub Pages 等にアップロードすればそのまま公開できます。

## ディレクトリ構造

```
machigaisagashi_app/
├── app/                  # Next.js App Router のページ
│   ├── layout.tsx        # ルートレイアウト（背景きらきら演出）
│   ├── page.tsx          # タイトル画面（モード選択）
│   ├── play/page.tsx     # ゲーム画面
│   └── globals.css       # 共通スタイル
├── components/           # React コンポーネント
│   ├── TitleScreen.tsx   # タイトル＋モード選択
│   ├── GameBoard.tsx     # ゲームの親コンポーネント
│   ├── Panel.tsx         # 左右のパネル（画像＋ホットスポット）
│   ├── Hotspot.tsx       # 間違い当たり判定
│   ├── Mascot.tsx        # マスコット（うさぎちゃん）
│   ├── StarProgress.tsx  # 星で見つけた数を表示
│   ├── Effects.tsx       # 正解・不正解の演出
│   ├── Confetti.tsx      # クリア時の紙吹雪
│   ├── ClearScreen.tsx   # クリア画面
│   └── SoundToggle.tsx   # 音声 ON/OFF
├── lib/                  # ロジック（ゲーム状態・音声・ステージ定義）
│   ├── stages.ts         # 全ステージデータ
│   ├── modes.ts          # ３もん / ６もん モード設定
│   ├── speech.ts         # 音声読み上げ（Web Speech API）
│   ├── sound.ts          # 効果音（AudioContext）
│   └── store.ts          # Zustand ゲーム状態
├── public/
│   ├── kids/             # Codex 生成のステージ画像・マスコット・差分パーツ
│   ├── icon-192.png      # アプリアイコン (192)
│   ├── icon-512.png      # アプリアイコン (512)
│   └── manifest.json     # PWA マニフェスト
├── docs/
│   ├── asset_spec.md     # Codex 向け画像仕様書
│   └── codex_prompts.md  # Codex 向けプロンプト集
├── tools/
│   └── build_kids_assets.py  # ステージ画像組み立てスクリプト（Codex 側）
├── _archive/             # 旧バージョンのアセットとソース（参考用）
├── package.json
├── tsconfig.json
└── next.config.ts        # 静的エクスポート設定
```

## 音声読み上げについて

このアプリは **Web Speech API**（ブラウザ標準の音声合成）を使います。

- iOS Safari・Android Chrome では自動で日本語音声が選ばれます。
- 初回の音声再生は **ユーザーが画面をタップしたあと** に発火します（ブラウザの安全仕様）。
- 音声が出ない場合は右下のトグルで ON にしてください。

## 画像・キャラクターを追加・差し替えしたい

画像アセットは **Codex 側で生成**する役割分担になっています。

1. `docs/asset_spec.md` と `docs/codex_prompts.md` を Codex に読ませる
2. Codex が `public/kids/` に画像を書き出す（既存の `tools/build_kids_assets.py` も活用）
3. `lib/stages.ts` のステージ定義と `public/kids/` のパスを揃える
4. `npm run build` で再配布

ステージを増やす / 減らすときは：
- `lib/stages.ts` の `STAGES` 配列を編集
- `lib/modes.ts` の `MODE_10_LEVELS` / `MODE_30_LEVELS` を編集

## ヒントが欲しい場合

- ゲーム中の「💡 ヒント」ボタンを押すと、まだ見つけていない間違いの場所を「ひだりのうえ」等のざっくり位置でマスコットが教えてくれます。
- タップ回数に制限はありません。

## よくあるトラブル

| 症状 | 対処 |
|---|---|
| `npm install` でエラー | Node.js のバージョンが 18 未満だと失敗します。`node -v` を確認 |
| 音声が出ない | ブラウザの自動再生ブロックの可能性。画面をどこかタップしてから再度メッセージが出るのを待つ |
| 画像が真っ白 | `public/kids/` にファイルが揃っているか確認。`lib/stages.ts` のパスと一致しているか |
| スマホでフリーズ | PWA として追加した場合、スワイプジェスチャーが画面の戻るボタンと干渉することがある。ブラウザから開き直してみる |

## ライセンス

個人使用の範囲内で自由に編集・利用してください。
