const AWS = require("aws-sdk");
const createError = require("http-errors");
const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function addUser(newUser) {
  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Item: newUser,
  };
  try {
    await dynamodb.put(params).promise();
    return newUser;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  // return newUser;
}
