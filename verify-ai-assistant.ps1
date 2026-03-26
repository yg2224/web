$ErrorActionPreference = 'Stop'

$requiredPatterns = @(
    'https://api.deepseek.com/chat/completions',
    'deepseek-chat',
    'ai-chat-panel',
    'sk-'
)

$scriptPath = Join-Path $PSScriptRoot 'script.js'
if (-not (Test-Path $scriptPath)) {
    Write-Error 'script.js not found.'
}

$scriptContent = Get-Content -Raw -Path $scriptPath
foreach ($pattern in $requiredPatterns) {
    if ($scriptContent -notmatch [regex]::Escape($pattern)) {
        Write-Error "Missing pattern in script.js: $pattern"
    }
}

$requiredHtml = @('index.html', 'main.html', 'test(1).html')
foreach ($name in $requiredHtml) {
    $htmlPath = Join-Path $PSScriptRoot $name
    if (-not (Test-Path $htmlPath)) {
        Write-Error "Missing HTML file: $name"
    }

    $htmlContent = Get-Content -Raw -Path $htmlPath
    if ($htmlContent -notmatch '<script src="script\.js"></script>') {
        Write-Error "Missing script.js include: $name"
    }
}

Write-Output 'AI assistant integration resolved.'
