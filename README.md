# AIDA - AI-driven Instructional Design Assistant

## Overview

AIDA (AI-driven Instructional Design Assistant) is a cloud-native educational platform that combines online learning with artificial intelligence-powered tools. The platform allows users to enroll in courses, complete lessons, track learning progress, and generate AI-powered quizzes from both lesson content and uploaded PDF documents.

This project was developed as part of a Cloud Computing and DevOps semester assignment and demonstrates the complete lifecycle of a cloud-native application, including infrastructure provisioning, containerized deployment, database management, backup and recovery, and automated CI/CD deployment.

---

## Features

### Learning Platform

* User registration and authentication
* Course browsing and enrollment
* Lesson progression tracking
* Learning dashboard
* Course completion tracking
* Responsive desktop and mobile interface

### AI Learning Tools

* AI-generated lesson summaries
* AI-generated quizzes
* PDF lecture upload and quiz generation
* Quiz score calculation
* Quiz result storage

### Cloud and DevOps Features

* Infrastructure as Code using Terraform
* Azure Virtual Machine deployment
* Docker containerization
* Docker Compose orchestration
* PostgreSQL database
* Database backup and recovery
* Automated CI/CD using GitHub Actions

---

## Technology Stack

### Frontend

* React
* React Router
* Axios
* React Hot Toast

### Backend

* FastAPI
* SQLAlchemy
* PostgreSQL
* JWT Authentication

### AI Services

* Groq API
* Llama 3.1 8B Instant

### Cloud & DevOps

* Microsoft Azure
* Terraform
* Docker
* Docker Compose
* GitHub Actions

---

## System Architecture

```text
User
   |
   v
React Frontend
   |
   v
FastAPI Backend
   |
   v
PostgreSQL Database

Hosted on Azure Linux Virtual Machine
```

### Deployment Flow

```text
Developer
    |
    v
GitHub Repository
    |
    v
GitHub Actions
    |
    v
SSH Deployment
    |
    v
Azure Virtual Machine
    |
    v
Docker Compose
    |
    v
Frontend + Backend + PostgreSQL
```

---

## Cloud Infrastructure

The cloud infrastructure is provisioned entirely using Terraform.

Provisioned resources:

* Azure Resource Group
* Virtual Network (VNet)
* Subnet
* Network Security Group (NSG)
* Public IP Address
* Linux Virtual Machine

Terraform workflow:

```bash
terraform init
terraform validate
terraform plan
terraform apply
```

---

## Containerized Deployment

The application consists of three Docker containers:

| Service  | Description                       |
| -------- | --------------------------------- |
| Frontend | React application served by Nginx |
| Backend  | FastAPI REST API                  |
| Database | PostgreSQL                        |

Start the application:

```bash
docker-compose up --build -d
```

Verify running containers:

```bash
sudo docker ps
```

---

## Database Backup and Recovery

Create a backup:

```bash
docker exec ai_course_db pg_dump -U postgres -d ai_course_db > aida_backup.sql
```

Restore a backup:

```bash
cat aida_backup.sql | docker exec -i ai_course_db psql -U postgres -d ai_course_db
```

---

## CI/CD Pipeline

GitHub Actions automatically deploys the application whenever changes are pushed to the `main` branch.

Deployment workflow:

```text
Git Push
   |
   v
GitHub Actions
   |
   v
SSH to Azure VM
   |
   v
Git Pull
   |
   v
Frontend Build
   |
   v
Docker Compose Rebuild
   |
   v
Updated Application
```

The deployment pipeline performs the following steps:

1. Connect to Azure VM via SSH
2. Pull the latest code from GitHub
3. Install frontend dependencies
4. Build the React application
5. Rebuild Docker containers
6. Start updated services

---

## Running the Project Locally

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/ai-course-generator.git
cd ai-course-generator
```

Start all services:

```bash
docker-compose up --build
```

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8000
```

API Documentation:

```text
http://localhost:8000/docs
```

---

## Project Objectives Achieved

* Cloud infrastructure provisioning using Terraform
* Azure Virtual Machine deployment
* Containerized application architecture
* PostgreSQL database integration
* Infrastructure as Code implementation
* Automated CI/CD deployment
* Backup and recovery procedures
* Cloud-native application hosting

---

## Author

**Jahonoro Tojieva**

Cloud Computing and DevOps Semester Project

Eötvös Loránd University – Faculty of Informatics

Academic Year 2025/2026
