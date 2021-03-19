import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getOrderById } from "./getOrder";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function addProductToOrder(event, context) {
  const { id } = event.pathParameters;
  const { productId } = event.body;
  const order = await getOrderById(id);
  const { products, sort } = order;

  // Validation to ensure an order has not yet been placed.
  if (sort !== "SHOPPING") {
    throw new createError.Forbidden(
      "Whoops! You cannot add items to an order after it has been placed. Please contact us if you need some help with this order!"
    );
  }

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set products = :productId",
    ExpressionAttributeValues: {
      ":productId": [...products, productId],
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
    body: JSON.stringify(updatedOrder),
  };
}

export const handler = commonMiddleware(addProductToOrder);
