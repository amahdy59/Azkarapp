from PIL import Image
from pathlib import Path

root = Path(__file__).resolve().parents[3]
for name in ['morning', 'evening', 'sleep', 'quran']:
    source = root / 'design-sources/azkar-responsive-assets/source-assets/images' / f'wird-{name}.jpg'
    image = Image.open(source).convert('RGB')
    for width in [360, 720]:
        resized = image.resize((width, round(width * image.height / image.width)), Image.Resampling.LANCZOS)
        output = root / 'public/assets/cards' / f'wird-{name}-{width}'
        resized.save(output.with_suffix('.avif'), quality=48, speed=6)
        resized.save(output.with_suffix('.webp'), quality=72, method=6)
