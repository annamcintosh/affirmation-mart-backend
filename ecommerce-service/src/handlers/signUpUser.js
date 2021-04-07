const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
// import { addUser } from "./addUser";
import { getUserById } from "./getUser";
import { createOrder } from "./createOrder";
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const dotenv = require("dotenv").config();

async function signUpUser(event, context) {
  const { email, name, password } = event.body;
  const now = new Date();

  if (!name || !email || !password) {
    throw new createError.Forbidden("Please enter all fields.");
  }

  const existingUser = await getUserById(email);
  if (existingUser) {
    throw new createError.Forbidden(
      "User with this email already exists. Please log in, use another email to register, or contact us for more help."
    );
  }

  const newUser = {
    id: email,
    sort: "CUSTOMER",
    data: name,
    password,
    accountBalance: 50,
    createdAt: now.toISOString(),
    shoppingOrder: "",
  };

  const params = {
    TableName: process.env.AFFIRMATION_TABLE_NAME,
    Item: newUser,
  };
  try {
    await dynamodb.put(params).promise();
    // const { id, name } = newUser;
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(newUser),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
  // bcrypt.genSalt(10, (err, salt) => {
  //   bcrypt.hash(newUser.password, salt, (err, hash) => {
  //     if (err) throw err;
  //     newUser.password = hash;
  //     return addUser(newUser).then((user) => {
  //       jwt.sign(
  //         { id: user.id },
  //         process.env.JWT_SECRET,
  //         { expiresIn: 3600 },
  //         (err, token) => {
  //           if (err) throw err;
  //           res.json({
  //             token,
  //             user: {
  //               id: user.id,
  //               name: user.name,
  //               accountBalance: user.accountBalance,
  //             },
  //           });
  //         }
  //       );
  //     });
  //   });
  // });
}

export const handler = commonMiddleware(signUpUser);
