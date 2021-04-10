import AWS from "aws-sdk";
import { getUserById } from "./getUser";

export async function processOrderEmails(userId, order) {
  const sqs = new AWS.SQS();
  const now = new Date();
  const currently = now.toISOString();

  const id = { id: userId };
  const user = await getUserById(id);

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: {
        subject: " Order Completed",
        recipient: "affirmation.mart@gmail.com",
        body: { order, user, currently },
        template: "AFFIRMATION-ORDER-SELLER-COMPLETED",
      },
    })
    .promise();

  const orderCompletion = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: {
        subject: "Your affirmations have arrived!",
        recipient: userId,
        body: { order, user },
        template: "AFFIRMATION-ORDER-COMPLETED",
      },
    })
    .promise();

  return Promise.all([notifySeller, orderCompletion]);
}
