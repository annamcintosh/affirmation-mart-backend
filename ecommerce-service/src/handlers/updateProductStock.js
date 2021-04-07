import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
// import { getOrderById } from "./getOrder";
import { getProductById } from './getProduct'

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function updateProductStock(event, context) {
  const { id } = event.pathParameters;
  const { orderedStock } = event.body;

  const product = await getProductById(id);
  const { stockNumber, data } = product;

  // Validation to ensure the item is in stock.
  if (data === "outOfStock") {
    throw new createError.Forbidden(
      `Uh oh! It looks like the ${product} is out of stock. Please check back tomorrow to see if there's a restock!`
    );
  }

  // Validation to ensure enough stock exists.
  if (orderedStock > stockNumber) {
    throw new createError.Forbidden(
      `Uh oh! We don't have enough of the ${product} to fulfill your order. We only have ${stockNumber} in stock right now. Please adjust your order or contact us if you need some help with this order!`
    );
  }

  const newStockNumber = stockNumber - orderedStock;

  let params;

  if (newStockNumber === 0) {
    params = {
      TableName: process.env.AFFIRMATION_TABLE_NAME,
      Key: { id },
      UpdateExpression: "set stockNumber = :stockNumber, data = :data",
      ExpressionAttributeValues: {
        ":stockNumber": newStockNumber,
        ":data": "outOfStock",
      },
      ReturnValues: "ALL_NEW",
    };
  } else {
    params = {
      TableName: process.env.AFFIRMATION_TABLE_NAME,
      Key: { id },
      UpdateExpression: "set stockNumber = :stockNumber",
      ExpressionAttributeValues: {
        ":stockNumber": newStockNumber,
      },
      ReturnValues: "ALL_NEW",
    };
  }

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

export const handler = commonMiddleware(updateProductStock);
