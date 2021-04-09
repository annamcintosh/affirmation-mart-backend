export async function processOrderEmails(userId, id, order, user) {
  const sqs = new AWS.SQS();
  const now = new Date();
  const currently = now.toISOString();

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: " Order Completed",
        recipient: "affirmation.mart@gmail.com",
        body: {order, user, currently},
        template: "AFFIRMATION-ORDER-SELLER-COMPLETED",
      }),
    })
    .promise();

  const orderCompletion = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "Your affirmations have arrived!",
        recipient: userId,
        body: {order, user},
        template: "AFFIRMATION-ORDER-COMPLETED",
      }),
    })
    .promise();

  return Promise.all([notifySeller, orderCompletion]);
}
