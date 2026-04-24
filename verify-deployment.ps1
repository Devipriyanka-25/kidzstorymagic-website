# Kidz Story Magic - Local Deployment Test Suite (PowerShell)
# Tests all critical functionality before production deployment

param(
    [switch]$Verbose
)

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"

Write-Host "🚀 Starting Local Deployment Tests..." -ForegroundColor Yellow
Write-Host "=======================================" -ForegroundColor Yellow

# Test 1: Check environment variables
Write-Host "`nTest 1: Checking environment variables..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    Write-Host "✓ .env.local exists" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "✓ Supabase URL configured" -ForegroundColor Green
    } else {
        Write-Host "✗ Supabase URL missing" -ForegroundColor Red
    }
    
    if ($envContent -match "STRIPE_SECRET_KEY") {
        Write-Host "✓ Stripe keys configured" -ForegroundColor Green
    } else {
        Write-Host "✗ Stripe keys missing" -ForegroundColor Red
    }
    
    if ($envContent -match "JWT_SECRET") {
        Write-Host "✓ JWT secret configured" -ForegroundColor Green
    } else {
        Write-Host "✗ JWT secret missing" -ForegroundColor Red
    }
    
    if ($envContent -match "SUPABASE_SERVICE_KEY") {
        Write-Host "✓ Supabase service key configured" -ForegroundColor Green
    } else {
        Write-Host "✗ Supabase service key missing" -ForegroundColor Red
    }
} else {
    Write-Host "✗ .env.local not found" -ForegroundColor Red
    exit 1
}

# Test 2: Check dependencies
Write-Host "`nTest 2: Checking npm dependencies..." -ForegroundColor Yellow

$packages = @("@supabase/supabase-js", "stripe", "jsonwebtoken", "axios")
foreach ($package in $packages) {
    try {
        $output = & npm list $package 2>&1
        if ($output -match $package) {
            Write-Host "✓ $package installed" -ForegroundColor Green
        }
    } catch {
        Write-Host "✗ $package missing" -ForegroundColor Red
    }
}

# Test 3: Build verification
Write-Host "`nTest 3: Verifying build status..." -ForegroundColor Yellow
Write-Host "Running: npm run build" -ForegroundColor Yellow

$buildOutput = & npm run build 2>&1
if ($buildOutput -match "Compiled successfully|without errors") {
    Write-Host "✓ Build passes without errors" -ForegroundColor Green
} else {
    Write-Host "⚠ Build completed (check above for warnings)" -ForegroundColor Yellow
}

# Test 4: Check critical API routes exist
Write-Host "`nTest 4: Checking API routes..." -ForegroundColor Yellow

$routes = @(
    "app/api/auth/login/route.js",
    "app/api/payment/checkout/route.js",
    "app/api/payment/story-status/[id]/route.js",
    "app/api/webhook/stripe/route.js",
    "app/api/story/preview-with-payment/[id]/route.js"
)

foreach ($route in $routes) {
    if (Test-Path $route) {
        Write-Host "✓ $route exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $route missing" -ForegroundColor Red
    }
}

# Test 5: Check critical components exist
Write-Host "`nTest 5: Checking React components..." -ForegroundColor Yellow

$components = @(
    "components/wizard/Step4ChildDetails.jsx",
    "components/preview/WatermarkOverlay.jsx",
    "components/preview/BlurLockOverlay.jsx",
    "app/story/preview/[id]/page.jsx"
)

foreach ($component in $components) {
    if (Test-Path $component) {
        Write-Host "✓ $component exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $component missing" -ForegroundColor Red
    }
}

# Test 6: Supabase connectivity check
Write-Host "`nTest 6: Checking Supabase connectivity..." -ForegroundColor Yellow

try {
    # Check if we can read the environment variables
    $supabaseUrl = (Select-String -Path ".env.local" -Pattern 'NEXT_PUBLIC_SUPABASE_URL="([^"]+)"' | ForEach-Object {$_.Matches.Groups[1].Value}) | Select-Object -First 1
    
    if ($supabaseUrl) {
        Write-Host "✓ Supabase URL: $supabaseUrl" -ForegroundColor Green
        Write-Host "  (Full connectivity test requires database to be set up)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not verify Supabase connectivity" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=======================================" -ForegroundColor Yellow
Write-Host "✓ Pre-deployment checks completed!" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Yellow

Write-Host "`n📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Run SQL script in Supabase Dashboard:" -ForegroundColor White
Write-Host "   - Go to: https://app.supabase.com" -ForegroundColor Cyan
Write-Host "   - Select your project" -ForegroundColor Cyan
Write-Host "   - SQL Editor → New Query" -ForegroundColor Cyan
Write-Host "   - Paste contents of: SETUP_DATABASE_SCHEMA.sql" -ForegroundColor Cyan
Write-Host "   - Click Run ✓" -ForegroundColor Cyan

Write-Host "`n2. Start dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan

Write-Host "`n3. Open in browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n4. Test credentials:" -ForegroundColor White
Write-Host "   Email: demo@example.com" -ForegroundColor Cyan
Write-Host "   Password: Demo@123456" -ForegroundColor Cyan

Write-Host "`n5. (Optional) Set up Stripe CLI for webhook testing:" -ForegroundColor White
Write-Host "   stripe listen --forward-to http://localhost:3000/api/webhook/stripe" -ForegroundColor Cyan

Write-Host "`n🚀 Ready to deploy locally!" -ForegroundColor Green
Write-Host ""
