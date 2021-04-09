export async function processConfirmationEmails(userId, id, order, user) {
  const sqs = new AWS.SQS();
  const now = new Date();
  const currently = now.toISOString();

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "New Order Placed",
        recipient: "affirmation.mart@gmail.com",
        body: {order, user, currently},
        template: "AFFIRMATION-ORDER-SELLER-CONFIRMED",
      }),
    })
    .promise();

    const orderConfirmation = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "Affirmation-Mart Order Confirmation",
        recipient: userId,
        body: {order, user},
        template: "AFFIRMATION-ORDER-CONFIRMED"
      }),
    })
    .promise();

  return Promise.all([notifySeller, orderConfirmation]);
}
