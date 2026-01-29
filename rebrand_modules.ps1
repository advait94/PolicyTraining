
# Bulk find-replace script for rebranding modules to AA Plus
$publicPath = "C:\Users\pc\Desktop\PolicyTraining\public"

# Get all HTML files recursively
$htmlFiles = Get-ChildItem -Path $publicPath -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Replace Ishan Technologies with AA Plus
    $content = $content -replace "Ishan Technologies", "AA Plus"
    $content = $content -replace "Ishan's", "AA Plus's"
    $content = $content -replace "icc@ishantechnologies.com", "compliance@aaplus.com"
    
    # Replace logo references
    $content = $content -replace "../ishantechnologies_logo.jpeg", "/aaplus_logo.png"
    $content = $content -replace "ishantechnologies_logo.jpeg", "/aaplus_logo.png"
    
    # Replace Training Hub link (../index.html) with /dashboard
    $content = $content -replace 'href="../index.html"', 'href="/dashboard"'
    $content = $content -replace "href=`"../index.html`"", 'href="/dashboard"'
    
    # Save the file back
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Rebranding complete. Processed $($htmlFiles.Count) files."
