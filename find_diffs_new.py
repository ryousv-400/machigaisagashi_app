import sys
import copy
from PIL import Image
import numpy as np

def bfs(diff_mask, start_y, start_x):
    queue = [(start_y, start_x)]
    diff_mask[start_y, start_x] = False
    
    min_y, max_y = start_y, start_y
    min_x, max_x = start_x, start_x
    
    pixels = 0
    
    while queue:
        y, x = queue.pop(0)
        pixels += 1
        
        min_y = min(min_y, y)
        max_y = max(max_y, y)
        min_x = min(min_x, x)
        max_x = max(max_x, x)
        
        for dy, dx in [(0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < diff_mask.shape[0] and 0 <= nx < diff_mask.shape[1] and diff_mask[ny, nx]:
                diff_mask[ny, nx] = False
                queue.append((ny, nx))
                
    return pixels, (min_x, min_y, max_x, max_y)

def find_diffs(left_path, right_path, num_mistakes):
    left = Image.open(left_path).convert('RGB')
    right = Image.open(right_path).convert('RGB')
    if left.size != right.size:
        right = right.resize(left.size, Image.LANCZOS)
    
    left_arr = np.array(left, dtype=np.int16)
    right_arr = np.array(right, dtype=np.int16)
    
    diff_map = np.max(np.abs(left_arr - right_arr), axis=2)
    diff_mask = diff_map > 30
    
    height, width = left_arr.shape[:2]
    
    # Custom connected components
    objects = []
    
    sys.setrecursionlimit(max(sys.getrecursionlimit(), 10000))
    for y in range(height):
        for x in range(width):
            if diff_mask[y, x]:
                pixels, box = bfs(diff_mask, y, x)
                # Ignore very small noise
                if pixels > 10:
                    area = (box[2] - box[0]) * (box[3] - box[1])
                    objects.append((area, box))
                    
    objects.sort(key=lambda x: x[0], reverse=True)
    
    results = []
    for i in range(min(num_mistakes, len(objects))):
        area, box = objects[i]
        x1, y1, x2, y2 = box
        w_px = x2 - x1
        h_px = y2 - y1
        
        # Center coordinates in percentage
        cx_pct = (x1 + w_px/2) / width * 100
        cy_pct = (y1 + h_px/2) / height * 100
        w_pct = w_px / width * 100
        h_pct = h_px / height * 100
        
        results.append({
            "id": i + 1,
            "x": round(cx_pct, 2),
            "y": round(cy_pct, 2),
            "w": round(w_pct, 2),
            "h": round(h_pct, 2)
        })
        
    return results

print("Stage 1:")
for m in find_diffs("assets/stage1_left.png", "assets/stage1_right.png", 5):
    print(f'{{ id: {m["id"]}, x: {m["x"]}, y: {m["y"]}, w: {m["w"]}, h: {m["h"]} }},')

print("\nStage 2:")
for m in find_diffs("assets/stage2_left.png", "assets/stage2_right.png", 3):
    print(f'{{ id: {m["id"]}, x: {m["x"]}, y: {m["y"]}, w: {m["w"]}, h: {m["h"]} }},')
