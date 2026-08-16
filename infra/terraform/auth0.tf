# -----------------------------------------------------------
# Locals
# -----------------------------------------------------------

locals {
  auth0_application_name = "${var.name_prefix}-web"
  auth0_api_name         = "${var.name_prefix}-api"

  cloudfront_url = "https://${aws_cloudfront_distribution.main.domain_name}"

  # Auth0 API identifier / audience.
  #
  # This is an identifier, not necessarily a directly reachable
  # endpoint. Keeping it stable and independent from the CloudFront
  # distribution URL makes it possible to change the infrastructure
  # endpoint later without changing the OAuth audience.
  auth0_api_identifier = "https://api.${var.name_prefix}.rpg2d"

  auth0_scopes = {
    "read:resources"   = "Read RPG2D resources"
    "write:resources"  = "Create and update RPG2D resources"
    "delete:resources" = "Delete RPG2D resources"
  }
}

# -----------------------------------------------------------
# API / Resource Server
# -----------------------------------------------------------

resource "auth0_resource_server" "api" {
  name       = local.auth0_api_name
  identifier = local.auth0_api_identifier

  signing_alg = "RS256"

  allow_offline_access = true

  token_lifetime = 86400

  skip_consent_for_verifiable_first_party_clients = true
}

resource "auth0_resource_server_scopes" "api" {
  resource_server_identifier = auth0_resource_server.api.identifier

  dynamic "scopes" {
    for_each = local.auth0_scopes

    content {
      name        = scopes.key
      description = scopes.value
    }
  }
}

# -----------------------------------------------------------
# Web Application
# -----------------------------------------------------------

resource "auth0_client" "web" {
  name = local.auth0_application_name

  app_type = "regular_web"

  grant_types = [
    "authorization_code",
    "refresh_token",
  ]

  is_first_party  = true
  oidc_conformant = true

  callbacks = [
    "${local.cloudfront_url}/api/auth/callback",
  ]

  allowed_logout_urls = [
    local.cloudfront_url,
  ]

  allowed_origins = [
    local.cloudfront_url,
  ]

  web_origins = [
    local.cloudfront_url,
  ]

  jwt_configuration {
    alg = "RS256"
  }

  refresh_token {
    rotation_type       = "rotating"
    expiration_type     = "expiring"
    token_lifetime      = 2592000
    idle_token_lifetime = 1209600
  }
}

resource "auth0_client_credentials" "web" {
  client_id             = auth0_client.web.id
  authentication_method = "client_secret_post"
}

# -----------------------------------------------------------
# Web → API authorization
# -----------------------------------------------------------

resource "auth0_client_grant" "web_api" {
  client_id = auth0_client.web.client_id
  audience  = auth0_resource_server.api.identifier

  scopes = keys(local.auth0_scopes)
}

# -----------------------------------------------------------
# Google OAuth
# -----------------------------------------------------------

resource "auth0_connection" "google" {
  name     = "google"
  strategy = "google-oauth2"

  options {
    client_id     = var.google_client_id
    client_secret = var.google_client_secret
  }
}

resource "auth0_connection_clients" "google" {
  connection_id = auth0_connection.google.id

  enabled_clients = [
    auth0_client.web.id,
  ]
}

# -----------------------------------------------------------
# Database Connection
# -----------------------------------------------------------

resource "auth0_connection" "database" {
  name     = "auth0-database"
  strategy = "auth0"

  options {
    password_policy = "good"

    brute_force_protection = true

    disable_signup = false

    requires_username = false

    enabled_database_customization = false
  }
}

resource "auth0_connection_client" "database_web" {
  connection_id = auth0_connection.database.id
  client_id     = auth0_client.web.id
}
