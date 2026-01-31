# Simple AWS Development Configuration

A streamlined, cost-effective AWS setup for developing and testing the AI-powered medical research platform using a single EC2 instance.

*"Keep it simple, keep it running, keep it affordable."*

## 🎯 Development Architecture Overview

This configuration runs both the SvelteKit frontend and FastAPI backend on a single EC2 instance, perfect for development, testing, and small-scale demonstrations.

**Monthly Cost: ~$30-50**

---

## 🖥️ Core Infrastructure

### **Single EC2 Instance Setup**

#### **Instance Configuration**
```yaml
Instance Type: t3.medium
  CPU: 2 vCPUs
  Memory: 4GB RAM
  Storage: 20GB GP3 SSD
  Network: Enhanced networking enabled
  
Operating System: Ubuntu 22.04 LTS
Region: us-east-1 (Virginia - cheapest)
Availability Zone: us-east-1a

Security Group: dev-web-server
  Inbound Rules:
    - SSH (22): Your IP address only
    - HTTP (80): 0.0.0.0/0
    - HTTPS (443): 0.0.0.0/0
    - Custom (3000): 0.0.0.0/0 (SvelteKit dev server)
    - Custom (8000): 0.0.0.0/0 (FastAPI backend)
  
  Outbound Rules:
    - All traffic: 0.0.0.0/0 (for package updates, API calls)

Key Pair: Create new key pair for SSH access
```

#### **Storage Configuration**
```yaml
Root Volume:
  Type: GP3 SSD
  Size: 20GB
  IOPS: 3000
  Throughput: 125 MB/s
  Encrypted: Yes (default KMS key)

Additional Storage (Optional):
  Data Volume: 10GB GP3 for database files
  Mount Point: /var/lib/postgresql
```

### **Database Setup (On-Instance PostgreSQL)**

#### **PostgreSQL Configuration**
```yaml
Installation: PostgreSQL 14
Database Name: prime_time_db
User: prime_time_user
Password: Generated strong password
Port: 5432 (localhost only)

Configuration:
  Max Connections: 20
  Shared Buffers: 128MB
  Work Memory: 4MB
  Maintenance Work Memory: 64MB
  
Extensions:
  - pg_stat_statements (query monitoring)
  - pgcrypto (password hashing)
  
Backup Strategy:
  Daily dump to S3 bucket
  Retention: 7 days
  Automated via cron job
```

### **Application Stack**

#### **Backend (FastAPI)**
```yaml
Runtime: Python 3.11
Process Manager: systemd service
Port: 8000
Workers: 2 (unicorn workers)
Environment: .env file with secrets

Service Configuration:
  Service Name: prime-time-api
  Auto-start: Enabled
  Restart Policy: Always
  Log Location: /var/log/prime-time/api.log
  
Dependencies:
  - PostgreSQL
  - Redis (optional, for caching)
  - Python packages from requirements.txt
```

#### **Frontend (SvelteKit)**
```yaml
Runtime: Node.js 18 LTS
Build: npm run build
Serve: Static files via Nginx
Port: 80/443 (via Nginx proxy)

Development Mode:
  Port: 3000
  Hot Reload: Enabled
  Process: npm run dev (via screen/tmux)
```

#### **Web Server (Nginx)**
```yaml
Configuration:
  Frontend: Serve built SvelteKit static files
  API Proxy: Reverse proxy to FastAPI (port 8000)
  SSL: Let's Encrypt certificates (free)
  
Virtual Hosts:
  - Default: Frontend (SvelteKit)
  - /api/: Proxy to FastAPI backend
  
Caching:
  Static Assets: 1 year cache
  API Responses: 5 minutes cache (configurable)
```

---

## 🛠️ Setup Instructions

### **1. Launch EC2 Instance**

#### **Using AWS Console**
```bash
# 1. Go to EC2 Dashboard
# 2. Click "Launch Instance"
# 3. Choose Ubuntu 22.04 LTS (Free Tier Eligible)
# 4. Select t3.medium instance type
# 5. Create new key pair or use existing
# 6. Configure security group as specified above
# 7. Add 20GB GP3 storage
# 8. Launch instance
```

#### **Using AWS CLI**
```bash
# Create security group
aws ec2 create-security-group \
    --group-name dev-web-server \
    --description "Development web server security group"

# Add inbound rules
aws ec2 authorize-security-group-ingress \
    --group-name dev-web-server \
    --protocol tcp --port 22 --cidr YOUR_IP/32

aws ec2 authorize-security-group-ingress \
    --group-name dev-web-server \
    --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name dev-web-server \
    --protocol tcp --port 443 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name dev-web-server \
    --protocol tcp --port 3000 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-name dev-web-server \
    --protocol tcp --port 8000 --cidr 0.0.0.0/0

# Launch instance
aws ec2 run-instances \
    --image-id ami-0c02fb55956c7d316 \
    --count 1 \
    --instance-type t3.medium \
    --key-name YOUR_KEY_PAIR \
    --security-groups dev-web-server \
    --block-device-mappings DeviceName=/dev/sda1,Ebs='{VolumeSize=20,VolumeType=gp3,Encrypted=true}'
```

### **2. Initial Server Setup**

#### **Connect to Instance**
```bash
# SSH to your instance
ssh -i your-key.pem ubuntu@YOUR_INSTANCE_IP

# Update system
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git htop tree unzip nginx certbot python3-certbot-nginx
```

#### **Install Development Tools**
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python 3.11 and pip
sudo apt install -y python3.11 python3.11-pip python3.11-venv

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis (optional, for caching)
sudo apt install -y redis-server
```

### **3. Database Setup**

#### **Configure PostgreSQL**
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE prime_time_db;
CREATE USER prime_time_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE prime_time_db TO prime_time_user;
ALTER USER prime_time_user CREATEDB;
\q

# Configure PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
# Uncomment and modify:
# listen_addresses = 'localhost'
# max_connections = 20
# shared_buffers = 128MB

sudo systemctl restart postgresql
```

### **4. Application Deployment**

#### **Clone and Setup Backend**
```bash
# Create application directory
sudo mkdir -p /opt/prime-time
sudo chown ubuntu:ubuntu /opt/prime-time
cd /opt/prime-time

# Clone repository
git clone https://github.com/MaiaMarin/AI-for-Scientific-Articles-Analysis.git
cd AI-for-Scientific-Articles-Analysis

# Setup Python virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cat > .env << EOF
DATABASE_URL=postgresql://prime_time_user:your_secure_password@localhost/prime_time_db
DEBUG=False
SECRET_KEY=your_secret_key_here
PUBMED_EMAIL=your_email@domain.com
EOF

# Initialize database
python src/main.py --init-db
```

#### **Setup Frontend**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# The build output will be in frontend/build/
```

### **5. Configure Web Server**

#### **Setup Nginx**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/prime-time

# Add configuration:
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;
    
    # Frontend - serve static files
    location / {
        root /opt/prime-time/AI-for-Scientific-Articles-Analysis/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/prime-time /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Start Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx
```

### **6. Setup System Services**

#### **Create Backend Service**
```bash
# Create systemd service file
sudo nano /etc/systemd/system/prime-time-api.service

# Add service configuration:
[Unit]
Description=Prime Time API Service
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/prime-time/AI-for-Scientific-Articles-Analysis
Environment=PATH=/opt/prime-time/AI-for-Scientific-Articles-Analysis/venv/bin
ExecStart=/opt/prime-time/AI-for-Scientific-Articles-Analysis/venv/bin/python -m uvicorn src.main_api:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable prime-time-api
sudo systemctl start prime-time-api

# Check status
sudo systemctl status prime-time-api
```

#### **Setup SSL Certificate (Optional)**
```bash
# Install SSL certificate using Let's Encrypt
sudo certbot --nginx -d YOUR_DOMAIN

# Auto-renewal is handled by systemd timer
sudo systemctl status certbot.timer
```

---

## 📊 Monitoring & Maintenance

### **Basic Monitoring**

#### **System Monitoring**
```bash
# Install monitoring tools
sudo apt install -y htop iotop netstat-nat

# Check system resources
htop                    # CPU and memory usage
df -h                   # Disk usage
free -m                 # Memory usage
sudo netstat -tlnp      # Network connections

# Check application logs
sudo journalctl -u prime-time-api -f    # Backend logs
sudo tail -f /var/log/nginx/access.log  # Web server logs
```

#### **Database Monitoring**
```bash
# Connect to PostgreSQL
sudo -u postgres psql prime_time_db

# Check database size
SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database;

# Check active connections
SELECT * FROM pg_stat_activity WHERE datname = 'prime_time_db';

# Check slow queries (if pg_stat_statements is enabled)
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

### **Backup Strategy**

#### **Database Backup**
```bash
# Create backup script
nano /home/ubuntu/backup-db.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
mkdir -p $BACKUP_DIR

# Create database dump
sudo -u postgres pg_dump prime_time_db > $BACKUP_DIR/prime_time_db_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "prime_time_db_*.sql" -mtime +7 -delete

echo "Backup completed: prime_time_db_$DATE.sql"

# Make executable
chmod +x /home/ubuntu/backup-db.sh

# Setup daily backup via cron
crontab -e
# Add line:
0 2 * * * /home/ubuntu/backup-db.sh
```

#### **Code Backup**
```bash
# Setup automatic git pull for updates
nano /home/ubuntu/update-app.sh

#!/bin/bash
cd /opt/prime-time/AI-for-Scientific-Articles-Analysis

# Pull latest changes
git pull origin main

# Update Python dependencies
source venv/bin/activate
pip install -r requirements.txt

# Rebuild frontend
cd frontend
npm install
npm run build

# Restart services
sudo systemctl restart prime-time-api
sudo systemctl reload nginx

echo "Application updated successfully"

# Make executable
chmod +x /home/ubuntu/update-app.sh
```

### **Security Considerations**

#### **Basic Security Setup**
```bash
# Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Disable root login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
# Set: PasswordAuthentication no

sudo systemctl restart ssh

# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

#### **Regular Maintenance**
```bash
# Weekly maintenance script
nano /home/ubuntu/maintenance.sh

#!/bin/bash
echo "Starting weekly maintenance..."

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up old packages
sudo apt autoremove -y
sudo apt autoclean

# Check disk space
df -h

# Restart services if needed
sudo systemctl restart prime-time-api

echo "Maintenance completed"

# Setup weekly maintenance
crontab -e
# Add line:
0 3 * * 0 /home/ubuntu/maintenance.sh
```

---

## 💰 Cost Breakdown

### **Monthly AWS Costs**

```yaml
EC2 Instance (t3.medium):
  Compute: ~$30/month (730 hours)
  Storage (20GB GP3): ~$2/month
  Data Transfer: ~$1-5/month (first 1GB free)

Total Monthly Cost: ~$33-37

Annual Cost: ~$400-450

Cost Savings vs Production:
  Production AWS setup: $1,125-1,897/month
  Development setup: $33-37/month
  Savings: 97% reduction in costs
```

### **Optional Add-ons**

```yaml
Domain Name: ~$12/year (.com domain)
Elastic IP: ~$3.65/month (if instance is stopped frequently)
Additional Storage: ~$0.10/GB/month for GP3
Load Balancer: ~$16/month (if scaling to multiple instances)

S3 Backup Bucket: ~$1-5/month (for database backups)
CloudWatch Basic: Free tier (10 custom metrics)
```

---

## 🚀 Scaling Options

### **Vertical Scaling (Upgrade Instance)**

```yaml
Current: t3.medium (2 vCPU, 4GB RAM) - $30/month
Upgrade Options:
  t3.large (2 vCPU, 8GB RAM) - $60/month
  t3.xlarge (4 vCPU, 16GB RAM) - $120/month
  c5.large (2 vCPU, 4GB RAM, optimized) - $62/month
  c5.xlarge (4 vCPU, 8GB RAM, optimized) - $123/month
```

### **Horizontal Scaling (Multiple Instances)**

```yaml
When to Scale Out:
  - CPU consistently > 80%
  - Memory consistently > 85%
  - Response times > 2 seconds
  - User base > 100 concurrent users

Scaling Approach:
  1. Add Application Load Balancer (~$16/month)
  2. Launch additional EC2 instances
  3. Use shared RDS database (~$25/month for db.t3.micro)
  4. Implement Redis cluster for sessions
  
Estimated Cost for 2 instances + ALB + RDS: ~$125/month
```

### **Migration to Managed Services**

```yaml
When to Migrate:
  - Team size grows
  - Need high availability
  - Compliance requirements
  - Management overhead too high

Migration Path:
  Database: EC2 PostgreSQL → RDS PostgreSQL
  Backend: EC2 → App Runner or ECS Fargate
  Frontend: Nginx → S3 + CloudFront
  
Estimated Cost After Migration: ~$200-400/month
```

---

## 🔧 Development Workflow

### **Local Development**

```bash
# For local development, developers can:
1. Clone repository locally
2. Run backend: python src/main_api.py
3. Run frontend: npm run dev
4. Use local PostgreSQL or Docker
5. Push changes to Git
6. Deploy to EC2 for testing
```

### **Deployment Process**

```bash
# Simple deployment workflow:
1. SSH to EC2 instance
2. Run update script: ./update-app.sh
3. Test functionality
4. Monitor logs for issues

# Advanced: Setup CI/CD with GitHub Actions
# (Can deploy directly to EC2 on push to main branch)
```

### **Development Features**

```yaml
Advantages:
  - Full control over environment
  - Easy debugging and testing
  - Cost-effective for development
  - Simple architecture to understand
  - Fast iteration cycles

Limitations:
  - Single point of failure
  - Manual scaling required
  - Basic monitoring only
  - No automatic backups to cloud
  - Limited to single availability zone
```

---

## 📝 Quick Start Commands

### **Essential Commands**

```bash
# Check application status
sudo systemctl status prime-time-api
sudo systemctl status nginx
sudo systemctl status postgresql

# View logs
sudo journalctl -u prime-time-api -f
sudo tail -f /var/log/nginx/error.log

# Restart services
sudo systemctl restart prime-time-api
sudo systemctl reload nginx

# Database access
sudo -u postgres psql prime_time_db

# Update application
cd /opt/prime-time/AI-for-Scientific-Articles-Analysis
git pull
./update-app.sh

# System monitoring
htop
df -h
free -m
```

### **Troubleshooting**

```bash
# Common issues and solutions:

# Backend not starting:
sudo journalctl -u prime-time-api --since "1 hour ago"
# Check database connection in .env file

# Frontend not loading:
sudo nginx -t
sudo systemctl status nginx
# Check if build directory exists

# Database connection issues:
sudo systemctl status postgresql
sudo -u postgres psql -c "SELECT version();"
# Verify credentials in .env file

# High resource usage:
htop
sudo iotop
# Consider upgrading instance type

# SSL certificate issues:
sudo certbot certificates
sudo certbot renew --dry-run
```

---

## 🎯 Summary

This simple AWS development configuration provides:

✅ **Cost-Effective**: ~$35/month vs $1,000+/month for production setup  
✅ **Full-Featured**: Runs complete application stack  
✅ **Easy Setup**: Single instance, straightforward configuration  
✅ **Scalable**: Clear path to upgrade when needed  
✅ **Secure**: Basic security measures implemented  
✅ **Maintainable**: Simple monitoring and backup procedures  

**Perfect for:**
- Development and testing
- Small team collaboration
- Proof of concept demonstrations
- Learning AWS fundamentals
- Budget-conscious projects

**Next Steps:**
1. Launch EC2 instance following the setup guide
2. Deploy your application
3. Test all functionality
4. Monitor performance and costs
5. Scale up when requirements grow

*"Simple, effective, and affordable - the perfect development environment."*
