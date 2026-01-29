
# PowerShell script to fix quiz and results pages
# 1. Remove inline style blocks that override dark theme
# 2. Update logo to colored version
$publicPath = "C:\Users\pc\Desktop\PolicyTraining\public"

# Get all HTML files recursively
$htmlFiles = Get-ChildItem -Path $publicPath -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Update logo to colored version
    $content = $content -replace 'src="/aaplus_logo.png"', 'src="/aaplus_logo_colored.png"'
    $content = $content -replace "src='/aaplus_logo.png'", "src='/aaplus_logo_colored.png'"
    
    # Remove inline style blocks that contain light theme overrides
    # Match style blocks containing quiz-page with light backgrounds
    $content = $content -replace '(?s)<style>.*?\.quiz-page\s*\{[^}]*background:\s*linear-gradient\(135deg,\s*#f5f7fa.*?</style>', ''
    
    # Save the file back
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}

Write-Host "Fixed $($htmlFiles.Count) files - removed light theme overrides and updated logos"
