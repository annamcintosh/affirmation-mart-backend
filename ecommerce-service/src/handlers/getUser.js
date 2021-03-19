import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getUserById(id) {
  let user;

  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AFFIRMATION_TABLE_NAME,
        Key: { id },
      })
      .promise();

    user = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!user) {
    throw new createError.NotFound(`User with ID "${id}" not found.`);
  }

  return user;
}

async function getUser(event, context) {
  const { id } = event.pathParameters;
  const user = await getUserById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(user),
  };
}

export const handler = commonMiddleware(getUser);
