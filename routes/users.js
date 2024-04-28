var express = require("express");
const {
  signupUserController,
  loginUserController,
} = require("../controllers/userAuthController");
const upload = require("../utils/uploadImage");
const UserPrivileges = require("../middlewares/protect");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", upload.single("image"), signupUserController);
router.post("/login", loginUserController);



module.exports = router;
