$ErrorActionPreference = "Stop"

Write-Host "VIDORA ADS - Cloudflare Deploy" -ForegroundColor Cyan

if (-not (Test-Path ".\package.json")) {
    throw "Run this script from the project root."
}

Write-Host "[1/5] Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

Write-Host "[2/5] TypeScript check..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw "TypeScript check failed" }

Write-Host "[3/5] Building OpenNext..." -ForegroundColor Yellow
npm run cf:build
if ($LASTEXITCODE -ne 0) { throw "OpenNext build failed" }

Write-Host "[4/5] Applying remote D1 migrations..." -ForegroundColor Yellow
npm run db:migrate:remote
if ($LASTEXITCODE -ne 0) { throw "D1 migration failed" }

Write-Host "[5/5] Deploying a NEW Worker version..." -ForegroundColor Yellow
npx opennextjs-cloudflare deploy
if ($LASTEXITCODE -ne 0) { throw "Cloudflare deploy failed" }

Write-Host "Deployment completed." -ForegroundColor Green
