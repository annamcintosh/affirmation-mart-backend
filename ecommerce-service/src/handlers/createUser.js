import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import validator from "@middy/validator";
import createUserSchema from "../lib/schemas/createUserSchema";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function createUser(event, context) {
  const { id, name } = event.body;
  // const { email } = event.requestContext.authorizer;
  const now = new Date();

  const user = {
    id,
    sort: name,
    accountBalance: 50,
    data: now.toISOString(),
  };

  try {
    await dynamodb
      .put({
        TableName: process.env.AFFIRMATION_TABLE_NAME,
        Item: user,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 201,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(createUser).use(
  validator({ inputSchema: createUserSchema })
);
