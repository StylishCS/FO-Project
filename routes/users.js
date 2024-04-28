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
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", upload.single("image"), signupUserController);
router.post("/login", loginUserController);
router.get("/products", getProductsController);
router.get("/products/:id", getProductByIDController);

module.exports = router;
