
# PowerShell script to update all module HTML files to use dark-styles.css
$publicPath = "C:\Users\pc\Desktop\PolicyTraining\public"

# Get all HTML files recursively
$htmlFiles = Get-ChildItem -Path $publicPath -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Replace styles.css reference with dark-styles.css (absolute path)
    $content = $content -replace 'href="styles.css"', 'href="/dark-styles.css"'
    $content = $content -replace "href='styles.css'", "href='/dark-styles.css'"
    $content = $content -replace 'href="../styles.css"', 'href="/dark-styles.css"'
    $content = $content -replace "href='../styles.css'", "href='/dark-styles.css'"
    
    # Save the file back
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Updated $($htmlFiles.Count) files to use dark-styles.css"
