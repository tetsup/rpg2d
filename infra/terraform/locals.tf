locals {
  project_name = "RPG2d"

  name_prefix = "${local.project_name}-${var.environment}"

  editor_name  = "${local.name_prefix}-editor"
  runtime_name = "${local.name_prefix}-runtime"
  api_name     = "${local.name_prefix}-api"

  tags = {
    Project     = local.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
