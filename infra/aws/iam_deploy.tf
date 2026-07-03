resource "aws_iam_user" "github_actions_deploy" {
  count = var.create_github_actions_deploy_user ? 1 : 0

  name = "${var.name_prefix}-github-actions-deploy"
  tags = local.common_tags
}

resource "aws_iam_user_policy" "github_actions_deploy_lambda" {
  count = var.create_github_actions_deploy_user ? 1 : 0

  name = "${var.name_prefix}-github-actions-deploy-lambda"
  user = aws_iam_user.github_actions_deploy[0].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "UpdateRPG2dApiLambda"
        Effect = "Allow"
        Action = [
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
        ]
        Resource = aws_lambda_function.api.arn
      },
      {
        Sid    = "PublishLambdaLogs"
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents",
        ]
        Resource = "${aws_cloudwatch_log_group.api.arn}:*"
      }
    ]
  })
}
