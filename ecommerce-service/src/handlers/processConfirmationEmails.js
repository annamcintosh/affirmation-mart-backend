import AWS from "aws-sdk";
import { getUserById } from "./getUser";

export async function processConfirmationEmails(userId, order) {
  const sqs = new AWS.SQS();
  const now = new Date();
  const currently = now.toISOString();

  const id = { id: userId };
  const user = await getUserById(id);

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: {
        recipient: "affirmation.mart@gmail.com",
        body: { order, user },
        template: "AFFIRMATION-ORDER-SELLER-CONFIRMED",
      },
    })
    .promise();

  const orderConfirmation = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: {
        recipient: userId,
        body: { order, user },
        template: "AFFIRMATION-ORDER-CONFIRMED",
      },
    })
    .promise();

  Promise.all([notifySeller, orderConfirmation]);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
  };
}
