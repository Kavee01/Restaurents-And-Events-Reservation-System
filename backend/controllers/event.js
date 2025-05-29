const modelEvent = require("../models/event");
const modelRestaurant = require("../models/restaurant");

module.exports = {
  getAll,
  getAllByOwnerId,
  getAllByRestaurantId,
  getOneById,
  createEvent,
  updateEvent,
  deleteEvent,
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
async function getAll(req, res) {
  try {
    const events = await modelEvent.getAll();
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all events by owner ID
// @route   GET /api/events/owner
// @access  Private (Owner only)
async function getAllByOwnerId(req, res) {
  try {
    const events = await modelEvent.getAllByOwnerId(req.user.id);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all events by restaurant ID
// @route   GET /api/events/restaurant/:restId
// @access  Private
async function getAllByRestaurantId(req, res) {
  try {
    const events = await modelEvent.getAllByRestaurantId(req.params.restId);
    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get one event by ID
// @route   GET /api/events/:id
// @access  Public
async function getOneById(req, res) {
  try {
    const event = await modelEvent.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ errorMsg: "Event not found" });
    }
    
    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Owner only)
async function createEvent(req, res) {
  try {
    console.log("Creating event with data:", req.body);
    console.log("User ID:", req.user.id);
    
    // Check if restaurant exists and belongs to the user
    const restaurant = await modelRestaurant.getRestaurantById(req.body.restaurant);
    
    if (!restaurant) {
      console.log("Restaurant not found:", req.body.restaurant);
      return res.status(404).json({ errorMsg: "Restaurant not found" });
    }
    
    if (restaurant.owner.toString() !== req.user.id) {
      console.log("User not authorized. Owner:", restaurant.owner.toString(), "User:", req.user.id);
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Create the event
    const event = await modelEvent.createEvent({
      ...req.body,
      owner: req.user.id
    });
    
    res.status(201).json(event);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Owner only)
async function updateEvent(req, res) {
  try {
    // Check if the event exists
    const event = await modelEvent.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ errorMsg: "Event not found" });
    }
    
    // Check if the event belongs to the owner
    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Update the event
    const updatedEvent = await modelEvent.updateEvent(req.params.id, req.body);
    res.json(updatedEvent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Owner only)
async function deleteEvent(req, res) {
  try {
    // Check if the event exists
    const event = await modelEvent.getEventById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ errorMsg: "Event not found" });
    }
    
    // Check if the event belongs to the owner
    if (event.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Delete the event
    await modelEvent.deleteEvent(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
} 