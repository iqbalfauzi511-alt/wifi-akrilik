from PIL import Image
import os

def generate_icons():
    logo_path = 'public/cobascan-logo.png'
    if not os.path.exists(logo_path):
        raise FileNotFoundError(f"{logo_path} not found")

    logo_src = Image.open(logo_path).convert('RGBA')
    bbox = logo_src.getbbox()
    logo_cropped = logo_src.crop(bbox)
    orig_w, orig_h = logo_cropped.size
    print(f"Original cropped logo size: {orig_w}x{orig_h}")

    targets = [
        # Standard PWA & iOS touch icons (Solid RGB White background)
        ('public/icons/apple-touch-icon.png', 180, 0.70),
        ('public/icons/icon-192.png', 192, 0.70),
        ('public/icons/icon-512.png', 512, 0.70),
        ('public/icons/icon-maskable.png', 512, 0.65), # 65% safe zone for Android circle/squircle masks
        ('public/apple-touch-icon.png', 180, 0.70),
        ('public/apple-touch-icon-precomposed.png', 180, 0.70),
        ('app/icon.png', 512, 0.70),
        ('app/apple-icon.png', 180, 0.70),
    ]

    for dest, size, scale_ratio in targets:
        # Create solid white canvas (255, 255, 255)
        canvas = Image.new('RGBA', (size, size), (255, 255, 255, 255))
        
        target_max = int(size * scale_ratio)
        scale = min(target_max / orig_w, target_max / orig_h)
        new_w = int(orig_w * scale)
        new_h = int(orig_h * scale)

        resized = logo_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        offset_x = (size - new_w) // 2
        offset_y = (size - new_h) // 2

        canvas.paste(resized, (offset_x, offset_y), resized)

        # Convert to RGB (No alpha channel) so that iOS Safari NEVER defaults to a black background!
        final_img = canvas.convert('RGB')
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        final_img.save(dest, format='PNG', optimize=True)
        print(f"Saved {dest} ({size}x{size}, mode={final_img.mode})")

if __name__ == '__main__':
    generate_icons()

