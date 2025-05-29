const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventBooking");
const securityMiddleware = require("../middlewares/security");

// Public endpoints (no authentication required)
router.get("/event/:eventId/availability", controller.getEventAvailability);

// User routes
router.get("/", securityMiddleware.checkLogin, controller.getAllByUserId);
router.post("/", securityMiddleware.checkLogin, controller.createEventBooking);
router.put("/:id", securityMiddleware.checkLogin, controller.updateEventBooking);
router.delete("/:id", securityMiddleware.checkLogin, controller.deleteEventBooking);

// Owner routes
router.get("/owner-bookings", securityMiddleware.checkIfOwner, controller.getAllByOwnerId);
router.get("/event/:eventId", securityMiddleware.checkIfOwner, controller.getAllByEventId);
router.put("/:id/confirm", securityMiddleware.checkIfOwner, controller.confirmEventBooking);
router.put("/:id/cancel", securityMiddleware.checkIfOwner, controller.cancelEventBooking);

// Route with ID parameter should come after other routes
router.get("/:id", securityMiddleware.checkLogin, controller.getOneById);

module.exports = router; 