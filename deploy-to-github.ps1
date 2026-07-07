param(
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
$RepoUrl = "https://github.com/vrobeert/rxsbmw.git"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$LogPath = Join-Path $ProjectRoot "deploy-last.log"

Start-Transcript -Path $LogPath -Force | Out-Null

function Write-Step {
  param([string]$Text)
  Write-Host ""
  Write-Host "==> $Text" -ForegroundColor Cyan
}

function Find-Tool {
  param(
    [string]$Name,
    [string]$Fallback
  )

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  if ($Fallback -and (Test-Path -LiteralPath $Fallback)) {
    return $Fallback
  }

  return $null
}

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$GitArgs)
  & $script:GitExe @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $($GitArgs -join ' ')"
  }
}

try {
  Set-Location -LiteralPath $ProjectRoot
  Write-Host "RXS x BMW deploy automat catre GitHub" -ForegroundColor Green
  Write-Host "Folder: $ProjectRoot"
  Write-Host "Repository: $RepoUrl"

  $bundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
  if (Test-Path -LiteralPath $bundledNode) {
    $env:PATH = "$bundledNode;$env:PATH"
  }

  $script:GitExe = Find-Tool -Name "git.exe" -Fallback ""
  if (-not $script:GitExe) {
    throw "Git nu este instalat sau nu este in PATH."
  }

  $pnpmFallback = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\bin\pnpm.cmd"
  $pnpmExe = Find-Tool -Name "pnpm.cmd" -Fallback $pnpmFallback

  if ($pnpmExe) {
    Write-Step "Verific build-ul aplicatiei"
    & $pnpmExe build
    if ($LASTEXITCODE -ne 0) {
      throw "Build-ul a picat. Deploy-ul a fost oprit."
    }
  } else {
    Write-Host "pnpm nu a fost gasit. Sar peste build si continui cu Git." -ForegroundColor Yellow
  }

  if (-not (Test-Path -LiteralPath (Join-Path $ProjectRoot ".git"))) {
    Write-Step "Initializez repository Git local"
    Invoke-Git init
  }

  $userName = (& $script:GitExe config user.name) 2>$null
  if (-not $userName) {
    Invoke-Git config user.name "RXS BMW Deploy"
  }

  $userEmail = (& $script:GitExe config user.email) 2>$null
  if (-not $userEmail) {
    Invoke-Git config user.email "deploy@rxsbmw.local"
  }

  Write-Step "Setez remote origin"
  $remoteNames = @(& $script:GitExe remote)
  if ($LASTEXITCODE -ne 0) {
    throw "Nu pot citi remote-urile Git."
  }

  if ($remoteNames -notcontains "origin") {
    Invoke-Git remote add origin $RepoUrl
  } else {
    $origin = & $script:GitExe remote get-url origin
    if ($LASTEXITCODE -ne 0) {
      throw "Remote-ul origin exista, dar URL-ul nu poate fi citit."
    }

    if ($origin.Trim() -ne $RepoUrl) {
      Invoke-Git remote set-url origin $RepoUrl
    }
  }

  Write-Step "Pregatesc commit-ul"
  Invoke-Git add -A

  & $script:GitExe diff --cached --quiet
  $hasStagedChanges = $LASTEXITCODE -ne 0

  if ($hasStagedChanges) {
    if (-not $Message) {
      $Message = "Deploy RXS x BMW $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }
    Invoke-Git commit -m $Message
  } else {
    Write-Host "Nu exista schimbari noi de commit-uit." -ForegroundColor Yellow
  }

  Write-Step "Setez branch-ul main"
  Invoke-Git branch -M main

  Write-Step "Sincronizez cu GitHub daca exista deja branch main"
  & $script:GitExe ls-remote --exit-code --heads origin main | Out-Null
  $remoteMainExists = $LASTEXITCODE -eq 0
  if ($remoteMainExists) {
    Invoke-Git pull origin main --allow-unrelated-histories --no-rebase --no-edit
  } else {
    Write-Host "Remote main nu exista inca. Va fi creat la push." -ForegroundColor Yellow
  }

  Write-Step "Trimit proiectul pe GitHub"
  Invoke-Git push -u origin main

  Write-Host ""
  Write-Host "Deploy terminat cu succes." -ForegroundColor Green
  Write-Host "Repository: $RepoUrl"
}
catch {
  Write-Host ""
  Write-Host "Deploy oprit: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "Vezi logul: $LogPath" -ForegroundColor Yellow
  exit 1
}
finally {
  Stop-Transcript | Out-Null
}
