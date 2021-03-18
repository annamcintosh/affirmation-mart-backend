import AWS from "aws-sdk";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function restockProduct(product) {
  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id: product.id },
    UpdateExpression: "set data = :data",
    ExpressionAttributeValues: {
      ":data": 25,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedProduct;

  try {
    const result = await dynamodb.update(params).promise();
    updatedProduct = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedProduct),
  };
}
