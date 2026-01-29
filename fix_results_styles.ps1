
# PowerShell script to fix results pages
# Remove inline style blocks from results.html files
$publicPath = "C:\Users\pc\Desktop\PolicyTraining\public"

# Get all results.html files
$resultsFiles = Get-ChildItem -Path $publicPath -Filter "results.html" -Recurse

foreach ($file in $resultsFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Remove the inline style block - match from <style> to </style>
    $content = $content -replace '(?s)<style>.*?</style>', ''
    
    # Add link to dark-styles.css if not already present
    if ($content -notmatch 'dark-styles.css') {
        $content = $content -replace '(</head>)', '    <link rel="stylesheet" href="/dark-styles.css">`n$1'
    }
    
    # Update logo to use invert filter by adding it as inline style or class
    $content = $content -replace 'class="certificate-logo"', 'class="certificate-logo" style="filter: invert(1);"'
    
    # Save the file back
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "Fixed: $($file.FullName)"
}

Write-Host "`nFixed $($resultsFiles.Count) results.html files"
