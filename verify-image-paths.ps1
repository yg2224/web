$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlFiles = Get-ChildItem -Path $projectRoot -Filter *.html -File
$issues = @()
$expectedResourceIcons = @{
    'Bibliography' = 'image/archive-database.svg'
    'Teaching Materials' = 'image/archive-database.svg'
    'Archives' = 'image/archive-database.svg'
}

foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content -Path $htmlFile.FullName -Raw
    $matches = [regex]::Matches($content, '<img\b[^>]*\bsrc="([^"]+)"', 'IgnoreCase')

    foreach ($match in $matches) {
        $src = $match.Groups[1].Value

        if ($src -match '^/api/placeholder') {
            $issues += "Placeholder image not replaced: $($htmlFile.Name) -> $src"
            continue
        }

        if ($src -match '^/') {
            $resolvedPath = Join-Path $projectRoot $src.TrimStart('/').Replace('/', '\')
        } else {
            $resolvedPath = Join-Path $htmlFile.DirectoryName $src.Replace('/', '\')
        }

        if (-not (Test-Path -Path $resolvedPath -PathType Leaf)) {
            $issues += "Image file not found: $($htmlFile.Name) -> $src"
        }
    }

    foreach ($alt in $expectedResourceIcons.Keys) {
        $expectedSrc = $expectedResourceIcons[$alt]
        $altPattern = '\balt="' + [regex]::Escape($alt) + '"'

        if (-not [regex]::IsMatch($content, $altPattern, 'IgnoreCase')) {
            continue
        }

        $pattern = '<img\b[^>]*\bsrc="' + [regex]::Escape($expectedSrc) + '"[^>]*\balt="' + [regex]::Escape($alt) + '"'

        if (-not [regex]::IsMatch($content, $pattern, 'IgnoreCase')) {
            $issues += "Expected resource icon missing: $($htmlFile.Name) -> alt=$alt src=$expectedSrc"
        }
    }
}

if ($issues.Count -gt 0) {
    $issues | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Host 'All image paths resolved.'
