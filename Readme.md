# Notes API 

## Project Overview

Notes API is a cloud-native REST API developed using Node.js, Express.js, and PostgreSQL. The application provides secure note management through JWT authentication and demonstrates modern DevOps practices including Docker containerization, Infrastructure as Code using Terraform, automated CI/CD using GitHub Actions, and deployment to AWS ECS Fargate.

This project was developed as part of a Cloud DevOps assignment to showcase backend development, containerization, cloud deployment, and infrastructure automation skills.

---

## Assignment Objectives

* Develop a secure REST API using Node.js and Express.js
* Implement PostgreSQL database integration
* Secure APIs using JWT authentication
* Document APIs using Swagger
* Containerize the application using Docker
* Provision infrastructure using Terraform
* Automate deployment using GitHub Actions
* Deploy application to AWS ECS Fargate

---

## Features

### Authentication

* User Registration (Signup)
* User Login
* Password Hashing using bcryptjs
* JWT Token Generation
* Protected API Routes

### Notes Management

* Create Note
* Get All Notes
* Get Note By ID
* Update Note
* Delete Note

### DevOps Features

* Docker Containerization
* Infrastructure as Code using Terraform
* AWS ECS Fargate Deployment
* Amazon ECR Integration
* GitHub Actions CI/CD
* Swagger API Documentation

---

## Technology Stack

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL

### Authentication

* JWT (JSON Web Token)
* bcryptjs

### Documentation

* Swagger UI
* OpenAPI Specification

### DevOps & Cloud

* Docker
* Terraform
* GitHub Actions
* AWS ECS Fargate
* Amazon ECR
* AWS IAM
* AWS VPC

---

## Project Structure

```text
Notes_api_Project/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml
│
├── middleware/
│   └── authMiddleware.js
│
├── routes/
│   ├── auth.js
│   └── notes.js
│
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── versions.tf
│   └── .terraform.lock.hcl
│
├── Screenshots/
│
├── app.js
├── db.js
├── Dockerfile
├── swagger.yaml
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
├── .dockerignore
└── .env
```

---

## Architecture

```text
Developer
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions CI/CD
    │
    ▼
Terraform
    │
    ▼
Amazon ECR
    │
    ▼
Amazon ECS Fargate
    │
    ▼
Notes API Container
    │
    ▼
PostgreSQL Database
```

---

## Database Schema

### Users Table

| Column   | Type               |
| -------- | ------------------ |
| id       | SERIAL PRIMARY KEY |
| email    | VARCHAR            |
| password | VARCHAR            |

### Notes Table

| Column     | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| title      | VARCHAR            |
| content    | TEXT               |
| user_id    | INTEGER            |
| created_at | TIMESTAMP          |

---

## API Endpoints

### Health Check

```http
GET /health
```

### Authentication

```http
POST /auth/signup
POST /auth/login
```

### Notes

```http
POST   /notes
GET    /notes
GET    /notes/:id
PUT    /notes/:id
DELETE /notes/:id
```

---

## Local Setup

### Clone Repository

```bash
git clone https://github.com/Dhyanhvi21/Notes_api_Project.git
cd Notes_api_Project
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=notes_user
DB_PASSWORD=your_password
DB_NAME=notes_db

JWT_SECRET=mysecretkey123
```

### Start Application

```bash
npm run dev
```

Application URL:

```text
http://localhost:3000
```

---

## Swagger Documentation

Swagger UI:

```text
http://localhost:3000/api-docs
```

Features:

* Interactive API Testing
* Request/Response Examples
* Endpoint Documentation

---

## Docker

### Build Docker Image

```bash
docker build -t notes-api .
```

### Run Docker Container

```bash
docker run -d -p 3000:3000 --name notes-api notes-api
```

### Verify Running Container

```bash
docker ps
```

---

## Terraform

### Initialize Terraform

```bash
terraform init
```

### Validate Configuration

```bash
terraform validate
```

### Format Terraform Files

```bash
terraform fmt
```

### Deploy Infrastructure

```bash
terraform apply
```

### Destroy Infrastructure

```bash
terraform destroy
```

---

## CI/CD Pipeline

GitHub Actions automates the complete deployment process.

Workflow File:

```text
.github/workflows/ci-cd.yml
```

Pipeline Stages:

1. Checkout Repository
2. Setup Node.js
3. Install Dependencies
4. Run Syntax Validation
5. Setup Terraform
6. Configure AWS Credentials
7. Terraform Init
8. Terraform Validate
9. Create ECR Repository
10. Build Docker Image
11. Push Docker Image to ECR
12. Deploy Infrastructure
13. Deploy Application to ECS Fargate

---

## AWS Services Used

* Amazon ECS Fargate
* Amazon ECR
* AWS IAM
* AWS VPC
* Security Groups
* CloudWatch Logs

---

## Deployment Outcome

The application was successfully:

* Containerized using Docker
* Stored in Amazon ECR
* Deployed on AWS ECS Fargate
* Automated using GitHub Actions
* Provisioned using Terraform
* Documented using Swagger

---

## Screenshots

The Screenshots folder contains:

* Application Running
* Health Check API
* Signup API
* Login API
* JWT Authentication
* Notes CRUD Operations
* Docker Image Build
* Docker Container Running
* ECS Deployment
* GitHub Actions Success

---

## Future Enhancements

* Add Unit Testing
* Add API Rate Limiting
* Add HTTPS Support
* Add Monitoring and Alerting
* Add Note Categories and Tags
* Add User Profile Management

---

## Author
Dnyanhvi Kale <br>
Cloud Engineer <br>
AWS Certified Solutions Architect – Associate
