provider "aws" {
  region = "sa-east-1"
}

resource "random_id" "suffix" {
  byte_length = 4
}

# IAM
resource "aws_iam_role" "lambda_role" {
  name = "lambda_event-manager_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy_attachment" "lambda_basic" {
  name       = "lambda-logs"
  roles      = [aws_iam_role.lambda_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "dynamodb_policy" {
  name = "dynamodb-access"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = [
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem"
        ]
        Resource = [
          aws_dynamodb_table.event-manager_items.arn,
          "${aws_dynamodb_table.event-manager_items.arn}/*"
        ]
      }
    ]
  })
}

# DynamoDB
resource "aws_dynamodb_table" "event-manager_items" {
  name         = "EventManagerItems"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "item"

  attribute {
    name = "item"
    type = "S"
  }
}

# Lambda Functions
resource "aws_lambda_function" "event_manager" {
  filename         = "${path.module}/../backend/event-manager/event_manager.zip"
  function_name    = "event_manager"
  handler          = "dist/lambda.handler"
  runtime          = "nodejs20.x"
  role             = aws_iam_role.lambda_role.arn
  source_code_hash = filebase64sha256("${path.module}/../backend/event-manager/event_manager.zip")
}

# API Gateway
resource "aws_apigatewayv2_api" "http_api" {
  name          = "event-manager"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "PATCH", "OPTIONS"]
    allow_headers = ["content-type"]
  }
}

resource "aws_apigatewayv2_integration" "event_manager" {
  api_id                 = aws_apigatewayv2_api.http_api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.event_manager.invoke_arn
  integration_method     = "POST"
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "event_manager_default_route" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.event_manager.id}"
}

resource "aws_apigatewayv2_stage" "prod" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "prod"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_event_manager" {
  statement_id  = "AllowAPIGatewayInvokeEventManager"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.event_manager.arn
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*"
}

# S3 Static Site
resource "aws_s3_bucket" "event-manager_site" {
  bucket = "event-manager-party-site-${random_id.suffix.hex}"

  website {
    index_document = "index.html"
    error_document = "index.html"
  }

  tags = {
    Name = "EventManagerStaticSite"
  }
}

resource "aws_s3_bucket_ownership_controls" "event-manager_site_controls" {
  bucket = aws_s3_bucket.event-manager_site.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "event-manager_site_block" {
  bucket                  = aws_s3_bucket.event-manager_site.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "event-manager_site_policy" {
  bucket = aws_s3_bucket.event-manager_site.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = "*",
      Action = ["s3:GetObject"],
      Resource = "${aws_s3_bucket.event-manager_site.arn}/*"
    }]
  })
}


# Outputs
output "s3_static_site_url" {
  value = aws_s3_bucket.event-manager_site.bucket_regional_domain_name
}

output "s3_bucket_name" {
  value = aws_s3_bucket.event-manager_site.id
}

output "event_manager_api_url" {
  value = "${aws_apigatewayv2_api.http_api.api_endpoint}/${aws_apigatewayv2_stage.prod.name}"
}