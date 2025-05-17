# PowerShell script to download product images from negosiodelux.store

# Create pics directory if it doesn't exist
if (-not (Test-Path -Path ".\pics")) {
    New-Item -ItemType Directory -Path ".\pics"
    Write-Host "Created directory: pics"
}

# Function to download an image
function Download-Image {
    param (
        [string]$Url,
        [string]$OutputPath
    )
    
    try {
        $fileName = [System.IO.Path]::GetFileName($Url)
        # Add jpg extension if no extension
        if (-not [System.IO.Path]::HasExtension($fileName)) {
            $fileName = "$fileName.jpg"
        }
        $outputFile = Join-Path -Path $OutputPath -ChildPath $fileName
        
        Write-Host "Downloading $Url to $outputFile..."
        
        # Create WebClient to download the file
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        $webClient.DownloadFile($Url, $outputFile)
        
        Write-Host "Downloaded: $fileName" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Error downloading $Url : $_" -ForegroundColor Red
        return $false
    }
}

# Product image URLs from negosiodelux.store
# These are example URLs - the script won't work without actual URLs from the website
$productImages = @(
    # Main product images
    "https://www.negosiodelux.store/path/to/zegna_triple_stitch.jpg",
    "https://www.negosiodelux.store/path/to/zegna_baskets_triple.jpg",
    "https://www.negosiodelux.store/path/to/dior_stone_island.jpg",
    "https://www.negosiodelux.store/path/to/loro_piana_walk.jpg",
    "https://www.negosiodelux.store/path/to/summer_walk_loafer.jpg",
    "https://www.negosiodelux.store/path/to/louis_vuitton_loafer.jpg",
    "https://www.negosiodelux.store/path/to/tshirt_dolce_gabbana.jpg",
    "https://www.negosiodelux.store/path/to/tshirt_dior.jpg",
    "https://www.negosiodelux.store/path/to/tshirt_armani.jpg",
    "https://www.negosiodelux.store/path/to/tshirt_hermes.jpg",
    "https://www.negosiodelux.store/path/to/givenchy_jeans.jpg",
    "https://www.negosiodelux.store/path/to/fendi_roma_jeans.jpg",
    "https://www.negosiodelux.store/path/to/dior_jeans.jpg",
    "https://www.negosiodelux.store/path/to/louis_vuitton_jeans.jpg",
    "https://www.negosiodelux.store/path/to/jeans_loewe.jpg",
    "https://www.negosiodelux.store/path/to/valise_horizon.jpg"
)

Write-Host "This script is a template for downloading product images."
Write-Host "IMPORTANT: You need to replace the example URLs with actual image URLs from negosiodelux.store."
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Visit https://www.negosiodelux.store/"
Write-Host "2. Right-click on product images and select 'Copy Image Address'"
Write-Host "3. Replace the example URLs in this script with the actual image URLs"
Write-Host "4. Run the script again to download the images"
Write-Host ""

# Count for unique filenames
$count = 1

# Download each image
foreach ($imageUrl in $productImages) {
    # Skip example URLs
    if ($imageUrl -like "*path/to*") {
        continue
    }
    
    $outputFile = ".\pics\product_$count.jpg"
    $success = Download-Image -Url $imageUrl -OutputPath ".\pics"
    if ($success) {
        $count++
    }
    
    # Short delay
    Start-Sleep -Milliseconds 200
}

Write-Host "`nDownloaded $($count-1) product images to .\pics"
Write-Host "`nNOTE: To get actual product images, you need to:"
Write-Host "1. Visit negosiodelux.store in your browser"
Write-Host "2. Right-click on product images"
Write-Host "3. Select 'Copy Image Address'"
Write-Host "4. Edit this script to include those URLs" 