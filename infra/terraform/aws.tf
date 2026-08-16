data "aws_caller_identity" "current" {}

locals {
  cloudfront_distribution_name = "${var.name_prefix}-cdn"
  frontend_artifact_dir        = "${path.module}/artifacts/frontend"
  backend_artifact_dir         = "${path.module}/artifacts/backend"

  spa_origin_id     = "${var.name_prefix}-spa"
  api_origin_id     = "${var.name_prefix}-api"
  api_artifact_key  = "lambda-api.zip"
  api_artifact_path = "${local.backend_artifact_dir}/${local.api_artifact_key}"
  common_tags       = {}
}

resource "aws_iam_role" "github_actions_deploy" {
  name = "${var.name_prefix}-github-actions-deploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"

    Statement = [{
      Effect = "Allow"

      Principal = {
        Federated = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/token.actions.githubusercontent.com"
      }

      Action = "sts:AssumeRoleWithWebIdentity"

      Condition = {
        StringEquals = {
          "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        }

        StringLike = {
          "token.actions.githubusercontent.com:sub" = "repo:tetsup/rpg2d:ref:refs/heads/main"
        }
      }
    }]
  })
}


resource "aws_ssm_parameter" "auth0_client_id" {
  name  = "/${var.name_prefix}/auth0_client_id"
  type  = "String"
  value = auth0_client.web.client_id
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "auth0_client_secret" {
  name  = "/${var.name_prefix}/auth0_client_secret"
  type  = "SecureString"
  value = auth0_client_credentials.web.client_secret
  tags  = local.common_tags
}

resource "aws_ssm_parameter" "frontend_origin" {
  name  = "/${var.name_prefix}/frontend_origin"
  type  = "String"
  value = "https://${aws_cloudfront_distribution.main.domain_name}"
  tags  = local.common_tags
}

resource "aws_iam_role" "api_lambda" {
  name = "${var.name_prefix}-api-lambda-exec"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = local.common_tags
}

resource "aws_iam_policy" "api_lambda_ssm" {
  name        = "${var.name_prefix}-lambda-ssm-policy"
  description = "Allow Lambda to read Auth0 secrets from SSM Parameter Store"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameters",
          "ssm:GetParameter"
        ]
        Resource = [
          aws_ssm_parameter.auth0_client_id.arn,
          aws_ssm_parameter.auth0_client_secret.arn,
          aws_ssm_parameter.frontend_origin.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "api_lambda_ssm" {
  role       = aws_iam_role.api_lambda.name
  policy_arn = aws_iam_policy.api_lambda_ssm.arn
}

resource "aws_iam_role_policy_attachment" "api_lambda_basic_execution" {
  role       = aws_iam_role.api_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# -----------------------------------------------------------
# Frontend
# -----------------------------------------------------------

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.name_prefix}-frontend"

  tags = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "frontend" {
  for_each = fileset(local.frontend_artifact_dir, "**")

  bucket = aws_s3_bucket.frontend.id
  key    = each.value

  source = "${local.frontend_artifact_dir}/${each.value}"

  source_hash = filemd5(
    "${local.frontend_artifact_dir}/${each.value}"
  )

  content_type = lookup(
    {
      html = "text/html"
      js   = "application/javascript"
      css  = "text/css"
      json = "application/json"
      svg  = "image/svg+xml"
      png  = "image/png"
      jpg  = "image/jpeg"
      jpeg = "image/jpeg"
      webp = "image/webp"
      ico  = "image/x-icon"
      wasm = "application/wasm"
    },
    lower(regex("[^.]+$", each.value)),
    null
  )
}

resource "aws_s3_bucket_ownership_controls" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${var.name_prefix}-frontend"
  description                       = "CloudFront access to frontend S3 bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------
# API
# -----------------------------------------------------------

resource "aws_s3_bucket" "backend" {
  bucket = "${var.name_prefix}-backend"

  tags = local.common_tags
}

resource "aws_s3_bucket_public_access_block" "backend" {
  bucket = aws_s3_bucket.backend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_object" "api" {
  bucket = aws_s3_bucket.backend.id
  key    = local.api_artifact_key

  source      = local.api_artifact_path
  source_hash = filemd5(local.api_artifact_path)
}

resource "random_password" "session" {
  length  = 64
  special = true
}

resource "aws_lambda_function" "api" {
  function_name = "${var.name_prefix}-api"

  role        = aws_iam_role.api_lambda.arn
  handler     = "index.handler"
  runtime     = "nodejs22.x"
  timeout     = var.lambda_timeout_seconds
  memory_size = var.lambda_memory_mb

  s3_bucket = aws_s3_bucket.backend.id
  s3_key    = aws_s3_object.api.key

  source_code_hash = filebase64sha256(
    local.api_artifact_path
  )

  environment {
    variables = {
      DATABASE_URL   = data.neon_project.main.connection_uri
      AUTH0_DOMAIN   = var.auth0_domain
      SESSION_SECRET = random_password.session.result
      SSM_PREFIX     = var.name_prefix
    }
  }

  depends_on = [
    aws_s3_object.api,
    aws_iam_role_policy_attachment.api_lambda_basic_execution,
    aws_cloudwatch_log_group.api,
  ]

  tags = local.common_tags
}

resource "aws_lambda_function_url" "api" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "AWS_IAM"
}

resource "aws_cloudfront_origin_access_control" "api" {
  name                              = "${var.name_prefix}-api"
  description                       = "CloudFront access to Lambda Function URL"
  origin_access_control_origin_type = "lambda"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# -----------------------------------------------------------
# CloudFront
# -----------------------------------------------------------

resource "aws_cloudfront_function" "spa_router" {
  name    = "${var.name_prefix}-spa-router"
  runtime = "cloudfront-js-2.0"
  comment = "Route SPA paths to their application index"
  publish = true
  code    = file("${path.module}/src/spa-router.js")
}

resource "aws_cloudfront_distribution" "main" {
  enabled = true
  comment = local.cloudfront_distribution_name

  price_class         = "PriceClass_100"
  default_root_object = "landing/index.html"

  origin {
    origin_id                = local.spa_origin_id
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  origin {
    origin_id = local.api_origin_id
    domain_name = trimsuffix(
      trimprefix(aws_lambda_function_url.api.function_url, "https://"),
      "/"
    )
    origin_access_control_id = aws_cloudfront_origin_access_control.api.id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"

      origin_ssl_protocols = [
        "TLSv1.2",
      ]
    }
  }

  ordered_cache_behavior {
    path_pattern     = "/api/*"
    target_origin_id = local.api_origin_id

    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT",
    ]

    cached_methods = [
      "GET",
      "HEAD",
    ]

    compress = true

    cache_policy_id = data.aws_cloudfront_cache_policy.caching_disabled.id

    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host_header.id
  }

  # それ以外は全部S3
  default_cache_behavior {
    target_origin_id       = local.spa_origin_id
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS",
    ]

    cached_methods = [
      "GET",
      "HEAD",
    ]

    compress = true

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa_router.arn
    }

    cache_policy_id = data.aws_cloudfront_cache_policy.caching_optimized.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.common_tags
}

# -----------------------------------------------------------
# CloudFront managed policies
# -----------------------------------------------------------

data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer_except_host_header" {
  name = "Managed-AllViewerExceptHostHeader"
}

data "aws_iam_policy_document" "frontend_bucket" {
  statement {
    sid    = "AllowCloudFrontRead"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.frontend.arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"

      values = [
        aws_cloudfront_distribution.main.arn,
      ]
    }
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_bucket.json
}

resource "aws_lambda_permission" "api_cloudfront_invoke_url" {
  statement_id  = "AllowCloudFrontInvokeFunctionUrl"
  action        = "lambda:InvokeFunctionUrl"
  function_name = aws_lambda_function.api.function_name
  principal     = "cloudfront.amazonaws.com"

  source_arn = aws_cloudfront_distribution.main.arn

  function_url_auth_type = "AWS_IAM"
}

resource "aws_lambda_permission" "api_cloudfront_invoke" {
  statement_id  = "AllowCloudFrontInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "cloudfront.amazonaws.com"

  source_arn = aws_cloudfront_distribution.main.arn
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/lambda/${var.name_prefix}-backend-lambda"
  retention_in_days = var.log_retention_days

  tags = local.common_tags
}
