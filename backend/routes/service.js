const express = require("express");
const router = express.Router();
const controller = require("../controllers/service");
const securityMiddleware = require("../middlewares/security");

// Public endpoints (no authentication required)
router.get("/", controller.getAll);

// Authenticated endpoints
router.get("/owner-services", securityMiddleware.checkLogin, controller.getAllByOwnerId);
router.get("/restaurant/:restId", controller.getAllByRestaurantId);

// ID-based routes (must be after specific paths)
router.get("/:id", controller.getOneById);
router.post("/", securityMiddleware.checkLogin, controller.createService);
router.put("/:id", securityMiddleware.checkLogin, controller.updateService);
router.delete("/:id", securityMiddleware.checkLogin, controller.deleteService);

module.exports = router; 