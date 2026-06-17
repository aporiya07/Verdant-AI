#!/usr/bin/env bash
# One-time GCP bootstrap for Verdant AI
# Run: bash infra/gcp/setup.sh
# Requires: gcloud CLI authenticated, PROJECT_ID env var set

set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="us-central1"
REGISTRY_REPO="verdant-ai"

echo "🌿 Bootstrapping Verdant AI on GCP project: $PROJECT_ID"

# Set project
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo "→ Enabling APIs..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  iamcredentials.googleapis.com \
  cloudbuild.googleapis.com

# Create Artifact Registry repository
echo "→ Creating Artifact Registry repo..."
gcloud artifacts repositories create "$REGISTRY_REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --description="Verdant AI Docker images" \
  2>/dev/null || echo "  (already exists)"

# Create secrets (fill values manually or via CI)
echo "→ Creating Secret Manager secrets (populate values separately)..."
for secret in GEMINI_API_KEY JWT_SECRET DATABASE_URL SUPABASE_URL SUPABASE_ANON_KEY; do
  gcloud secrets create "$secret" --replication-policy="automatic" 2>/dev/null \
    || echo "  $secret already exists"
done

# Create service accounts
echo "→ Creating service accounts..."
gcloud iam service-accounts create verdant-api-sa \
  --display-name="Verdant API Cloud Run SA" 2>/dev/null || true

gcloud iam service-accounts create verdant-deploy-sa \
  --display-name="Verdant CI Deploy SA" 2>/dev/null || true

# IAM bindings for deploy SA
DEPLOY_SA="verdant-deploy-sa@${PROJECT_ID}.iam.gserviceaccount.com"
for role in roles/run.admin roles/artifactregistry.writer roles/secretmanager.secretAccessor iam.serviceAccountTokenCreator; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:${DEPLOY_SA}" \
    --role="$role" --quiet
done

# IAM for API SA to read secrets
API_SA="verdant-api-sa@${PROJECT_ID}.iam.gserviceaccount.com"
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${API_SA}" \
  --role="roles/secretmanager.secretAccessor" --quiet

echo ""
echo "✅ Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. Populate secrets: gcloud secrets versions add GEMINI_API_KEY --data-file=<(echo -n 'your-key')"
echo "  2. Set up Workload Identity Federation for GitHub Actions (see docs/decisions/)"
echo "  3. Add secrets to GitHub repo settings"
echo "  4. Push to main to trigger deploy.yml"
