#!/bin/bash

set -e

echo "🔄 Limpando zips antigos..."
rm -f ./backend/event-manager/*.zip

echo "📦 Empacotando ..."


echo "📦 Buildando Lambda event-manager..."
cd backend/event-manager

npm i
npm run build

echo "📦 Empacotando Lambda event-manager..."
zip -r event_manager.zip dist node_modules
cd ../../
cd infra

echo "🧹 Limpando cache do Terraform..."
rm -rf .terraform .terraform.lock.hcl

echo "⚙️ Inicializando Terraform..."
terraform init

echo "✅ Executando Terraform Apply..."
terraform apply -auto-approve

echo "🌐 Atualizando .env.production com a URL da API..."
API_URL=$(terraform output -raw event_manager_api_url)
cd ../frontend

echo "REACT_APP_API_URL=$API_URL" > .env.production

echo "⚛️ Instalando dependências e buildando frontend React..."
npm install
npm run build

cd ../infra
NOME_DO_SEU_BUCKET=$(terraform output -raw s3_bucket_name)

echo "📤 Subindo build do React para o S3..."
aws s3 sync ../frontend/build/ s3://$NOME_DO_SEU_BUCKET --delete