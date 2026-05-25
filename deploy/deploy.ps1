# Prisma mini app — deploy skripti (Windows PowerShell)
# Ishlatish:  .\deploy\deploy.ps1
# Server avval SERVER_SETUP.md bo'yicha sozlangan bo'lishi kerak.

param(
    [string]$ServerIp = "157.180.46.214",
    [string]$ServerUser = "root",
    [string]$RemoteDir = "/var/www/prisma",
    [string]$SshKey = "$env:USERPROFILE\.ssh\prisma_deploy"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

# Multi-tenant serverda ehtiyot uchun:
#  - SSH kaliti aniq berildi (default kalitlardan birortasi tasodifan boshqa
#    serverga ulanmasligi uchun)
#  - .env tar'dan chiqarib tashlandi — serverdagi haqiqiy kreditallarni
#    lokal .env (kreditalsiz nusxa) overwrite qilmasin
$sshArgs = @(
    "-i", $SshKey,
    "-o", "StrictHostKeyChecking=no",
    "-o", "UserKnownHostsFile=/dev/null",
    "-o", "LogLevel=ERROR"
)

Write-Host "1/5  Mini app build qilinmoqda..." -ForegroundColor Cyan
Push-Location "$root\webapp"
npm install
npm run build
Pop-Location

Write-Host "2/5  Arxiv tayyorlanmoqda..." -ForegroundColor Cyan
$archive = "$env:TEMP\prisma-deploy.tar.gz"
if (Test-Path $archive) { Remove-Item $archive }
tar -czf $archive -C $root `
    --exclude=".venv" --exclude="__pycache__" --exclude="node_modules" `
    --exclude=".git" --exclude="*.pyc" `
    --exclude="backend/.env" --exclude=".env.production" `
    backend webapp/dist deploy

Write-Host "3/5  Serverga yuborilmoqda..." -ForegroundColor Cyan
scp @sshArgs $archive "${ServerUser}@${ServerIp}:/tmp/prisma-deploy.tar.gz"

Write-Host "4/5  Serverda o'rnatilmoqda..." -ForegroundColor Cyan
ssh @sshArgs "${ServerUser}@${ServerIp}" @"
set -e
mkdir -p $RemoteDir
tar -xzf /tmp/prisma-deploy.tar.gz -C $RemoteDir
cd $RemoteDir/backend
[ -d .venv ] || python3 -m venv .venv
.venv/bin/pip install --upgrade pip -q
.venv/bin/pip install -q -r requirements.txt
.venv/bin/alembic upgrade head
id prisma >/dev/null 2>&1 && chown -R prisma:prisma $RemoteDir || true
[ -f .env ] && chmod 600 .env || true
# Yangi MINDS_* sozlamalari .env da yo'q bo'lsa, default qiymatlar bilan qo'shamiz
grep -q '^MINDS_API_URL=' .env 2>/dev/null || {
  echo '' >> .env
  echo '# minds.abdulvahob-blog.uz to'\''lov/obuna backend (deploy.ps1 tomonidan qo'\''shildi)' >> .env
  echo 'MINDS_API_URL=https://minds.abdulvahob-blog.uz' >> .env
  echo 'MINDS_USERNAME=' >> .env
  echo 'MINDS_PASSWORD=' >> .env
  echo 'OGOHLANTIRISH: .env ga MINDS_USERNAME va MINDS_PASSWORD qiymatlarini qo'\''shing!'
}
systemctl restart prisma-api prisma-bot || echo 'OGOHLANTIRISH: servislar hali sozlanmagan (SERVER_SETUP.md ga qarang)'
rm -f /tmp/prisma-deploy.tar.gz
echo 'Server tomonida deploy tugadi.'
"@

Write-Host "5/5  Tayyor! Deploy muvaffaqiyatli yakunlandi." -ForegroundColor Green
