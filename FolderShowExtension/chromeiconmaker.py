from PIL import Image
import os

def generate_chrome_extension_icons(source_image_path, output_folder):
    """
    Generate icons for a Chrome extension from a source PNG image.

    :param source_image_path: Path to the source PNG image.
    :param output_folder: Directory where resized icons will be saved.
    """
    # Ensure the output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Open the source image
    with Image.open(source_image_path) as img:
        # Ensure the image is in RGB mode for better compatibility
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Define Chrome extension icon sizes
        sizes = [(16, 16), (48, 48), (128, 128)]  # Standard Chrome extension icon sizes

        # Generate icons for each size
        for width, height in sizes:
            # Calculate aspect ratio to preserve
            aspect_ratio = img.width / img.height
            if aspect_ratio > (width / height):
                # If image is wider, base resizing on height
                scaled_height = height
                scaled_width = int(height * aspect_ratio)
            else:
                # If image is taller or square, base resizing on width
                scaled_width = width
                scaled_height = int(width / aspect_ratio)

            # Resize the image
            resized_img = img.resize((scaled_width, scaled_height), Image.LANCZOS)
            
            # Create a new image with the desired size and paste the resized image in the center
            result = Image.new('RGB', (width, height), (0, 0, 0, 0))  # Transparent background
            result.paste(resized_img, ((width - scaled_width) // 2, (height - scaled_height) // 2))
            
            # Save the icon with a name that includes its size for easy identification
            icon_path = os.path.join(output_folder, f"icon{width}.png")
            result.save(icon_path, "PNG")
            print(f"Saved {icon_path}")

if __name__ == "__main__":
    # Use the script's directory for the source image and output
    script_directory = os.path.dirname(os.path.abspath(__file__))

    source_image = os.path.join(script_directory, "iconsample.png")
    output_dir = script_directory  # or any other directory you prefer for output

    generate_chrome_extension_icons(source_image, output_dir)