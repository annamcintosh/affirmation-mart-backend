import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function updateShoppingOrderWithId(newOrderId, userId) {
  let updatedUser;

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { userId },
    UpdateExpression: "set shoppingOrder = :shoppingOrder",
    ExpressionAttributeValues: {
      ":shoppingOrder": newOrderId,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamodb.update(params).promise();
    updatedUser = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return updatedUser;
}

async function updateShoppingOrder(event, context) {
  const { newOrderId, userId } = event.body;
  const updatedUser = await updateShoppingOrderWithId(newOrderId, userId);

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
