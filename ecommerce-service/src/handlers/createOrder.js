import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createOrder(event, context) {
  const { userId } = event.body;
  const now = new Date();

  const order = {
    id: uuid(),
    sort: "SHOPPING",
    data: userId,
    createdAt: now.toISOString(),
    total: null,
    products: [],
    recipient: userId,
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.AFFIRMATION_TABLE_NAME,
        Item: order,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(order),
  };
}

export const handler = commonMiddleware(createOrder);
