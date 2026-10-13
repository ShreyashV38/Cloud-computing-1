#!/bin/bash
# ═══════════════════════════════════════════════════════════════
#  Auto Deploy — Ecommerce Microservices to GCP VMs
#  Run this from Google Cloud Shell!
#  Usage: bash auto-deploy.sh
# ═══════════════════════════════════════════════════════════════

set -e

# ─── Configuration ────────────────────────────────────────────
ZONE="us-central1-a"
REPO="https://github.com/ShreyashV38/Cloud-computing-1.git"
BRANCH="main"
PROJECT_DIR="Cloud-computing-1"

# VM IPs (from GCP Console)
PRODUCT_VM_IP="10.128.0.2"
SEARCH_VM_IP="10.128.0.3"
CART_VM_IP="10.128.0.4"
ORDER_VM_IP="10.128.0.5"
PAYMENT_VM_IP="10.128.0.6"
REVIEW_VM_IP="10.128.0.7"
USER_VM_IP="10.128.0.8"
GATEWAY_EXTERNAL_IP="136.71.92.173"

# Service VMs and their deploy directories
declare -A SERVICE_VMS
SERVICE_VMS=(
  ["product-vm"]="product"
  ["search-vm"]="search"
  ["cart-vm"]="cart"
  ["order-vm"]="order"
  ["payment-vm"]="payment"
  ["review-vm"]="review"
  ["user-vm"]="user"
)

# ─── Colors for output ───────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ─── Helper Functions ─────────────────────────────────────────
log_header() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
}

log_step() {
  echo -e "${BLUE}  ▸ $1${NC}"
}

log_success() {
  echo -e "${GREEN}  ✔ $1${NC}"
}

log_warn() {
  echo -e "${YELLOW}  ⚠ $1${NC}"
}

log_error() {
  echo -e "${RED}  ✘ $1${NC}"
}

# SSH into a VM and run commands
run_on_vm() {
  local vm_name=$1
  shift
  local commands="$@"
  
  gcloud compute ssh "$vm_name" \
    --zone="$ZONE" \
    --command="$commands" \
    --quiet \
    -- -o StrictHostKeyChecking=no -o ConnectTimeout=30
}

# ─── Step 1: Setup Docker on all VMs (parallel) ──────────────
setup_docker_on_vm() {
  local vm_name=$1
  log_step "Setting up Docker on ${vm_name}..."
  
  run_on_vm "$vm_name" "
    # Check if Docker is already installed
    if command -v docker &> /dev/null && docker --version &> /dev/null; then
      echo 'Docker already installed on ${vm_name}'
    else
      sudo apt-get update -y
      sudo apt-get install -y docker.io docker-compose-v2 git
      sudo systemctl start docker
      sudo systemctl enable docker
      sudo usermod -aG docker \$USER
      echo 'Docker installed on ${vm_name}'
    fi
  "
  
  if [ $? -eq 0 ]; then
    log_success "Docker ready on ${vm_name}"
  else
    log_error "Failed to setup Docker on ${vm_name}"
    return 1
  fi
}

# ─── Step 2: Clone repo and deploy a service VM ──────────────
deploy_service_vm() {
  local vm_name=$1
  local service_dir=$2
  
  log_step "Deploying ${service_dir} service on ${vm_name}..."
  
  run_on_vm "$vm_name" "
    # Use newgrp to get docker group access without re-login
    # Clone or update repo
    if [ -d '${PROJECT_DIR}' ]; then
      cd ${PROJECT_DIR}
      git fetch origin
      git reset --hard origin/${BRANCH}
      echo 'Repo updated on ${vm_name}'
    else
      git clone ${REPO}
      cd ${PROJECT_DIR}
      echo 'Repo cloned on ${vm_name}'
    fi
    
    # Deploy using docker compose
    cd deploy/${service_dir}
    sudo docker compose down 2>/dev/null || true
    sudo docker compose up --build -d
    
    echo ''
    echo '--- Container status on ${vm_name} ---'
    sudo docker compose ps
  "
  
  if [ $? -eq 0 ]; then
    log_success "${vm_name} deployed successfully"
  else
    log_error "Failed to deploy ${vm_name}"
    return 1
  fi
}

# ─── Step 3: Deploy gateway VM ────────────────────────────────
deploy_gateway_vm() {
  log_step "Deploying gateway + client on gateway-vm..."
  
  run_on_vm "gateway-vm" "
    # Clone or update repo
    if [ -d '${PROJECT_DIR}' ]; then
      cd ${PROJECT_DIR}
      git fetch origin
      git reset --hard origin/${BRANCH}
      echo 'Repo updated on gateway-vm'
    else
      git clone ${REPO}
      cd ${PROJECT_DIR}
      echo 'Repo cloned on gateway-vm'
    fi
    
    cd deploy/gateway
    
    # Auto-generate .env file with actual VM IPs
    cat > .env << 'ENVEOF'
PRODUCT_VM_IP=${PRODUCT_VM_IP}
SEARCH_VM_IP=${SEARCH_VM_IP}
CART_VM_IP=${CART_VM_IP}
ORDER_VM_IP=${ORDER_VM_IP}
PAYMENT_VM_IP=${PAYMENT_VM_IP}
REVIEW_VM_IP=${REVIEW_VM_IP}
USER_VM_IP=${USER_VM_IP}
GATEWAY_EXTERNAL_IP=${GATEWAY_EXTERNAL_IP}
ENVEOF
    
    echo '.env file created:'
    cat .env
    echo ''
    
    # Deploy
    sudo docker compose down 2>/dev/null || true
    sudo docker compose up --build -d
    
    echo ''
    echo '--- Container status on gateway-vm ---'
    sudo docker compose ps
  "
  
  if [ $? -eq 0 ]; then
    log_success "gateway-vm deployed successfully"
  else
    log_error "Failed to deploy gateway-vm"
    return 1
  fi
}

# ─── Step 4: Health check all services ────────────────────────
health_check() {
  local vm_name=$1
  local port=$2
  
  run_on_vm "$vm_name" "
    for i in 1 2 3 4 5; do
      if curl -sf http://localhost:${port}/health > /dev/null 2>&1; then
        echo 'HEALTHY'
        exit 0
      fi
      sleep 5
    done
    echo 'UNHEALTHY'
    exit 1
  "
}

# ═══════════════════════════════════════════════════════════════
#  MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Ecom Microservices — Automated GCP Deployment      ║${NC}"
echo -e "${GREEN}║   8 VMs • 7 Services + Gateway + Client              ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Repo:     ${CYAN}${REPO}${NC}"
echo -e "  Branch:   ${CYAN}${BRANCH}${NC}"
echo -e "  Zone:     ${CYAN}${ZONE}${NC}"
echo -e "  Gateway:  ${CYAN}http://${GATEWAY_EXTERNAL_IP}:3000${NC}"
echo ""

# ── Phase 1: Install Docker on ALL VMs ────────────────────────
log_header "Phase 1/4 — Installing Docker on all VMs"

ALL_VMS=("product-vm" "search-vm" "cart-vm" "order-vm" "payment-vm" "review-vm" "user-vm" "gateway-vm")

for vm in "${ALL_VMS[@]}"; do
  setup_docker_on_vm "$vm"
done

log_success "Docker installed on all VMs"

# ── Phase 2: Deploy 7 microservice VMs ────────────────────────
log_header "Phase 2/4 — Deploying 7 microservice VMs"

for vm in "${!SERVICE_VMS[@]}"; do
  deploy_service_vm "$vm" "${SERVICE_VMS[$vm]}"
done

log_success "All 7 microservices deployed"

# ── Phase 3: Wait for services, then deploy gateway ──────────
log_header "Phase 3/4 — Deploying Gateway + Client VM"

echo -e "${YELLOW}  Waiting 30s for microservices to fully start...${NC}"
sleep 30

deploy_gateway_vm

# ── Phase 4: Health checks ────────────────────────────────────
log_header "Phase 4/4 — Running Health Checks"

echo -e "${YELLOW}  Waiting 60s for gateway and client to build and start...${NC}"
sleep 60

declare -A HEALTH_PORTS
HEALTH_PORTS=(
  ["product-vm"]="4001"
  ["search-vm"]="4002"
  ["cart-vm"]="4003"
  ["order-vm"]="4004"
  ["payment-vm"]="4005"
  ["review-vm"]="4006"
  ["user-vm"]="4008"
  ["gateway-vm"]="4000"
)

FAILED=0
for vm in "${!HEALTH_PORTS[@]}"; do
  port="${HEALTH_PORTS[$vm]}"
  log_step "Checking ${vm} (:${port})..."
  if health_check "$vm" "$port"; then
    log_success "${vm} is healthy ✓"
  else
    log_warn "${vm} health check failed (may still be starting)"
    FAILED=$((FAILED + 1))
  fi
done

# ── Final Summary ─────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DEPLOYMENT COMPLETE! 🚀${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Website:    ${CYAN}http://${GATEWAY_EXTERNAL_IP}:3000${NC}"
echo -e "  🔗 API Health: ${CYAN}http://${GATEWAY_EXTERNAL_IP}:4000/health${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
  echo -e "${YELLOW}  ⚠ ${FAILED} service(s) may still be starting up.${NC}"
  echo -e "${YELLOW}    Run health checks again in a minute:${NC}"
  echo -e "${YELLOW}    curl http://${GATEWAY_EXTERNAL_IP}:4000/health${NC}"
fi

echo ""
echo -e "  To check logs on any VM:"
echo -e "  ${CYAN}gcloud compute ssh <vm-name> --zone=${ZONE} --command='cd ${PROJECT_DIR}/deploy/<service> && sudo docker compose logs'${NC}"
echo ""
