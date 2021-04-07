import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
// import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getShoppingOrderByUser(event, context) {
  const { id } = event.pathParameters;

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    IndexName: "sortAndData",
    KeyConditionExpression: "#sort = :sort AND #data = :data",
    ExpressionAttributeNames: {
      "#sort": "sort",
      "#data": "data",
    },
    ExpressionAttributeValues: {
      ":sort": "SHOPPING",
      ":data": id,
    },
  };

  let order;

  try {
    const result = await dynamodb.query(params).promise();
    order = result.Items[0];
  } catch (error) {
    return {
      message: "This is an error",
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(order),
  };
}

export const handler = commonMiddleware(getShoppingOrderByUser);
