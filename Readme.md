# Notes API Project

A production-ready REST API for managing notes, built with Node.js, Express, and PostgreSQL. Features automated CI/CD pipeline, containerized deployment, and infrastructure-as-code using Terraform and AWS ECS Fargate.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Terraform Infrastructure](#terraform-infrastructure)
- [ECS Fargate Deployment](#ecs-fargate-deployment)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Troubleshooting](#troubleshooting)

---

## Overview

This project implements a complete DevOps workflow with:

- **Backend API**: Node.js/Express REST API with JWT authentication
- **Database**: PostgreSQL for data persistence
- **Containerization**: Docker for consistent deployment
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Infrastructure**: Terraform for AWS resource provisioning
- **Hosting**: AWS ECS Fargate for serverless container management
- **Load Balancing**: Application Load Balancer for traffic distribution
- **Registry**: Amazon ECR for Docker image storage
- **Monitoring**: CloudWatch logs and Container Insights

---

## Prerequisites

### Local Development

- Node.js 22+
- npm or yarn
- PostgreSQL 12+ (or Docker)
- Git

### AWS Deployment

- AWS Account with appropriate permissions
- AWS CLI configured
- Terraform 1.6.0+
- Docker (for building images)

### GitHub Configuration

- GitHub repository with Actions enabled
- GitHub repository variables and secrets configured

---

## Local Development

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Notes_api_Project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=notes_user
DB_PASSWORD=your_password
DB_NAME=notes_db
JWT_SECRET=your_jwt_secret_key
```

### 4. Set Up PostgreSQL Database

```bash
# Using Docker
docker run -d \
  --name postgres_notes \
  -e POSTGRES_USER=notes_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=notes_db \
  -p 5432:5432 \
  postgres:15-alpine

# Initialize database schema (run db.js)
node db.js
```

### 5. Run the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The API will be available at `http://localhost:3000`

### 6. Access API Documentation

Visit `http://localhost:3000/api-docs` to view the Swagger documentation.

---

## GitHub Actions CI/CD

### Workflow Overview

The CI/CD pipeline (`.github/workflows/ci-cd.yml`) automates the entire deployment process:

1. **Code Quality Checks**
   - Node.js syntax validation
   - YAML configuration validation
   - Dependency installation

2. **Infrastructure Validation**
   - Terraform format checking
   - Terraform configuration validation
   - AWS credential verification

3. **Docker Image Build & Push**
   - Builds Docker image from Dockerfile
   - Authenticates with Amazon ECR
   - Pushes to ECR registry
   - Tags with commit SHA for version tracking

4. **Infrastructure Deployment**
   - Provisions AWS resources via Terraform
   - Updates ECS service with new image
   - Applies database environment variables
   - Maintains high availability during deployments

### Trigger Events

The workflow runs automatically on:

- **Push to main branch**: Complete CI/CD pipeline executes
- **Manual trigger**: Manually trigger via GitHub Actions UI (`workflow_dispatch`)

### Setting Up GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

```
AWS_ROLE_TO_ASSUME=arn:aws:iam::YOUR_ACCOUNT:role/GitHubActionsRole
DB_HOST=your-postgres-host.rds.amazonaws.com
DB_PORT=5432
DB_USER=notes_user
DB_PASSWORD=your_postgres_password
DB_NAME=notes_db
JWT_SECRET=your_secure_jwt_secret
```

### Setting Up GitHub Variables

Add this variable to your repository (Settings > Secrets and variables > Actions):

```
AWS_REGION=ap-south-1
```

(Optional - defaults to `ap-south-1`)

### Workflow Steps Explained

| Step | Purpose | Details |
|------|---------|---------|
| Checkout repository | Retrieves latest code | Uses actions/checkout@v4 |
| Setup Node.js | Configures Node 22 | Includes npm caching for speed |
| Install dependencies | Runs reproducible build | Uses `npm ci` for deterministic installs |
| Run syntax checks | Validates all source files | Checks .js and .yaml files |
| Setup Terraform | Configures Terraform CLI | Uses official Terraform action |
| Configure AWS credentials | Sets up AWS authentication | Uses OIDC for secure, token-free access |
| Terraform init | Initializes state and modules | Prepares Terraform environment |
| Terraform format check | Enforces code standards | Ensures consistent formatting |
| Terraform validate | Validates HCL syntax | Catches configuration errors early |
| Create ECR repository | Provisions container registry | Creates repo if not exists |
| Build and push Docker image | Creates and stores container | Tags with commit SHA |
| Deploy infrastructure and ECS | Applies Terraform plan | Provisions all AWS resources |

### Monitoring Workflow Runs

1. Go to your GitHub repository
2. Click **Actions** tab at the top
3. Select **CI/CD** workflow from the left sidebar
4. Click the latest run to view:
   - Overall status (✓ success or ✗ failure)
   - Duration of each step
   - Detailed logs for debugging
   - Input variables used

### Workflow File Location

`.github/workflows/ci-cd.yml` - Contains the complete CI/CD configuration

---

## Terraform Infrastructure

### Directory Structure

```
terraform/
├── main.tf                    # Main infrastructure resource definitions
├── variables.tf               # Input variable declarations and descriptions
├── outputs.tf                 # Output values for reference
├── versions.tf                # Terraform and provider version requirements
├── terraform.tfvars.example   # Example variable values template
└── README.md                  # Terraform-specific documentation
```

### AWS Resources Created

#### Container Registry
- **ECR Repository**: Stores Docker images
  - Name: `{project_name}-{environment}` (e.g., `notes-api-dev`)
  - Image scanning: Enabled on push
  - Lifecycle policy: Retains last 10 images, auto-expires older ones
  - Immutability: Mutable tags allow re-tagging

#### Networking
- **VPC**: Virtual Private Cloud with 10.0.0.0/16 CIDR block
  - DNS support enabled
  - DNS hostnames enabled
- **Internet Gateway**: Routes outbound traffic to the internet
- **Public Subnets**: 2 subnets across availability zones (10.0.0.0/24, 10.0.1.0/24)
  - Auto-assign public IPs enabled
  - Multi-AZ for high availability
- **Route Tables**: 
  - Public route table directs 0.0.0.0/0 to Internet Gateway
  - Subnet associations configured

#### Load Balancing
- **Application Load Balancer (ALB)**: 
  - Distributes HTTP traffic to ECS tasks
  - Protocol: HTTP on port 80
  - Accessible from internet (0.0.0.0/0)
- **Target Group**: 
  - Monitors ECS task health
  - Health check path: `/health`
  - Protocol: HTTP on container port 3000
  - Healthy threshold: 2 checks
  - Unhealthy threshold: 3 checks
  - Check interval: 30 seconds
- **Security Groups**:
  - ALB: Allows inbound HTTP (80), all outbound
  - ECS: Allows inbound from ALB only, all outbound

#### Container Orchestration
- **ECS Cluster**: Container orchestration service
  - Container Insights enabled for monitoring
  - Auto-scaling ready
- **ECS Task Definition**: Specifies container runtime configuration
  - Image: Pulled from ECR
  - CPU: 256 units (0.25 vCPU)
  - Memory: 512 MiB
  - Port mapping: Container 3000 → Load Balancer traffic
  - Environment variables for database connection
  - CloudWatch logging integration
- **ECS Service**: Manages running task instances
  - Launch type: Fargate (serverless)
  - Desired count: 1 (configurable)
  - Load balancer integration
  - Auto-restart on failure

#### Monitoring & Logging
- **CloudWatch Log Group**: 
  - Name: `/ecs/{project_name}-{environment}` (e.g., `/ecs/notes-api-dev`)
  - Retention: 7 days
  - Log stream prefix: "ecs"
  - Structured logging with CloudWatch Logs Agent

#### Security & Access
- **IAM Execution Role**: 
  - Name: `{project_name}-{environment}-ecs-execution-role`
  - Permissions: AmazonECSTaskExecutionRolePolicy
  - Trust: ECS Tasks service
  - Allows pulling images and writing logs

### Configuration Variables

Create `terraform.tfvars` based on `terraform.tfvars.example`:

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `aws_region` | string | ap-south-1 | AWS region for resource deployment |
| `project_name` | string | notes-api | Prefix for all AWS resource names |
| `environment` | string | dev | Environment name (dev/staging/prod) |
| `container_port` | number | 3000 | Port exposed by Node.js container |
| `cpu` | number | 256 | Fargate CPU units (256-4096, in increments) |
| `memory` | number | 512 | Fargate memory in MiB (512-30720) |
| `desired_count` | number | 1 | Number of ECS tasks to keep running |
| `image_uri` | string | ECR URL | Full Docker image URI (set by GitHub Actions) |
| `db_host` | string | - | PostgreSQL hostname or RDS endpoint |
| `db_port` | string | 5432 | PostgreSQL port number |
| `db_user` | string | - | Database username |
| `db_password` | string | - | Database password (sensitive) |
| `db_name` | string | - | Database name |
| `jwt_secret` | string | - | JWT signing secret (sensitive) |

### Manual Terraform Deployment

#### Step 1: Initialize Terraform

```bash
cd terraform
terraform init
```

This downloads AWS provider and initializes the state backend.

#### Step 2: Prepare Variables

Copy the example and edit with your values:

```bash
cp terraform.tfvars.example terraform.tfvars
nano terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
aws_region   = "ap-south-1"
project_name = "notes-api"
environment  = "dev"
cpu          = 256
memory       = 512
desired_count = 1

# Database credentials (use existing RDS or managed database)
db_host     = "notes-db.c1234567890.ap-south-1.rds.amazonaws.com"
db_port     = "5432"
db_user     = "notes_user"
db_password = "SecurePassword123!"
db_name     = "notes_db"

# JWT secret for authentication
jwt_secret  = "your-very-secure-jwt-secret-key-min-20-chars"
```

#### Step 3: Plan Changes

```bash
terraform plan -out=tfplan
```

This shows all resources that will be created/modified without making changes.

#### Step 4: Apply Changes

```bash
terraform apply tfplan
```

This provisions the infrastructure on AWS. Expected duration: 2-5 minutes.

#### Step 5: Get Outputs

```bash
terraform output
```

Sample outputs:

```
ecr_repository_url = "123456789012.dkr.ecr.ap-south-1.amazonaws.com/notes-api-dev"
ecs_cluster_name = "notes-api-dev-cluster"
ecs_service_name = "notes-api-dev-service"
load_balancer_dns_name = "notes-api-dev-alb-1234567890.ap-south-1.elb.amazonaws.com"
application_url = "http://notes-api-dev-alb-1234567890.ap-south-1.elb.amazonaws.com"
```

### Terraform Best Practices

```bash
# Format code to standards
terraform fmt -recursive

# Validate configuration syntax
terraform validate

# Preview changes without applying
terraform plan

# View all managed resources
terraform state list

# Inspect specific resource state
terraform state show aws_ecs_service.app

# Destroy all infrastructure (be careful!)
terraform destroy
```

### Terraform State Management

The state is stored locally in `terraform.tfstate` by default. For production:

1. **Use Remote State** (S3 + DynamoDB):

```hcl
# versions.tf
terraform {
  backend "s3" {
    bucket         = "notes-api-terraform-state"
    key            = "prod/terraform.tfstate"
    region         = "ap-south-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

2. **Initialize with backend**:

```bash
terraform init -backend-config="bucket=notes-api-terraform-state"
```

---

## ECS Fargate Deployment

### What is ECS Fargate?

AWS ECS (Elastic Container Service) Fargate is a serverless container orchestration platform:

- **Serverless**: No EC2 instances to provision or manage
- **Pay-per-use**: Charges only for running containers
- **Auto-scaling**: Scales tasks based on CPU/memory metrics
- **High availability**: Multi-AZ deployment by default
- **Integration**: Works with ALB, CloudWatch, ECR, IAM

### Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│            Your Application                          │
│  (Node.js Express API with PostgreSQL)              │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │    GitHub Repository    │
        │   (git push to main)    │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  GitHub Actions CI/CD   │
        │  1. Build Docker image  │
        │  2. Push to ECR         │
        │  3. Run Terraform apply │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────────────┐
        │  AWS Resources (Terraform)      │
        │  ├─ ECR Repository              │
        │  ├─ VPC & Networking            │
        │  ├─ ECS Cluster                 │
        │  ├─ ECS Task Definition         │
        │  ├─ ECS Service                 │
        │  ├─ Application Load Balancer   │
        │  └─ CloudWatch Logs             │
        └────────────┬────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   Running ECS Tasks     │
        │  (Docker Containers)    │
        │  Port 3000 (internal)   │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │ Application Load Balancer       │
        │ Port 80 (public internet)       │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   Internet Users        │
        │  http://your-api-url    │
        └─────────────────────────┘
```

### Task Container Configuration

The ECS Task Definition specifies the following for each container:

```
Image:     123456789012.dkr.ecr.ap-south-1.amazonaws.com/notes-api-dev:abc1234
CPU:       256 units (0.25 vCPU)
Memory:    512 MiB
Port:      3000 (internal) → Load Balancer routes HTTP (80)

Environment Variables:
  PORT=3000
  DB_HOST=notes-db.rds.amazonaws.com
  DB_PORT=5432
  DB_USER=notes_user
  DB_PASSWORD=***
  DB_NAME=notes_db
  JWT_SECRET=***

Logging:
  Driver: awslogs
  Log Group: /ecs/notes-api-dev
  Region: ap-south-1
  Stream Prefix: ecs
```

### Scaling the Service

#### Horizontal Scaling (Run more containers)

Increase the number of concurrent task instances:

```bash
cd terraform
```

Edit `terraform.tfvars`:

```hcl
desired_count = 3  # Run 3 concurrent containers
```

Apply changes:

```bash
terraform apply
```

This will gradually launch 2 additional tasks, monitored by the health check.

#### Vertical Scaling (More CPU/memory per container)

Increase resources per container:

```bash
cd terraform
```

Edit `terraform.tfvars`:

```hcl
cpu    = 512    # Increase from 256 to 512 units
memory = 1024   # Increase from 512 to 1024 MiB
```

Apply changes:

```bash
terraform apply
```

Terraform will:
1. Update task definition
2. Stop old tasks gracefully
3. Start new tasks with updated resources
4. Maintain zero downtime

### Monitoring ECS Service

#### View CloudWatch Logs

```bash
# List all log streams
aws logs describe-log-streams \
  --log-group-name /ecs/notes-api-dev \
  --region ap-south-1

# Tail logs in real-time
aws logs tail /ecs/notes-api-dev --follow --region ap-south-1

# View specific time range
aws logs tail /ecs/notes-api-dev \
  --since 1h \
  --region ap-south-1
```

#### Check ECS Cluster Status

```bash
# List ECS clusters
aws ecs list-clusters --region ap-south-1

# Describe specific cluster
aws ecs describe-clusters \
  --clusters notes-api-dev-cluster \
  --region ap-south-1
```

#### Monitor ECS Service

```bash
# View service details and recent events
aws ecs describe-services \
  --cluster notes-api-dev-cluster \
  --services notes-api-dev-service \
  --region ap-south-1

# List running tasks
aws ecs list-tasks \
  --cluster notes-api-dev-cluster \
  --region ap-south-1

# View specific task details
aws ecs describe-tasks \
  --cluster notes-api-dev-cluster \
  --tasks arn:aws:ecs:ap-south-1:123456789012:task/notes-api-dev-cluster/abc123... \
  --region ap-south-1
```

#### Monitor Load Balancer Health

```bash
# List target groups
aws elbv2 describe-target-groups \
  --region ap-south-1

# Check target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:ap-south-1:123456789012:targetgroup/notes-api-dev-tg/abc123 \
  --region ap-south-1
```

### Health Checks

The ALB monitors task health using the `/health` endpoint:

```
Endpoint:              GET /health
Interval:              30 seconds
Timeout:               5 seconds
Healthy Threshold:     2 consecutive successes
Unhealthy Threshold:   3 consecutive failures
```

Ensure your API always responds to health checks:

```javascript
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok",
    timestamp: new Date().toISOString()
  });
});
```

### Rolling Deployment Process

When you push code to main branch:

1. GitHub Actions builds new Docker image
2. Image pushed to ECR with commit SHA tag
3. Terraform updates task definition
4. ECS Service:
   - Launches new task with updated image
   - Waits for health check success
   - Routes traffic to healthy new task
   - Terminates old task gracefully
5. Zero downtime maintained throughout

### Accessing the Deployed Service

After successful Terraform deployment:

#### Get Load Balancer DNS

```bash
# From Terraform outputs
terraform output load_balancer_dns_name

# From AWS CLI
aws elbv2 describe-load-balancers \
  --query 'LoadBalancers[0].DNSName' \
  --region ap-south-1
```

#### Test the API

```bash
# Health check
curl http://notes-api-dev-alb-1234567890.ap-south-1.elb.amazonaws.com/health

# API documentation
curl http://notes-api-dev-alb-1234567890.ap-south-1.elb.amazonaws.com/api-docs

# API endpoints (after registering)
curl -X GET http://<LOAD_BALANCER_DNS>/notes \
  -H "Authorization: Bearer <JWT_TOKEN>"
```

#### Configure Custom Domain (Optional)

Use Route 53 or your DNS provider:

1. Create CNAME record
2. Point to load balancer DNS name
3. Example: `notes-api.example.com` → `notes-api-dev-alb-xxx.amazonaws.com`

```bash
# Verify DNS resolution
nslookup notes-api.example.com
```

### Updating the Service

To deploy a new version:

1. **Commit and push code**:

```bash
git add .
git commit -m "feat: add new API endpoint"
git push origin main
```

2. **GitHub Actions automatically**:
   - Runs syntax checks
   - Builds Docker image
   - Tags with commit SHA
   - Pushes to ECR
   - Applies Terraform (updates task definition)
   - ECS rolls out new version

3. **Monitor deployment**:

```bash
# Watch CloudWatch logs
aws logs tail /ecs/notes-api-dev --follow

# Check service events
aws ecs describe-services \
  --cluster notes-api-dev-cluster \
  --services notes-api-dev-service
```

### Rollback Procedure

If issues occur after deployment:

#### Option 1: Redeploy Previous Commit

```bash
git revert HEAD  # Creates new commit that undoes changes
git push origin main
```

#### Option 2: Manual ECS Update

```bash
# Get previous task definition revision
aws ecs list-task-definition-revisions \
  --task-definition notes-api-dev-task \
  --sort DESCENDING

# Update service to use previous revision
aws ecs update-service \
  --cluster notes-api-dev-cluster \
  --service notes-api-dev-service \
  --task-definition notes-api-dev-task:2
```

---

## API Documentation

### Base URL

- **Local**: `http://localhost:3000`
- **Deployed**: `http://<LOAD_BALANCER_DNS>`

### Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register**: POST `/auth/register` → Receive credentials
2. **Login**: POST `/auth/login` → Get JWT token
3. **Authenticated requests**: Include `Authorization: Bearer <TOKEN>` header

### Core Endpoints

#### Health Check

```
GET /health
```

Returns service health status.

**Response** (200):
```json
{
  "status": "ok"
}
```

#### Authentication

See `routes/auth.js` for complete details:
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Get JWT token

#### Notes CRUD

See `routes/notes.js` for complete details:
- `GET /notes` - List all notes
- `POST /notes` - Create new note
- `GET /notes/:id` - Get specific note
- `PUT /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

#### API Documentation UI

```
GET /api-docs
```

Interactive Swagger UI with:
- All endpoint details
- Request/response schemas
- Try-it-out functionality
- Authentication configuration

---

## Database Schema

PostgreSQL 12+ is required. The application uses the schema defined in `db.js`.

### Connection Configuration

The application manages database connections via connection pooling:

```javascript
const pool = new Pool({
  host: process.env.DB_HOST,        // RDS endpoint or localhost
  port: process.env.DB_PORT,        // Default: 5432
  user: process.env.DB_USER,        // Database username
  password: process.env.DB_PASSWORD,// Database password
  database: process.env.DB_NAME,    // Database name
  max: 20,                           // Maximum concurrent connections
  idleTimeoutMillis: 30000          // Close idle connections after 30s
});
```

### Initial Database Setup

Initialize the schema:

```bash
node db.js
```

This creates all tables required for the Notes API.

### Database Security

In AWS deployment:

- Use Amazon RDS PostgreSQL (managed database)
- Enable automatic backups
- Configure security group to allow:
  - Inbound: Port 5432 from ECS security group only
  - Outbound: N/A (RDS is inbound only)
- Use strong passwords (20+ characters)
- Enable RDS encryption

---

## Troubleshooting

### Local Development Issues

#### Port already in use (3000)

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

#### Database connection refused

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify credentials in .env file
cat .env

# Test connection manually
psql postgresql://notes_user:password@localhost:5432/notes_db
```

#### JWT errors during testing

Ensure `JWT_SECRET` in `.env` is:
- Set to a strong value
- At least 20 characters
- Consistent across requests
- Not exposed in git history

#### Dependencies installation fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### GitHub Actions Workflow Issues

#### Workflow fails at AWS credentials

**Problem**: "Failed to assume IAM role"

**Solution**:
- Verify `AWS_ROLE_TO_ASSUME` secret in GitHub
- Ensure AWS account ID is correct
- Check OIDC trust relationship in AWS IAM
- Verify role exists and is accessible

```bash
# Test AWS role
aws sts assume-role \
  --role-arn arn:aws:iam::ACCOUNT_ID:role/GitHubActionsRole \
  --role-session-name github-actions
```

#### ECR push fails

**Problem**: "Repository not found" or authentication error

**Solution**:

```bash
# Check ECR repository exists
aws ecr describe-repositories --repository-names notes-api-dev

# Verify AWS credentials
aws sts get-caller-identity

# Manually create ECR repo if missing
aws ecr create-repository \
  --repository-name notes-api-dev \
  --region ap-south-1
```

#### Terraform validation fails

**Problem**: HCL syntax errors or variable issues

**Solution**:

```bash
# Validate locally
cd terraform
terraform validate

# Check variable syntax
terraform plan -var-file=terraform.tfvars

# Format code
terraform fmt -recursive
```

### ECS Deployment Issues

#### Tasks fail to reach healthy state

**Problem**: ALB target group shows "unhealthy"

**Check logs**:
```bash
# View container logs
aws logs tail /ecs/notes-api-dev --follow

# Verify health endpoint responds
curl http://localhost:3000/health
```

**Common causes**:
- Application not listening on port 3000
- `/health` endpoint not responding
- Database connection failed
- Insufficient memory allocated

#### Cannot reach deployed API

**Problem**: "Connection refused" or "timeout"

**Solution**:

```bash
# Verify load balancer is running
aws elbv2 describe-load-balancers --region ap-south-1

# Check target group health
aws elbv2 describe-target-health --target-group-arn <ARN>

# Test from within ECS task
aws ecs execute-command \
  --cluster notes-api-dev-cluster \
  --task <TASK_ID> \
  --container notes-api \
  --command "curl localhost:3000/health" \
  --interactive
```

#### Database connection errors from ECS

**Problem**: "Unable to connect to database"

**Check**:

```bash
# Verify database endpoint
echo $DB_HOST  # From ECS task environment

# Check security group allows 5432
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx

# Test connectivity from ECS
aws ecs execute-command \
  --cluster notes-api-dev-cluster \
  --task <TASK_ID> \
  --container notes-api \
  --command "ping $DB_HOST" \
  --interactive
```

#### Service stuck in "deploying" state

**Problem**: Deployment doesn't complete

**Solution**:

```bash
# View service events
aws ecs describe-services \
  --cluster notes-api-dev-cluster \
  --services notes-api-dev-service

# Check task definition updates
aws ecs describe-task-definition \
  --task-definition notes-api-dev-task

# View CloudWatch logs for errors
aws logs tail /ecs/notes-api-dev --follow
```

### General Debugging Commands

#### Enable debug logging

```bash
# Node.js debug
DEBUG=* npm start

# Terraform debug
TF_LOG=DEBUG terraform apply
```

#### Check AWS resources

```bash
# List all ECS clusters
aws ecs list-clusters

# List all services
aws ecs list-services --cluster notes-api-dev-cluster

# List running tasks
aws ecs list-tasks --cluster notes-api-dev-cluster

# View CloudFormation stacks
aws cloudformation describe-stacks
```

#### Test health endpoint

```bash
# From local machine
curl -v http://localhost:3000/health

# From deployed service
curl -v http://<LOAD_BALANCER_DNS>/health
```

#### Check resource limits

```bash
# View ECS resource utilization
aws ecs describe-services \
  --cluster notes-api-dev-cluster \
  --services notes-api-dev-service \
  --query 'services[0].[{cpu,memory,desiredCount,runningCount}]'
```

---

## Support & Documentation

- **Swagger API Docs**: `http://localhost:3000/api-docs`
- **Terraform Docs**: https://www.terraform.io/docs
- **AWS ECS**: https://docs.aws.amazon.com/ecs/
- **GitHub Actions**: https://docs.github.com/en/actions
- **AWS CLI**: https://docs.aws.amazon.com/cli/

---

## License

ISC

## Author

Your Name
