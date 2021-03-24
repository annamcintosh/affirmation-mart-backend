import commonMiddleware from "../lib/commonMiddleware";
import createError from "http-errors";
import { addUser } from "./addUser";
import { getUserById } from "./getUser";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

async function registerUser(event, context) {
  const { email, name, password } = event.body;
  const now = new Date();

  if (!name || !email || !password) {
    throw new createError.Forbidden("Please enter all fields.");
  }

  const existingUser = await getUserById(email);
  if (!existingUser) {
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
  };

  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) throw err;
      newUser.password = hash;
      return addUser(newUser).then((user) => {
        jwt.sign(
          { id: user.id },
          process.env.JWT_SECRET,
          { expiresIn: 3600 },
          (err, token) => {
            if (err) throw err;
            res.json({
              token,
              user: {
                id: user.id,
                name: user.name,
                accountBalance: user.accountBalance,
              },
            });
          }
        );
      });
    });
  });
}

export const handler = commonMiddleware(registerUser);
