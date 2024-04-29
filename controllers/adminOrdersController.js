const User = require("../DB/Users.json");
const Product = require("../DB/Products.json");
const Order = require("../DB/Orders.json");
const path = require("path");
const fs = require("fs");
const { generateUID } = require("../utils/UUID");
const usersFilePath = path.resolve(__dirname, "..", "DB", "Users.json");
const orderFilePath = path.resolve(__dirname, "..", "DB", "Orders.json");

async function getAllOrders(req, res) {
  try {
    let allOrders = [];
    for (const user of User) {
      allOrders = allOrders.concat(user.orders);
    }
    return res.status(200).json(allOrders);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getNotShippedOrders(res, res) {
  try {
    let notShippedOrders = [];
    for (const user of User) {
      const userNotShippedOrders = user.orders.filter(
        (order) => !order.shipped
      );
      notShippedOrders = notShippedOrders.concat(userNotShippedOrders);
    }
    return res.status(200).json(notShippedOrders);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function markShipped(req, res) {
  try {
    for (const user of User) {
      const orderToUpdate = user.orders.find(
        (order) => order.id === req.params.id
      );
      if (orderToUpdate) {
        orderToUpdate.shipped = true;
        fs.writeFileSync(usersFilePath, JSON.stringify(User, null, 2));
        return res.status(200).json("Order Shipped");
      }
    }
    throw new Error();
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = { getAllOrders, getNotShippedOrders, markShipped };
