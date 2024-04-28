const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
async function loginAdminController(req, res) {
  try {
    if (req.body.username !== process.env.ADMIN_USER) {
      return res.status(404).json("Wrong Username Or Password");
    }
    const valid = bcrypt.compareSync(
      req.body.password,
      process.env.ADMIN_PASSWORD
    );
    if (!valid) {
      return res.status(404).json("Wrong Username Or Password");
    }
    const token = jwt.sign(
      { id: process.env.ADMIN_ID },
      process.env.JWT_ADMIN_SECRET,
      {}
    );
    return res.status(200).json(token);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { loginAdminController };
