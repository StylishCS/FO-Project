const User = require("../DB/Users.json");
const Product = require("../DB/Products.json");
const Order = require("../DB/Orders.json");
const path = require("path");
const fs = require("fs");
const { generateUID } = require("../utils/UUID");
const usersFilePath = path.resolve(__dirname, "..", "DB", "Users.json");
const orderFilePath = path.resolve(__dirname, "..", "DB", "Orders.json");

async function addToCart(req, res) {
  try {
    const product = Product.find((prod) => prod.id === req.params.id);
    if (!product) {
      return res.status(404).json("Product Not Found");
    }
    const user = User.find((u) => u.id === req.userId);
    if (!user) {
      return res.status(404).json("User Not Found");
    }
    const existingItemIndex = user.cart.findIndex(
      (item) => item.id === req.params.id
    );

    if (existingItemIndex !== -1) {
      user.cart[existingItemIndex].quantity += req.body.quantity;
      user.cart[existingItemIndex].price += product.price * req.body.quantity;
    } else {
      const cartItem = {
        id: product.id,
        quantity: req.body.quantity,
        price: product.price * req.body.quantity,
      };
      user.cart.push(cartItem);
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(User, null, 2));
    return res.status(200).json(user.cart);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function getCart(req, res) {
  try {
    const user = User.find((u) => u.id === req.userId);
    if (!user) {
      return res.status(404).json("User Not Found");
    }
    return res.status(200).json(user.cart ? user.cart : "Cart Empty");
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function removeFromCart(req, res) {
  try {
    const productId = req.params.id;
    const user = User.find((u) => u.id === req.userId);
    if (!user) {
      return res.status(404).json("User Not Found");
    }
    const index = user.cart.findIndex((item) => item.id === productId);
    if (index === -1) {
      return res.status(404).json("Product Not Found in Cart");
    }
    user.cart.splice(index, 1);
    fs.writeFileSync(usersFilePath, JSON.stringify(User, null, 2));
    return res.status(200).json(user.cart);
  } catch (error) {
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function checkoutCartController(req, res, next) {
  try {
    let data = {
      api_key: process.env.PAYMOB_API_KEY,
    };
    const user = User.find((u) => u.id === req.userId);
    let cart = user.cart;
    req.user = user;
    let totalPrice = 0;
    user.cart.forEach((item) => {
      totalPrice += item.price;
    });
    let order = {
      cart: cart,
      totalPrice: totalPrice,
    };
    req.order = order;
    let request = await fetch("https://accept.paymob.com/api/auth/tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    let response = await request.json();
    req.token = response.token;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function handlePayment(req, res, next) {
  try {
    let data = {
      auth_token: req.token,
      delivery_needed: "false",
      amount_cents: req.order.totalPrice * 100,
      currency: "EGP",
      items: [
        {
          name: "ASC1515",
          amount_cents: "500000",
          description: "Smart Watch",
          quantity: "1",
        },
        {
          name: "ERT6565",
          amount_cents: "200000",
          description: "Power Bank",
          quantity: "1",
        },
      ],
    };
    let request = await fetch(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    let response = await request.json();
    req.id = response.id;
    console.log("Response: ", response);
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function paymentUserEndPoint(req, res) {
  try {
    let arr = [];
    const cart = req.order.cart;
    for (const item of cart) {
      const prodId = item.id;
      arr.push(prodId);
    }

    let data = {
      auth_token: req.token,
      amount_cents: req.order.totalPrice * 100,
      expiration: 3600,
      order_id: req.id,
      billing_data: {
        apartment: "NA",
        email: req.user.email,
        floor: "NA",
        first_name: req.user.name.split(" ")[0],
        street: "NA",
        building: "NA",
        phone_number: "+201234567899",
        shipping_method: "NA",
        postal_code: "NA",
        city: "Shorouk",
        country: "EG",
        last_name: req.user.name.split(" ")[1]
          ? req.user.name.split(" ")[1]
          : "NA",
        state: "CAI",
      },
      currency: "EGP",
      integration_id: 4272185,
      lock_order_when_paid: "true",
    };
    let request = await fetch(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
    const filteredOrders = Order.filter((ord) => ord.user_id !== req.userId);
    fs.writeFileSync(orderFilePath, JSON.stringify(filteredOrders, null, 2));
    console.log("order id: ", req.id);
    const transaction = {
      id: generateUID(10),
      order_id: req.id,
      total_price: req.order.totalPrice,
      user_id: req.userId,
      paid: false,
      cart_items: arr,
    };
    // const userIndex = User.findIndex((user) => user.id === req.userId);
    // if (userIndex !== -1) {
    //   User[userIndex].orders.push(transaction);
    // } else {
    //   return res.status(404).json("User Not Found");
    // }
    Order.push(transaction);
    fs.writeFileSync(orderFilePath, JSON.stringify(Order, null, 2));
    let response = await request.json();
    let url = `https://accept.paymob.com/api/acceptance/iframes/793481?payment_token=${response.token}`;
    return res.status(200).json(url);
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

async function paymentSuccess(req, res) {
  try {
    // Test Mode Payment API Always returns with unsuccessful payment attempts
    // if (!req.query.success) {
    //   return res.status(400).json("Something Went Wrong");
    // }
    // let transaction = await Order.findOne({ order_id: req.query.order });
    let transaction = Order.find((ord) => ord.order_id == req.query.order);
    if (!transaction) {
      return res.status(400).json("Something Went Wrong");
    }
    // let user = await User.findById(transaction.user_id);
    let user = User.find((u) => u.id === transaction.user_id);
    if (!user) {
      return res.status(400).json("Something Went Wrong");
    }
    // await Order.findByIdAndDelete(transaction._id);
    const ordIdx = Order.findIndex((ord) => ord.id === transaction.id);
    Order[ordIdx].paid = true;
    Order[ordIdx].shipped = false;
    user.orders.push(Order[ordIdx]);
    user.cart.splice(0, user.cart.length);
    Order.splice(0, Order.length);
    fs.writeFileSync(usersFilePath, JSON.stringify(User, null, 2));
    fs.writeFileSync(orderFilePath, JSON.stringify(Order, null, 2));
    return res.redirect("https://www.google.com");
  } catch (error) {
    console.log(error);
    return res.status(500).json("INTERNAL SERVER ERROR");
  }
}

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  checkoutCartController,
  handlePayment,
  paymentSuccess,
  paymentUserEndPoint,
};
