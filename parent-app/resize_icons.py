import os
from PIL import Image

def resize_and_pad(img_path, output_path, target_size, pad_scale, bg_color=None):
    try:
        img = Image.open(img_path).convert("RGBA")
        
        # Calculate new size based on pad_scale (how much of the image it should take up)
        new_w = int(target_size[0] * pad_scale)
        new_h = int(target_size[1] * pad_scale)
        
        # Maintain aspect ratio
        img.thumbnail((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Create new image with solid background or transparent
        if bg_color:
            new_img = Image.new("RGBA", target_size, bg_color)
        else:
            new_img = Image.new("RGBA", target_size, (255, 255, 255, 0)) # transparent
            
        # Paste centered
        paste_pos = ((target_size[0] - img.size[0]) // 2, (target_size[1] - img.size[1]) // 2)
        
        # If the original image has an alpha channel, use it as a mask
        new_img.paste(img, paste_pos, img)
        
        # Convert back to RGB if no transparency was requested so there's no alpha channel
        if bg_color and bg_color[3] == 255:
            new_img = new_img.convert("RGB")
            
        new_img.save(output_path, "PNG")
        print(f"Created {output_path}")
    except Exception as e:
        print(f"Error processing {img_path} to {output_path}: {e}")

if __name__ == "__main__":
    logo_path = "assets/logo.png"
    icon_out = "assets/images/icon.png"
    splash_out = "assets/images/splash-icon.png"
    android_fg_out = "assets/images/android-icon-foreground.png"
    
    if not os.path.exists(logo_path):
        print(f"File not found: {logo_path}")
        exit(1)
        
    print(f"Processing {logo_path}...")
    
    # icon.png (App Icon) - White background so the logo looks nice and doesn't cut. Scale 0.7 gives padding.
    resize_and_pad(logo_path, icon_out, (1024, 1024), 0.7, bg_color=(255, 255, 255, 255))
    
    # splash-icon.png (Splash Screen) - Transparent background. Scale 0.6 so it's not huge.
    resize_and_pad(logo_path, splash_out, (1024, 1024), 0.6, bg_color=None)
    
    # android-icon-foreground.png (Adaptive Icon FG) - Transparent. Scale 0.6 to fit within Android circular mask.
    resize_and_pad(logo_path, android_fg_out, (1080, 1080), 0.6, bg_color=None)
    
    print("Done!")
