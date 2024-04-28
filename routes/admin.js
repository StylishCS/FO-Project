var express = require("express");
const { loginAdminController } = require("../controllers/adminAuthController");
const upload = require("../utils/uploadImage");
const {
  addProductController,
  updateProductController,
  deleteProductController,
} = require("../controllers/productsController");
const AdminPrivileges = require("../middlewares/protectAdmin");
var router = express.Router();

router.post("/login", loginAdminController);
router.post(
  "/products/add",
  AdminPrivileges,
  upload.single("image"),
  addProductController
);
router.put(
  "/products/:id",
  AdminPrivileges,
  upload.single("image"),
  updateProductController
);

router.delete("/products/:id", AdminPrivileges, deleteProductController);

module.exports = router;
