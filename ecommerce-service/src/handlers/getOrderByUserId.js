import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
// import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getShoppingOrderByUser(userId) {

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
      ":data": userId,
    },
  };

  try {
    const result = await dynamodb.query(params).promise();
    return result.Items[0];
  } catch (error) {
    return {
      message: "This is an error",
    };
  }
}

async function getOrderByUserId(event, context) {
  const { id } = event.pathParameters;
  const order = await getShoppingOrderByUser(id);

  return {
    statusCode: 200,
    body: JSON.stringify(order),
  };
}

export const handler = commonMiddleware(getOrderByUserId);
