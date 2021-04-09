import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
// import { getOrderById } from "./getOrder";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function updateOrderStatusById(newStatus, id) {
  let updatedOrder;

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set sort = :sort",
    ExpressionAttributeValues: {
      ":sort": newStatus,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamodb.update(params).promise();
    updatedOrder = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  return updatedOrder;
}

async function updateOrderStatus(event, context) {
  const { newStatus, id } = event.body;
  const updatedOrder = await updateOrderStatusById(newStatus, id);
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(updatedOrder),
  };
}

export const handler = commonMiddleware(updateOrderStatus);
