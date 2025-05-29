const express = require("express");
const router = express.Router();
const controller = require("../controllers/serviceBooking");
const securityMiddleware = require("../middlewares/security");

// Owner routes - Must come BEFORE ID routes to avoid MongoDB ObjectId parsing issues
// Note: /servicebooking?owner=true is the preferred approach to avoid MongoDB ObjectId parsing issues
router.get("/owner-bookings", securityMiddleware.checkIfOwner, controller.getAllByOwnerId);
router.get("/service/:serviceId", securityMiddleware.checkIfOwner, controller.getAllByServiceId);
router.put("/:id/confirm", securityMiddleware.checkIfOwner, controller.confirmServiceBooking);
router.put("/:id/cancel", securityMiddleware.checkIfOwner, controller.cancelServiceBooking);

// User routes
router.get("/", securityMiddleware.checkLogin, controller.getAllByUserId);
router.post("/", securityMiddleware.checkLogin, controller.createServiceBooking);
router.put("/:id", securityMiddleware.checkLogin, controller.updateServiceBooking);
router.delete("/:id", securityMiddleware.checkLogin, controller.deleteServiceBooking);

// Route with ID parameter should come after other routes
router.get("/:id", securityMiddleware.checkLogin, controller.getOneById);

module.exports = router; 