import os
import requests
from bs4 import BeautifulSoup
import time
import re
from urllib.parse import urljoin

# Create pics directory if it doesn't exist
os.makedirs('pics', exist_ok=True)

def download_image(url, folder_path, filename=None):
    """Download an image from a URL and save it to the specified folder"""
    try:
        response = requests.get(url, stream=True)
        if response.status_code == 200:
            # Extract filename from URL if not provided
            if filename is None:
                filename = os.path.basename(url).split('?')[0]
                # Ensure filename has an extension
                if not re.search(r'\.(jpg|jpeg|png|gif|webp)$', filename.lower()):
                    filename += '.jpg'
            
            filepath = os.path.join(folder_path, filename)
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            print(f"Downloaded: {filename}")
            return True
        else:
            print(f"Failed to download: {url} (Status code: {response.status_code})")
            return False
    except Exception as e:
        print(f"Error downloading {url}: {e}")
        return False

def scrape_product_images(url, folder_path):
    """Scrape product images from a website"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers)
        if response.status_code != 200:
            print(f"Failed to fetch the website: {response.status_code}")
            return
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find all image tags
        img_tags = soup.find_all('img')
        
        # Count for unique filenames
        count = 1
        downloaded = 0
        
        # Process each image
        for img in img_tags:
            # Get image URL
            img_url = img.get('src') or img.get('data-src')
            if not img_url:
                continue
            
            # Make absolute URL if it's relative
            img_url = urljoin(url, img_url)
            
            # Skip small icons, logos, etc.
            if 'icon' in img_url.lower() or 'logo' in img_url.lower():
                continue
                
            # Generate a unique filename
            filename = f"product_{count}.jpg"
            
            # Download the image
            success = download_image(img_url, folder_path, filename)
            if success:
                downloaded += 1
                count += 1
            
            # Short delay to prevent overwhelming the server
            time.sleep(0.2)
        
        print(f"\nDownloaded {downloaded} product images to {folder_path}")
    
    except Exception as e:
        print(f"Error scraping images: {e}")

if __name__ == "__main__":
    website_url = "https://www.negosiodelux.store/"
    scrape_product_images(website_url, "pics")
    
    # Additional categories to scrape
    categories = [
        "https://www.negosiodelux.store/collections/zegna",
        "https://www.negosiodelux.store/collections/loro-piana",
        "https://www.negosiodelux.store/collections/t-shirt",
        "https://www.negosiodelux.store/collections/jeans",
        "https://www.negosiodelux.store/collections/valise-cabine-horizon"
    ]
    
    for category_url in categories:
        print(f"\nScraping category: {category_url}")
        scrape_product_images(category_url, "pics") 