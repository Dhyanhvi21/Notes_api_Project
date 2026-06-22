variable "aws_region" {
  description = "AWS region where resources will be created."
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name prefix for all AWS resources."
  type        = string
  default     = "notes-api"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"
}

variable "image_uri" {
  description = "Full Docker image URI to run in ECS."
  type        = string
  default     = "public.ecr.aws/docker/library/node:22-alpine"
}

variable "container_port" {
  description = "Port exposed by the Node.js API container."
  type        = number
  default     = 3000
}

variable "desired_count" {
  description = "Number of ECS tasks to keep running."
  type        = number
  default     = 1
}

variable "cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 256
}

variable "memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 512
}

variable "db_host" {
  description = "PostgreSQL database hostname."
  type        = string
  sensitive   = true
}

variable "db_port" {
  description = "PostgreSQL database port."
  type        = string
  default     = "5432"
  sensitive   = true
}

variable "db_user" {
  description = "PostgreSQL database username."
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL database password."
  type        = string
  sensitive   = true
}

variable "db_name" {
  description = "PostgreSQL database name."
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret used to sign JWT tokens."
  type        = string
  sensitive   = true
}
