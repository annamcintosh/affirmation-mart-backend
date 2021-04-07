import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateShoppingOrder(event, context) {
  const { id } = event.pathParameters;
  const { newOrder } = event.body;

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set shoppingOrder = :shoppingOrder",
    ExpressionAttributeValues: {
      ":shoppingOrder": newOrder,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedUser;

  try {
    const result = await dynamodb.update(params).promise();
    updatedUser = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(updatedUser),
  };
}

export const handler = commonMiddleware(updateShoppingOrder);
