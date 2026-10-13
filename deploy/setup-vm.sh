#!/bin/bash
# ─── Setup Script for GCP VM ─────────────────────────────
# Run this on each VM after SSH-ing in:
#   chmod +x setup-vm.sh && ./setup-vm.sh
# Then log out and SSH back in for group changes to take effect.

set -e

echo "══════════════════════════════════════════════"
echo "  Installing Docker & Docker Compose..."
echo "══════════════════════════════════════════════"

# Update packages
sudo apt-get update -y

# Install Docker
sudo apt-get install -y docker.io docker-compose-v2 git

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (no sudo needed for docker commands)
sudo usermod -aG docker $USER

echo ""
echo "══════════════════════════════════════════════"
echo "  ✅ Docker installed successfully!"
echo "  ⚠️  Log out and SSH back in, then run:"
echo ""
echo "  git clone <YOUR_REPO_URL> ecom-site"
echo "  cd ecom-site/deploy/<service-folder>"
echo "  docker compose up --build -d"
echo "══════════════════════════════════════════════"
