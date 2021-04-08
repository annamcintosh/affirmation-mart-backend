import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getOrderById } from "./getOrder";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function removeProductFromOrder(event, context) {
  const { id } = event.pathParameters;
  const { productId, unitPrice } = event.body;

  const order = await getOrderById(id);
  const { products, sort, total } = order;
  const updatedProducts = products.filter(
    (product) => product.productId !== productId
  );

  // Validation to ensure the order has not yet been placed.
  if (sort !== "SHOPPING") {
    throw new createError.Forbidden(
      "Whoops! You cannot remove items from an order after it has been placed. Please contact us if you need some help with this order!"
    );
  }

  const newTotal = parseInt(total) - parseInt(unitPrice);

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set #products = :products, #total = :total",
    ExpressionAttributeNames: {
      "#products": "products",
      "#total": "total",
    },
    ExpressionAttributeValues: {
      ":products": updatedProducts,
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

export const handler = commonMiddleware(removeProductFromOrder);
