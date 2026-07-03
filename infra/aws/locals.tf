locals {
  api_function_name = "${var.name_prefix}-api"
  common_tags = {
    Project = "RPG2d"
    Managed = "terraform"
  }
}
