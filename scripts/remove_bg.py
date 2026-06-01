import os
from PIL import Image

input_dir = os.path.join(os.getcwd(), 'public', 'assets', 'logos')
output_dir = os.path.join(os.getcwd(), 'public', 'assets', 'logos')

def remove_background(img, mode='light'):
    img = img.convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # Calculate luminance
        luminance = (0.299*item[0] + 0.587*item[1] + 0.114*item[2])
        
        if mode == 'light':
            # Remove light background (white/off-white)
            if luminance > 200:
                newData.append((255, 255, 255, 0))
            else:
                newData.append(item)
        elif mode == 'dark':
            # Remove dark background
            if luminance < 50:
                newData.append((0, 0, 0, 0))
            else:
                newData.append(item)
    
    img.putdata(newData)
    return img

def process_logos():
    print("Starting background removal...")
    for filename in os.listdir(input_dir):
        if not filename.endswith('.png'):
            continue
            
        filepath = os.path.join(input_dir, filename)
        
        # Skip Favicon and Apple Touch Icon (they need their yellow bg)
        if filename in ['Favicon.png', 'Apple_Touch_Icon.png']:
            print(f"Skipping {filename}")
            continue
            
        print(f"Processing {filename}...")
        try:
            img = Image.open(filepath)
            
            # Determine mode based on file name
            mode = 'dark' if 'Footer_Monochromatic' in filename else 'light'
            
            processed_img = remove_background(img, mode)
            
            # Save back to same file
            processed_img.save(filepath, "PNG")
            print(f"Successfully processed {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    process_logos()
