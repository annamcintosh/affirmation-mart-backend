import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getUserById } from "./getUser";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

async function signInUser(event, context) {
  const { email, password } = event.body;

  const eventPass = password;

  if (!email || !eventPass) {
    throw new createError.Forbidden("Please enter all fields.");
  }

  const newUser = await getUserById(email);
  if (!newUser) {
    throw new createError.NotFound("User with this email does not exist.");
  }

  const newUserResponse = {
    id: newUser.id,
    name: newUser.data,
    shoppingOrder: newUser.shoppingOrder,
  };

  //Validate password
  const isMatch = await bcrypt.compare(eventPass, newUser.password);
  if (!isMatch) {
    throw new createError.Forbidden("Invalid credentials");
  } else {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(newUserResponse),
    };
  }

  // jwt.sign(
  //   { id: user.id },
  //   process.env.JWT_SECRET,
  //   { expiresIn: 3600 },
  //   (err, token) => {
  //     if (err) throw err;
  //     return ({
  //       token,
  //       user: {
  //         name: user.name,
  //         id: user.id,
  //       },
  //     });
  //   }
  // );
}

export const handler = commonMiddleware(signInUser);
