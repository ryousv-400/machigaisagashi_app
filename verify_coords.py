"""
全30ステージの座標検証スクリプト
- 左右の画像を読み込み、ピクセル差分を計算
- JS側で定義された間違い座標の領域に実際に差分があるか検証
- 差分がない座標、または座標外に大きな差分がある場合を報告
"""
import os
import json
from PIL import Image
import numpy as np

# JS側のステージデータ（script.jsから転記）
STAGES = [
    {
        "level": 1,
        "title": "まほうの どうぶつの もり",
        "mistakes": [
            {"id": 1, "x": 30.0, "y": 20.16, "w": 8.12, "h": 7.81},
            {"id": 2, "x": 3.59, "y": 73.91, "w": 5.31, "h": 6.88},
            {"id": 3, "x": 97.58, "y": 79.45, "w": 3.59, "h": 4.53},
            {"id": 4, "x": 3.83, "y": 32.27, "w": 2.66, "h": 5.78},
            {"id": 5, "x": 57.73, "y": 66.48, "w": 3.0, "h": 3.0}
        ]
    },
    {
        "level": 2,
        "title": "おひめさまの おしろ",
        "mistakes": [
            {"id": 1, "x": 91.8, "y": 6.8, "w": 11.09, "h": 6.09},
            {"id": 2, "x": 16.48, "y": 31.87, "w": 5.47, "h": 5.94},
            {"id": 3, "x": 20.62, "y": 68.28, "w": 4.0, "h": 4.0}
        ]
    },
    {
        "level": 3,
        "title": "スイーツと キャンディのくに",
        "mistakes": [
            {"id": 1, "x": 31.67, "y": 68.33, "w": 16.67, "h": 23.33},
            {"id": 2, "x": 70.42, "y": 18.75, "w": 29.17, "h": 19.17},
            {"id": 3, "x": 74.17, "y": 82.08, "w": 12.00, "h": 15.00}
        ]
    },
    {
        "level": 4,
        "title": "にんぎょと うみのなかまたち",
        "mistakes": [
            {"id": 1, "x": 21.25, "y": 76.25, "w": 12.0, "h": 12.0},
            {"id": 2, "x": 67.50, "y": 17.08, "w": 10.0, "h": 10.0},
            {"id": 3, "x": 88.33, "y": 10.42, "w": 20.0, "h": 19.17},
            {"id": 4, "x": 37.5, "y": 34.5, "w": 10.0, "h": 10.0}
        ]
    },
    {
        "level": 5,
        "title": "ようせいの おはなばたけ",
        "mistakes": [
            {"id": 1, "x": 6.5, "y": 20.4, "w": 12.0, "h": 12.0},
            {"id": 2, "x": 69.2, "y": 53.8, "w": 10.0, "h": 16.0},
            {"id": 3, "x": 21.7, "y": 75.6, "w": 28.0, "h": 26.0}
        ]
    },
    {
        "level": 6,
        "title": "にじいろ ユニコーン",
        "mistakes": [
            {"id": 1, "x": 6.2, "y": 21.9, "w": 10.0, "h": 10.0},
            {"id": 2, "x": 37.1, "y": 25.6, "w": 8.0, "h": 10.0},
            {"id": 3, "x": 10.0, "y": 45.0, "w": 15.0, "h": 15.0}
        ]
    },
    {
        "level": 7,
        "title": "猫カフェの午後",
        "mistakes": [
            {"id": 1, "x": 33.75, "y": 34.17, "w": 17.5, "h": 11.67},
            {"id": 2, "x": 51.67, "y": 70.42, "w": 15.0, "h": 9.17},
            {"id": 3, "x": 75.42, "y": 75.0, "w": 19.17, "h": 8.33}
        ]
    },
    {
        "level": 8,
        "title": "うさぎのお茶会",
        "mistakes": [
            {"id": 1, "x": 65.83, "y": 40.42, "w": 8.0, "h": 8.0},
            {"id": 2, "x": 80.83, "y": 50.83, "w": 21.67, "h": 16.67},
            {"id": 3, "x": 30.83, "y": 61.67, "w": 13.33, "h": 11.67},
            {"id": 4, "x": 59.17, "y": 86.25, "w": 21.67, "h": 19.17}
        ]
    },
    {
        "level": 9,
        "title": "ちいさなバレリーナ",
        "mistakes": [
            {"id": 1, "x": 75.83, "y": 45.0, "w": 26.67, "h": 35.0},
            {"id": 2, "x": 46.67, "y": 33.75, "w": 8.33, "h": 9.17},
            {"id": 3, "x": 22.92, "y": 67.08, "w": 29.17, "h": 29.17}
        ]
    },
    {
        "level": 10,
        "title": "巨大アイスクリームショップ",
        "mistakes": [
            {"id": 1, "x": 83.33, "y": 14.17, "w": 25.0, "h": 16.67},
            {"id": 2, "x": 57.5, "y": 41.25, "w": 15.0, "h": 14.17},
            {"id": 3, "x": 25.42, "y": 40.83, "w": 15.83, "h": 11.67}
        ]
    },
    {
        "level": 11,
        "title": "妖精の花冠",
        "mistakes": [
            {"id": 1, "x": 88.33, "y": 20.0, "w": 20.0, "h": 26.67},
            {"id": 2, "x": 65.0, "y": 92.92, "w": 20.0, "h": 17.5},
            {"id": 3, "x": 15.83, "y": 22.92, "w": 8.0, "h": 8.0}
        ]
    },
    {
        "level": 12,
        "title": "子犬の遊び場",
        "mistakes": [
            {"id": 1, "x": 48.33, "y": 11.25, "w": 18.33, "h": 17.5},
            {"id": 2, "x": 61.25, "y": 60.42, "w": 15.83, "h": 15.83},
            {"id": 3, "x": 91.67, "y": 68.33, "w": 11.67, "h": 11.67}
        ]
    },
    {
        "level": 13,
        "title": "マジカルサーカス",
        "mistakes": [
            {"id": 1, "x": 42.08, "y": 78.75, "w": 29.17, "h": 29.17},
            {"id": 2, "x": 69.58, "y": 53.33, "w": 27.5, "h": 25.0},
            {"id": 3, "x": 14.17, "y": 41.25, "w": 10.0, "h": 10.83}
        ]
    },
    {
        "level": 14,
        "title": "マーメイドの海のお城",
        "mistakes": [
            {"id": 1, "x": 10.42, "y": 15.0, "w": 15.83, "h": 13.33},
            {"id": 2, "x": 59.58, "y": 75.42, "w": 39.17, "h": 32.5},
            {"id": 3, "x": 18.33, "y": 67.5, "w": 8.0, "h": 8.0}
        ]
    },
    {
        "level": 15,
        "title": "蝶の庭",
        "mistakes": [
            {"id": 1, "x": 58.0, "y": 82.2, "w": 9.4, "h": 9.4},
            {"id": 2, "x": 38.5, "y": 71.0, "w": 7.8, "h": 7.8},
            {"id": 3, "x": 44.4, "y": 14.7, "w": 11.9, "h": 11.9}
        ]
    },
    {
        "level": 16,
        "title": "魔法の図書館",
        "mistakes": [
            {"id": 1, "x": 43.6, "y": 56.2, "w": 8.1, "h": 8.1},
            {"id": 2, "x": 68.4, "y": 87.5, "w": 11.2, "h": 11.2},
            {"id": 3, "x": 76.3, "y": 65.9, "w": 9.1, "h": 9.1}
        ]
    },
    {
        "level": 17,
        "title": "雲のお城",
        "mistakes": [
            {"id": 1, "x": 13.4, "y": 14.1, "w": 10.3, "h": 10.3},
            {"id": 2, "x": 42.8, "y": 23.9, "w": 6.2, "h": 6.2},
            {"id": 3, "x": 55.2, "y": 52.3, "w": 10.3, "h": 10.3},
            {"id": 4, "x": 32.2, "y": 47.0, "w": 10.6, "h": 10.6}
        ]
    },
    {
        "level": 18,
        "title": "さくらの森",
        "mistakes": [
            {"id": 1, "x": 85.1, "y": 73.7, "w": 9.1, "h": 9.1},
            {"id": 2, "x": 77.7, "y": 79.5, "w": 10.3, "h": 10.3},
            {"id": 3, "x": 71.3, "y": 86.5, "w": 6.6, "h": 6.6}
        ]
    },
    {
        "level": 19,
        "title": "ふしぎなパン屋",
        "mistakes": [
            {"id": 1, "x": 30.8, "y": 70.3, "w": 8.1, "h": 8.1},
            {"id": 2, "x": 44.1, "y": 15.5, "w": 7.2, "h": 7.2},
            {"id": 3, "x": 73.4, "y": 83.0, "w": 7.2, "h": 7.2},
            {"id": 4, "x": 50.5, "y": 39.8, "w": 6.2, "h": 6.2},
            {"id": 5, "x": 52.0, "y": 27.2, "w": 6.9, "h": 6.9}
        ]
    },
    {
        "level": 20,
        "title": "おとぎの森",
        "mistakes": [
            {"id": 1, "x": 45.6, "y": 26.6, "w": 11.9, "h": 11.9},
            {"id": 2, "x": 43.0, "y": 59.5, "w": 12.2, "h": 12.2},
            {"id": 3, "x": 59.6, "y": 72.7, "w": 7.2, "h": 7.2},
            {"id": 4, "x": 77.3, "y": 89.0, "w": 7.8, "h": 7.8}
        ]
    },
    {
        "level": 21,
        "title": "クリスタルの洞窟",
        "mistakes": [
            {"id": 1, "x": 78.6, "y": 34.7, "w": 10.6, "h": 10.6},
            {"id": 2, "x": 82.8, "y": 84.4, "w": 12.5, "h": 12.5},
            {"id": 3, "x": 23.8, "y": 47.9, "w": 12.2, "h": 12.2}
        ]
    },
    {
        "level": 22,
        "title": "オルゴールの中",
        "mistakes": [
            {"id": 1, "x": 61.4, "y": 90.8, "w": 11.2, "h": 11.2},
            {"id": 2, "x": 37.0, "y": 73.4, "w": 7.2, "h": 7.2},
            {"id": 3, "x": 39.1, "y": 17.4, "w": 7.8, "h": 7.8},
            {"id": 4, "x": 79.7, "y": 33.8, "w": 6.2, "h": 6.2},
            {"id": 5, "x": 87.2, "y": 76.9, "w": 11.9, "h": 11.9}
        ]
    },
    {
        "level": 23,
        "title": "王家のガーデン",
        "mistakes": [
            {"id": 1, "x": 32.3, "y": 35.6, "w": 6.9, "h": 6.9},
            {"id": 2, "x": 44.9, "y": 53.7, "w": 8.4, "h": 8.4},
            {"id": 3, "x": 34.5, "y": 26.8, "w": 12.2, "h": 12.2},
            {"id": 4, "x": 41.4, "y": 25.2, "w": 8.1, "h": 8.1}
        ]
    },
    {
        "level": 24,
        "title": "雪の国",
        "mistakes": [
            {"id": 1, "x": 90.6, "y": 54.1, "w": 8.8, "h": 8.8},
            {"id": 2, "x": 16.6, "y": 50.1, "w": 9.1, "h": 9.1},
            {"id": 3, "x": 53.0, "y": 20.3, "w": 11.2, "h": 11.2},
            {"id": 4, "x": 25.4, "y": 67.3, "w": 10.9, "h": 10.9},
            {"id": 5, "x": 31.6, "y": 38.8, "w": 9.4, "h": 9.4}
        ]
    },
    {
        "level": 25,
        "title": "おもちゃの部屋",
        "mistakes": [
            {"id": 1, "x": 86.3, "y": 58.8, "w": 9.7, "h": 9.7},
            {"id": 2, "x": 33.6, "y": 17.0, "w": 7.5, "h": 7.5},
            {"id": 3, "x": 21.6, "y": 40.8, "w": 6.9, "h": 6.9}
        ]
    },
    {
        "level": 26,
        "title": "わくわくペットランド",
        "mistakes": [
            {"id": 1, "x": 59.8, "y": 39.5, "w": 8.8, "h": 8.8},
            {"id": 2, "x": 81.4, "y": 49.2, "w": 6.9, "h": 6.9},
            {"id": 3, "x": 64.1, "y": 74.8, "w": 11.6, "h": 11.6},
            {"id": 4, "x": 75.2, "y": 61.7, "w": 8.8, "h": 8.8}
        ]
    },
    {
        "level": 27,
        "title": "虹の滝",
        "mistakes": [
            {"id": 1, "x": 49.5, "y": 29.8, "w": 11.9, "h": 11.9},
            {"id": 2, "x": 75.6, "y": 72.0, "w": 7.5, "h": 7.5},
            {"id": 3, "x": 79.3, "y": 27.3, "w": 10.3, "h": 10.3}
        ]
    },
    {
        "level": 28,
        "title": "星空観測所",
        "mistakes": [
            {"id": 1, "x": 27.0, "y": 13.1, "w": 8.8, "h": 8.8},
            {"id": 2, "x": 23.7, "y": 16.3, "w": 8.4, "h": 8.4},
            {"id": 3, "x": 13.0, "y": 33.8, "w": 9.1, "h": 9.1},
            {"id": 4, "x": 65.4, "y": 19.9, "w": 7.8, "h": 7.8},
            {"id": 5, "x": 88.4, "y": 83.8, "w": 10.9, "h": 10.9}
        ]
    },
    {
        "level": 29,
        "title": "夕暮れの遊園地",
        "mistakes": [
            {"id": 1, "x": 72.0, "y": 49.3, "w": 9.7, "h": 9.7},
            {"id": 2, "x": 37.6, "y": 59.3, "w": 12.2, "h": 12.2},
            {"id": 3, "x": 45.1, "y": 21.2, "w": 10.3, "h": 10.3},
            {"id": 4, "x": 29.8, "y": 33.9, "w": 7.5, "h": 7.5},
            {"id": 5, "x": 35.2, "y": 20.4, "w": 9.1, "h": 9.1}
        ]
    },
    {
        "level": 30,
        "title": "夢の王宮",
        "mistakes": [
            {"id": 1, "x": 48.4, "y": 49.8, "w": 10.3, "h": 10.3},
            {"id": 2, "x": 52.1, "y": 33.0, "w": 7.2, "h": 7.2},
            {"id": 3, "x": 79.8, "y": 36.6, "w": 9.7, "h": 9.7}
        ]
    }
]

DIFF_THRESHOLD = 30   # ピクセル差分の閾値
COVERAGE_MIN = 0.05   # 座標領域内の最低差分割合（5%以上ピクセルが違う必要）

def get_box(m, width, height):
    """JS座標（%ベース、中心座標）からピクセルboxを取得"""
    cx = m["x"] * width / 100
    cy = m["y"] * height / 100
    cw = m["w"] * width / 100
    ch = m["h"] * height / 100
    x1 = max(0, int(cx - cw / 2))
    y1 = max(0, int(cy - ch / 2))
    x2 = min(width, int(cx + cw / 2))
    y2 = min(height, int(cy + ch / 2))
    return (x1, y1, x2, y2)

def check_stage(stage, assets_dir):
    level = stage["level"]
    left_path = os.path.join(assets_dir, f"stage{level}_left.png")
    right_path = os.path.join(assets_dir, f"stage{level}_right.png")

    if not os.path.exists(left_path):
        return {"level": level, "status": "SKIP", "reason": f"{left_path} not found"}
    if not os.path.exists(right_path):
        return {"level": level, "status": "SKIP", "reason": f"{right_path} not found"}

    left = Image.open(left_path).convert("RGB")
    right = Image.open(right_path).convert("RGB")

    # サイズが異なる場合はリサイズ
    if left.size != right.size:
        right = right.resize(left.size, Image.LANCZOS)

    left_arr = np.array(left, dtype=np.int16)
    right_arr = np.array(right, dtype=np.int16)
    width, height = left.size

    # ピクセル差分マップ（各ピクセルのRGB最大差分）
    diff_map = np.max(np.abs(left_arr - right_arr), axis=2)  # shape: (H, W)

    # 差分があるピクセルのマスク
    diff_mask = diff_map > DIFF_THRESHOLD

    results = {
        "level": level,
        "title": stage["title"],
        "image_size": f"{width}x{height}",
        "total_diff_pixels": int(np.sum(diff_mask)),
        "mistakes": []
    }

    # 全差分ピクセルのカバレッジを追跡
    covered_mask = np.zeros_like(diff_mask, dtype=bool)

    for m in stage["mistakes"]:
        box = get_box(m, width, height)
        x1, y1, x2, y2 = box
        region = diff_mask[y1:y2, x1:x2]
        region_total = region.size if region.size > 0 else 1
        region_diff = int(np.sum(region))
        coverage = region_diff / region_total

        covered_mask[y1:y2, x1:x2] = True

        status = "OK" if coverage >= COVERAGE_MIN else "NO_DIFF"
        results["mistakes"].append({
            "id": m["id"],
            "box_px": f"({x1},{y1})-({x2},{y2})",
            "coverage": f"{coverage*100:.1f}%",
            "diff_pixels": region_diff,
            "status": status
        })

    # 座標外に残っている差分ピクセル数
    uncovered_diff = int(np.sum(diff_mask & ~covered_mask))
    results["uncovered_diff_pixels"] = uncovered_diff
    results["uncovered_diff_ratio"] = f"{uncovered_diff / max(1, int(np.sum(diff_mask))) * 100:.1f}%"

    return results

def main():
    assets_dir = "assets"
    all_ok = True
    issues = []

    print("=" * 70)
    print("  座標検証レポート")
    print("=" * 70)

    for stage in STAGES:
        result = check_stage(stage, assets_dir)
        level = result["level"]

        if result.get("status") == "SKIP":
            print(f"\n[Stage {level}] SKIP: {result['reason']}")
            continue

        has_issue = False
        for m in result["mistakes"]:
            if m["status"] != "OK":
                has_issue = True
                break

        uncovered = result.get("uncovered_diff_pixels", 0)
        total_diff = result.get("total_diff_pixels", 0)

        status_str = "✅ OK" if not has_issue else "❌ 要修正"
        print(f"\n[Stage {level}] {result['title']} ({result['image_size']}) - {status_str}")
        print(f"  差分ピクセル合計: {total_diff}")
        print(f"  座標外の差分: {uncovered} ({result['uncovered_diff_ratio']})")

        for m in result["mistakes"]:
            icon = "✅" if m["status"] == "OK" else "❌"
            print(f"  {icon} 間違い#{m['id']}: box={m['box_px']} coverage={m['coverage']} ({m['diff_pixels']}px)")

        if has_issue:
            all_ok = False
            issues.append(result)

    print("\n" + "=" * 70)
    if all_ok:
        print("✅ 全ステージの座標は正常です！")
    else:
        print(f"❌ {len(issues)}ステージに問題があります：")
        for r in issues:
            bad = [m for m in r["mistakes"] if m["status"] != "OK"]
            print(f"  - Stage {r['level']} ({r['title']}): 間違い#{', '.join(str(m['id']) for m in bad)} に差分なし")
    print("=" * 70)

    return all_ok, issues

if __name__ == "__main__":
    ok, issues = main()

    # 結果をJSONでも保存
    with open("verify_results.json", "w", encoding="utf-8") as f:
        json.dump({"all_ok": ok, "issues": [{"level": r["level"], "title": r["title"], "bad_mistakes": [m for m in r["mistakes"] if m["status"] != "OK"]} for r in issues]}, f, ensure_ascii=False, indent=2)
