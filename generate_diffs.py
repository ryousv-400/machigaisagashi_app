import os
from PIL import Image

stages = {
    15: [
        {"id": 1, "x": 58.0, "y": 82.2, "w": 9.4, "h": 9.4},
        {"id": 2, "x": 38.5, "y": 71.0, "w": 7.8, "h": 7.8},
        {"id": 3, "x": 44.4, "y": 14.7, "w": 11.9, "h": 11.9}
    ],
    16: [
        {"id": 1, "x": 43.6, "y": 56.2, "w": 8.1, "h": 8.1},
        {"id": 2, "x": 68.4, "y": 87.5, "w": 11.2, "h": 11.2},
        {"id": 3, "x": 76.3, "y": 65.9, "w": 9.1, "h": 9.1}
    ],
    17: [
        {"id": 1, "x": 13.4, "y": 14.1, "w": 10.3, "h": 10.3},
        {"id": 2, "x": 42.8, "y": 23.9, "w": 6.2, "h": 6.2},
        {"id": 3, "x": 55.2, "y": 52.3, "w": 10.3, "h": 10.3},
        {"id": 4, "x": 32.2, "y": 47.0, "w": 10.6, "h": 10.6}
    ],
    18: [
        {"id": 1, "x": 85.1, "y": 73.7, "w": 9.1, "h": 9.1},
        {"id": 2, "x": 77.7, "y": 79.5, "w": 10.3, "h": 10.3},
        {"id": 3, "x": 71.3, "y": 86.5, "w": 6.6, "h": 6.6}
    ],
    19: [
        {"id": 1, "x": 30.8, "y": 70.3, "w": 8.1, "h": 8.1},
        {"id": 2, "x": 44.1, "y": 15.5, "w": 7.2, "h": 7.2},
        {"id": 3, "x": 73.4, "y": 83.0, "w": 7.2, "h": 7.2},
        {"id": 4, "x": 50.5, "y": 39.8, "w": 6.2, "h": 6.2},
        {"id": 5, "x": 52.0, "y": 27.2, "w": 6.9, "h": 6.9}
    ],
    20: [
        {"id": 1, "x": 45.6, "y": 26.6, "w": 11.9, "h": 11.9},
        {"id": 2, "x": 43.0, "y": 59.5, "w": 12.2, "h": 12.2},
        {"id": 3, "x": 59.6, "y": 72.7, "w": 7.2, "h": 7.2},
        {"id": 4, "x": 77.3, "y": 89.0, "w": 7.8, "h": 7.8}
    ],
    21: [
        {"id": 1, "x": 78.6, "y": 34.7, "w": 10.6, "h": 10.6},
        {"id": 2, "x": 82.8, "y": 84.4, "w": 12.5, "h": 12.5},
        {"id": 3, "x": 23.8, "y": 47.9, "w": 12.2, "h": 12.2}
    ],
    22: [
        {"id": 1, "x": 61.4, "y": 90.8, "w": 11.2, "h": 11.2},
        {"id": 2, "x": 37.0, "y": 73.4, "w": 7.2, "h": 7.2},
        {"id": 3, "x": 39.1, "y": 17.4, "w": 7.8, "h": 7.8},
        {"id": 4, "x": 79.7, "y": 33.8, "w": 6.2, "h": 6.2},
        {"id": 5, "x": 87.2, "y": 76.9, "w": 11.9, "h": 11.9}
    ],
    23: [
        {"id": 1, "x": 32.3, "y": 35.6, "w": 6.9, "h": 6.9},
        {"id": 2, "x": 44.9, "y": 53.7, "w": 8.4, "h": 8.4},
        {"id": 3, "x": 34.5, "y": 26.8, "w": 12.2, "h": 12.2},
        {"id": 4, "x": 41.4, "y": 25.2, "w": 8.1, "h": 8.1}
    ],
    24: [
        {"id": 1, "x": 90.6, "y": 54.1, "w": 8.8, "h": 8.8},
        {"id": 2, "x": 16.6, "y": 50.1, "w": 9.1, "h": 9.1},
        {"id": 3, "x": 53.0, "y": 20.3, "w": 11.2, "h": 11.2},
        {"id": 4, "x": 25.4, "y": 67.3, "w": 10.9, "h": 10.9},
        {"id": 5, "x": 31.6, "y": 38.8, "w": 9.4, "h": 9.4}
    ],
    25: [
        {"id": 1, "x": 86.3, "y": 58.8, "w": 9.7, "h": 9.7},
        {"id": 2, "x": 33.6, "y": 17.0, "w": 7.5, "h": 7.5},
        {"id": 3, "x": 21.6, "y": 40.8, "w": 6.9, "h": 6.9}
    ],
    26: [
        {"id": 1, "x": 59.8, "y": 39.5, "w": 8.8, "h": 8.8},
        {"id": 2, "x": 81.4, "y": 49.2, "w": 6.9, "h": 6.9},
        {"id": 3, "x": 64.1, "y": 74.8, "w": 11.6, "h": 11.6},
        {"id": 4, "x": 75.2, "y": 61.7, "w": 8.8, "h": 8.8}
    ],
    27: [
        {"id": 1, "x": 49.5, "y": 29.8, "w": 11.9, "h": 11.9},
        {"id": 2, "x": 75.6, "y": 72.0, "w": 7.5, "h": 7.5},
        {"id": 3, "x": 79.3, "y": 27.3, "w": 10.3, "h": 10.3}
    ],
    28: [
        {"id": 1, "x": 27.0, "y": 13.1, "w": 8.8, "h": 8.8},
        {"id": 2, "x": 23.7, "y": 16.3, "w": 8.4, "h": 8.4},
        {"id": 3, "x": 13.0, "y": 33.8, "w": 9.1, "h": 9.1},
        {"id": 4, "x": 65.4, "y": 19.9, "w": 7.8, "h": 7.8},
        {"id": 5, "x": 88.4, "y": 83.8, "w": 10.9, "h": 10.9}
    ],
    29: [
        {"id": 1, "x": 72.0, "y": 49.3, "w": 9.7, "h": 9.7},
        {"id": 2, "x": 37.6, "y": 59.3, "w": 12.2, "h": 12.2},
        {"id": 3, "x": 45.1, "y": 21.2, "w": 10.3, "h": 10.3},
        {"id": 4, "x": 29.8, "y": 33.9, "w": 7.5, "h": 7.5},
        {"id": 5, "x": 35.2, "y": 20.4, "w": 9.1, "h": 9.1}
    ],
    30: [
        {"id": 1, "x": 48.4, "y": 49.8, "w": 10.3, "h": 10.3},
        {"id": 2, "x": 52.1, "y": 33.0, "w": 7.2, "h": 7.2},
        {"id": 3, "x": 79.8, "y": 36.6, "w": 9.7, "h": 9.7}
    ]
}

def swap_channels(img_patch):
    if img_patch.mode == 'RGBA':
        r, g, b, a = img_patch.split()
        return Image.merge('RGBA', (g, b, r, a))
    elif img_patch.mode == 'RGB':
        r, g, b = img_patch.split()
        return Image.merge('RGB', (g, b, r))
    return img_patch

for level, mistakes in stages.items():
    left_path = f"assets/stage{level}_left.png"
    right_path = f"assets/stage{level}_right.png"
    
    if not os.path.exists(left_path):
        print(f"Skipping {level}, {left_path} not found")
        continue

    img = Image.open(left_path)
    width, height = img.size
    
    # We will modify the image to create the right image
    # Note: `img` is already the new base image
    
    for m in mistakes:
        x, y, w, h = m["x"], m["y"], m["w"], m["h"]
        
        # Calculate pixel coordinates
        cx = x * width / 100
        cy = y * height / 100
        cw = w * width / 100
        ch = h * height / 100
        
        box = (int(cx - cw/2), int(cy - ch/2), int(cx + cw/2), int(cy + ch/2))
        
        # Ensure box is within bounds
        box = (
            max(0, box[0]),
            max(0, box[1]),
            min(width, box[2]),
            min(height, box[3])
        )
        
        patch = img.crop(box)
        # Apply the channel swap
        patch = swap_channels(patch)
        img.paste(patch, box)

    img.save(right_path)
    print(f"Generated {right_path}")

print("Done generating all difference images.")
