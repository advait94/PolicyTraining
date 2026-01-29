
# PowerShell script to update all results.html files with new certificate design
$publicPath = "C:\Users\pc\Desktop\PolicyTraining\public"

# Define certificate template by module
$certTemplates = @{
    "AntiCorruption" = "Anti-Corruption &amp; Anti-Bribery Training in India"
    "CyberSecurity"  = "Cyber Security Training Program"
    "DataPrivacy"    = "Data Privacy Training Program"
    "hse\HSE"        = "Health, Safety &amp; Environment Training"
    "posh\POSH"      = "POSH Act Training Program"
    "POSH"           = "POSH Act Training Program"
}

$newCertTemplate = @'
        <div class="certificate-section" id="certificateSection">
            <div class="certificate-new" id="certificate">
                <!-- Decorative Double Border -->
                <div class="cert-border-frame"></div>
                
                <!-- Close Button -->
                <div class="cert-close-btn">
                    <a href="/dashboard">Close</a>
                </div>
                
                <!-- Main Content -->
                <div class="cert-content">
                    <!-- Header -->
                    <div class="cert-header">
                        <div class="cert-logo-wrapper">
                            <img src="/aaplus_logo_colored.png" alt="AA Plus Policy Training" class="cert-logo-new">
                        </div>
                        <h1 class="cert-title-new">Certificate</h1>
                        <p class="cert-subtitle-new">of Completion</p>
                        <div class="cert-title-bar"></div>
                    </div>
                    
                    <!-- Recipient Section -->
                    <div class="cert-recipient-section">
                        <p class="cert-text-italic">This is to certify that</p>
                        <h2 class="cert-name" id="recipientName">Training Participant</h2>
                        <p class="cert-text-italic">Has successfully completed the training module</p>
                        <h3 class="cert-module-title">MODULE_TITLE_PLACEHOLDER</h3>
                    </div>
                    
                    <!-- Signatures Footer -->
                    <div class="cert-signatures">
                        <div class="cert-sig-block">
                            <div class="cert-sig-area">
                                <img src="/papa_signature.jpg" alt="Authorized Signature" class="cert-signature-img">
                            </div>
                            <div class="cert-sig-line"></div>
                            <p class="cert-sig-label">Authorized Signature</p>
                        </div>
                        <div class="cert-sig-block">
                            <div class="cert-sig-area">
                                <p class="cert-date-value" id="completionDate">January 29, 2026</p>
                            </div>
                            <div class="cert-sig-line"></div>
                            <p class="cert-sig-label">Date Completed</p>
                        </div>
                    </div>
                </div>
                
                <!-- Watermark -->
                <div class="cert-watermark">
                    AA Plus Policy Training Platform • Proficiency Assessment Verified
                </div>
            </div>

            <div class="print-instructions">
                <strong>📄 To download:</strong> Click the Print button below and select "Save as PDF" as your printer.
                <br><br>
                <button class="action-btn primary" onclick="printCertificate()">🖨️ Print Certificate</button>
            </div>
        </div>
'@

# Get all results.html files except the POSH one we already updated
$resultsFiles = Get-ChildItem -Path $publicPath -Filter "results.html" -Recurse | Where-Object { $_.FullName -notlike "*\POSH\results.html" }

foreach ($file in $resultsFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Determine module title based on path
    $relativePath = $file.DirectoryName.Substring($publicPath.Length + 1)
    $moduleTitle = "Training Program"
    
    foreach ($key in $certTemplates.Keys) {
        if ($relativePath -eq $key -or $relativePath -like "*$key*") {
            $moduleTitle = $certTemplates[$key]
            break
        }
    }
    
    # Create certificate with proper module title
    $moduleCert = $newCertTemplate -replace "MODULE_TITLE_PLACEHOLDER", $moduleTitle
    
    # Replace the old certificate section with new one
    # Match from <div class="certificate-section" to the end </div> of print-instructions
    $pattern = '(?s)<div class="certificate-section"[^>]*>.*?<div class="print-instructions">.*?</div>\s*</div>'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $moduleCert
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated: $($file.FullName) with title: $moduleTitle"
    }
    else {
        Write-Host "No certificate section found in: $($file.FullName)"
    }
}

Write-Host "`nUpdated $($resultsFiles.Count) results.html files with new certificate design"
