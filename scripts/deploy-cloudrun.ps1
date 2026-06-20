# Build and deploy Verdant AI to Cloud Run with Gemini API key from Secret Manager.
# Requires: gcloud CLI, authenticated, and VITE_GEMINI_API_KEY in .env (first run only).

$ErrorActionPreference = "Stop"

$ProjectId = if ($env:GCP_PROJECT) { $env:GCP_PROJECT } else { "verdant-ai-500011" }
$Region = "us-central1"
$ServiceName = "verdant-ai-web"
$SecretName = "gemini-api-key"
$RepoName = "cloud-run-source-deploy"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")

Write-Host "Project: $ProjectId | Region: $Region | Service: $ServiceName"

gcloud services enable secretmanager.googleapis.com artifactregistry.googleapis.com run.googleapis.com cloudbuild.googleapis.com --project=$ProjectId --quiet

$secretExists = $false
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
gcloud secrets describe $SecretName --project=$ProjectId 2>$null | Out-Null
$ErrorActionPreference = $prevEap
if ($LASTEXITCODE -eq 0) {
  $secretExists = $true
  Write-Host "Secret '$SecretName' already exists."
} else {
  Write-Host "Secret '$SecretName' not found - creating from .env..."
}

if (-not $secretExists) {
  $envFile = Join-Path $Root ".env"
  if (-not (Test-Path $envFile)) {
    throw "Missing .env file. Copy .env.example to .env and set VITE_GEMINI_API_KEY."
  }

  $keyLine = Get-Content $envFile | Where-Object { $_ -match '^\s*VITE_GEMINI_API_KEY\s*=' } | Select-Object -First 1
  if (-not $keyLine) {
    throw "VITE_GEMINI_API_KEY not found in .env"
  }

  $key = ($keyLine -split '=', 2)[1].Trim().Trim('"').Trim("'")
  if (-not $key -or $key -eq "your_gemini_api_key_here") {
    throw "Set a real VITE_GEMINI_API_KEY in .env before deploying."
  }

  $key | gcloud secrets create $SecretName --data-file=- --project=$ProjectId --replication-policy=automatic
  if ($LASTEXITCODE -ne 0) { throw "Failed to create secret '$SecretName'." }
  Write-Host "Created secret '$SecretName'."
}

$projectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
$cloudBuildSa = "${projectNumber}@cloudbuild.gserviceaccount.com"
$computeSa = "${projectNumber}-compute@developer.gserviceaccount.com"

$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
foreach ($sa in @($cloudBuildSa, $computeSa)) {
  gcloud secrets add-iam-policy-binding $SecretName `
    --member="serviceAccount:$sa" `
    --role="roles/secretmanager.secretAccessor" `
    --project=$ProjectId --quiet 2>$null | Out-Null
}
$ErrorActionPreference = $prevEap

$repoExists = $false
$prevEap = $ErrorActionPreference
$ErrorActionPreference = "Continue"
gcloud artifacts repositories describe $RepoName --location=$Region --project=$ProjectId 2>$null | Out-Null
$ErrorActionPreference = $prevEap
if ($LASTEXITCODE -eq 0) {
  $repoExists = $true
}

if (-not $repoExists) {
  Write-Host "Creating Artifact Registry repo '$RepoName'..."
  gcloud artifacts repositories create $RepoName `
    --repository-format=docker `
    --location=$Region `
    --project=$ProjectId `
    --description="Verdant AI Cloud Run images"
}

Write-Host "Submitting Cloud Build..."
Push-Location $Root
gcloud builds submit --config cloudbuild.yaml --project=$ProjectId
if ($LASTEXITCODE -ne 0) { throw "Cloud Build failed." }
Pop-Location

Write-Host "Done. Sage should work at your Cloud Run URL."
