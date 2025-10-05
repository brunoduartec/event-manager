variable "budget_email" {
  description = "Email para receber notificações do AWS Budget"
  type        = string
}

variable "budget_limit_amount" {
  description = "Limite mensal (USD) do orçamento - use um valor muito baixo para testes"
  type        = string
  default     = "1"
}

variable "budget_threshold_value" {
  description = "Valor em USD que aciona a notificação (ABSOLUTE_VALUE). Deve ser <= budget_limit_amount."
  type        = number
  default     = 0.01
}