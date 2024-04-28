var express = require("express");
const { getProductsController } = require("../controllers/productsController");
var router = express.Router();
const UserPrivileges = require("../middlewares/protect");

router.get("/", UserPrivileges, getProductsController);

module.exports = router;
