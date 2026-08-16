variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "production"
}

variable "name_prefix" {
  type    = string
  default = "rpg2d-dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "lambda_timeout_seconds" {
  type        = number
  description = "Lambda function timeout in seconds"
  default     = 10
}

variable "lambda_memory_mb" {
  type        = number
  description = "Lambda function memory size in MB"
  default     = 256
}

variable "lambda_artifact_key" {
  description = "S3 Key for lambda"
  type        = string
  default     = "lambda.zip"
}

variable "log_retention_days" {
  type        = number
  description = "CloudWatch Logs retention period in days"
  default     = 14
}

variable "auth0_domain" {
  description = "Auth0 tenant domain"
  type        = string
}

variable "auth0_client_id" {
  description = "Auth0 Management API client ID"
  type        = string
  sensitive   = true
}

variable "auth0_client_secret" {
  description = "Auth0 Management API client secret"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth Client ID for Auth0 Connection"
  type        = string
  default     = ""
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret for Auth0 Connection"
  type        = string
  default     = ""
  sensitive   = true
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}

variable "neon_project_id" {
  description = "Neon Project ID"
  type        = string
  sensitive   = true
}
