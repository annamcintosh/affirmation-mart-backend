const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getUserById } from "./getUser";
import { createOrderWithId } from "./createOrder";
import { addUser } from "./addUser";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

async function signUpUser(event, context) {
  const { email, name, password } = event.body;
  const now = new Date();

  // validate that all fields were filled in
  if (!name || !email || !password) {
    throw new createError.Forbidden("Please enter all fields.");
  }

  // check to see if user already exists
  const existingUser = await getUserById(email);
  if (existingUser) {
    throw new createError.Forbidden(
      "User with this email already exists. Please log in, use another email to register, or contact us for more help."
    );
  }

  const newOrder = await createOrderWithId(email);

  const newUser = {
    id: email,
    sort: "CUSTOMER",
    data: name,
    password,
    accountBalance: 50,
    createdAt: now.toISOString(),
    shoppingOrder: newOrder.id ? newOrder.id : "",
  };

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      return addUser(newUser);
    });
  });

  // const token = jwt.sign(newUser.id, process.env.JWT_SECRET, {
  //   expiresIn: 86400,
  // });

  const newUserResponse = {
    id: newUser.id,
    name: newUser.data,
    shoppingOrder: newUser.shoppingOrder,
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify(newUserResponse),
  };
}

export const handler = commonMiddleware(signUpUser);
