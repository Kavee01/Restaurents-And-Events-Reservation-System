var express = require("express");
var userController = require("../controllers/user");
var securityMiddleware = require("../middlewares/security");
var router = express.Router();

router.get("/login", userController.getLoginDetails);
router.post("/login", userController.loginUser);
router.post("/create", userController.createUser);
router.post(
  "/logout",
  securityMiddleware.checkLogin,
  userController.logoutUser
);
router.get("/check-admin", userController.checkAdmin);

// Add update user route
router.put(
  "/update",
  securityMiddleware.checkLogin,
  userController.updateUser
);

// Password reset routes
router.post("/forgot-password", userController.forgotPassword);
router.get("/reset-password/:token", userController.validateResetToken);
router.post("/reset-password", userController.resetPassword);

// Admin-only route to get all users
router.get(
  "/all",
  securityMiddleware.checkLogin,
  securityMiddleware.checkIfAdmin,
  userController.getAllUsers
);

module.exports = router;
