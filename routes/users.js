var express = require("express");
const {
  signupUserController,
  loginUserController,
} = require("../controllers/userAuthController");
const {
  getProductsController,
  getProductByIDController,
} = require("../controllers/productsController");
const upload = require("../utils/uploadImage");
const UserPrivileges = require("../middlewares/protect");
const {
  getCart,
  addToCart,
  removeFromCart,
  checkoutCartController,
  handlePayment,
  paymentUserEndPoint,
  paymentSuccess,
} = require("../controllers/cartController");
const { getUserOrders } = require("../controllers/userOrdersController");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", upload.single("image"), signupUserController);
router.post("/login", loginUserController);

router.get("/products", getProductsController);
router.get("/products/:id", getProductByIDController);

router.get("/cart", UserPrivileges, getCart);
router.post("/cart/:id", UserPrivileges, addToCart);
router.delete("/cart/:id", UserPrivileges, removeFromCart);

router.get(
  "/cart/checkout",
  UserPrivileges,
  checkoutCartController,
  handlePayment,
  paymentUserEndPoint
);
router.get("/success", paymentSuccess);

router.get("/orders", UserPrivileges, getUserOrders);

module.exports = router;
