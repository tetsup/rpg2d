variable "aws_region" {
  description = "AWS region for RPG2d resources."
  type        = string
  default     = "ap-northeast-1"
}

variable "name_prefix" {
  description = "Prefix for all RPG2d AWS resource names."
  type        = string
  default     = "RPG2d"

  validation {
    condition     = can(regex("^[A-Za-z0-9-]+$", var.name_prefix))
    error_message = "name_prefix may contain only letters, numbers, and hyphens."
  }
}

variable "frontend_origins" {
  description = "Allowed browser origins for the Lambda Function URL CORS configuration."
  type        = list(string)
}

variable "lambda_memory_mb" {
  description = "Memory size for the RPG2d API Lambda function."
  type        = number
  default     = 512
}

variable "lambda_timeout_seconds" {
  description = "Timeout for the RPG2d API Lambda function."
  type        = number
  default     = 30
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention for the RPG2d API Lambda log group."
  type        = number
  default     = 14
}

variable "create_github_actions_deploy_user" {
  description = "Create an IAM user for GitHub Actions Lambda deploys."
  type        = bool
  default     = true
}
