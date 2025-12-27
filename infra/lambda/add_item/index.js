const Joi = require("joi");
const { DynamoDB } = require("aws-sdk");

const docClient = new DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const items = JSON.parse(event.body);

  const schema = Joi.array().items(
    Joi.object({
      item: Joi.string().min(1).required(),
      quantidade: Joi.number().integer().min(1).required(),
      unidade_padrao: Joi.string().min(1).required(),
      unidade_medida: Joi.string().min(1).required(),
      name: Joi.string().min(1).optional()
    })
  );

  const { error } = schema.validate(items);
  if (error) {
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.details[0].message }),
    };
  }

  const updateItem = async ({ item, quantidade, unidade_padrao, unidade_medida,  name }) => {
    const params = {
      TableName: "PizzaPartyItems",
      Key: { item },
      UpdateExpression: "SET quantidade = if_not_exists(quantidade, :q), unidade_padrao = if_not_exists(unidade_padrao, :u), unidade_medida = if_not_exists(unidade_medida, :m)",
      ExpressionAttributeValues: {
        ":q": quantidade,
        ":u": unidade_padrao,
        ":m": unidade_medida
      },
      ReturnValues: "UPDATED_NEW"
    };

    if (name) {
      params.UpdateExpression = "ADD quemVaiLevar :p, " + params.UpdateExpression;
      params.ExpressionAttributeValues[":p"] = docClient.createSet([name]);
    }

    return docClient.update(params).promise();
  };

  await Promise.all(items.map(updateItem));

  return {
    statusCode: 200,
    headers: { "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ success: true }),
  };
};