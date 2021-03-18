import AWS from "aws-sdk";
import commonMiddleware from "./commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getUsers(event, context) {
  let users;

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    IndexName: "sortAndData",
    KeyConditionExpression: "sort = :sort",
    ExpressionAttributeValues: {
      ":sort": "CUSTOMER",
    },
  };

  try {
    const result = await dynamodb.query(params).promise();

    users = result.Items;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(users),
  };
}

export const handler = commonMiddleware(getUsers);
