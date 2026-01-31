# Simple AWS Serverless Config

**Goal:** Run SvelteKit frontend + FastAPI backend + **OpenAlex JSONL streaming** (no DB) for dev/testing in Europe.  
**Cost:** ~€15-30/month (~$17-33/month)

---

## Architecture
- **ECS Fargate:** Serverless containers (FastAPI backend, auto-scale 0-2)
- **S3:** OpenAlex JSONL.gz files (~1TB, lifecycle to Glacier)
- **CloudFront + S3:** SvelteKit frontend (static hosting)
- **VPC Endpoints:** S3/ECR/Logs access (no NAT costs)
- **EventBridge:** Monthly OpenAlex sync (scheduled task)
- **Query Method:** S3 Select + streaming (no database)v Config – Short Version

**Goal:** Run SvelteKit frontend + FastAPI backend on **one EC2 instance** for dev/testing.  
**Cost:** ~$35/month

---

## Architecture
- **Instance:** EC2 t3.medium (2 vCPU, 4GB RAM, 20GB SSD, Ubuntu 22.04, us-east-1)
- **Security Group:** Allow SSH (your IP), HTTP/HTTPS, ports 3000 & 8000
- **Storage:** 20GB GP3 (root), optional 10GB for DB
- **Database:** PostgreSQL 14 (local, localhost only)
- **Frontend:** SvelteKit built with Node.js 18, served via Nginx
- **Backend:** FastAPI (Python 3.11, systemd service)
- **Web Server:** Nginx reverse proxy, free SSL via Let’s Encrypt

---

## Quick Commands

### Startup
```bash
# Scale API up
aws ecs update-service --cluster prime-time --service api --desired-count 1 --region eu-central-1

# Enable monthly sync
aws events enable-rule --name openalex-monthly --region eu-central-1
```

### Shutdown (cost-save)
```bash
# Scale API to zero
aws ecs update-service --cluster prime-time --service api --desired-count 0 --region eu-central-1

# Disable sync
aws events disable-rule --name openalex-monthly --region eu-central-1
```

### Manual sync (if needed)
```bash
aws ecs run-task --cluster prime-time --task-definition openalex-sync --launch-type FARGATE --region eu-central-1
```

---

## Romanian Hosting
- **Region:** eu-central-1 (Frankfurt) - optimal for Romania
- **S3 Bucket:** `prime-time-openalex-euc1` (encrypted, lifecycle)
- **Time Zone:** Europe/Bucharest (configured in containers)
- **OpenAlex Query:** Stream JSONL.gz with S3 Select (serverless)
- **GDPR:** EU data residency, no local storage

---

## S3 Setup
```bash
# Create bucket
aws s3 mb s3://prime-time-openalex-euc1 --region eu-central-1

# Enable encryption & lifecycle
aws s3api put-bucket-encryption \
    --bucket prime-time-openalex-euc1 \
    --server-side-encryption-configuration '{
        "Rules": [{
            "ApplyServerSideEncryptionByDefault": {
                "SSEAlgorithm": "aws:kms"
            }
        }]
    }' --region eu-central-1

# Lifecycle: keep latest, archive old to Glacier
aws s3api put-bucket-lifecycle-configuration \
    --bucket prime-time-openalex-euc1 \
    --lifecycle-configuration '{
        "Rules": [{
            "ID": "openalex-lifecycle",
            "Status": "Enabled",
            "Filter": {"Prefix": "openalex/snapshots/"},
            "NoncurrentVersionTransitions": [{
                "NoncurrentDays": 30,
                "StorageClass": "GLACIER_IR"
            }]
        }]
    }' --region eu-central-1
```

---

## FastAPI S3 Query (Example)
```python
import boto3
s3 = boto3.client("s3")

# Query OpenAlex works with S3 Select
resp = s3.select_object_content(
    Bucket="prime-time-openalex-euc1",
    Key="openalex/snapshots/2025-08/works.jsonl.gz",
    ExpressionType="SQL",
    Expression="SELECT * FROM S3Object s WHERE s.publication_year >= 2023",
    InputSerialization={"JSON": {"Type": "LINES"}, "CompressionType": "GZIP"},
    OutputSerialization={"JSON": {}}
)

# Stream results to client
for event in resp['Payload']:
    if 'Records' in event:
        yield event['Records']['Payload']
```

---

## Pricing (EUR/month)
- **ECS Fargate:** €5-15 (when running)
- **S3 Storage:** €10-15 (~1TB OpenAlex)
- **Data Transfer:** €2-5
- **CloudFront:** €1-3
- **Total:** €18-38 (vs €115 with EC2+DB)

**Cost Benefits:**
- 70% cheaper than EC2 approach
- Pay only when services run
- Auto-scales to zero
- No database maintenance

---

## Summary
✅ **Serverless** OpenAlex streaming for Romania  
✅ **70% cheaper** than EC2 approach (€18-38 vs €115)  
✅ **Auto-scale to zero** when not in use  
✅ **S3 Select queries** - fast and cost-effective  
✅ **GDPR compliant** - EU data residency  
✅ **No database management** - query JSONL directly  

**Trade-offs:**
- S3 Select learning curve vs SQL
- Cold start delays (~30s)
- Limited complex joins
- Monthly sync vs real-time

*"Lean serverless research platform for România."*
