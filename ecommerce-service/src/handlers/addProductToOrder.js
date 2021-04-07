import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getOrderById } from "./getOrder";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function addProductToOrder(event, context) {
  const { id } = event.pathParameters;
  const { productId, unitPrice, name } = event.body;
  const order = await getOrderById(id);
  const { products, sort } = order;

  // Validation to ensure an order has not yet been placed.
  if (sort !== "SHOPPING") {
    throw new createError.Forbidden(
      "Whoops! You cannot add items to an order after it has been placed. Please contact us if you need some help with this order!"
    );
  }

  // // Validation to ensure this item does not already exist in the order.
  // for (let i = 0; i > products.length; i++) {
  //   if (products[i].productId === id) {
  //     throw new createError.Forbidden(
  //       "Whoops! You cannot add more than one of each item."
  //     );
  //   }
  // }

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set products = :productId",
    ExpressionAttributeValues: {
      ":productId": [...products, { productId, unitPrice, name }],
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

export const handler = commonMiddleware(addProductToOrder);
