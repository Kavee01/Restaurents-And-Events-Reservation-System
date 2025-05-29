const express = require("express");
const router = express.Router();
const controller = require("../controllers/activityBooking");
const securityMiddleware = require("../middlewares/security");

// User routes
router.get("/", securityMiddleware.checkLogin, controller.getAllByUserId);
router.post("/", securityMiddleware.checkLogin, controller.createActivityBooking);
router.put("/:id", securityMiddleware.checkLogin, controller.updateActivityBooking);
router.delete("/:id", securityMiddleware.checkLogin, controller.deleteActivityBooking);

// Owner routes
router.get("/owner-bookings", securityMiddleware.checkIfOwner, controller.getAllByOwnerId);
router.get("/activity/:activityId", securityMiddleware.checkIfOwner, controller.getAllByActivityId);
router.put("/:id/confirm", securityMiddleware.checkIfOwner, controller.confirmActivityBooking);
router.put("/:id/cancel", securityMiddleware.checkIfOwner, controller.cancelActivityBooking);

// Route with ID parameter should come after other routes
router.get("/:id", securityMiddleware.checkLogin, controller.getOneById);

module.exports = router; 