import AWS from "aws-sdk";
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getOrderById } from "./getOrder";
import { getUserById } from "./getUser";
import { updateOrderStatusById } from "./updateOrderStatus";
import { createOrderWithId } from "./createOrder";
import { updateShoppingOrderWithId } from "./updateShoppingOrder";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeOrder(event, context) {
  const { id } = event.pathParameters;
  const { userId } = event.body;

  const order = await getOrderById(id);
  const { total, sort } = order;

  // Check to see if the order exists.
  if (!order) {
    throw new createError.NotFound(`Order with ID "${id}" not found.`);
  }

  // Check to see if order has already been placed
  if (sort === "PROCESSING" || sort === "FULFILLED") {
    throw new createError.Forbidden(
      "Whoops! You cannot place an order twice. Please contact us if you need some help with this order!"
    );
  }

  // Order total and account balance validation
  if (total > 50) {
    throw new createError.Forbidden(
      "Uh oh! You don't have quite enough in your account balance to place this order right now. Try removing some items or increasing your account balance."
    );
  }

  // update order status
  // initialize SQS for confirmation
  // create new order
  // update order in user
  // initialize SQS for order

  try {
    const newStatusPending = "PENDING";
    const newStatusFulfilled = "FULFILLED";
    const newOrderStatusPending = await updateOrderStatusById(
      newStatusPending,
      id
    );
    const newOrder = await createOrderWithId(userId);
    const newOrderId = newOrder.id;
    const updateUserOrder = await updateShoppingOrderWithId(newOrderId, userId);
    const newOrderStatusFulfilled = await updateOrderStatusById(
      newStatusFulfilled,
      id
    );
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(updateUserOrder)
  };
}

export const handler = commonMiddleware(placeOrder);
