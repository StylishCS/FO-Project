const fs = require("fs");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const usersFilePath = path.resolve(__dirname, "..", "DB", "Users.json");
const Users = require("../DB/Users.json");

function generateUID(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function signupUserController(req, res) {
  try {
    const user = req.body;

    const existingUser = Users.find(
      (existingUser) => existingUser.email === user.email
    );
    if (existingUser) {
      return res.status(400).json("Email already exists");
    }

    const userId = generateUID(10);

    user.id = userId;
    user.password = bcrypt.hashSync(user.password, 10);
    if (req.file) {
      user.image = `http://127.0.0.1:3000/${req.file.filename}`;
    }
    Users.push(user);
    fs.writeFileSync(usersFilePath, JSON.stringify(Users, null, 2));
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {});
    return res.render("index", { user: user, token: token });
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function loginUserController(req, res) {
  try {
    const user = Users.find((user) => user.email === req.body.email);
    if (!user) {
      return res.status(404).json("User Not Found");
    }
    const valid = bcrypt.compareSync(req.body.password, user.password);
    if (!valid) {
      return res.status(401).json("Wrong Email or Password");
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {});
    return res.render("index", { user: user, token: token });
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { signupUserController, loginUserController };
