import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
// import { getProductById } from "./getProduct";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeOrder(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const { email } = event.requestContext.authorizer;

//   const order = await getOrderById(id);

  // Order total and account balance validation
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      `You don't have quite enough funds in your account balance to order this right now. You need at least ${auction.highestBid.amount}`
    );
  }

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set highestBid.amount = :amount, highestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAuction;

  try {
    const result = await dynamodb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeOrder);
