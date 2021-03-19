import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getOrderById } from "./getOrder";
import { getUserById } from "./getUser";
// import { getOrderTotal } from "../lib/getOrderTotal";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeOrder(event, context) {
  const { id } = event.pathParameters;
  // const { email } = event.requestContext.authorizer;
  const order = await getOrderById(id);
  const { total } = order;
  // // const newTotal = await getOrderTotal(products);

  // // Check to see if order has already been placed
  // if (sort === "PROCESSING" || sort === "FULFILLED") {
  //   throw new createError.Forbidden(
  //     "Whoops! You cannot place an order twice. Please contact us if you need some help with this order!"
  //   );
  // }
  const newTotal = total ? total + 5 : 30;
  // const accountBalance = 50;

  const user = await getUserById();
  const { accountBalance } = user;

  // Order total and account balance validation
  if (newTotal > accountBalance) {
    throw new createError.Forbidden(
      "Uh oh! You don't have quite enough in your account balance to place this order right now. Try removing some items or increasing your account balance."
    );
  }

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set #total = :total, #sort = :sort",
    ExpressionAttributeNames: {
      "#total": "total",
      "#sort": "sort",
    },
    ExpressionAttributeValues: {
      ":total": newTotal,
      ":sort": "PROCESSING",
    },
    ReturnValues: "ALL_NEW",
  };

  let placedOrder;

  try {
    const result = await dynamodb.update(params).promise();
    placedOrder = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(placedOrder),
  };
}

export const handler = commonMiddleware(placeOrder);
