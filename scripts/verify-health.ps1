# Verify backend health endpoint (local or production)
# Usage: .\scripts\verify-health.ps1 -BaseUrl "https://lendwise-api.onrender.com"

param(
    [string]$BaseUrl = "http://127.0.0.1:8000"
)

$healthUrl = "$BaseUrl.TrimEnd('/')/health"
Write-Host "Checking $healthUrl ..."

try {
    $response = Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 30
    if ($response.status -ne "ok") {
        Write-Error "Health check failed: status is '$($response.status)'"
        exit 1
    }
    Write-Host "OK — status: $($response.status)"
    Write-Host "  environment: $($response.environment)"
    Write-Host "  supabase_connected: $($response.supabase_connected)"
    Write-Host "  gemini_configured: $($response.gemini_configured)"
    exit 0
}
catch {
    Write-Error "Health check request failed: $_"
    exit 1
}
