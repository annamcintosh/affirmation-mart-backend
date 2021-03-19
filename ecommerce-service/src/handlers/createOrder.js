import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getOrderByUserId } from "./getOrderByUserId";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createOrder(event, context) {
  // const { email } = event.requestContext.authorizer;
  const { userId, productId } = event.body;
  const now = new Date();

  const existingShoppingOrder = await getOrderByUserId(userId);

  if (existingShoppingOrder) {
    return existingShoppingOrder;
  }

  const order = {
    id: uuid(),
    sort: "SHOPPING",
    data: userId,
    createdAt: now.toISOString(),
    total: null,
    products: [productId],
    recipient: userId
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
