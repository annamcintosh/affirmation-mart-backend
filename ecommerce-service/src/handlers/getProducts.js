import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getProducts(event, context) {
  let products;

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    IndexName: "sortAndData",
    KeyConditionExpression: "sort = :sort",
    ExpressionAttributeValues: {
      ":sort": "PRODUCT",
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    products = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
}

export const handler = commonMiddleware(getProducts);
