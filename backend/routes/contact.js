const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// POST /contact/create - Create a new contact submission
router.post("/create", contactController.createContact);

// GET /contact - Get all contact submissions (admin only)
router.get("/", contactController.getAllContacts);

module.exports = router; 