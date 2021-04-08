const bcrypt = require("bcryptjs");

export default async function hashPass(password) {
  await bcrypt.genSalt(10, function (err, salt) {
    if (err)
      throw new createError.ServiceUnavailable(
        "Something went wrong. Try again, please!"
      );
    bcrypt.hash(password, salt, function (err, hash) {
      if (err)
        throw new createError.ServiceUnavailable(
          "Something went wrong. Try again, please!"
        );
      //   const password = hash;
      return hash;
    });
  });
}
