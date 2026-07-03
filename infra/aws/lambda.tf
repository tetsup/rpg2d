data "archive_file" "api_placeholder" {
  type        = "zip"
  source_file = "${path.module}/placeholder/index.mjs"
  output_path = "${path.module}/placeholder.zip"
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${local.api_function_name}"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}

resource "aws_lambda_function" "api" {
  function_name = local.api_function_name
  role          = aws_iam_role.api_lambda.arn
  handler       = "index.handler"
  runtime       = "nodejs24.x"
  timeout       = var.lambda_timeout_seconds
  memory_size   = var.lambda_memory_mb

  filename         = data.archive_file.api_placeholder.output_path
  source_code_hash = data.archive_file.api_placeholder.output_base64sha256

  depends_on = [
    aws_iam_role_policy_attachment.api_lambda_basic_execution,
    aws_cloudwatch_log_group.api,
  ]

  tags = local.common_tags
}

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins     = var.frontend_origins
    allow_methods     = ["*"]
    allow_headers     = ["content-type", "authorization"]
    expose_headers    = ["content-type"]
    max_age           = 86400
  }
}
