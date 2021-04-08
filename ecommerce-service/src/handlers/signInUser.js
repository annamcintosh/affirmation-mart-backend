import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getUserById } from "./getUser";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

async function signInUser(event, context) {
  const { email, password } = event.body;

  if (!email || !password) {
    throw new createError.Forbidden("Please enter all fields.");
  }

  const user = await getUserById(email);
  if (!user) {
    throw new createError.NotFound("User with this email does not exist.");
  }

  //Validate password
  bcrypt.compare(password, user.password).then((isMatch) => {
    if (!isMatch) throw new createError.Forbidden("Invalid credentials");

    jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        return ({
          token,
          user: {
            name: user.name,
            id: user.id,
          },
        });
      }
    );
  });
}

export const handler = commonMiddleware(signInUser);
