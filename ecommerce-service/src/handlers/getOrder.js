import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";

const dynamodb = new AWS.DynamoDB.DocumentClient();

export async function getOrderById(id) {
  let order;

  try {
    const result = await dynamodb
      .get({
        TableName: process.env.AFFIRMATION_TABLE_NAME,
        Key: { id },
      })
      .promise();

    order = result.Item;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  if (!order) {
    throw new createError.NotFound(`Order with ID "${id}" not found.`);
  }

  return order;
}

// export async function getShoppingOrderByUser(userId) {
//   const params = {
//     TableName: process.env.AFFIRMATION_TABLE_NAME,
//     IndexName: "sortAndData",
//     KeyConditionExpression: "#sort = :sort AND #data = :data",
//     ExpressionAttributeNames: {
//       "#sort": "sort",
//       "#data": "data",
//     },
//     ExpressionAttributeValues: {
//       ":sort": "SHOPPING",
//       ":data": userId,
//     },
//   };
//   try {
//     const result = await dynamodb.query(params).promise();
//     return {
//       statusCode: 200,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Credentials": true,
//       },
//       body: JSON.stringify(result.Item),
//     };
//   } catch (error) {
//     return null;
//   }
// }

async function getOrder(event, context) {
  const { id } = event.pathParameters;
  const order = await getOrderById(id);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(order),
  };
}

export const handler = commonMiddleware(getOrder);
