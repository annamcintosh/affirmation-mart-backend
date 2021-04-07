import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateOrderTotal(event, context) {
  const { id } = event.pathParameters;
  const { newTotal } = event.body;

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set #total = :total",
    ExpressionAttributeNames: {
      "#total": "total",
    },
    ExpressionAttributeValues: {
      ":total": newTotal,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedOrder;

  try {
    const result = await dynamodb.update(params).promise();
    updatedOrder = result.Attributes;
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
    body: JSON.stringify(updatedOrder),
  };
}

export const handler = commonMiddleware(updateOrderTotal);
