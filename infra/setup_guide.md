# RPG2d Terraform Setup Guide

RPG2d のTerraform環境を新規セットアップするための手順。

このドキュメントでは、TerraformでAWS / Auth0 / Neon / Cloudflareのリソースを管理する前段階として、

- AWSアカウントの初期設定
- IAM Identity Center
- HCP Terraform
- AWS OIDC
- Auth0 M2M
- Neon API Key
- Cloudflare API Token
- HCP Terraformから各Providerへの疎通確認

までを扱う。

**実際のAWS / Auth0 / Neon / CloudflareリソースをTerraformで作成する手順は対象外。**

---

# 1. 全体構成

最終的なTerraform実行環境は以下。

```text
                        HCP Terraform
                              │
                ┌─────────────┼─────────────┐
                │             │             │
              OIDC          M2M          API Key
                │             │             │
                ▼             ▼             ▼
              AWS           Auth0          Neon
                │
                │
          API / Lambda

                HCP Terraform
                      │
                 API Token
                      │
                      ▼
                 Cloudflare
```

Terraform Provider：

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
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
```

---

# 2. AWSアカウント初期設定

## 2.1 Root User

AWSアカウント作成直後はRoot Userが存在する。

Root Userは通常のAWS操作には使用しない。

最低限、

- Root UserにMFAを設定
- Root Userの認証情報を安全に保管
- 日常的なAWS操作にはRoot Userを使用しない

としておく。

---

# 3. IAM Identity Center

AWSコンソールへ日常的にログインするため、IAM Identity Centerを使用する。

## 3.1 Identity Centerを有効化

AWS Consoleから、

```text
IAM Identity Center
```

を有効化する。

- 単一AWSアカウントで利用する個人開発環境では、必要以上に複雑な構成にしない。
  - 単一リージョン設定にすると、AWSマネージドのKMSキーが利用されるため、無料範囲で利用できる。

## 3.2 ユーザー作成

普段利用するユーザーを作成する。

Root Userと同じメールアドレスをIdentity Center Userに使用すること自体は問題ない。

例：

```text
Username:
tetsup

Email:
<Root Userと同じメールアドレス>
```

Root UserとIdentity Center Userは別の認証主体。

## 3.3 Permission Set

日常利用用のPermission Setを作成する。

- AdministratorAccessを常用する必要はない。
- Terraform用の権限はIdentity Centerのユーザー権限とは分離する。

---

# 4. HCP Terraform

HCP TerraformでOrganizationとWorkspaceを作成する。

例：

```text
Organization
  tetsup

Project
  rpg2d

Workspace
  rpg2d-demo
```

実際の名前は環境に合わせる。

Terraform実行はこのWorkspaceから行う。

---

# 5. AWS - HCP Terraform OIDC

AWSについては長期IAM UserをTerraform用に作成しない。

HCP TerraformのWorkload Identityを利用して、

```text
HCP Terraform
    │
    │ OIDC
    ▼
AWS IAM Role
    │
    │ AssumeRoleWithWebIdentity
    ▼
AWS
```

という構成にする。

## 5.1 HCP Terraform側

AWSのDynamic Credentials / Workload Identityで、

```text
Workload Type:
Workspace Run

Organization:
<tfc organization>

Workspace:
<tfc workspace>
```

を指定する。

ProjectやRun Phaseについては、実際のHCP Terraform / AWS側のUIで提供される設定に合わせる。

## 5.2 AWS側

HCP TerraformのOIDC ProviderをTrusted EntityとしてIAM Roleを作成する。

このRoleをTerraform実行用Roleとする。

Trust Policyでは、

```text
app.terraform.io:aud
    aws.workload.identity

app.terraform.io:sub
    organization:<organization>:...:workspace:<workspace>:...
```

のようにHCP TerraformのWorkspaceを識別して信頼対象を絞る。

不要なWorkspaceからAssumeRoleできないようにする。

以下のポリシーを許可する

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "TerraformLambda",
      "Effect": "Allow",
      "Action": [
        "lambda:CreateFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration",
        "lambda:DeleteFunction",
        "lambda:CreateFunctionUrlConfig",
        "lambda:GetFunctionUrlConfig",
        "lambda:UpdateFunctionUrlConfig",
        "lambda:DeleteFunctionUrlConfig",
        "lambda:AddPermission",
        "lambda:GetPolicy",
        "lambda:RemovePermission",
        "lambda:ListTags",
        "lambda:TagResource",
        "lambda:UntagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TerraformCloudFront",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateDistribution",
        "cloudfront:GetDistribution",
        "cloudfront:GetDistributionConfig",
        "cloudfront:UpdateDistribution",
        "cloudfront:DeleteDistribution",
        "cloudfront:CreateOriginAccessControl",
        "cloudfront:GetOriginAccessControl",
        "cloudfront:UpdateOriginAccessControl",
        "cloudfront:DeleteOriginAccessControl",
        "cloudfront:GetCachePolicy",
        "cloudfront:GetOriginRequestPolicy",
        "cloudfront:ListDistributions",
        "cloudfront:ListOriginAccessControls",
        "cloudfront:ListCachePolicies",
        "cloudfront:ListOriginRequestPolicies",
        "cloudfront:TagResource",
        "cloudfront:UntagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TerraformCloudWatchLogs",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:DescribeLogGroups",
        "logs:PutRetentionPolicy",
        "logs:DeleteLogGroup",
        "logs:ListTagsForResource",
        "logs:TagResource",
        "logs:UntagResource"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TerraformS3",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:GetBucketLocation",
        "s3:GetBucketTagging",
        "s3:PutBucketTagging",
        "s3:DeleteBucket",
        "s3:GetBucketPolicy",
        "s3:PutBucketPolicy",
        "s3:DeleteBucketPolicy",
        "s3:GetBucketPublicAccessBlock",
        "s3:PutBucketPublicAccessBlock",
        "s3:GetBucketOwnershipControls",
        "s3:PutBucketOwnershipControls"
      ],
      "Resource": "*"
    },
    {
      "Sid": "TerraformIAM",
      "Effect": "Allow",
      "Action": [
        "iam:CreateRole",
        "iam:GetRole",
        "iam:UpdateRole",
        "iam:DeleteRole",
        "iam:PutRolePolicy",
        "iam:GetRolePolicy",
        "iam:DeleteRolePolicy",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:ListRoleTags"
      ],
      "Resource": "*"
    }
  ]
}
```

---

# 6. Auth0 - Terraform用M2M

Auth0はTerraform専用のMachine-to-Machine Applicationを作成する。

## 6.1 M2M Application

Auth0 Dashboard：

```text
Applications
  → Applications
  → Create Application
  → Machine to Machine Applications
```

Terraform専用M2Mを作成。

**Third-party Applicationではなく、通常のM2M Applicationを使用する。**

Third-party Applicationでは今回必要なManagement API permissionを設定できなかった。

## 6.2 Auth0 Management API

作成したM2M Applicationから、

```text
APIs
  → Auth0 Management API
```

をAuthorizeする。

疎通確認では、

```text
read:clients
```

を付与。

必要なManagement API permissionは、Terraformで実際に管理するAuth0リソースに応じて追加する。

## 6.3 HCP Terraform Variables

以下をHCP Terraformに登録。

```hcl
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
```

Domainは、

```text
dev-gm1mf8ohdiplhsic.us.auth0.com
```

のようなTenant Domain。

`https://` や `/api/v2/` は含めない。

---

# 7. Google OAuth Setup

RPG2DのGoogleログイン用OAuth Clientを作成する。

## 7.1 Google Cloud Project

Google Cloud ConsoleでRPG2D用のProjectを作成・選択する。

## 7.2 Google Auth Platform

Google Auth Platformを開き、アプリ情報を設定する。

- App name: `RPG2D`
- User support email: 自分のメールアドレス
- Developer contact information: 自分のメールアドレス

## 7.3 Audience

Audienceを以下に設定する。

```text
External
```

開発中は必要なGoogleアカウントをTest Usersに追加する。

## 7.4 OAuth Clientを作成

ClientsからOAuth Clientを作成する。

- Application type: `Web application`
- Name: `RPG2D Auth0`

Authorized redirect URIにAuth0のCallback URLを登録する。

```text
https://<AUTH0_DOMAIN>/login/callback
```

## 7.5 Credentialを保存

作成された以下の値をVariablesに登録する。

```hcl
variable "google_client_id" {
  description = "Google OAuth Client ID for Auth0 Connection"
  type = string
  sensitive = true
}

variable "google_client_secret" {
  description = "Google OAuth Client Secret for Auth0 Connection"
  type = string
  sensitive = true
}
```

---

# 8. Neon - API Key

NeonはTerraform Provider用のAPI Keyを作成する。

## 8.1 API Key

Neon ConsoleからAPI Keyを作成する。

Organization Settingsから、Project-scoped API keyを作成する。

## 8.2 HCP Terraform

Project IDとAPI KeyをHCP TerraformのVariableとして登録。

```hcl
variable "neon_project_id" {
  description = "Neon Project ID"
  type        = string
  sensitive   = true
}

variable "neon_api_key" {
  description = "Neon API key"
  type        = string
  sensitive   = true
}
```

## 8.3 Terraform Provider

```hcl
provider "neon" {
  api_key=var.neon_api_key
}
```

としてAPI KeyをProviderに渡す。
