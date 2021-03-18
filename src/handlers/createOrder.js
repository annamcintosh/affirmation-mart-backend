import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createOrder(event, context) {
  // const { email } = event.requestContext.authorizer;
  const now = new Date();

  const order = {
    id: uuid(),
    sort: "SHOPPING",
    data: "lovetosing94al@gmail.com",
    createdAt: now.toISOString(),
    total: 0,
    products: [],
    recipient: "lovetosing94al@gmail.com"
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
    body: JSON.stringify(order),
  };
}

export const handler = commonMiddleware(createOrder);
