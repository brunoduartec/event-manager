const Joi = require("joi");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

exports.handler = async (event) => {
  const item = decodeURIComponent(event.pathParameters.item);
  const body = JSON.parse(event.body);
  const { quantidade, unidade_padrao, unidade_medida, quemVaiLevar, remover } = body;

  const schema = Joi.object({
    quantidade: Joi.number().integer().min(1).optional(),
    unidade_padrao: Joi.string().min(1).optional(),
    unidade_medida: Joi.string().min(1).optional(),
    quemVaiLevar: Joi.array().items(Joi.string().min(1)).optional(),
    remover: Joi.string().min(1).optional()
  });

  const { error } = schema.validate({ quantidade, unidade_padrao, unidade_medida, quemVaiLevar, remover });
  if (error) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.details[0].message }),
    };
  }

  let UpdateExpression = [];
  let ExpressionAttributeValues = {};
  let ExpressionAttributeNames = {};

  if (quantidade !== undefined) {
    UpdateExpression.push("#q = :q");
    ExpressionAttributeValues[":q"] = quantidade;
    ExpressionAttributeNames["#q"] = "quantidade";
  }

  if (unidade_padrao !== undefined) {
    UpdateExpression.push("#u = :u");
    ExpressionAttributeValues[":u"] = unidade_padrao;
    ExpressionAttributeNames["#u"] = "unidade_padrao";
  }

  if (unidade_medida !== undefined) {
    UpdateExpression.push("#u = :u");
    ExpressionAttributeValues[":u"] = unidade_medida;
    ExpressionAttributeNames["#u"] = "unidade_medida";
  }

  if (quemVaiLevar !== undefined) {
    // Não implementado: PATCH para adicionar pessoa. Use PUT/update_item para adicionar/atualizar.
  }

  if (remover !== undefined) {
    const data = await docClient.get({
      TableName: "PizzaPartyItems",
      Key: { item }
    }).promise();

    const listaAtual = Array.isArray(data.Item?.quemVaiLevar) ? data.Item.quemVaiLevar : [];
    // Remove pelo nome
    const novaLista = listaAtual.filter(obj => obj.nome !== remover);

    if (JSON.stringify(listaAtual) !== JSON.stringify(novaLista)) {
      UpdateExpression.push("#quemVaiLevar = :novaLista");
      ExpressionAttributeValues[":novaLista"] = novaLista;
      ExpressionAttributeNames["#quemVaiLevar"] = "quemVaiLevar";
    }
  }

  if (UpdateExpression.length === 0) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Nenhum campo para atualizar." }),
    };
  }

  const updateParams = {
    TableName: "PizzaPartyItems",
    Key: { item },
    UpdateExpression: "SET " + UpdateExpression.join(", "),
    ExpressionAttributeValues,
    ReturnValues: "UPDATED_NEW",
    // só inclui ExpressionAttributeNames se não estiver vazio
    ...(Object.keys(ExpressionAttributeNames).length > 0 && { ExpressionAttributeNames })
  };

  await docClient.update(updateParams).promise();

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ success: true }),
  };
};