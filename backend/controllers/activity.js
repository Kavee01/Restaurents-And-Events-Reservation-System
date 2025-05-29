const modelActivity = require("../models/activity");

module.exports = {
  getAll,
  getAllByOwnerId,
  getAllByRestaurantId,
  getOneById,
  createActivity,
  updateActivity,
  deleteActivity,
};

// @desc    Get all activities
// @route   GET /api/activities
// @access  Public
async function getAll(req, res) {
  try {
    const activities = await modelActivity.getAll();
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all activities by owner ID
// @route   GET /api/activities/owner
// @access  Private (Owner only)
async function getAllByOwnerId(req, res) {
  try {
    const activities = await modelActivity.getAllByOwnerId(req.user.id);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all activities by restaurant ID
// @route   GET /api/activities/restaurant/:restId
// @access  Private (Owner only)
async function getAllByRestaurantId(req, res) {
  try {
    const activities = await modelActivity.getAllByRestaurantId(req.params.restId);
    res.json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get one activity by ID
// @route   GET /api/activities/:id
// @access  Public
async function getOneById(req, res) {
  try {
    const activity = await modelActivity.getActivityById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ errorMsg: "Activity not found" });
    }
    
    res.json(activity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private (Owner only)
async function createActivity(req, res) {
  try {
    console.log("Creating activity with data:", req.body);
    console.log("User ID:", req.user.id);
    
    // Create the activity
    const activity = await modelActivity.createActivity({
      ...req.body,
      owner: req.user.id
    });
    
    res.status(201).json(activity);
  } catch (err) {
    console.error("Error creating activity:", err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private (Owner only)
async function updateActivity(req, res) {
  try {
    // Check if the activity exists
    const activity = await modelActivity.getActivityById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ errorMsg: "Activity not found" });
    }
    
    // Check if the activity belongs to the owner
    if (activity.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Update the activity
    const updatedActivity = await modelActivity.updateActivity(req.params.id, req.body);
    res.json(updatedActivity);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private (Owner only)
async function deleteActivity(req, res) {
  try {
    // Check if the activity exists
    const activity = await modelActivity.getActivityById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({ errorMsg: "Activity not found" });
    }
    
    // Check if the activity belongs to the owner
    if (activity.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Delete the activity
    await modelActivity.deleteActivity(req.params.id);
    res.json({ message: "Activity deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
} 