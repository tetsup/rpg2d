terraform {
  required_version = "1.15.8"

  cloud {
    organization = "tetsup"

    workspaces {
      name = "rpg2d-dev"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.60"
    }

    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.23"
    }

    auth0 = {
      source  = "auth0/auth0"
      version = "~> 1.54"
    }

    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.15"
    }
  }
}
