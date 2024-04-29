const User = require("../DB/Users.json");

async function getUserOrders(req, res) {
  try {
    const user = User.find((u) => u.id === req.userId);
    if (!user) {
      return res.status(404).json("User Not Found");
    }
    return res.status(200).json(user.orders);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { getUserOrders };
