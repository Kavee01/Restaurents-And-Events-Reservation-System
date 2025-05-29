const modelServiceBooking = require("../models/serviceBooking");
const modelService = require("../models/service");

module.exports = {
  getAllByUserId,
  getAllByServiceId,
  getAllByOwnerId,
  getOneById,
  createServiceBooking,
  updateServiceBooking,
  deleteServiceBooking,
  confirmServiceBooking,
  cancelServiceBooking
};

// @desc    Get all service bookings by user ID
// @route   GET /servicebooking
// @access  Private (User only)
async function getAllByUserId(req, res) {
  try {
    // Check if this is an owner request (using query parameter approach instead of path)
    if (req.query.owner === 'true' && req.user.isOwner) {
      console.log("Redirecting to owner bookings for user:", req.user.id);
      // Call the owner function instead
      return getAllByOwnerId(req, res);
    }
    
    const bookings = await modelServiceBooking.getAllByUserId(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all service bookings by service ID
// @route   GET /servicebooking/service/:serviceId
// @access  Private (Owner only)
async function getAllByServiceId(req, res) {
  try {
    // Check if the service belongs to the requesting owner
    const service = await modelService.getServiceById(req.params.serviceId);
    
    if (!service) {
      return res.status(404).json({ errorMsg: "Service not found" });
    }
    
    if (service.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const bookings = await modelServiceBooking.getAllByServiceId(req.params.serviceId);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get all service bookings for all services owned by the requesting owner
// @route   GET /servicebooking/owner-bookings
// @access  Private (Owner only)
async function getAllByOwnerId(req, res) {
  try {
    const bookings = await modelServiceBooking.getAllByOwnerId(req.user.id);
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Get one service booking by ID
// @route   GET /servicebooking/:id
// @access  Private (User or Owner)
async function getOneById(req, res) {
  try {
    const booking = await modelServiceBooking.getServiceBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Check if the user is the booker or the owner of the service
    if (booking.user._id.toString() !== req.user.id && 
        booking.service.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    res.json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Create a new service booking
// @route   POST /servicebooking
// @access  Private (User only)
async function createServiceBooking(req, res) {
  try {
    const bookingData = {
      ...req.body,
      user: req.user.id
    };
    
    const booking = await modelServiceBooking.createServiceBooking(bookingData);
    res.status(201).json(booking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Update a service booking
// @route   PUT /servicebooking/:id
// @access  Private (User only)
async function updateServiceBooking(req, res) {
  try {
    const booking = await modelServiceBooking.getServiceBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the user who made the booking can update it
    delete req.body.service;
    delete req.body.user;
    
    const updatedBooking = await modelServiceBooking.updateServiceBooking(req.params.id, req.body);
    res.json(updatedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Delete a service booking
// @route   DELETE /servicebooking/:id
// @access  Private (User only)
async function deleteServiceBooking(req, res) {
  try {
    const booking = await modelServiceBooking.getServiceBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the user who made the booking can delete it
    if (booking.user._id.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    await modelServiceBooking.deleteServiceBooking(req.params.id);
    res.json({ message: "Service booking cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Confirm a service booking (by owner)
// @route   PUT /servicebooking/:id/confirm
// @access  Private (Owner only)
async function confirmServiceBooking(req, res) {
  try {
    const booking = await modelServiceBooking.getServiceBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the owner of the service can confirm the booking
    if (booking.service.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const confirmedBooking = await modelServiceBooking.confirmBooking(req.params.id);
    res.json(confirmedBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
}

// @desc    Cancel a service booking (by owner)
// @route   PUT /servicebooking/:id/cancel
// @access  Private (Owner only)
async function cancelServiceBooking(req, res) {
  try {
    const booking = await modelServiceBooking.getServiceBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ errorMsg: "Booking not found" });
    }
    
    // Only the owner of the service can cancel the booking
    if (booking.service.owner.toString() !== req.user.id) {
      return res.status(401).json({ errorMsg: "Unauthorized" });
    }
    
    const cancelledBooking = await modelServiceBooking.cancelBooking(
      req.params.id, 
      req.body.cancellationReason
    );
    res.json(cancelledBooking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ errorMsg: err.message });
  }
} 