import os
from PIL import Image, ImageDraw

def create_diecast_shield_icon(size):
    # Dark gallery neutral backdrop (#0F1115)
    img = Image.new('RGBA', (size, size), (15, 17, 21, 255))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.10)
    badge_rect = [margin, margin, size - margin, size - margin]
    corner_r = int(size * 0.26)

    # 1. Outer Deep Racing Crimson Shield Badge (#DC2626) with Metallic Gold Chamfer (#F59E0B)
    gold_border_w = max(2, int(size * 0.04))
    draw.rounded_rectangle(
        badge_rect,
        radius=corner_r,
        fill=(220, 38, 38, 255),
        outline=(245, 158, 11, 255),
        width=gold_border_w
    )

    # 2. Top Specular Foil Light Reflection Arc
    top_foil = [
        margin + int(size * 0.03),
        margin + int(size * 0.03),
        size - margin - int(size * 0.03),
        margin + int(size * 0.32)
    ]
    draw.rounded_rectangle(top_foil, radius=int(corner_r * 0.6), fill=(255, 255, 255, 55))

    # 3. Dynamic Twin Racing Speed Wings in Metallic Gold
    cx, cy = size // 2, size // 2
    wing_span = int(size * 0.38)
    wing_h = max(2, int(size * 0.05))
    
    # Left speed wing
    draw.polygon([
        (cx - wing_span, cy - int(size * 0.06)),
        (cx - int(size * 0.16), cy - int(size * 0.02)),
        (cx - int(size * 0.16), cy + int(size * 0.02)),
        (cx - wing_span, cy - int(size * 0.02)),
    ], fill=(245, 158, 11, 255))
    
    # Right speed wing
    draw.polygon([
        (cx + wing_span, cy - int(size * 0.06)),
        (cx + int(size * 0.16), cy - int(size * 0.02)),
        (cx + int(size * 0.16), cy + int(size * 0.02)),
        (cx + wing_span, cy - int(size * 0.02)),
    ], fill=(245, 158, 11, 255))

    # 4. Central Clear Blister Capsule Core (#0F1115 with crisp white mold border)
    c_radius = int(size * 0.22)
    capsule_rect = [cx - c_radius, cy - c_radius, cx + c_radius, cy + c_radius]
    capsule_border_w = max(2, int(size * 0.028))
    draw.ellipse(
        capsule_rect,
        fill=(15, 17, 21, 255),
        outline=(255, 255, 255, 255),
        width=capsule_border_w
    )

    # 5. Inner Dynamic Racing Slash (Crimson)
    core_w = int(size * 0.14)
    draw.polygon([
        (cx - core_w // 2, cy + int(size * 0.04)),
        (cx + core_w // 2, cy - int(size * 0.04)),
        (cx + core_w // 2, cy - int(size * 0.01)),
        (cx - core_w // 2, cy + int(size * 0.07)),
    ], fill=(220, 38, 38, 255))

    # 6. Convex Lens Specular Highlight Point (Amber / White Glint)
    glint_size = max(2, int(size * 0.05))
    glint_x = cx + int(size * 0.06)
    glint_y = cy - int(size * 0.12)
    draw.ellipse([glint_x, glint_y, glint_x + glint_size, glint_y + glint_size], fill=(255, 255, 255, 240))

    return img

def main():
    os.makedirs('assets/images', exist_ok=True)
    icon_1024 = create_diecast_shield_icon(1024)
    icon_1024.save('assets/images/icon.png')
    icon_1024.save('assets/images/android-icon-foreground.png')
    
    icon_48 = create_diecast_shield_icon(48)
    icon_48.save('assets/images/favicon.png')
    print("Rendered brand die-cast shield icon to assets/images/icon.png, android-icon-foreground.png, favicon.png")

if __name__ == '__main__':
    main()
