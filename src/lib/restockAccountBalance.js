import AWS from "aws-sdk";
import commonMiddleware from "./commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function restockAccountBalance(user) {
  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id: user.id },
    UpdateExpression: "set data = :data",
    ExpressionAttributeValues: {
      ":data": 50,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAccountBalance;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAccountBalance = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAccountBalance),
  };
}
