output "api_lambda_function_name" {
  description = "Lambda function name used by GitHub Actions (AWS_LAMBDA_FUNCTION_NAME)."
  value       = aws_lambda_function.api.function_name
}

output "api_lambda_function_arn" {
  description = "Lambda function ARN for the RPG2d API."
  value       = aws_lambda_function.api.arn
}

output "api_lambda_function_url" {
  description = "Public Function URL for the RPG2d API (VITE_API_BASE_URL / Auth0 callback base)."
  value       = aws_lambda_function_url.api.function_url
}

output "api_auth_callback_url" {
  description = "Auth0 allowed callback URL for the RPG2d API."
  value       = "${trimsuffix(aws_lambda_function_url.api.function_url, "/")}/api/auth/callback"
}

output "github_actions_deploy_user_name" {
  description = "IAM user name for GitHub Actions deploy credentials."
  value       = try(aws_iam_user.github_actions_deploy[0].name, null)
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group for RPG2d API Lambda logs."
  value       = aws_cloudwatch_log_group.api.name
}
