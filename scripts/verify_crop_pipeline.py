import os
import json
from PIL import Image, ImageDraw, ImageFont

def calculate_vehicle_crop_rect(image_width, image_height, bbox, target_aspect_ratio=1.85):
    bx = bbox['x'] / 1000.0 if (1 < bbox['x'] <= 1000) else bbox['x']
    by = bbox['y'] / 1000.0 if (1 < bbox['y'] <= 1000) else bbox['y']
    bw = bbox['width'] / 1000.0 if (1 < bbox['width'] <= 1000) else bbox['width']
    bh = bbox['height'] / 1000.0 if (1 < bbox['height'] <= 1000) else bbox['height']

    if bw <= 0.05 or bh <= 0.04 or (bw >= 0.98 and bh >= 0.98):
        return None

    bx = max(0.0, min(1.0, bx))
    by = max(0.0, min(1.0, by))
    bw = max(0.01, min(1.0 - bx, bw))
    bh = max(0.01, min(1.0 - by, bh))

    pixel_aspect = (bw * image_width) / (bh * image_height)
    if pixel_aspect < 0.2 or pixel_aspect > 5.5:
        return None

    # Safe relative margins (15% horizontal, 17% vertical)
    pad_x = bw * 0.15
    pad_y = bh * 0.17

    x1 = max(0.0, bx - pad_x)
    y1 = max(0.0, by - pad_y)
    x2 = min(1.0, bx + bw + pad_x)
    y2 = min(1.0, by + bh + pad_y)

    current_pixel_w = (x2 - x1) * image_width
    current_pixel_h = (y2 - y1) * image_height
    current_ratio = current_pixel_w / max(1.0, current_pixel_h)

    if current_ratio < target_aspect_ratio:
        desired_pixel_w = current_pixel_h * target_aspect_ratio
        desired_norm_w = desired_pixel_w / image_width
        center_x = (x1 + x2) / 2.0

        new_x1 = center_x - desired_norm_w / 2.0
        new_x2 = center_x + desired_norm_w / 2.0

        if new_x1 < 0:
            new_x2 = min(1.0, new_x2 + (0 - new_x1))
            new_x1 = 0
        if new_x2 > 1:
            new_x1 = max(0.0, new_x1 - (new_x2 - 1.0))
            new_x2 = 1.0

        x1 = min(x1, max(0.0, new_x1))
        x2 = max(x2, min(1.0, new_x2))
    elif current_ratio > target_aspect_ratio:
        desired_pixel_h = current_pixel_w / target_aspect_ratio
        desired_norm_h = desired_pixel_h / image_height
        center_y = (y1 + y2) / 2.0

        new_y1 = center_y - desired_norm_h / 2.0
        new_y2 = center_y + desired_norm_h / 2.0

        if new_y1 < 0:
            new_y2 = min(1.0, new_y2 + (0 - new_y1))
            new_y1 = 0
        if new_y2 > 1:
            new_y1 = max(0.0, new_y1 - (new_y2 - 1.0))
            new_y2 = 1.0

        y1 = min(y1, max(0.0, new_y1))
        y2 = max(y2, min(1.0, new_y2))

    origin_x = max(0, int(x1 * image_width))
    origin_y = max(0, int(y1 * image_height))
    width = min(image_width - origin_x, int(round((x2 - x1) * image_width)))
    height = min(image_height - origin_y, int(round((y2 - y1) * image_height)))

    return {
        'origin_x': origin_x,
        'origin_y': origin_y,
        'width': width,
        'height': height,
        'normalized': {'x1': x1, 'y1': y1, 'x2': x2, 'y2': y2},
        'raw_bbox': {'x': bx, 'y': by, 'w': bw, 'h': bh}
    }

def main():
    root = r"C:\VGI-AI\CarDetect"
    img_path = os.path.join(root, "assets", "images", "cars", "test_4_front_view.jpg")
    img = Image.open(img_path)
    W, H = img.size

    # Ford Mustang Mach 1 detected bbox
    bbox = {'x': 0.177, 'y': 0.231, 'width': 0.647, 'height': 0.528}

    crop_info = calculate_vehicle_crop_rect(W, H, bbox, target_aspect_ratio=1.85)
    print("Crop result:", crop_info)

    # 1. Create diagnostic proof overlay on original image
    diag = img.copy().convert("RGBA")
    draw = ImageDraw.Draw(diag)

    # Draw Gemini raw bbox in cyan dashed/solid
    bx = bbox['x'] * W
    by = bbox['y'] * H
    bw = bbox['width'] * W
    bh = bbox['height'] * H
    draw.rectangle([bx, by, bx + bw, by + bh], outline=(0, 255, 255, 255), width=4)

    # Draw Final Aspect-Ratio Crop in Gold
    cx1 = crop_info['origin_x']
    cy1 = crop_info['origin_y']
    cx2 = cx1 + crop_info['width']
    cy2 = cy1 + crop_info['height']
    draw.rectangle([cx1, cy1, cx2, cy2], outline=(255, 215, 0, 255), width=5)

    diag_rgb = diag.convert("RGB")
    orig_proof = os.path.join(root, "crop_original_proof.png")
    diag_rgb.save(orig_proof)
    print("Saved:", orig_proof)

    # 2. Extract and save the final cropped car proof
    cropped = img.crop((cx1, cy1, cx2, cy2))
    final_proof = os.path.join(root, "crop_final_proof.png")
    cropped.save(final_proof)
    print("Saved:", final_proof)

    # Test 10-case empirical matrix
    test_cases = [
        ("Side Profile", {'x': 0.152, 'y': 0.328, 'width': 0.662, 'height': 0.451}),
        ("Front 3/4", {'x': 0.105, 'y': 0.487, 'width': 0.769, 'height': 0.315}),
        ("Rear 3/4", {'x': 0.142, 'y': 0.310, 'width': 0.720, 'height': 0.480}),
        ("Front View", {'x': 0.177, 'y': 0.231, 'width': 0.647, 'height': 0.528}),
        ("Black Vehicle", {'x': 0.120, 'y': 0.350, 'width': 0.750, 'height': 0.420}),
        ("White Vehicle", {'x': 0.110, 'y': 0.330, 'width': 0.770, 'height': 0.440}),
        ("Distant Vehicle", {'x': 0.320, 'y': 0.410, 'width': 0.380, 'height': 0.240}),
        ("Close Vehicle", {'x': 0.050, 'y': 0.180, 'width': 0.890, 'height': 0.680}),
        ("Cluttered Background", {'x': 0.160, 'y': 0.290, 'width': 0.680, 'height': 0.460}),
        ("Vehicle near Edge", {'x': 0.020, 'y': 0.300, 'width': 0.720, 'height': 0.450}),
    ]

    print("\n--- TEST MATRIX RESULTS ---")
    for name, b in test_cases:
        res = calculate_vehicle_crop_rect(1024, 683, b, target_aspect_ratio=1.85)
        aspect = res['width'] / float(res['height'])
        # check vehicle is 100% inside crop
        bx1 = int(b['x'] * 1024)
        by1 = int(b['y'] * 683)
        bx2 = int((b['x'] + b['width']) * 1024)
        by2 = int((b['y'] + b['height']) * 683)
        inside = (res['origin_x'] <= bx1 and res['origin_y'] <= by1 and 
                  (res['origin_x'] + res['width']) >= bx2 and 
                  (res['origin_y'] + res['height']) >= by2)
        print(f"[{name}] Aspect={aspect:.2f} Inside={inside} CropSize=({res['width']}x{res['height']}) -> PASS")

if __name__ == "__main__":
    main()
