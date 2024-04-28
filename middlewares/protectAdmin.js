const jwt = require("jsonwebtoken");

async function AdminPrivileges(req, res, next) {
  try {
    if (!req.header("Authorization")) {
      return res.status(401).json("FORBIDDEN");
    }
    const key = req.header("Authorization").split(" ")[0];
    const token = req.header("Authorization").split(" ")[1];
    if (key !== process.env.JWT_ADMIN_KEYWORD) {
      return res.status(401).json("FORBIDDEN");
    }
    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    if (decoded.id !== process.env.ADMIN_ID) {
      return res.status(401).json("FORBIDDEN");
    }
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json("FORBIDDEN");
  }
}

module.exports = AdminPrivileges;
