import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { getUserById } from "./getUser";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

async function authenticateUser(event, context) {
  const { email, password } = event.body;

  if (!email || !password) {
    throw new createError.Forbidden("Please enter all fields.");
  }

  const existingUser = await getUserById(email);
  if (!existingUser) {
    throw new createError.NotFound("User with this email does not exist.");
  }

  //Validate password
  bcrypt.compare(password, user.password).then((isMatch) => {
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    jwt.sign(
      { id: user.email },
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      }
    );
  });
}

export const handler = commonMiddleware(authenticateUser);
