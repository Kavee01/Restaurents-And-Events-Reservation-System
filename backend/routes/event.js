const express = require("express");
const router = express.Router();
const controller = require("../controllers/event");
const securityMiddleware = require("../middlewares/security");

// Public endpoints (no authentication required)
router.get("/", controller.getAll);

// Authenticated endpoints
router.get("/owner-events", securityMiddleware.checkLogin, controller.getAllByOwnerId);
router.get("/restaurant/:restId", securityMiddleware.checkIfOwner, controller.getAllByRestaurantId);

// ID-based routes (must be after specific paths)
router.get("/:id", controller.getOneById);
router.post("/", securityMiddleware.checkLogin, controller.createEvent);
router.put("/:id", securityMiddleware.checkLogin, controller.updateEvent);
router.delete("/:id", securityMiddleware.checkLogin, controller.deleteEvent);

module.exports = router; 