from pathlib import Path
import json
import shutil
import subprocess

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
CODEX_HOME = Path.home() / ".codex"
GENERATED = CODEX_HOME / "generated_images" / "019dbf2c-4ecb-7c51-af8b-1adad46f2fed"
HELPER = CODEX_HOME / "skills" / ".system" / "imagegen" / "scripts" / "remove_chroma_key.py"

SOURCE_DIR = ROOT / "assets" / "kids" / "stamps" / "generated_sources"
FULL_ALPHA_DIR = ROOT / "assets" / "kids" / "stamps" / "alpha_full"
PUBLIC_DIR = ROOT / "public" / "kids" / "stamps"

MAX_SIZE = 512
CONTACT_THUMB = 128
CONTACT_COLS = 6


STAMPS = [
    ("stamp_01_rainbow_star", "にじいろスター", "ig_0651fe7a8cf22fd40169eb6924620c8191b128a727700dd90d.png"),
    ("stamp_02_heart_jewel", "ハートジュエル", "ig_0651fe7a8cf22fd40169eb694f90d88191a247bffcd091c890.png"),
    ("stamp_03_tiny_crown", "ちいさなクラウン", "ig_0651fe7a8cf22fd40169eb697ef7488191841194c4132ccb6e.png"),
    ("stamp_04_strawberry_cupcake", "いちごカップケーキ", "ig_0651fe7a8cf22fd40169eb69a7c6f0819188fe99ae3ca77b75.png"),
    ("stamp_05_bunny_face", "うさぎフェイス", "ig_0651fe7a8cf22fd40169eb69dcf08c81919d2656149498bcfa.png"),
    ("stamp_06_crown_fish", "おうかんフィッシュ", "ig_0651fe7a8cf22fd40169eb6a2138188191950b69bcb6b33018.png"),
    ("stamp_07_rainbow_train", "にじいろトレイン", "ig_0651fe7a8cf22fd40169eb6a5abd408191ad9aa89cb453e6ca.png"),
    ("stamp_08_smile_planet", "スマイルプラネット", "ig_0651fe7a8cf22fd40169eb6aaf1e688191bfd2f04ced8bf2a0.png"),
    ("stamp_09_music_drum", "ミュージックドラム", "ig_0651fe7a8cf22fd40169eb6b3c43188191840b9018b3476908.png"),
    ("stamp_10_rainbow_umbrella", "にじいろアンブレラ", "ig_0651fe7a8cf22fd40169eb6b6eca188191958f3d492f4a2c7b.png"),
    ("stamp_11_teddy_heart", "ハートテディ", "ig_0651fe7a8cf22fd40169eb6bd08fe88191a0b4211c38eaabdc.png"),
    ("stamp_12_tiny_dragon", "ちびドラゴン", "ig_0651fe7a8cf22fd40169eb75d14bec81919dacc3dfa26cd12c.png"),
    ("stamp_13_flower_pinwheel", "おはなかざぐるま", "ig_0651fe7a8cf22fd40169eb6c5bff948191882944bbf060f048.png"),
    ("stamp_14_winged_ball", "つばさボール", "ig_0651fe7a8cf22fd40169eb6c9d93748191962921722234f5c0.png"),
    ("stamp_15_rainbow_rocket", "にじいろロケット", "ig_0651fe7a8cf22fd40169eb6ccbbb9081919ce5c65e10f00e49.png"),
    ("stamp_16_treasure_chest", "たからばこ", "ig_0651fe7a8cf22fd40169eb6d17dfd48191852047d011590f6d.png"),
    ("stamp_17_ice_cream", "アイスクリーム", "ig_0651fe7a8cf22fd40169eb6d48dd8481918f13e6747d891b70.png"),
    ("stamp_18_rainbow_butterfly", "にじいろバタフライ", "ig_0651fe7a8cf22fd40169eb6d8ea88081918fca0ec2d8e9337e.png"),
    ("stamp_19_magic_wand", "まほうのステッキ", "ig_0651fe7a8cf22fd40169eb6dee343c8191a1212f3feb59f341.png"),
    ("stamp_20_gold_medal", "きんメダル", "ig_0651fe7a8cf22fd40169eb6e3afd8c8191969e4825c04ee88f.png"),
    ("stamp_21_rainbow_gem", "にじいろジュエル", "ig_0651fe7a8cf22fd40169eb6ee36ce48191b946448e4ee7d00d.png"),
    ("stamp_22_castle_tower", "おしろタワー", "ig_0651fe7a8cf22fd40169eb6f09e5f881919af18cb39f810f16.png"),
    ("stamp_23_chocolate_donut", "チョコドーナツ", "ig_0651fe7a8cf22fd40169eb6f526e448191807f8e3c9a15915f.png"),
    ("stamp_24_toy_car", "おもちゃカー", "ig_0651fe7a8cf22fd40169eb6f9cf39c8191b459100027124144.png"),
    ("stamp_25_pearl_shell", "パールシェル", "ig_0651fe7a8cf22fd40169eb6fd5ec708191a5cb3d381e8970c0.png"),
    ("stamp_26_red_apple", "りんごスマイル", "ig_0651fe7a8cf22fd40169eb7025bc048191b5abbc3e3848891d.png"),
    ("stamp_27_fluffy_cloud", "ふわふわクラウド", "ig_0651fe7a8cf22fd40169eb707a6f988191ad5d6af308a707bd.png"),
    ("stamp_28_crescent_moon", "おつきさま", "ig_0651fe7a8cf22fd40169eb70c9bea48191901e872cb9211bb7.png"),
    ("stamp_29_lucky_clover", "ラッキークローバー", "ig_0651fe7a8cf22fd40169eb7737b25c81918cf168ad46012b8d.png"),
    ("stamp_30_dinosaur_egg", "きょうりゅうエッグ", "ig_0651fe7a8cf22fd40169eb716539248191a2d87852e2d40e28.png"),
]


def trim_alpha(image):
    image = image.convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    return image.crop(bbox) if bbox else image


def make_public_png(alpha_path, out_path):
    image = trim_alpha(Image.open(alpha_path))
    image.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)
    image.save(out_path, optimize=True)


def make_contact_sheet(manifest):
    rows = (len(manifest) + CONTACT_COLS - 1) // CONTACT_COLS
    cell = CONTACT_THUMB + 28
    sheet = Image.new("RGBA", (CONTACT_COLS * cell, rows * cell), (255, 242, 248, 255))
    for item in manifest:
        image = Image.open(ROOT / "public" / item["src"].lstrip("/")).convert("RGBA")
        image.thumbnail((CONTACT_THUMB, CONTACT_THUMB), Image.Resampling.LANCZOS)
        index = item["id"] - 1
        col = index % CONTACT_COLS
        row = index // CONTACT_COLS
        x = col * cell + (cell - image.width) // 2
        y = row * cell + 8 + (CONTACT_THUMB - image.height) // 2
        sheet.alpha_composite(image, (x, y))
    sheet.convert("RGB").save(PUBLIC_DIR / "stamp_contact_sheet.png", optimize=True)


def main():
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    FULL_ALPHA_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    manifest = []
    for index, (slug, title, generated_name) in enumerate(STAMPS, start=1):
        generated_path = GENERATED / generated_name
        if not generated_path.exists():
            raise FileNotFoundError(generated_path)

        source_path = SOURCE_DIR / f"{slug}_chroma.png"
        alpha_path = FULL_ALPHA_DIR / f"{slug}.png"
        public_path = PUBLIC_DIR / f"{slug}.png"

        shutil.copy2(generated_path, source_path)
        subprocess.run(
            [
                "python3",
                str(HELPER),
                "--input",
                str(source_path),
                "--out",
                str(alpha_path),
                "--auto-key",
                "border",
                "--soft-matte",
                "--transparent-threshold",
                "12",
                "--opaque-threshold",
                "220",
                "--despill",
                "--force",
            ],
            check=True,
        )
        make_public_png(alpha_path, public_path)

        with Image.open(public_path) as image:
            bbox = image.getchannel("A").getbbox()
            manifest.append(
                {
                    "id": index,
                    "slug": slug,
                    "title": title,
                    "src": f"/kids/stamps/{public_path.name}",
                    "width": image.width,
                    "height": image.height,
                    "alphaBounds": bbox,
                }
            )

    (PUBLIC_DIR / "stamps.generated.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    make_contact_sheet(manifest)
    print(json.dumps(manifest, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
