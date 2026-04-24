from pathlib import Path
import json

from PIL import Image, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "kids" / "generated_sources"
ASSET_SRC = ROOT / "assets" / "kids"
OUT = ROOT / "public" / "kids"
SIZE = 640
MIN_HOTSPOT_PERCENT = 12
HOTSPOT_PAD_PERCENT = 2


DIFFS = {
    "heart_balloon": ASSET_SRC / "diff_heart_balloon.png",
    "star_cookie": ASSET_SRC / "diff_star_cookie.png",
    "crown_fish": ASSET_SRC / "diff_crown_fish.png",
    "toy_train": ASSET_SRC / "diff_toy_train.png",
    "smile_planet": ASSET_SRC / "diff_smile_planet.png",
    "music_drum": ASSET_SRC / "diff_music_drum.png",
    "rainbow_umbrella": ASSET_SRC / "diff_rainbow_umbrella.png",
    "teddy_heart": ASSET_SRC / "diff_teddy_heart.png",
    "strawberry_cupcake": ASSET_SRC / "diff_strawberry_cupcake.png",
    "flower_pinwheel": ASSET_SRC / "diff_flower_pinwheel.png",
    "winged_ball": ASSET_SRC / "diff_winged_ball.png",
}

DIFF_LABELS = {
    "heart_balloon": "ハートふうせん",
    "star_cookie": "スタークッキー",
    "crown_fish": "おうかんフィッシュ",
    "toy_train": "にじいろトレイン",
    "smile_planet": "スマイルプラネット",
    "music_drum": "ミュージックドラム",
    "rainbow_umbrella": "にじいろかさ",
    "teddy_heart": "ハートテディ",
    "strawberry_cupcake": "いちごカップケーキ",
    "flower_pinwheel": "おはなかざぐるま",
    "winged_ball": "つばさボール",
}

UI_ASSETS = [
    ASSET_SRC / "ui_star_badge.png",
    ASSET_SRC / "ui_hint_magnifier.png",
    ASSET_SRC / "ui_home_house.png",
    ASSET_SRC / "ui_sound_on.png",
    ASSET_SRC / "ui_sound_off.png",
]


BASES = [
    ("にじいろピクニック", "stage1_base.png"),
    ("あまいおかしのキッチン", "stage2_base.png"),
    ("うみのなかまたち", "stage3_base.png"),
    ("おもちゃのおへや", "stage4_base.png"),
    ("ほしぞらたんけん", "stage5_base.png"),
    ("もりのおんがくかい", "stage6_base.png"),
    ("きょうりゅうこうえん", "stage7_base.png"),
    ("ようせいのおちゃかい", "stage8_base.png"),
    ("アイスクリームカーニバル", "stage9_base.png"),
    ("ちいさなビルダーまち", "stage10_base.png"),
    ("あめあがりのまち", "stage11_base.png"),
    ("どうぶつパンやさん", "stage12_base.png"),
    ("ドラゴンのおしろパレード", "stage13_base.png"),
]


STAGE_ITEMS = [
    {
        "items": [
            ("heart_balloon", 82, 60, 135),
            ("star_cookie", 475, 92, 120),
            ("crown_fish", 92, 418, 135),
        ],
    },
    {
        "items": [
            ("star_cookie", 74, 72, 130),
            ("heart_balloon", 462, 108, 125),
            ("music_drum", 386, 408, 145),
        ],
    },
    {
        "items": [
            ("crown_fish", 424, 78, 150),
            ("star_cookie", 84, 410, 120),
            ("smile_planet", 455, 425, 130),
        ],
    },
    {
        "items": [
            ("toy_train", 52, 386, 180),
            ("heart_balloon", 474, 70, 125),
            ("star_cookie", 442, 410, 115),
        ],
    },
    {
        "items": [
            ("smile_planet", 74, 70, 145),
            ("crown_fish", 440, 354, 135),
            ("music_drum", 84, 422, 140),
        ],
    },
    {
        "items": [
            ("music_drum", 78, 398, 150),
            ("toy_train", 408, 392, 165),
            ("heart_balloon", 450, 74, 120),
        ],
    },
]


PATTERNS = [
    [("heart_balloon", 82, 58), ("star_cookie", 470, 82), ("crown_fish", 92, 415), ("rainbow_umbrella", 420, 400), ("winged_ball", 268, 78)],
    [("strawberry_cupcake", 74, 68), ("music_drum", 390, 404), ("teddy_heart", 462, 72), ("flower_pinwheel", 86, 410), ("smile_planet", 452, 260)],
    [("crown_fish", 420, 76), ("star_cookie", 82, 405), ("smile_planet", 458, 412), ("rainbow_umbrella", 70, 92), ("heart_balloon", 272, 438)],
    [("toy_train", 52, 384), ("heart_balloon", 474, 66), ("star_cookie", 438, 405), ("winged_ball", 82, 82), ("strawberry_cupcake", 282, 72)],
    [("smile_planet", 74, 68), ("crown_fish", 438, 350), ("music_drum", 84, 420), ("flower_pinwheel", 438, 78), ("teddy_heart", 268, 390)],
    [("music_drum", 78, 396), ("toy_train", 408, 392), ("heart_balloon", 450, 72), ("rainbow_umbrella", 82, 74), ("star_cookie", 270, 420)],
    [("teddy_heart", 82, 392), ("winged_ball", 438, 88), ("flower_pinwheel", 84, 76), ("strawberry_cupcake", 448, 400), ("smile_planet", 270, 72)],
    [("rainbow_umbrella", 76, 78), ("heart_balloon", 452, 88), ("star_cookie", 88, 410), ("teddy_heart", 402, 396), ("music_drum", 270, 420)],
    [("strawberry_cupcake", 86, 82), ("star_cookie", 450, 78), ("heart_balloon", 450, 398), ("winged_ball", 84, 400), ("crown_fish", 270, 70)],
    [("toy_train", 66, 400), ("winged_ball", 460, 84), ("flower_pinwheel", 88, 74), ("music_drum", 440, 396), ("star_cookie", 272, 420)],
    [("rainbow_umbrella", 82, 70), ("teddy_heart", 444, 390), ("heart_balloon", 456, 80), ("smile_planet", 80, 412), ("crown_fish", 270, 76)],
    [("strawberry_cupcake", 82, 392), ("star_cookie", 454, 86), ("teddy_heart", 444, 390), ("music_drum", 84, 76), ("flower_pinwheel", 272, 418)],
    [("crown_fish", 86, 86), ("heart_balloon", 458, 72), ("toy_train", 404, 396), ("star_cookie", 82, 416), ("winged_ball", 270, 80)],
]


def make_stage_config(level):
    base_title, base_file = BASES[(level - 1) % len(BASES)]
    pattern = PATTERNS[(level - 1) % len(PATTERNS)]
    if level <= 10:
        count = 3
        size_base = 128
    elif level <= 22:
        count = 4
        size_base = 112
    else:
        count = 5
        size_base = 96

    items = []
    shift = ((level - 1) // len(BASES)) * 22
    for index, (asset_name, x, y) in enumerate(pattern[:count]):
        adjusted_x = max(42, min(512, x + ((shift if index % 2 == 0 else -shift) // 2)))
        adjusted_y = max(48, min(500, y + ((shift if index % 2 == 1 else -shift) // 3)))
        size = max(88, size_base - (index * 4) + (8 if level <= 10 else 0))
        items.append((asset_name, adjusted_x, adjusted_y, size))

    title = base_title if level <= len(BASES) else f"{base_title} {level}"
    read_aloud = f"だい {level} もん！ {base_title}！ ちがうところは {count}こ あるよ！"
    return {
        "level": level,
        "title": title,
        "readAloud": read_aloud,
        "base": base_file,
        "items": items,
    }


STAGES = [make_stage_config(level) for level in range(1, 31)]


def fit_square(image):
    image = ImageOps.exif_transpose(image.convert("RGB"))
    w, h = image.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return image.crop((left, top, left + side, top + side)).resize((SIZE, SIZE), Image.Resampling.LANCZOS)


def trim_alpha(image):
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image
    return image.crop(bbox)


def paste_sticker(canvas, sticker, x, y, max_size):
    sticker = trim_alpha(sticker)
    w, h = sticker.size
    scale = max_size / max(w, h)
    new_size = (max(1, round(w * scale)), max(1, round(h * scale)))
    sticker = sticker.resize(new_size, Image.Resampling.LANCZOS)

    shadow = Image.new("RGBA", sticker.size, (0, 0, 0, 0))
    shadow.putalpha(sticker.getchannel("A").filter(ImageFilter.GaussianBlur(6)))
    shadow_tint = Image.new("RGBA", sticker.size, (80, 55, 80, 70))
    shadow = Image.composite(shadow_tint, shadow, shadow.getchannel("A"))
    canvas.alpha_composite(shadow, (x + 6, y + 8))
    canvas.alpha_composite(sticker, (x, y))

    visual_w = new_size[0] / SIZE * 100
    visual_h = new_size[1] / SIZE * 100
    return {
        "x": round((x + new_size[0] / 2) / SIZE * 100, 2),
        "y": round((y + new_size[1] / 2) / SIZE * 100, 2),
        "w": round(max(MIN_HOTSPOT_PERCENT, visual_w + HOTSPOT_PAD_PERCENT), 2),
        "h": round(max(MIN_HOTSPOT_PERCENT, visual_h + HOTSPOT_PAD_PERCENT), 2),
    }


def make_icon():
    mascot = trim_alpha(Image.open(ASSET_SRC / "mascot_bunny.png"))
    icon = Image.new("RGBA", (512, 512), (255, 239, 248, 255))
    for radius, color in [(232, (255, 198, 92, 255)), (205, (255, 255, 255, 255))]:
        layer = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        mask = Image.new("L", (512, 512), 0)
        cx = cy = 256
        for yy in range(512):
            for xx in range(512):
                if (xx - cx) ** 2 + (yy - cy) ** 2 <= radius ** 2:
                    mask.putpixel((xx, yy), 255)
        layer.paste(color, (0, 0), mask)
        icon.alpha_composite(layer)
    mascot.thumbnail((350, 350), Image.Resampling.LANCZOS)
    icon.alpha_composite(mascot, ((512 - mascot.width) // 2, 120))
    icon.save(ROOT / "public" / "icon-512.png")
    icon.resize((192, 192), Image.Resampling.LANCZOS).save(ROOT / "public" / "icon-192.png")


def write_public_cutout(source_path):
    image = trim_alpha(Image.open(source_path))
    image.thumbnail((512, 512), Image.Resampling.LANCZOS)
    image.save(OUT / source_path.name, optimize=True)


def make_stage_contact_sheet(manifest):
    cols = 6
    thumb = 128
    label = 24
    rows = (len(manifest) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * thumb, rows * (thumb + label)), (255, 242, 248))
    for item in manifest:
        image_path = ROOT / "public" / item["rightImg"].lstrip("/")
        image = Image.open(image_path).convert("RGB")
        image.thumbnail((thumb, thumb), Image.Resampling.LANCZOS)
        index = item["level"] - 1
        col = index % cols
        row = index // cols
        x = col * thumb + (thumb - image.width) // 2
        y = row * (thumb + label)
        sheet.paste(image, (x, y))
    sheet.save(OUT / "stage_contact_sheet.png", optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = []
    stickers = {name: Image.open(path) for name, path in DIFFS.items()}
    for asset_path in [ASSET_SRC / "mascot_bunny.png", *DIFFS.values(), *UI_ASSETS]:
        write_public_cutout(asset_path)

    for stage in STAGES:
        base = fit_square(Image.open(SRC / stage["base"]))
        left_path = OUT / f"kids_stage{stage['level']}_left.png"
        right_path = OUT / f"kids_stage{stage['level']}_right.png"
        base.save(left_path, optimize=True)

        right = base.convert("RGBA")
        mistakes = []
        for idx, (asset_name, x, y, max_size) in enumerate(stage["items"], start=1):
            box = paste_sticker(right, stickers[asset_name], x, y, max_size)
            mistakes.append({"id": idx, "label": DIFF_LABELS[asset_name], **box})
        right.convert("RGB").save(right_path, optimize=True)

        manifest.append(
            {
                "level": stage["level"],
                "title": stage["title"],
                "readAloud": stage["readAloud"],
                "leftImg": f"/kids/{left_path.name}",
                "rightImg": f"/kids/{right_path.name}",
                "mistakes": mistakes,
            }
        )

    make_icon()
    (OUT / "stages.generated.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    make_stage_contact_sheet(manifest)
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
