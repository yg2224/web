$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlFiles = Get-ChildItem -Path $projectRoot -Filter *.html -File
$issues = @()

foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content -Path $htmlFile.FullName -Raw
    $matches = [regex]::Matches($content, '<a\b[^>]*\bhref="([^"]+)"', 'IgnoreCase')

    foreach ($match in $matches) {
        $href = $match.Groups[1].Value.Trim()

        if ($href -eq '#' -or $href -eq 'javascript:void(0);' -or $href -eq 'javascript:void(0)') {
            $issues += "Placeholder link found: $($htmlFile.Name) -> $href"
            continue
        }

        if ($href -match '^(https?:|mailto:|tel:)') {
            continue
        }

        $pathPart = $href
        $fragment = $null

        if ($href.Contains('#')) {
            $parts = $href.Split('#', 2)
            $pathPart = $parts[0]
            $fragment = $parts[1]
        }

        if ([string]::IsNullOrWhiteSpace($pathPart)) {
            $targetPath = $htmlFile.FullName
        } else {
            $relativePath = $pathPart.Replace('/', '\')
            $targetPath = Join-Path $htmlFile.DirectoryName $relativePath
        }

        if (-not (Test-Path -Path $targetPath -PathType Leaf)) {
            $issues += "Target file not found: $($htmlFile.Name) -> $href"
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($fragment)) {
            $targetContent = Get-Content -Path $targetPath -Raw
            $idPattern = '\bid="' + [regex]::Escape($fragment) + '"'

            if (-not [regex]::IsMatch($targetContent, $idPattern, 'IgnoreCase')) {
                $issues += "Target id not found: $($htmlFile.Name) -> $href"
            }
        }
    }
}

if ($issues.Count -gt 0) {
    $issues | Sort-Object -Unique | ForEach-Object { Write-Host $_ }
    exit 1
}

Write-Host 'All site links resolved.'
