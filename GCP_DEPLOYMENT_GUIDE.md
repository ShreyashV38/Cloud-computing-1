# GCP Deployment Guide — Ecommerce Microservices

## Architecture Overview

```
                    Internet
                       │
              ┌────────▼────────┐
              │   gateway-vm    │  ← External IP (only VM accessible from internet)
              │  Gateway :4000  │
              │  Client  :3000  │
              └────────┬────────┘
                       │ (Internal Network)
        ┌──────┬──────┬┴──────┬───────┬───────┬───────┐
        ▼      ▼      ▼      ▼       ▼       ▼       ▼
   ┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐┌────────┐
   │product ││search  ││cart    ││order   ││payment ││review  ││user    │
   │-vm     ││-vm     ││-vm    ││-vm     ││-vm     ││-vm     ││-vm     │
   │:4001   ││:4002   ││:4003  ││:4004   ││:4005   ││:4006   ││:4008   │
   │+own DB ││+own DB ││+own DB││+own DB ││+own DB ││+own DB ││+own DB │
   └────────┘└────────┘└────────┘└────────┘└────────┘└────────┘└────────┘
   (Internal only — no external IP)
```

**8 VMs total:**
- 7 microservice VMs (internal only, each with its own PostgreSQL mini-database)
- 1 gateway VM (external IP — runs API gateway + frontend)

---

## Step 1: Create a GCP Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name: `ecom-microservices` → **Create**
4. Make sure this project is selected in the dropdown

---

## Step 2: Enable Compute Engine API

1. Go to **Navigation Menu (☰)** → **APIs & Services** → **Library**
2. Search for **Compute Engine API**
3. Click **Enable** (if not already enabled)
4. Wait for it to initialize (~1-2 minutes)

---

## Step 3: Push Your Code to GitHub

Before creating VMs, push the latest code (with the `deploy/` folder) to your GitHub repo:

```powershell
# On your local machine
cd C:\Users\shrey\OneDrive\Desktop\CloudComputing\ecom-site
git add .
git commit -m "Add per-VM docker-compose files for GCP deployment"
git push origin main
```

---

## Step 4: Create Firewall Rules

We need 2 firewall rules: one for internal communication, one for external access.

### 4a. Allow Internal Traffic Between VMs

1. Go to **Navigation Menu (☰)** → **VPC Network** → **Firewall**
2. Click **Create Firewall Rule**
3. Fill in:
   - **Name:** `allow-internal-microservices`
   - **Network:** `default`
   - **Direction:** Ingress
   - **Targets:** All instances in the network
   - **Source filter:** IPv4 ranges
   - **Source IPv4 ranges:** `10.128.0.0/20` (default GCP internal subnet)
   - **Protocols and ports:** Check **Specified protocols and ports** → **TCP** → `4000-4010,5432`
4. Click **Create**

### 4b. Allow External Access to Gateway VM Only

1. Click **Create Firewall Rule** again
2. Fill in:
   - **Name:** `allow-gateway-external`
   - **Network:** `default`
   - **Direction:** Ingress
   - **Targets:** Specified target tags
   - **Target tags:** `gateway-vm`
   - **Source filter:** IPv4 ranges
   - **Source IPv4 ranges:** `0.0.0.0/0`
   - **Protocols and ports:** Check **Specified protocols and ports** → **TCP** → `3000,4000`
3. Click **Create**

---

## Step 5: Create the 8 VM Instances

### Quick Overview

| VM Name      | Machine Type | External IP | Network Tag   | Service         |
|-------------|-------------|-------------|---------------|-----------------|
| product-vm  | e2-medium   | None        | —             | Product + DB    |
| search-vm   | e2-medium   | None        | —             | Search + DB     |
| cart-vm     | e2-medium   | None        | —             | Cart + DB       |
| order-vm    | e2-medium   | None        | —             | Order + DB      |
| payment-vm  | e2-medium   | None        | —             | Payment + DB    |
| review-vm   | e2-medium   | None        | —             | Review + DB     |
| user-vm     | e2-medium   | None        | —             | User + DB       |
| gateway-vm  | e2-medium   | Ephemeral   | `gateway-vm`  | Gateway + Client|

### 5a. Create Microservice VMs (repeat for each of the 7 services)

1. Go to **Navigation Menu (☰)** → **Compute Engine** → **VM instances**
2. Click **Create Instance**
3. Fill in:
   - **Name:** `product-vm` (change for each service)
   - **Region:** `us-central1` (or your preferred region — keep ALL VMs in the same region!)
   - **Zone:** `us-central1-a`
   - **Machine type:** `e2-medium` (2 vCPU, 4 GB RAM)
   - **Boot disk:** Click **Change** →
     - **OS:** Ubuntu
     - **Version:** Ubuntu 22.04 LTS
     - **Size:** 20 GB
   - **Firewall:** Leave unchecked (no HTTP/HTTPS)
   - **Advanced options** → **Networking**:
     - **Network interfaces** → Click the default interface →
     - **External IPv4 address:** Select **None** (internal only!)
4. Click **Create**

Repeat for: `search-vm`, `cart-vm`, `order-vm`, `payment-vm`, `review-vm`, `user-vm`

### 5b. Create Gateway VM (with external IP)

Same as above, but with these differences:
- **Name:** `gateway-vm`
- **External IPv4 address:** **Ephemeral** (this gives it a public IP)
- **Network tags:** `gateway-vm` (needed for firewall rule)
- **Firewall:** Check ✅ **Allow HTTP traffic** and ✅ **Allow HTTPS traffic**

---

## Step 6: Set Up Each VM

### 6a. SSH into Each VM

For VMs **with** external IP (gateway-vm):
- Click the **SSH** button next to the VM in the console

For VMs **without** external IP (service VMs):
- Use **SSH-in-browser** from the GCP Console (it connects through Google's IAP tunnel automatically)
- Or from Cloud Shell: `gcloud compute ssh product-vm --zone=us-central1-a`

### 6b. Run Setup Script on Each VM

SSH into a VM and run:

```bash
# Download and run the setup script
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-v2 git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# IMPORTANT: Log out and SSH back in for docker group to apply
exit
```

After SSH-ing back in:
```bash
# Verify Docker works (should NOT need sudo)
docker --version
```

### 6c. Clone the Repo on Each VM

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ecom-site
cd ecom-site
```

---

## Step 7: Deploy Services (One VM at a Time)

### 7a. Deploy Microservice VMs First

SSH into **each service VM** and run the corresponding commands:

**On product-vm:**
```bash
cd ecom-site/deploy/product
docker compose up --build -d
```

**On search-vm:**
```bash
cd ecom-site/deploy/search
docker compose up --build -d
```

**On cart-vm:**
```bash
cd ecom-site/deploy/cart
docker compose up --build -d
```

**On order-vm:**
```bash
cd ecom-site/deploy/order
docker compose up --build -d
```

**On payment-vm:**
```bash
cd ecom-site/deploy/payment
docker compose up --build -d
```

**On review-vm:**
```bash
cd ecom-site/deploy/review
docker compose up --build -d
```

**On user-vm:**
```bash
cd ecom-site/deploy/user
docker compose up --build -d
```

### 7b. Verify Each Service is Running

On each VM, run:
```bash
docker compose ps
docker compose logs
```

All containers should show **Up** status.

### 7c. Note Down Internal IPs

Go to **GCP Console** → **Compute Engine** → **VM instances**

Write down the **Internal IP** of each VM:
```
product-vm:  10.128.0.___
search-vm:   10.128.0.___
cart-vm:     10.128.0.___
order-vm:    10.128.0.___
payment-vm:  10.128.0.___
review-vm:   10.128.0.___
user-vm:     10.128.0.___
gateway-vm:  External IP = ___.___.___.___ 
```

### 7d. Deploy Gateway VM (Last)

SSH into **gateway-vm** and run:

```bash
cd ecom-site/deploy/gateway

# Create the .env file with actual IPs
cp .env.example .env
nano .env
```

Fill in the actual IPs you noted down:
```env
PRODUCT_VM_IP=10.128.0.2
SEARCH_VM_IP=10.128.0.3
CART_VM_IP=10.128.0.4
ORDER_VM_IP=10.128.0.5
PAYMENT_VM_IP=10.128.0.6
REVIEW_VM_IP=10.128.0.7
USER_VM_IP=10.128.0.8
GATEWAY_EXTERNAL_IP=34.56.78.90
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`), then:

```bash
docker compose up --build -d
```

---

## Step 8: Access Your Site! 🎉

Open your browser and go to:

```
http://<GATEWAY_EXTERNAL_IP>:3000
```

The API gateway health check:
```
http://<GATEWAY_EXTERNAL_IP>:4000/health
```

---

## Useful Commands

```bash
# Check running containers
docker compose ps

# View logs
docker compose logs

# View logs for a specific service
docker compose logs product-service

# Restart services
docker compose restart

# Stop everything
docker compose down

# Stop and delete volumes (data)
docker compose down -v

# Rebuild after code changes
git pull
docker compose up --build -d
```

---

## Troubleshooting

### "Cannot connect to service"
- Check firewall rules in GCP Console
- Verify the service VM is running: `docker compose ps`
- Check if the internal IP is correct in gateway's `.env`
- Test connectivity: `curl http://10.128.0.X:4001/health` (from gateway VM)

### "Build failed"
- Make sure you're in the right directory (`deploy/<service>/`)
- Check disk space: `df -h`
- Check Docker logs: `docker compose logs`

### "Permission denied" for Docker
- Run: `sudo usermod -aG docker $USER`
- Log out and SSH back in

---

## Cost Management ⚠️

These VMs cost money! When done:

```bash
# Option 1: Stop all VMs (keeps data, no compute charges)
# GCP Console → VM instances → Select all → Stop

# Option 2: Delete all VMs (no charges at all)
# GCP Console → VM instances → Select all → Delete
```

**Tip:** Stop VMs when not in use to save costs. You can start them again later.
