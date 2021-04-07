import { v4 as uuid } from "uuid";
import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import validator from "@middy/validator";
import createProductSchema from "../lib/schemas/createProductSchema";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createProduct(event, context) {
  const { name, unitPrice, description, image, seller } = event.body;
  // const { email } = event.requestContext.authorizer;
  const now = new Date();

  const product = {
    id: uuid(),
    sort: "PRODUCT",
    data: seller,
    name,
    description,
    image,
    unitPrice,
    stockNumber: 25,
    createdAt: now.toISOString(),
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.AFFIRMATION_TABLE_NAME,
        Item: product,
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
    body: JSON.stringify(product),
  };
}

export const handler = commonMiddleware(createProduct).use(
  validator({ inputSchema: createProductSchema })
);
