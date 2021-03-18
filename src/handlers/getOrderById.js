import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getOrderById(id) {
  let order;

  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AFFIRMATION_TABLE_NAME,
        Key: { id },
      })
      .promise();

    order = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!order) {
    throw new createError.NotFound(`Order with ID "${id}" not found.`);
  }

  return order;
}

async function getOrder(event, context) {
  const { id } = event.pathParameters;
  const order = await getOrderById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(order),
  };
}

export const handler = commonMiddleware(getOrder);
