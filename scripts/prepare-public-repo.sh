#!/usr/bin/env bash
# prepare-public-repo.sh — Creates a clean copy of Casino for public release.
#
# Usage:
#   ./scripts/prepare-public-repo.sh [output-dir]
#
# Defaults to /tmp/casino-public if no output dir is given.
# The output directory will contain a fresh git repo with a single initial commit.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="${1:-/tmp/casino-public}"

echo "==> Preparing public repo at $OUTPUT_DIR"

# Clean slate
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# rsync with exclusions
rsync -av \
  --exclude='.claude/' \
  --exclude='CLAUDE.md' \
  --exclude='AGENTS.md' \
  --exclude='packages/' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='.env.production' \
  --exclude='.vercel/' \
  --exclude='.next/' \
  --exclude='dist/' \
  --exclude='node_modules/' \
  --exclude='*.tgz' \
  --exclude='.DS_Store' \
  --exclude='*.tsbuildinfo' \
  --exclude='package-lock.json' \
  --exclude='.git/' \
  --exclude='next-env.d.ts' \
  "$REPO_ROOT/" "$OUTPUT_DIR/"

echo ""
echo "==> Running secret scan..."

FOUND=0
scan() {
  local pattern="$1"
  local label="$2"
  local matches
  matches=$(grep -r "$pattern" "$OUTPUT_DIR" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --include="*.json" --include="*.sh" --include="*.yml" --include="*.yaml" -l 2>/dev/null | grep -v 'prepare-public-repo\.sh' || true)
  if [ -n "$matches" ]; then
    echo "$matches"
    echo "  FOUND: $label"
    FOUND=1
  fi
}

scan "t_6fe54402be43" "Production tenant ID"
scan "dtn_" "Daytona API key"
scan "236604670302" "AWS account ID"
scan "E2OSR8WN48G0GD" "CloudFront distribution ID (casino)"
scan "E2AMKTEUZ2BMJI" "CloudFront distribution ID (SDK)"
scan "sk_live" "Stripe live secret key"
scan "sk_test" "Stripe test secret key"
scan "VERCEL_OIDC_TOKEN" "Vercel OIDC token reference"
scan "db5dc51e2c7f27a61548ceac5f99df92" "WalletConnect project ID"
scan "cmnou80yx00bw0cjssqzvh7ni" "Privy app ID"

if [ "$FOUND" -eq 1 ]; then
  echo ""
  echo "!!! SECRET SCAN FAILED — fix the issues above before pushing !!!"
  exit 1
fi

echo "  No secrets found."
echo ""

# Initialize fresh git repo
cd "$OUTPUT_DIR"
git init
git add -A
git commit -m "Initial open-source release

Casino is the reference frontend for the Open Inference Foundation.
MIT License. Built with Vite + React 19 + TypeScript + Tailwind CSS 4.

https://openinferencefoundation.org"

echo ""
echo "==> Done! Clean repo at: $OUTPUT_DIR"
echo "    $(git log --oneline -1)"
echo ""
echo "Next steps:"
echo "  cd $OUTPUT_DIR"
echo "  git remote add origin git@github.com:open-inference-foundation/casino.git"
echo "  git push -u origin main"
