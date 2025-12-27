resource "aws_budgets_budget" "monthly_spend_limit" {
  name        = "monthly-spend-notify"
  budget_type = "COST"
  time_unit   = "MONTHLY"

  budget_limit {
    amount = var.budget_limit_amount
    unit   = "USD"
  }

  notification {
    notification_type   = "ACTUAL"
    comparison_operator = "GREATER_THAN"
    threshold           = var.budget_threshold_value
    threshold_type      = "ABSOLUTE_VALUE"
  }

  subscriber {
    subscription_type = "EMAIL"
    address           = var.budget_email
  }
}