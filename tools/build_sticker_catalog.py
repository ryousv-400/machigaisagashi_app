from __future__ import annotations

import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PUBLIC_DIR = ROOT / "public" / "kids" / "stamps"
SIZE = 512
CONTACT_THUMB = 86
CONTACT_COLS = 10


BASE_STAMPS = [
    (1, "stamp_01_rainbow_star", "にじいろスター", "⭐", "#fff4c2"),
    (2, "stamp_02_heart_jewel", "ハートジュエル", "💎", "#ffd1e5"),
    (3, "stamp_03_tiny_crown", "ちいさなクラウン", "👑", "#fff1b8"),
    (4, "stamp_04_strawberry_cupcake", "いちごカップケーキ", "🧁", "#ffe0ec"),
    (5, "stamp_05_bunny_face", "うさぎフェイス", "🐰", "#ffe3ef"),
    (6, "stamp_06_crown_fish", "おうかんフィッシュ", "🐟", "#dcecff"),
    (7, "stamp_07_rainbow_train", "にじいろトレイン", "🚂", "#ffe8f4"),
    (8, "stamp_08_smile_planet", "スマイルプラネット", "🪐", "#e6dfff"),
    (9, "stamp_09_music_drum", "ミュージックドラム", "🥁", "#ffe8b3"),
    (10, "stamp_10_rainbow_umbrella", "にじいろアンブレラ", "☂️", "#ffe8f4"),
    (11, "stamp_11_teddy_heart", "ハートテディ", "🧸", "#f5dcb8"),
    (12, "stamp_12_tiny_dragon", "ちびドラゴン", "🐉", "#dcf5d9"),
    (13, "stamp_13_flower_pinwheel", "おはなかざぐるま", "🌸", "#ffe0ee"),
    (14, "stamp_14_winged_ball", "つばさボール", "⚾", "#fff7e0"),
    (15, "stamp_15_rainbow_rocket", "にじいろロケット", "🚀", "#e0f4ff"),
    (16, "stamp_16_treasure_chest", "たからばこ", "💰", "#f4d9b1"),
    (17, "stamp_17_ice_cream", "アイスクリーム", "🍦", "#fff1e4"),
    (18, "stamp_18_rainbow_butterfly", "にじいろバタフライ", "🦋", "#dcecff"),
    (19, "stamp_19_magic_wand", "まほうのステッキ", "✨", "#f1e1ff"),
    (20, "stamp_20_gold_medal", "きんメダル", "🏅", "#fff4c2"),
    (21, "stamp_21_rainbow_gem", "にじいろジュエル", "💎", "#e0f4ff"),
    (22, "stamp_22_castle_tower", "おしろタワー", "🏰", "#ffe0ec"),
    (23, "stamp_23_chocolate_donut", "チョコドーナツ", "🍩", "#f4d9b1"),
    (24, "stamp_24_toy_car", "おもちゃカー", "🚗", "#ffe1cc"),
    (25, "stamp_25_pearl_shell", "パールシェル", "🐚", "#dcecff"),
    (26, "stamp_26_red_apple", "りんごスマイル", "🍎", "#ffdde0"),
    (27, "stamp_27_fluffy_cloud", "ふわふわクラウド", "☁️", "#e5f1ff"),
    (28, "stamp_28_crescent_moon", "おつきさま", "🌙", "#e6dfff"),
    (29, "stamp_29_lucky_clover", "ラッキークローバー", "🍀", "#dcf5d9"),
    (30, "stamp_30_dinosaur_egg", "きょうりゅうエッグ", "🥚", "#fff2c2"),
]


NEW_STAMPS = [
    ("smile_sun", "にこにこたいよう", "☀️", "#ffe9a8", "sun"),
    ("sleepy_moon", "ねむねむムーン", "🌙", "#e7e1ff", "moon"),
    ("puffy_rainbow", "ぷくぷくにじ", "🌈", "#e5f7ff", "rainbow"),
    ("heart_ball", "ハートボール", "💖", "#ffd6e8", "heart"),
    ("candy_twist", "くるくるキャンディ", "🍬", "#ffe1f1", "candy"),
    ("berry_cookie", "ベリークッキー", "🍪", "#ffe8c9", "cookie"),
    ("melon_panda", "メロンパンダ", "🐼", "#dff7cf", "animal"),
    ("tiny_penguin", "ちびペンギン", "🐧", "#dff3ff", "animal"),
    ("round_kitten", "まるねこ", "🐱", "#ffe5c7", "animal"),
    ("puppy_star", "こいぬスター", "🐶", "#ffe2bb", "animal"),
    ("sleepy_koala", "ねむりコアラ", "🐨", "#e9ecf5", "animal"),
    ("pink_dolphin", "ピンクドルフィン", "🐬", "#ffd8ea", "fish"),
    ("baby_turtle", "あかちゃんカメ", "🐢", "#dff5d5", "turtle"),
    ("whale_fountain", "しおふきクジラ", "🐳", "#d8f1ff", "fish"),
    ("ladybug_dot", "てんとうむし", "🐞", "#ffdede", "bug"),
    ("honey_bee", "はちみつビー", "🐝", "#fff0ad", "bug"),
    ("sparkle_snail", "きらきらかたつむり", "🐌", "#e8dbff", "bug"),
    ("apple_hat", "りんごぼうし", "🍎", "#ffe1e1", "fruit"),
    ("banana_boat", "バナナボート", "🍌", "#fff2a8", "banana"),
    ("cherry_pair", "なかよしチェリー", "🍒", "#ffd8df", "fruit"),
    ("grape_bunch", "ぶどうちゃん", "🍇", "#e8d8ff", "fruit"),
    ("orange_smile", "みかんスマイル", "🍊", "#ffe0bf", "fruit"),
    ("strawberry_star", "いちごスター", "🍓", "#ffd8e0", "fruit"),
    ("watermelon_slice", "すいかボート", "🍉", "#dff7e4", "watermelon"),
    ("milk_bottle", "ミルクボトル", "🍼", "#e7f3ff", "bottle"),
    ("pancake_stack", "パンケーキ", "🥞", "#ffe5bd", "stack"),
    ("pudding_cup", "ぷるぷるプリン", "🍮", "#fff0bd", "cup"),
    ("donut_sprinkle", "スプリンクルドーナツ", "🍩", "#ffe2c9", "donut"),
    ("popcorn_star", "ポップコーン", "🍿", "#fff1c5", "cup"),
    ("jelly_soda", "ゼリーソーダ", "🥤", "#dcf8ff", "cup"),
    ("red_crayon", "あかいクレヨン", "🖍️", "#ffdada", "crayon"),
    ("blue_paint", "あおいえのぐ", "🎨", "#d9eeff", "paint"),
    ("rainbow_pencil", "にじいろえんぴつ", "✏️", "#fff0cc", "crayon"),
    ("tiny_book", "ちいさなえほん", "📖", "#e7e2ff", "book"),
    ("music_note", "うたうおんぷ", "🎵", "#e0f4ff", "note"),
    ("happy_piano", "にこにこピアノ", "🎹", "#f1e1ff", "piano"),
    ("bell_flower", "ベルフラワー", "🔔", "#fff0b8", "bell"),
    ("star_drum", "スターたいこ", "🥁", "#ffe1cb", "drum"),
    ("magic_hat", "まほうのぼうし", "🎩", "#e2def8", "hat"),
    ("tiny_camera", "ちびカメラ", "📷", "#e6edff", "camera"),
    ("rocket_balloon", "ロケットバルーン", "🎈", "#ffd8e8", "rocket"),
    ("ufo_friend", "ユーフォーともだち", "🛸", "#e0f4ff", "ufo"),
    ("planet_ring", "わっかプラネット", "🪐", "#e8ddff", "planet"),
    ("star_cloud", "ほしぐも", "☁️", "#e8f6ff", "cloud"),
    ("snow_crystal", "ゆきのけっしょう", "❄️", "#e2f7ff", "snow"),
    ("leaf_boat", "このはボート", "🍃", "#def6d1", "leaf"),
    ("flower_crown", "おはなクラウン", "🌼", "#fff1c9", "flower"),
    ("tulip_buddy", "チューリップ", "🌷", "#ffe2ea", "flower"),
    ("acorn_cap", "どんぐりぼうし", "🌰", "#f3dfc1", "acorn"),
    ("mushroom_house", "きのこハウス", "🍄", "#ffe0df", "mushroom"),
    ("tiny_lion", "ちびライオン", "🦁", "#ffe0b4", "animal"),
    ("baby_elephant", "あかちゃんゾウ", "🐘", "#e2ecff", "animal"),
    ("giraffe_spot", "きりんスポット", "🦒", "#ffe9b8", "animal"),
    ("bear_honey", "くまハニー", "🐻", "#f4dfc4", "animal"),
    ("frog_king", "かえるキング", "🐸", "#d9f6cb", "animal"),
    ("seal_ball", "あざらしボール", "🦭", "#e6f2ff", "animal"),
    ("crab_clap", "ぱちぱちカニ", "🦀", "#ffd8cd", "crab"),
    ("octopus_baby", "たこベビー", "🐙", "#ffd7ee", "octopus"),
    ("jellyfish_light", "ひかるクラゲ", "🪼", "#e5e1ff", "jelly"),
    ("seahorse_twirl", "くるりタツノオトシゴ", "🐚", "#dcf5f2", "fish"),
    ("police_car", "パトカースマイル", "🚓", "#dfeeff", "car"),
    ("fire_truck", "しょうぼうしゃ", "🚒", "#ffd8d0", "car"),
    ("bus_rainbow", "にじバス", "🚌", "#fff0bb", "bus"),
    ("airplane_cloud", "くもひこうき", "✈️", "#e1f4ff", "plane"),
    ("boat_duck", "あひるボート", "🛶", "#fff1b8", "boat"),
    ("train_star", "スターでんしゃ", "🚃", "#e7e1ff", "train"),
    ("crown_castle", "クラウンキャッスル", "🏰", "#ffe3ef", "castle"),
    ("key_heart", "ハートのかぎ", "🗝️", "#fff0c7", "key"),
    ("treasure_map", "たからのちず", "🗺️", "#f5e4bf", "map"),
    ("rainbow_medal", "にじいろメダル", "🏅", "#fff2bd", "medal"),
]


def star_points(cx: float, cy: float, outer: float, inner: float, points: int = 5) -> list[tuple[float, float]]:
    coords = []
    for i in range(points * 2):
        r = outer if i % 2 == 0 else inner
        a = -math.pi / 2 + i * math.pi / points
        coords.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
    return coords


def heart_points(cx: float, cy: float, scale: float) -> list[tuple[float, float]]:
    coords = []
    for i in range(80):
        t = i / 80 * math.tau
        x = 16 * math.sin(t) ** 3
        y = -(13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t))
        coords.append((cx + x * scale, cy + y * scale))
    return coords


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: str, outline: str = "#ffffff", width: int = 12) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=outline)
    inset = width
    draw.rounded_rectangle((box[0] + inset, box[1] + inset, box[2] - inset, box[3] - inset), radius=max(1, radius - inset), fill=fill)


def draw_face(draw: ImageDraw.ImageDraw, cx: int, cy: int, scale: float = 1.0, mouth: str = "smile") -> None:
    eye = int(12 * scale)
    gap = int(42 * scale)
    draw.ellipse((cx - gap - eye, cy - eye, cx - gap + eye, cy + eye), fill="#513e57")
    draw.ellipse((cx + gap - eye, cy - eye, cx + gap + eye, cy + eye), fill="#513e57")
    draw.ellipse((cx - gap - 4, cy - 5, cx - gap + 3, cy + 2), fill="#ffffff")
    draw.ellipse((cx + gap - 4, cy - 5, cx + gap + 3, cy + 2), fill="#ffffff")
    draw.ellipse((cx - 78, cy + 18, cx - 42, cy + 42), fill=(255, 130, 170, 115))
    draw.ellipse((cx + 42, cy + 18, cx + 78, cy + 42), fill=(255, 130, 170, 115))
    if mouth == "sleep":
        draw.arc((cx - 22, cy + 18, cx + 22, cy + 52), start=0, end=180, fill="#513e57", width=6)
    else:
        draw.arc((cx - 34, cy + 12, cx + 34, cy + 58), start=15, end=165, fill="#513e57", width=7)


def draw_sparkle(draw: ImageDraw.ImageDraw, cx: int, cy: int, size: int, fill: str = "#ffffff") -> None:
    draw.polygon([(cx, cy - size), (cx + size // 4, cy - size // 4), (cx + size, cy), (cx + size // 4, cy + size // 4), (cx, cy + size), (cx - size // 4, cy + size // 4), (cx - size, cy), (cx - size // 4, cy - size // 4)], fill=fill)


def draw_badge(draw: ImageDraw.ImageDraw, rng: random.Random, color: str) -> None:
    draw.ellipse((66, 64, 446, 448), fill=(255, 255, 255, 245))
    draw.ellipse((92, 90, 420, 422), fill=color)
    for _ in range(8):
        x = rng.randint(72, 440)
        y = rng.randint(70, 430)
        draw_sparkle(draw, x, y, rng.randint(9, 17), fill=rng.choice(["#ffffff", "#fff7a8", "#ffd7ef"]))


def draw_subject(draw: ImageDraw.ImageDraw, shape: str, color: str, rng: random.Random) -> None:
    draw_badge(draw, rng, color)
    c1 = rng.choice(["#ff6fa8", "#ffcf3a", "#3ccf7a", "#3fb0ff", "#d4b3ff", "#ff9a3c"])
    c2 = rng.choice(["#fff7e0", "#ffe3ef", "#e0f4ff", "#dcf5d9", "#f1e1ff"])

    if shape in {"sun", "star"}:
        draw.polygon(star_points(256, 242, 142, 72, 12), fill="#ffffff")
        draw.polygon(star_points(256, 242, 118, 58, 12), fill="#ffcf3a")
        draw_face(draw, 256, 244, 0.9)
    elif shape in {"heart"}:
        draw.polygon(heart_points(256, 252, 9.6), fill="#ffffff")
        draw.polygon(heart_points(256, 252, 8.2), fill=c1)
        draw_face(draw, 256, 252, 0.82)
    elif shape in {"moon"}:
        draw.ellipse((142, 112, 386, 374), fill="#ffffff")
        draw.ellipse((168, 132, 360, 352), fill="#fff0a8")
        draw.ellipse((226, 80, 430, 326), fill=color)
        draw_face(draw, 236, 238, 0.75, mouth="sleep")
    elif shape in {"rainbow"}:
        for i, col in enumerate(["#ff6fa8", "#ffcf3a", "#3ccf7a", "#3fb0ff", "#d4b3ff"]):
            draw.arc((104 + i * 18, 128 + i * 18, 408 - i * 18, 432 - i * 18), 190, 350, fill=col, width=22)
        draw.ellipse((118, 312, 220, 384), fill="#ffffff")
        draw.ellipse((286, 312, 398, 388), fill="#ffffff")
        draw_face(draw, 256, 318, 0.65)
    elif shape in {"cloud"}:
        for box in [(118, 220, 230, 330), (190, 164, 320, 330), (290, 214, 402, 330), (142, 270, 376, 374)]:
            draw.ellipse(box, fill="#ffffff")
        draw_face(draw, 256, 284, 0.7)
    elif shape in {"flower"}:
        for i in range(8):
            a = i * math.tau / 8
            x = 256 + math.cos(a) * 78
            y = 228 + math.sin(a) * 78
            draw.ellipse((x - 58, y - 42, x + 58, y + 42), fill=c1)
        draw.ellipse((184, 156, 328, 300), fill="#fff1a8")
        draw.line((256, 296, 256, 390), fill="#5fcf87", width=16)
        draw.ellipse((214, 332, 262, 374), fill="#8fe3b3")
        draw.ellipse((258, 344, 312, 386), fill="#8fe3b3")
        draw_face(draw, 256, 224, 0.72)
    elif shape in {"animal"}:
        draw.ellipse((138, 126, 374, 370), fill="#ffffff")
        draw.ellipse((164, 154, 348, 342), fill=c2)
        draw.ellipse((116, 126, 190, 206), fill=c2)
        draw.ellipse((322, 126, 396, 206), fill=c2)
        draw.ellipse((222, 236, 290, 292), fill="#ffffff")
        draw_face(draw, 256, 224, 0.74)
    elif shape in {"fish", "turtle", "crab", "octopus", "jelly"}:
        if shape == "turtle":
            draw.ellipse((148, 170, 362, 334), fill="#ffffff")
            draw.ellipse((170, 188, 340, 316), fill="#8fe3b3")
            draw.ellipse((326, 208, 402, 280), fill="#dcf5d9")
            draw_face(draw, 360, 244, 0.45)
        elif shape == "crab":
            draw.ellipse((156, 190, 356, 326), fill="#ff8f78")
            draw.ellipse((106, 174, 172, 238), fill="#ff8f78")
            draw.ellipse((340, 174, 406, 238), fill="#ff8f78")
            draw_face(draw, 256, 246, 0.65)
        elif shape == "octopus":
            draw.ellipse((150, 128, 362, 314), fill="#ff9ad1")
            for x in [172, 216, 260, 304, 348]:
                draw.ellipse((x - 26, 284, x + 26, 374), fill="#ff9ad1")
            draw_face(draw, 256, 222, 0.7)
        elif shape == "jelly":
            draw.pieslice((142, 116, 370, 344), 180, 360, fill="#d4b3ff")
            draw.rectangle((142, 230, 370, 290), fill="#d4b3ff")
            for x in [178, 218, 258, 298, 338]:
                draw.line((x, 288, x - 24, 374), fill="#a890ff", width=8)
            draw_face(draw, 256, 236, 0.6)
        else:
            draw.ellipse((122, 178, 366, 326), fill="#ffffff")
            draw.ellipse((150, 196, 338, 308), fill=c1)
            draw.polygon([(340, 252), (424, 190), (418, 320)], fill=c1)
            draw_face(draw, 234, 246, 0.58)
    elif shape in {"fruit", "banana", "watermelon"}:
        if shape == "banana":
            draw.arc((114, 112, 420, 402), 28, 155, fill="#ffe86a", width=58)
            draw.arc((130, 146, 388, 374), 32, 152, fill="#fff3a8", width=26)
            draw_face(draw, 250, 258, 0.58)
        elif shape == "watermelon":
            draw.pieslice((118, 112, 394, 388), 20, 160, fill="#3ccf7a")
            draw.pieslice((142, 138, 370, 360), 20, 160, fill="#ff6f8f")
            for x in [214, 256, 298]:
                draw.ellipse((x - 7, 238, x + 7, 258), fill="#513e57")
            draw_face(draw, 256, 290, 0.5)
        else:
            draw.ellipse((150, 146, 362, 352), fill=c1)
            draw.ellipse((236, 104, 292, 168), fill="#8fe3b3")
            draw_face(draw, 256, 244, 0.7)
    elif shape in {"car", "bus", "train"}:
        rounded(draw, (118, 194, 394, 326), 42, c1, width=14)
        draw.rounded_rectangle((168, 146, 326, 224), radius=34, fill="#ffffff")
        draw.rounded_rectangle((188, 164, 244, 216), radius=16, fill="#e0f4ff")
        draw.rounded_rectangle((254, 164, 306, 216), radius=16, fill="#e0f4ff")
        draw.ellipse((152, 300, 218, 366), fill="#513e57")
        draw.ellipse((296, 300, 362, 366), fill="#513e57")
        draw.ellipse((172, 320, 198, 346), fill="#ffffff")
        draw.ellipse((316, 320, 342, 346), fill="#ffffff")
        draw_face(draw, 256, 260, 0.48)
    elif shape in {"rocket", "plane", "boat", "ufo"}:
        if shape == "ufo":
            draw.ellipse((122, 214, 390, 330), fill="#ffffff")
            draw.ellipse((152, 232, 360, 304), fill="#8fd3ff")
            draw.pieslice((184, 132, 328, 286), 180, 360, fill="#d4b3ff")
            draw_face(draw, 256, 260, 0.55)
        elif shape == "boat":
            draw.polygon([(122, 270), (390, 270), (342, 352), (176, 352)], fill="#ffcf3a")
            draw.polygon([(244, 122), (244, 268), (350, 240)], fill="#ffffff")
            draw.line((244, 112, 244, 274), fill="#513e57", width=8)
            draw_face(draw, 256, 306, 0.52)
        elif shape == "plane":
            draw.polygon([(108, 260), (404, 150), (334, 278), (404, 370)], fill="#8fd3ff")
            draw.polygon([(188, 244), (112, 186), (226, 230)], fill="#d4b3ff")
            draw_face(draw, 286, 260, 0.42)
        else:
            draw.ellipse((182, 132, 330, 362), fill="#ffffff")
            draw.ellipse((204, 154, 308, 340), fill=c1)
            draw.polygon([(182, 186), (126, 282), (196, 272)], fill="#ffcf3a")
            draw.polygon([(330, 186), (386, 282), (316, 272)], fill="#ffcf3a")
            draw_face(draw, 256, 234, 0.5)
    elif shape in {"candy", "cookie", "donut", "cup", "stack", "bottle"}:
        if shape == "donut":
            draw.ellipse((138, 132, 374, 368), fill="#c9824f")
            draw.ellipse((170, 164, 342, 336), fill="#ff9ed1")
            draw.ellipse((224, 218, 288, 282), fill=color)
            for _ in range(18):
                x, y = rng.randint(180, 330), rng.randint(176, 322)
                draw.rectangle((x, y, x + 18, y + 6), fill=rng.choice(["#fff", "#ffcf3a", "#3fb0ff", "#3ccf7a"]))
            draw_face(draw, 256, 300, 0.48)
        elif shape == "cup":
            rounded(draw, (164, 152, 348, 364), 38, c1, width=14)
            draw.ellipse((152, 130, 360, 210), fill="#ffffff")
            draw_face(draw, 256, 256, 0.58)
        elif shape == "bottle":
            rounded(draw, (180, 126, 332, 374), 48, "#ffffff", width=14)
            draw.rounded_rectangle((210, 90, 302, 152), radius=28, fill="#8fd3ff")
            draw_face(draw, 256, 252, 0.55)
        elif shape == "stack":
            for i in range(4):
                draw.ellipse((144, 238 - i * 34, 368, 314 - i * 34), fill="#e9ad68")
                draw.ellipse((162, 232 - i * 34, 350, 294 - i * 34), fill="#ffd798")
            draw_face(draw, 256, 252, 0.52)
        else:
            draw.ellipse((148, 138, 364, 354), fill=c1)
            if shape == "candy":
                draw.polygon([(148, 246), (82, 190), (88, 302)], fill="#ffffff")
                draw.polygon([(364, 246), (430, 190), (424, 302)], fill="#ffffff")
            draw_face(draw, 256, 246, 0.65)
    elif shape in {"crayon", "paint", "book", "note", "piano", "bell", "drum", "hat", "camera"}:
        if shape in {"crayon", "note"}:
            draw.rounded_rectangle((180, 116, 304, 372), radius=42, fill=c1)
            draw.polygon([(180, 116), (242, 64), (304, 116)], fill="#fff2bf")
            draw.line((186, 190, 298, 190), fill="#ffffff", width=16)
            draw_face(draw, 242, 262, 0.55)
        elif shape == "book":
            rounded(draw, (132, 150, 380, 350), 28, c1, width=14)
            draw.line((256, 158, 256, 342), fill="#ffffff", width=10)
            draw_face(draw, 256, 260, 0.5)
        elif shape == "camera":
            rounded(draw, (132, 166, 380, 342), 38, c1, width=14)
            draw.ellipse((204, 204, 308, 308), fill="#ffffff")
            draw.ellipse((226, 226, 286, 286), fill="#8fd3ff")
            draw_face(draw, 256, 312, 0.38)
        else:
            rounded(draw, (136, 168, 376, 334), 46, c1, width=14)
            draw_face(draw, 256, 250, 0.58)
    else:
        draw.ellipse((134, 126, 378, 370), fill="#ffffff")
        draw.ellipse((162, 154, 350, 342), fill=c1)
        draw_face(draw, 256, 248, 0.72)


def make_generated_stamp(item: tuple[int, str, str, str, str, str]) -> None:
    sid, slug, title, fallback, base_color, shape = item
    rng = random.Random(sid * 2027)
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse((92, 352, 420, 438), fill=(80, 50, 90, 42))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    image.alpha_composite(shadow)
    draw = ImageDraw.Draw(image, "RGBA")
    draw_subject(draw, shape, base_color, rng)
    image.save(PUBLIC_DIR / f"{slug}.png", optimize=True)


def make_shiny(normal_path: Path, shiny_path: Path, seed: int) -> None:
    rng = random.Random(seed * 4099)
    normal = Image.open(normal_path).convert("RGBA")
    enhanced = ImageEnhance.Color(normal).enhance(1.24)
    enhanced = ImageEnhance.Contrast(enhanced).enhance(1.06)
    enhanced = ImageEnhance.Brightness(enhanced).enhance(1.05)

    glow = Image.new("RGBA", normal.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, "RGBA")
    colors = ["#ff6fa8", "#ffcf3a", "#3ccf7a", "#3fb0ff", "#d4b3ff"]
    for i, col in enumerate(colors):
        gd.arc((34 + i * 7, 34 + i * 7, SIZE - 34 - i * 7, SIZE - 34 - i * 7), i * 38, i * 38 + 230, fill=col, width=12)
    for _ in range(18):
        draw_sparkle(gd, rng.randint(58, 454), rng.randint(54, 454), rng.randint(9, 22), fill=rng.choice(["#ffffff", "#fff3a8", "#ffd6ee"]))
    glow = glow.filter(ImageFilter.GaussianBlur(0.3))
    glow.alpha_composite(enhanced)
    glow.save(shiny_path, optimize=True)


def make_contact_sheet(manifest: list[dict[str, object]], key: str, filename: str) -> None:
    rows = math.ceil(len(manifest) / CONTACT_COLS)
    cell = CONTACT_THUMB + 36
    sheet = Image.new("RGBA", (CONTACT_COLS * cell, rows * cell), (255, 244, 250, 255))
    for item in manifest:
        image = Image.open(ROOT / "public" / str(item[key]).lstrip("/")).convert("RGBA")
        image.thumbnail((CONTACT_THUMB, CONTACT_THUMB), Image.Resampling.LANCZOS)
        index = int(item["id"]) - 1
        col = index % CONTACT_COLS
        row = index // CONTACT_COLS
        x = col * cell + (cell - image.width) // 2
        y = row * cell + 8 + (CONTACT_THUMB - image.height) // 2
        sheet.alpha_composite(image, (x, y))
    sheet.convert("RGB").save(PUBLIC_DIR / filename, optimize=True)


def main() -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    catalog = [(sid, slug, title, fallback, color, "existing", "special") for sid, slug, title, fallback, color in BASE_STAMPS]
    for offset, item in enumerate(NEW_STAMPS, start=31):
        slug, title, fallback, color, shape = item
        catalog.append((offset, f"stamp_{offset:02d}_{slug}", title, fallback, color, shape, "mini"))

    if len(catalog) != 100:
        raise RuntimeError(f"expected 100 stamps, got {len(catalog)}")

    manifest: list[dict[str, object]] = []
    for sid, slug, title, fallback, base_color, shape, series in catalog:
        normal_path = PUBLIC_DIR / f"{slug}.png"
        if shape != "existing":
            make_generated_stamp((sid, slug, title, fallback, base_color, shape))
        if not normal_path.exists():
            raise FileNotFoundError(normal_path)

        shiny_path = PUBLIC_DIR / f"{slug}_shiny.png"
        make_shiny(normal_path, shiny_path, sid)

        with Image.open(normal_path) as normal:
            manifest.append(
                {
                    "id": sid,
                    "slug": slug,
                    "title": title,
                    "series": series,
                    "src": f"/kids/stamps/{normal_path.name}",
                    "shinySrc": f"/kids/stamps/{shiny_path.name}",
                    "fallbackEmoji": fallback,
                    "baseColor": base_color,
                    "width": normal.width,
                    "height": normal.height,
                    "alphaBounds": normal.getchannel("A").getbbox(),
                }
            )

    (PUBLIC_DIR / "stamps.generated.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    make_contact_sheet(manifest, "src", "stamp_contact_sheet.png")
    make_contact_sheet(manifest, "shinySrc", "stamp_shiny_contact_sheet.png")
    print(f"wrote {len(manifest)} stamps")


if __name__ == "__main__":
    main()
