const Joi = require("joi");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });

exports.handler = async (event) => {
  const item = decodeURIComponent(event.pathParameters.item);
  const body = JSON.parse(event.body);
  const { quantidade, unidade_padrao, unidade_medida, quemVaiLevar } = body;

  const schema = Joi.object({
    quantidade: Joi.number().integer().min(1).optional(),
    unidade_padrao: Joi.string().min(1).optional(),
    unidade_medida: Joi.string().min(1).optional(),

    quemVaiLevar: Joi.array().items(
      Joi.object({
        nome: Joi.string().min(1).required(),
        quantidade: Joi.number().integer().min(1).required()
      })
    ).optional()
  });

  const { error } = schema.validate({ quantidade, unidade_padrao, unidade_medida, quemVaiLevar });
  if (error) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.details[0].message }),
    };
  }

  // Atualiza quemVaiLevar como array de objetos {nome, quantidade}
  let updateFields = {};
  if (unidade !== undefined) updateFields.unidade = unidade;

  if (quemVaiLevar && Array.isArray(quemVaiLevar)) {
    // Busca o item atual
    const data = await docClient.get({ TableName: "PizzaPartyItems", Key: { item } }).promise();
    let lista = Array.isArray(data.Item?.quemVaiLevar) ? data.Item.quemVaiLevar : [];
    const totalDisponivel = data.Item?.quantidade || 0;
    // Atualiza ou adiciona cada pessoa
    quemVaiLevar.forEach(novo => {
      lista = lista.filter(obj => obj.nome !== novo.nome);
      lista.push({ nome: novo.nome, quantidade: novo.quantidade });
    });
    // Soma das quantidades
    const soma = lista.reduce((acc, obj) => acc + (obj.quantidade || 0), 0);
    if (soma > totalDisponivel) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `A soma das quantidades (${soma}) excede o total disponível (${totalDisponivel})!` }),
      };
    }
    updateFields.quemVaiLevar = lista;
  }

  if (Object.keys(updateFields).length === 0) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Nenhum campo para atualizar." }),
    };
  }

  // Monta UpdateExpression dinamicamente
  let UpdateExpression = 'SET ' + Object.keys(updateFields).map((k, idx) => `#${k} = :${k}`).join(', ');
  let ExpressionAttributeNames = {};
  let ExpressionAttributeValues = {};
  Object.keys(updateFields).forEach(k => {
    ExpressionAttributeNames[`#${k}`] = k;
    ExpressionAttributeValues[`:${k}`] = updateFields[k];
  });

  await docClient.update({
    TableName: "PizzaPartyItems",
    Key: { item },
    UpdateExpression,
    ExpressionAttributeNames,
    ExpressionAttributeValues,
    ReturnValues: "UPDATED_NEW"
  }).promise();

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ success: true }),
  };
};