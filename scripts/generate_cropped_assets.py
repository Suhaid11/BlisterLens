import json
import os
from PIL import Image

def main():
    with open('scripts/qa_empirical_results.json', 'r') as f:
        results = json.load(f)

    file_suffixes = [
        '',
        'side_profile.jpg',
        'front_three_quarter.jpg',
        'rear_three_quarter.jpg',
        'front_view.jpg',
        'dark_vehicle.jpg',
        'white_vehicle.jpg',
        'distant_vehicle.jpg',
        'close_vehicle.jpg'
    ]

    os.makedirs('assets/images/cars/cropped', exist_ok=True)

    for r in results:
        test_num = r['testNum']
        img_name = f'test_{test_num}_{file_suffixes[test_num]}'
        img_path = os.path.join('assets/images/cars', img_name)
        
        im = Image.open(img_path)
        w, h = im.size
        crop_w = r['cropWindow']
        
        # Calculate pixel coordinates
        x0 = max(0, int(crop_w['padX'] * w))
        y0 = max(0, int(crop_w['padY'] * h))
        x1 = min(w, int((crop_w['padX'] + crop_w['padW']) * w))
        y1 = min(h, int((crop_w['padY'] + crop_w['padH']) * h))
        
        cropped = im.crop((x0, y0, x1, y1))
        out_path = os.path.join('assets/images/cars/cropped', f'test_{test_num}_cropped.jpg')
        cropped.save(out_path, quality=95)
        print(f"Test {test_num} [{r['category']}]: Orig {w}x{h} -> Crop {cropped.size} saved to {out_path}")

if __name__ == '__main__':
    main()
