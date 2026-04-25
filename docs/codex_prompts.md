# Codex 生成プロンプト・テンプレート

このファイルは [asset_spec.md](./asset_spec.md) とセットで使う、
Codex（画像生成AI）に直接貼り付けられるプロンプト集です。

---

## 0. 共通システムプロンプト（毎回先頭に付ける）

```
You are generating illustrations for a spot-the-difference game for 5-year-olds.

Style guide (MUST follow):
- Storybook / picture-book style (think "こどもちゃれんじ" or "Peppa Pig").
- Bright pastel colors (soft pinks, sky blues, mint green, cream yellow).
- THICK dark outlines (dark brown #4a3f55, 3-5 px equivalent).
- Rounded, cute, child-friendly shapes. No sharp edges.
- Flat shading with only subtle highlights. NO heavy shadows, NO photorealism.
- Main subject is large and centered. Background is simple (single color or soft gradient).
- NO scary elements, NO weapons, NO violence, NO frightening faces.
- Square 1024x1024 PNG output.
```

---

## 1. ステージ画像プロンプト（ペアで生成）

ステージごとに `left.png`（おてほん）と `right.png`（もんだい）の 2 枚を生成します。
**2 枚の間には正確に 3 箇所の差分**を入れてください。

### プロンプトテンプレート

```
Generate a spot-the-difference pair for stage {NN}: "{JA_TITLE}".

## LEFT image (public/stages/stage{NN}_left.png)
Scene: {SCENE}
Main subject: {MAIN}
Supporting elements: {SUPPORTING}

## RIGHT image (public/stages/stage{NN}_right.png)
Same scene, same main subject, same composition — pixel-perfect alignment of all non-differing elements.
Apply EXACTLY these 3 differences (and no others):

1. Difference A (Presence/Absence): {DIFF_1}
2. Difference B (Color change): {DIFF_2}
3. Difference C (Size change — make it at least 2x larger or smaller): {DIFF_3}

## Constraints
- Each difference MUST cover at least 12% × 12% of the image area (about 123×123 px).
- Differences must NOT be placed within 8% of any edge.
- Differences must be at least 20% apart from each other.
- Differences must be OBVIOUS to a 5-year-old. Avoid subtle differences.
- All non-differing parts must be pixel-identical between the two images.
```

### 具体例（ステージ 01 の場合）

```
Generate a spot-the-difference pair for stage 01: "もりの うさぎさん" (rabbit in the forest).

## LEFT image (public/stages/stage01_left.png)
Scene: A sunny green forest with soft dappled light, pastel sky peeking through branches.
Main subject: A cute white rabbit sitting in the center of the image, with pink inner ears and a small bow-tie.
Supporting elements: A large rounded tree on the left background, a red mushroom with white dots at the bottom-right, a blue butterfly floating at the top-left, tufts of grass and small pink flowers around the rabbit.

## RIGHT image (public/stages/stage01_right.png)
Same scene, same rabbit, same composition — pixel-perfect alignment of all non-differing elements.
Apply EXACTLY these 3 differences (and no others):

1. Difference A (Presence/Absence): The blue butterfly at the top-left is MISSING.
2. Difference B (Color change): The red mushroom at the bottom-right is YELLOW (same shape, just yellow with white dots).
3. Difference C (Size change): The rabbit's ears are at least 2x TALLER.

## Constraints
- Each difference MUST cover at least 12% × 12% of the image area.
- Differences must NOT be within 8% of any edge.
- Differences must be at least 20% apart from each other.
- Differences must be OBVIOUS to a 5-year-old.
- All non-differing parts must be pixel-identical between the two images.
```

### 30 ステージ分の簡易テーブル

各ステージの詳細は `asset_spec.md` セクション 2 を参照し、上記テンプレートの
`{NN}`, `{JA_TITLE}`, `{SCENE}`, `{MAIN}`, `{SUPPORTING}`, `{DIFF_1}`, `{DIFF_2}`, `{DIFF_3}` を
埋めて Codex に渡してください。

---

## 1B. リアル差分版ステージ（むずかしいモード専用）

通常版とは別の **絵本風 / 微小差分** ステージ。仕様の本体は
`asset_spec.md` セクション 1B を参照。

### ベース画像生成プロンプト（左版 = `_left.png`）

```
Generate base illustration for a children's spot-the-difference book — "subtle differences" tier.

Style requirements:
- Soft watercolor + ink storybook illustration. Reference: Japanese picture books like
  "ノンタン", "パンどろぼう". Slightly more detailed than typical "こどもちゃれんじ" style.
- Multiple animal characters arranged in a balanced composition.
- Mid-density background with subtle painted details (mushrooms, plants, small props).
- Pastel + slightly desaturated palette, 8-12 colors total. NO neon.
- Thick but slightly textured ink lines (varying line weight).
- Soft watercolor wash with gentle paper texture, NO heavy shadows, NO photorealism.
- Square 1024x1024 PNG, no border, no text, no UI chrome.
- Whole scene readable as a single illustration (no panels).

Scene: {SCENE_PROMPT}
```

例（S01: まほうの もり）:

```
Scene: A magical green forest with a small stream winding from left to right.
A friendly brown bear stands center-left, smiling, gesturing toward a pink rabbit beside it.
A small white rabbit sits on the lower-left bank near a pink crystal cluster.
A small orange fox is on the lower-right, half-crouched.
Two small blue birds fly across the upper portion of the image.
A wise owl peeks from a hollow on the right side of a large tree.
Mushrooms (red and pink) and small flowers are scattered across the foreground.
Soft beams of light filter through the trees from the upper background.
A small wooden signpost on the lower-right is blank (no text).
Composition: balanced, multiple focal points, bright but storybook-like atmosphere.
```

### 右版生成プロンプト — reference image 路線（mask 方式は不採用）

**重要**: gpt-image-2 の `images.edit` (マスク付き inpainting) は前回検証で
**マスク領域だけの局所書き換えができず画像全体を再生成してしまう**ため、
mask 方式は使わない。

代わりに **左版を reference image として渡し、agentic に「○○を消す／増やす／変える」
と指示して右版を生成** する路線を採用する。

> ユーザーは ChatGPT Plus 加入なので、Codex 経由なら `gpt-image-2` を月額枠内で
> 利用可能。`OPENAI_API_KEY` 不在を理由に SVG にフォールバックする必要はない。

```python
# 擬似コード（最新 OpenAI SDK の reference image / image-to-image 機能を使用）
# 具体的なエンドポイント名は gpt-image-2 の最新ドキュメント参照
from openai import OpenAI
client = OpenAI()

# 1) ベース画像（左版）を生成
left = client.images.generate(
    model="gpt-image-2",
    prompt=BASE_PROMPT,  # 上記「ベース画像生成プロンプト」
    size="1024x1024",
    quality="medium",
)
save(left, "stage01_left.png")

# 2) 左版を reference として、差分を全て反映した右版を 1 回で生成
#    プロンプトに 4〜5 箇所の差分を「位置と内容」で明示
diff_prompt = """
Generate a near-identical version of the reference image, with ONLY these subtle local changes:
1. Add ONE extra small red-with-white-dots mushroom near the streambank around (25%, 72%) of the image.
2. Tint the leaves of the leftmost tree slightly more yellow (autumnal warmth) around (15%, 26%).
3. Remove ONE of the two flying blue birds in the upper area around (67%, 23%).
4. Change ONLY the curl of the fox's tail at (74%, 69%) — curve up more sharply at the tip.

Keep EVERYTHING ELSE — composition, characters, colors, lighting, background — identical to the reference image.
Use the same watercolor + ink storybook style.
"""

right = client.images.generate(
    model="gpt-image-2",
    prompt=diff_prompt,
    image=open("stage01_left.png", "rb"),  # reference image として渡す（API の最新仕様確認）
    size="1024x1024",
    quality="medium",
)
save(right, "stage01_right.png")
```

> 注: `client.images.generate` への reference image の渡し方は gpt-image-2 の
> 最新ドキュメント（developers.openai.com/api/docs/models/gpt-image-2）を確認。
> reference image が複数渡せる場合は左版 + マスク領域の輪郭ヒント等も併用可。

### 右版生成のチェックポイント（緩めの基準）

- 意図した 4〜5 箇所の差分が **大きなクラスタ** として検出される
- それ以外の領域は「人間の目で見て概ね同じ」（完全ピクセル一致は求めない）
- `node scripts/find_diffs.mjs left.png right.png --tolerance 8 --min-pixels 200 --merge-distance 48`
  で 4〜5 クラスタが検出され、各クラスタの中心がメタデータ (x, y) と概ね一致
- 各差分が画像全体の 6% 四方以上のホットスポットでカバーできる
- 「ぱっと見ては気づかないが、よく見ると分かる」レベル
- 5歳児が指で押せる広さに調整（タップ判定 w/h はメタデータで広めに設定可）

### 生成対象

全 10 ステージ（S01〜S10、level 101〜110）を `gpt-image-2` で本生成。
SVG 試作版は既に main にあり、テーマ・差分構成・座標は確定済みなので、
画風だけ水彩タッチに差し替える形になる。

最初は **S01** で画質・差分品質を固めてから、同じ基準で S02〜S10 を連続生成。

各ステージの詳細シーン・差分は `asset_spec.md` セクション 1B を参照。

### メタデータ JSON 出力先

```
public/kids/subtle/stages.generated.json
```

形式は `asset_spec.md` セクション 1B の例を参照。
`tier: "subtle"` を必ず付与する。

---

## 2. マスコットキャラクター生成プロンプト

```
Design an original mascot character for a spot-the-difference game for 5-year-olds.

## Style requirements
- Storybook / picture-book illustration style.
- Pastel colors (soft pink, cream, gentle yellow).
- Thick dark outlines (#4a3f55).
- Rounded, cuddly, huggable shape.
- Large expressive eyes.
- One signature accessory (e.g., a tiny bow, a star hair clip, a ribbon).
- Character should be immediately lovable to a 5-year-old.

## Output (4 expressions)
Produce 4 PNG files at 512×512 px with TRANSPARENT BACKGROUND:

1. `public/mascot/idle.png` — calm, friendly smile, eyes fully open, arms at sides.
2. `public/mascot/happy.png` — big beaming smile, eyes squinted with joy, both arms raised or mid-jump.
3. `public/mascot/sad.png` — soft frown, eyes downcast, slight slump (NO tears, just disappointed).
4. `public/mascot/hint.png` — thinking pose, one paw/hand under chin or index finger raised, curious expression.

## Species suggestion
Pick ONE of: rabbit / bear / cat / tiny fairy / star child.
Keep the same species and accessory across all 4 expressions — only pose & face change.

## Margins
Keep 10% transparent margin on all sides (so the character doesn't touch edges).
```

---

## 3. アプリアイコンプロンプト

```
Design an app icon for a cute Japanese spot-the-difference game for 5-year-olds,
titled 「まちがいさがし」.

## Requirements
- Square icon, provide two sizes: 192×192 and 512×512 PNG.
- Background: soft pastel pink (#fff0f6) with a thin rounded border.
- Center: close-up of the game's mascot character (same as `public/mascot/idle.png`).
- The kana「まちがいさがし」can appear in small rounded font at the bottom in dark pink,
  or omitted entirely if crowded.
- Must remain readable at 64×64 px (iOS home screen size).
- Rounded corners are optional — iOS applies its own mask.
```

---

## 4. モード選択アイコン（任意）

```
Design two small badge illustrations for mode selection buttons in a Japanese kids' game.

1. `public/mode_10.png` (200×200 px, transparent PNG)
   - Cute rabbit peeking from behind a pink ribbon with the number "10" on it.
   - Soft pastel pink palette.
   - "もん" kana optional below.

2. `public/mode_30.png` (200×200 px, transparent PNG)
   - A unicorn or a big sparkle burst with a purple/blue ribbon bearing the number "30".
   - Soft pastel purple/blue palette.
   - "もん" kana optional below.

Match the storybook style of the stage illustrations.
Thick dark outlines, flat shading, rounded shapes.
```

---

## 5. ワークフロー手順（提案）

1. `docs/asset_spec.md` を Codex 側で読ませる（コンテキストとして渡す）
2. マスコットから先に生成（4表情 × 統一キャラ）
3. アプリアイコン生成
4. ステージ 01 をテスト生成 → 配置 → `node scripts/find_diffs.mjs` で差分検出 → UI 確認
5. 問題なければ残り 02〜30 を順番に生成
6. 全画像配置後、座標データ自動更新 & ビルド
