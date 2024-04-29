const jwt = require("jsonwebtoken");

async function AdminPrivileges(req, res, next) {
  try {
    if (!req.header("Authorization")) {
      return res.status(401).json("FORBIDDEN");
    }
    const key = req.header("Authorization").split(" ")[0];
    const token = req.header("Authorization").split(" ")[1];
    console.log(token);
    if (key !== process.env.JWT_ADMIN_KEYWORD) {
      console.log("flag1");
      return res.status(401).json("FORBIDDEN");
    }
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    if (decoded.id !== process.env.ADMIN_ID) {
      console.log("flag2");
      return res.status(401).json("FORBIDDEN");
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log("flag3");
    console.log(error);
    return res.status(401).json("FORBIDDEN");
  }
}

module.exports = AdminPrivileges;
