var express = require("express");
const { loginAdminController } = require("../controllers/adminAuthController");
const upload = require("../utils/uploadImage");
const {
  addProductController,
  updateProductController,
  deleteProductController,
} = require("../controllers/productsController");
const AdminPrivileges = require("../middlewares/protectAdmin");
const {
  getAllOrders,
  getNotShippedOrders,
  markShipped,
} = require("../controllers/adminOrdersController");
var router = express.Router();

router.post("/login", loginAdminController);
router.post(
  "/products/add",
  AdminPrivileges,
  upload.single("image"),
  addProductController
);
router.patch(
  "/products/:id",
  AdminPrivileges,
  upload.single("image"),
  updateProductController
);
router.delete("/products/:id", AdminPrivileges, deleteProductController);

router.patch("/orders/shipping/:id", AdminPrivileges, markShipped);
router.get("/orders", AdminPrivileges, getAllOrders);
router.get("/orders/shipping", AdminPrivileges, getNotShippedOrders);

module.exports = router;
