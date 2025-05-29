const modelActivityBooking = require("../models/activityBooking");
const modelActivity = require("../models/activity");

module.exports = {
  getAllByUserId,
  getAllByActivityId,
  getAllByOwnerId,
  getOneById,
  createActivityBooking,
  updateActivityBooking,
  deleteActivityBooking,
  confirmActivityBooking,
  cancelActivityBooking
};

// @desc    Get all activity bookings by user ID
// @route   GET /activitybooking
// @access  Private (User only)
async function getAllByUserId(req, res) {
  try {
    const bookings = await modelActivityBooking.getAllByUserId(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all activity bookings by activity ID
// @route   GET /activitybooking/activity/:activityId
// @access  Private (Owner only)
async function getAllByActivityId(req, res) {
  try {
    // Check if the activity belongs to the requesting owner
    const activity = await modelActivity.getActivityById(req.params.activityId);
    
    if (!activity) {
      return res.status(404).json({ errorMsg: "Activity not found" });
    }
    
    if (activity.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const bookings = await modelActivityBooking.getAllByActivityId(req.params.activityId);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all activity bookings for all activities owned by the requesting owner
// @route   GET /activitybooking/owner-bookings
// @access  Private (Owner only)
async function getAllByOwnerId(req, res) {
  try {
    const bookings = await modelActivityBooking.getAllByOwnerId(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get one activity booking by ID
// @route   GET /activitybooking/:id
// @access  Private (User or Owner)
async function getOneById(req, res) {
  try {
    const booking = await modelActivityBooking.getActivityBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Check if the user is the booker or the owner of the activity
    if (booking.user._id.toString() !== req.user.id && 
        booking.activity.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Create a new activity booking
// @route   POST /activitybooking
// @access  Private (User only)
async function createActivityBooking(req, res) {
  try {
    const bookingData = {
      ...req.body,
      user: req.user.id
    };
    
    const booking = await modelActivityBooking.createActivityBooking(bookingData);
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Update an activity booking
// @route   PUT /activitybooking/:id
// @access  Private (User only)
async function updateActivityBooking(req, res) {
  try {
    const booking = await modelActivityBooking.getActivityBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the user who made the booking can update it
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    // Don't allow changing the activity or user
    delete req.body.activity;
    delete req.body.user;
    
    const updatedBooking = await modelActivityBooking.updateActivityBooking(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Delete an activity booking
// @route   DELETE /activitybooking/:id
// @access  Private (User only)
async function deleteActivityBooking(req, res) {
  try {
    const booking = await modelActivityBooking.getActivityBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the user who made the booking can delete it
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    await modelActivityBooking.deleteActivityBooking(req.params.id);
    res.json({ message: "Activity booking cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Confirm an activity booking (by owner)
// @route   PUT /activitybooking/:id/confirm
// @access  Private (Owner only)
async function confirmActivityBooking(req, res) {
  try {
    const booking = await modelActivityBooking.getActivityBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the owner of the activity can confirm the booking
    if (booking.activity.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const confirmedBooking = await modelActivityBooking.confirmBooking(req.params.id);
    res.json(confirmedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Cancel an activity booking (by owner)
// @route   PUT /activitybooking/:id/cancel
// @access  Private (Owner only)
async function cancelActivityBooking(req, res) {
  try {
    const booking = await modelActivityBooking.getActivityBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the owner of the activity can cancel the booking
    if (booking.activity.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const cancelledBooking = await modelActivityBooking.cancelBooking(
      req.params.id, 
      req.body.cancellationReason
    );
    res.json(cancelledBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
} 